using System.ComponentModel.DataAnnotations;

namespace AITextHumanizer.API.Models
{
    public class AnalysisHistory
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string OriginalText { get; set; } = string.Empty;
        
        public string ProcessedText { get; set; } = string.Empty;
        
        [Range(0, 100)]
        public decimal AiScore { get; set; }
        
        [Required]
        public string ProcessingType { get; set; } = string.Empty; // "detect" or "humanize"
        
        public string? Tone { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}