using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartElectric.API.Models;

public class DeviceLog
{
    // THIS MUST BE AN 'int' and named 'LogId'
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int LogId { get; set; }

    [Required]
    public string DeviceId { get; set; } = string.Empty;

    public DateTime Timestamp { get; set; }
    
    [Required]
    public string Author { get; set; } = string.Empty;

    [Required]
    public string Comment { get; set; } = string.Empty;

    [Required]
    public string NewStatus { get; set; } = string.Empty;
    
    [ForeignKey("DeviceId")]
    public ElectricDevice? Device { get; set; }
}