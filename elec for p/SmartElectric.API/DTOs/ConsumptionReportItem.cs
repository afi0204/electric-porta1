// In DTOs/ConsumptionReportItem.cs
namespace SmartElectric.API.DTOs;

public class ConsumptionReportItem
{
    public required string DeviceId { get; set; }
    public required string DeviceName { get; set; }
    public string? Location { get; set; }
    public long TotalConsumption { get; set; }
    public List<DailyConsumption> DailyConsumption { get; set; } = new(); 
     }

public class DailyConsumption
{
    public DateTime Date { get; set; }
    public long Consumption { get; set; }
}
