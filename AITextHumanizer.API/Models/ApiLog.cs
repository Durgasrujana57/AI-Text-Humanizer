using System.ComponentModel.DataAnnotations;

namespace AITextHumanizer.API.Models
{
    public class ApiLog
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(20)]
        public string Endpoint { get; set; } = string.Empty;
        
        [MaxLength(10)]
        public string Method { get; set; } = string.Empty;
        
        public int StatusCode { get; set; }
        
        public double Duration { get; set; }
        
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        
        [MaxLength(50)]
        public string? IpAddress { get; set; }
    }
}