using System.ComponentModel.DataAnnotations;

namespace AITextHumanizer.API.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Username { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        [MaxLength(200)]
        public string Email { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation property
        public ICollection<AnalysisHistory> Analyses { get; set; } = new List<AnalysisHistory>();
    }
}