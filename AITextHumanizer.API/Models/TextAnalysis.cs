using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AITextHumanizer.API.Models
{
    public class TextAnalysis
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string OriginalText { get; set; } = string.Empty;
        
        public string? ProcessedText { get; set; }
        
        [Required]
        [MaxLength(20)]
        public string AnalysisType { get; set; } = string.Empty; // "detect" or "humanize"
        
        [Column(TypeName = "decimal(5,2)")]
        public decimal AiScore { get; set; }
        
        [MaxLength(50)]
        public string? Tone { get; set; }
        
        [MaxLength(500)]
        public string? AnalysisResult { get; set; } // Summary message
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // For future: link to user
        public int? UserId { get; set; }
        public User? User { get; set; }
        
        // Metadata
        public int TextLength { get; set; }
        public double ProcessingTimeMs { get; set; }
        public string? IpAddress { get; set; }
    }
}