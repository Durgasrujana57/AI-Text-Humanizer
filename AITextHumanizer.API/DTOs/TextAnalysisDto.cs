using System.ComponentModel.DataAnnotations;

namespace AITextHumanizer.API.DTOs
{
    public class DetectRequestDto
    {
        [Required]
        [MinLength(10)]
        [MaxLength(10000)]
        public string Text { get; set; } = string.Empty;
    }

    public class HumanizeRequestDto
    {
        [Required]
        [MinLength(10)]
        [MaxLength(10000)]
        public string Text { get; set; } = string.Empty;
        
        [RegularExpression("casual|professional|friendly|academic")]
        public string Tone { get; set; } = "casual";
    }

    public class AnalysisResponseDto
    {
        public int Id { get; set; }
        public string OriginalText { get; set; } = string.Empty;
        public string? ProcessedText { get; set; }
        public decimal AiScore { get; set; }
        public string AnalysisType { get; set; } = string.Empty;
        public string? Tone { get; set; }
        public string? AnalysisResult { get; set; }
        public DateTime CreatedAt { get; set; }
        public int TextLength { get; set; }
        
        // Formatted for display
        public string FormattedDate => CreatedAt.ToString("yyyy-MM-dd HH:mm");
        public string ScoreLabel => GetScoreLabel();
        public string ScoreColor => GetScoreColor();
        
        private string GetScoreLabel()
        {
            if (AiScore >= 80) return "Very High AI";
            if (AiScore >= 60) return "High AI";
            if (AiScore >= 40) return "Medium AI";
            if (AiScore >= 20) return "Low AI";
            return "Very Low AI";
        }
        
        private string GetScoreColor()
        {
            if (AiScore >= 80) return "red";
            if (AiScore >= 60) return "orange";
            if (AiScore >= 40) return "yellow";
            if (AiScore >= 20) return "green";
            return "blue";
        }
    }

    public class PaginatedResponseDto<T>
    {
        public List<T> Items { get; set; } = new();
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasPrevious => Page > 1;
        public bool HasNext => Page < TotalPages;
    }

    public class FeedbackDto
    {
        [Required]
        public int AnalysisId { get; set; }
        
        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }
        
        [MaxLength(500)]
        public string? Comment { get; set; }
        
        public bool WasAccurate { get; set; }
    }

    public class StatisticsDto
    {
        public int TotalAnalyses { get; set; }
        public int TotalDetections { get; set; }
        public int TotalHumanizations { get; set; }
        public double AverageAiScore { get; set; }
        public Dictionary<string, int> AnalysesByDay { get; set; } = new();
        public Dictionary<string, double> AverageScoreByTone { get; set; } = new();
        public int UniqueIpsToday { get; set; }
        public double AverageResponseTime { get; set; }
    }
}