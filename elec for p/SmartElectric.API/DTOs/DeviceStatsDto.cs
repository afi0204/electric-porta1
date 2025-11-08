// In DTOs/DeviceStatsDto.cs
namespace SmartElectric.API.DTOs;

public class DeviceStatsDto
{
    public int TotalCount { get; set; }
    public int ActiveCount { get; set; }
    public int MaintenanceCount { get; set; }
    public int AlertCount { get; set; }
    public int OtherCount { get; set; }
}