using System.ComponentModel.DataAnnotations;

namespace SmartElectric.API.Models;

public class ElectricDevice
{
    [Key]
    public string DeviceId { get; set; } = string.Empty;

    [Required]
    public string Name { get; set; } = string.Empty;
    public string? Location { get; set; }
    public string? Status { get; set; }
    public int? NetworkSignal { get; set; }

    // THIS IS THE MOST LIKELY FIX
    // Ensure this property is a 'long?' to match the 'BIGINT' in the database.
    public long? LastKnownVolume { get; set; }

    public DateTime? LastReadingTimestamp { get; set; }
    public DateTime? InstallationDate { get; set; }

    // Also ensure this navigation property uses the correct class name
    public ICollection<ElectricReading> Readings { get; set; } = new List<ElectricReading>();
}