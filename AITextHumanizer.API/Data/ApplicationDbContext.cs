using Microsoft.EntityFrameworkCore;
using AITextHumanizer.API.Models;

namespace AITextHumanizer.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<AnalysisHistory> AnalysisHistories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<AnalysisHistory>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.OriginalText).IsRequired().HasColumnType("TEXT");
                entity.Property(e => e.ProcessedText).HasColumnType("TEXT");
                entity.Property(e => e.AiScore).HasPrecision(5, 2);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.ProcessingType);
            });
        }
    }
}