using Microsoft.EntityFrameworkCore;
using SmartElectric.API.Models;

namespace SmartElectric.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
        // Enable retry on failure with longer timeout
        Database.SetCommandTimeout(120); // 2 minute timeout
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Add indexes for frequently queried columns
        modelBuilder.Entity<ElectricDevice>()
            .HasIndex(d => d.Status);
            
        modelBuilder.Entity<ElectricDevice>()
            .HasIndex(d => d.LastReadingTimestamp);
            
        modelBuilder.Entity<ElectricReading>()
            .HasIndex(r => r.DeviceId);
            
        modelBuilder.Entity<ElectricReading>()
            .HasIndex(r => r.Timestamp);
            
        modelBuilder.Entity<DeviceLog>()
            .HasIndex(l => l.DeviceId);
            
        modelBuilder.Entity<DeviceLog>()
            .HasIndex(l => l.Timestamp);
    }

    public DbSet<ElectricDevice> ElectricDevices { get; set; }
    public DbSet<ElectricReading> ElectricReadings { get; set; }
    public DbSet<DeviceLog> DeviceLogs { get; set; }
}