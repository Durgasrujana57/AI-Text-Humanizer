using System.ComponentModel.DataAnnotations;

namespace AITextHumanizer.API.Models
{
    public class Feedback
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int AnalysisId { get; set; }
        public TextAnalysis? Analysis { get; set; }
        
        [Range(1, 5)]
        public int Rating { get; set; } // 1-5 stars
        
        [MaxLength(500)]
        public string? Comment { get; set; }
        
        public bool WasAccurate { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}