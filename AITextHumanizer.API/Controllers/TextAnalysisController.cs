using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AITextHumanizer.API.Models;
using AITextHumanizer.API.Data;
using AITextHumanizer.API.Services;
using System.ComponentModel.DataAnnotations;

namespace AITextHumanizer.API.Controllers
{
    // Keep only these request/response models in the controller
    public class TextRequest
    {
        [Required]
        [MinLength(10)]
        public string Text { get; set; } = string.Empty;
        
        public string? Tone { get; set; }
    }

    public class TextResponse
    {
        public string OriginalText { get; set; } = string.Empty;
        public string ProcessedText { get; set; } = string.Empty;
        public decimal AiScore { get; set; }
        public string ProcessingType { get; set; } = string.Empty;
        public DateTime ProcessedAt { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    [ApiController]
    [Route("api/[controller]")]
    public class TextAnalysisController : ControllerBase
    {
        private readonly IGeminiService _geminiService;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TextAnalysisController> _logger;

        public TextAnalysisController(
            IGeminiService geminiService,
            ApplicationDbContext context,
            ILogger<TextAnalysisController> logger)
        {
            _geminiService = geminiService;
            _context = context;
            _logger = logger;
        }

        [HttpPost("detect")]
        public async Task<IActionResult> DetectAIText([FromBody] TextRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Text) || request.Text.Length < 10)
                    return BadRequest(new { error = "Text must be at least 10 characters" });

                var result = await _geminiService.DetectAITextAsync(request.Text);

                var response = new TextResponse
                {
                    OriginalText = request.Text,
                    ProcessedText = request.Text,
                    AiScore = result.AiScore,
                    ProcessingType = "detect",
                    ProcessedAt = DateTime.UtcNow,
                    Message = result.Message
                };

                // Save to history using the Model namespace
                var history = new AnalysisHistory
                {
                    OriginalText = request.Text,
                    ProcessedText = request.Text,
                    AiScore = result.AiScore,
                    ProcessingType = "detect",
                    CreatedAt = DateTime.UtcNow
                };
                
                _context.AnalysisHistories.Add(history);
                await _context.SaveChangesAsync();

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Detection error");
                return StatusCode(500, new { error = "Internal server error", details = ex.Message });
            }
        }

        [HttpPost("humanize")]
        public async Task<IActionResult> HumanizeText([FromBody] TextRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Text) || request.Text.Length < 10)
                    return BadRequest(new { error = "Text must be at least 10 characters" });

                var result = await _geminiService.HumanizeTextAsync(request.Text, request.Tone ?? "casual");

                var response = new TextResponse
                {
                    OriginalText = request.Text,
                    ProcessedText = result.HumanizedText,
                    AiScore = result.RemainingAiScore,
                    ProcessingType = "humanize",
                    ProcessedAt = DateTime.UtcNow,
                    Message = GetHumanizationMessage((double)result.RemainingAiScore)
                };

                // Save to history using the Model namespace
                var history = new AnalysisHistory
                {
                    OriginalText = request.Text,
                    ProcessedText = result.HumanizedText,
                    AiScore = result.RemainingAiScore,
                    ProcessingType = "humanize",
                    Tone = request.Tone,
                    CreatedAt = DateTime.UtcNow
                };
                
                _context.AnalysisHistories.Add(history);
                await _context.SaveChangesAsync();

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Humanization error");
                return StatusCode(500, new { error = "Internal server error", details = ex.Message });
            }
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetHistory([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var query = _context.AnalysisHistories.OrderByDescending(h => h.CreatedAt);
                
                var items = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var total = await query.CountAsync();

                return Ok(new
                {
                    items,
                    total,
                    page,
                    pageSize,
                    totalPages = (int)Math.Ceiling(total / (double)pageSize)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "History error");
                return StatusCode(500, new { error = "Failed to retrieve history" });
            }
        }

        [HttpGet("history/{id}")]
        public async Task<IActionResult> GetHistoryItem(int id)
        {
            try
            {
                var item = await _context.AnalysisHistories.FindAsync(id);
                if (item == null)
                    return NotFound(new { error = "History item not found" });
                
                return Ok(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "History item error");
                return StatusCode(500, new { error = "Failed to retrieve history item" });
            }
        }

        [HttpDelete("history/{id}")]
        public async Task<IActionResult> DeleteHistory(int id)
        {
            try
            {
                var item = await _context.AnalysisHistories.FindAsync(id);
                if (item == null) 
                    return NotFound(new { error = "History item not found" });
                
                _context.AnalysisHistories.Remove(item);
                await _context.SaveChangesAsync();
                
                return Ok(new { message = "History item deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Delete error");
                return StatusCode(500, new { error = "Failed to delete history item" });
            }
        }

        [HttpDelete("history")]
        public async Task<IActionResult> ClearAllHistory()
        {
            try
            {
                var allItems = await _context.AnalysisHistories.ToListAsync();
                _context.AnalysisHistories.RemoveRange(allItems);
                await _context.SaveChangesAsync();
                
                return Ok(new { message = "All history cleared successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Clear all error");
                return StatusCode(500, new { error = "Failed to clear history" });
            }
        }

        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new
            {
                message = "API is working!",
                dotnetVersion = Environment.Version.ToString(),
                timestamp = DateTime.Now,
                database = _context.Database.CanConnect() ? "Connected" : "Not Connected"
            });
        }

        private string GetHumanizationMessage(double score)
        {
            if (score >= 70) return "Text has been lightly humanized";
            if (score >= 50) return "Text has been partially humanized";
            if (score >= 30) return "Text has been moderately humanized";
            if (score >= 10) return "Text has been well humanized";
            return "Text has been fully humanized";
        }
    }
}