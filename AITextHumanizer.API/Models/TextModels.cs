using System.ComponentModel.DataAnnotations;

namespace AITextHumanizer.API.Models
{
    public class TextRequest
    {
        [Required]
        [MinLength(10)]
        public string Text { get; set; } = string.Empty;
        public string? Tone { get; set; } = "casual";
    }

    public class TextResponse
    {
        public string OriginalText { get; set; } = string.Empty;
        public string ProcessedText { get; set; } = string.Empty;
        public double AiScore { get; set; }
        public string ProcessingType { get; set; } = string.Empty;
        public DateTime ProcessedAt { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}