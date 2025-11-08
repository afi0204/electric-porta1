using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartElectric.API.Models;

public class ElectricReading
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long ReadingId { get; set; }

    [Required]
    public string DeviceId { get; set; } = string.Empty;

    [Required]
    public DateTime Timestamp { get; set; }

    [Required]
    public long Volume { get; set; } // kWh Volume

    [Required]
    public int ConsumptionSinceLast { get; set; }

    [Required]
    public int NetworkSignal { get; set; }

    public int? BatteryVoltage { get; set; }

    [ForeignKey("DeviceId")]
    public ElectricDevice Device { get; set; } = null!;
}