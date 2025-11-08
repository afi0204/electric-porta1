// In DTOs/DashboardDataDto.cs
using SmartElectric.API.Models;

namespace SmartElectric.API.DTOs;

public class DashboardDataDto
{
    public required PaginatedList<ElectricDevice> PaginatedDevices { get; set; }
    public required DeviceStatsDto Stats { get; set; }
    public required List<ElectricReading> RecentReadingsSummary { get; set; }
}