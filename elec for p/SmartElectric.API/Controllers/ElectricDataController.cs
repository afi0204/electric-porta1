using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartElectric.API.Data;
using SmartElectric.API.Models;
using SmartElectric.API.DTOs; // Make sure this using statement is at the top

namespace SmartElectric.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ElectricDataController : ControllerBase
{
    private readonly AppDbContext _context;
    public ElectricDataController(AppDbContext context) { _context = context; }

    // === INCOMING DATA ENDPOINT ===

    [HttpPost("reading")]
    public async Task<IActionResult> PostElectricReading([FromBody] ElectricReadingDto readingDto)
    {
        var cleanData = readingDto.RawData.TrimStart('#');
        var parts = cleanData.Split(',');
        if ((parts.Length != 6 && parts.Length != 7) || (parts[3] != "@" && parts[3] != "8")) return BadRequest($"Invalid format: {readingDto.RawData}");

        try
        {
            string statusFlag = parts[1].ToUpper();
            string deviceId = parts[2];
            int signal = int.Parse(parts[4]);
            long currentVolume = long.Parse(parts[5]);
            int? batteryVoltage = null;
            if (parts.Length == 7)
            {
                batteryVoltage = int.Parse(parts[6]);
            }

            var device = await _context.ElectricDevices.FindAsync(deviceId);
            if (device == null)
            {
                device = new ElectricDevice { DeviceId = deviceId, Name = $"New Meter {deviceId}" };
                _context.ElectricDevices.Add(device);
            }

            int consumption = (int)(currentVolume - (device.LastKnownVolume ?? currentVolume));
            device.NetworkSignal = signal;
            device.LastKnownVolume = currentVolume;
            device.LastReadingTimestamp = DateTime.UtcNow;

            string newStatus = device.Status ?? "inactive";
            switch (statusFlag)
            {
                case "CO": newStatus = "cover_open"; break;
                case "R": newStatus = "reversed"; break;
                case "TO": newStatus = "terminal_open"; break;
                case "S":
                case "D":
                    if (newStatus != "cover_open" && newStatus != "reversed" && newStatus != "terminal_open")
                        newStatus = "active";
                    break;
            }
            device.Status = newStatus;

            _context.ElectricReadings.Add(new ElectricReading { DeviceId = deviceId, Timestamp = DateTime.UtcNow, Volume = currentVolume, ConsumptionSinceLast = consumption, NetworkSignal = signal, BatteryVoltage = batteryVoltage });
            await _context.SaveChangesAsync();
            return Ok(new { message = $"Data for meter {deviceId} processed. Status set to: {newStatus}" });
        }
        catch (Exception ex) { return StatusCode(500, $"An error occurred: {ex.Message}"); }
    }

    // === MAIN DASHBOARD DATA ENDPOINTS ===

    [HttpGet("devices")]
    public async Task<ActionResult<PaginatedList<ElectricDevice>>> GetDevices([FromQuery] DeviceQueryParameters queryParams)
    {
        var query = _context.ElectricDevices.AsQueryable();

        if (!string.IsNullOrEmpty(queryParams.Status))
        {
            if (queryParams.Status.ToLower() == "alert")
            {
                var alertStatuses = new[] { "cover_open", "reversed", "terminal_open" };
                query = query.Where(d => d.Status != null && alertStatuses.Contains(d.Status));
            }
            else
            {
                query = query.Where(d => d.Status == queryParams.Status);
            }
        }
        if (!string.IsNullOrEmpty(queryParams.SearchTerm))
        {
            var term = queryParams.SearchTerm.ToLower();
            query = query.Where(d => d.Name.ToLower().Contains(term) || d.DeviceId.ToLower().Contains(term));
        }

        var orderedQuery = queryParams.SortBy?.ToLower() switch
        {
            "name" => (queryParams.SortOrder == "asc") ? query.OrderBy(d => d.Name) : query.OrderByDescending(d => d.Name),
            "location" => (queryParams.SortOrder == "asc") ? query.OrderBy(d => d.Location) : query.OrderByDescending(d => d.Location),
            _ => query.OrderByDescending(d => d.LastReadingTimestamp)
        };
        var finalQuery = orderedQuery.ThenByDescending(d => d.Status == "cover_open" || d.Status == "reversed" || d.Status == "terminal_open");

        var totalCount = await finalQuery.CountAsync();
        var items = await finalQuery.Skip((queryParams.PageNumber - 1) * queryParams.PageSize).Take(queryParams.PageSize).ToListAsync();
        return Ok(new PaginatedList<ElectricDevice>(items, totalCount, queryParams.PageNumber, queryParams.PageSize));
    }

    [HttpGet("stats")]
    public async Task<ActionResult<DeviceStatsDto>> GetDeviceStats()
    {
        var statuses = await _context.ElectricDevices.Select(d => d.Status).ToListAsync();
        var total = statuses.Count;
        var active = statuses.Count(s => s == "active");
        var maintenance = statuses.Count(s => s == "maintenance");
        var alert = statuses.Count(s => s == "cover_open" || s == "reversed" || s == "terminal_open");
        return Ok(new DeviceStatsDto { TotalCount = total, ActiveCount = active, MaintenanceCount = maintenance, AlertCount = alert, OtherCount = total - active - maintenance - alert });
    }

    [HttpGet("readings/summary")]
    public async Task<ActionResult<IEnumerable<ElectricReading>>> GetReadingsSummary([FromQuery] string period = "30d")
    {
        DateTime fromDate;
        var now = DateTime.UtcNow;
        switch (period)
        {
            case "24h": fromDate = now.AddHours(-24); break;
            case "7d": fromDate = now.AddDays(-7); break;
            case "90d": fromDate = now.AddDays(-90); break;
            case "30d":
            default: fromDate = now.AddDays(-30); break;
        }
        return await _context.ElectricReadings.Where(r => r.Timestamp >= fromDate).ToListAsync();
    }

    // === SINGLE DEVICE ENDPOINTS (FOR DETAIL PAGE & MODALS) ===

    [HttpGet("devices/{id}")]
    public async Task<ActionResult<ElectricDevice>> GetDeviceById(string id)
    {
        var device = await _context.ElectricDevices.FindAsync(id);
        return device == null ? NotFound() : Ok(device);
    }

    [HttpPut("devices/{id}")]
    public async Task<IActionResult> UpdateDevice(string id, [FromBody] ElectricDevice deviceUpdate)
    {
        if (id != deviceUpdate.DeviceId) return BadRequest("ID mismatch.");
        _context.Entry(deviceUpdate).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("devices/{id}/resolve-alert")]
    public async Task<IActionResult> ResolveDeviceAlert(string id)
    {
        var device = await _context.ElectricDevices.FindAsync(id);
        if (device == null) return NotFound();
        device.Status = "active";
        await _context.SaveChangesAsync();
        return Ok(device);
    }

    [HttpGet("devices/{id}/readings")]
    public async Task<ActionResult<IEnumerable<ElectricReading>>> GetDeviceReadings(string id, [FromQuery] string period = "30d")
    {
        DateTime fromDate;
        var now = DateTime.UtcNow;
        switch (period)
        {
            case "24h": fromDate = now.AddHours(-24); break;
            case "7d": fromDate = now.AddDays(-7); break;
            case "90d": fromDate = now.AddDays(-90); break;
            case "30d":
            default: fromDate = now.AddDays(-30); break;
        }
        return await _context.ElectricReadings.Where(r => r.DeviceId == id && r.Timestamp >= fromDate).ToListAsync();
    }

    [HttpGet("devices/{id}/daily-detail")]
    public async Task<ActionResult<IEnumerable<ElectricReading>>> GetDeviceDailyDetail(string id, [FromQuery] string date)
    {
        if (DateTime.TryParse(date, out DateTime selectedDate))
        {
            var startOfDay = selectedDate.Date;
            var endOfDay = startOfDay.AddDays(1).AddTicks(-1); // End of day
            return await _context.ElectricReadings
                .Where(r => r.DeviceId == id && r.Timestamp >= startOfDay && r.Timestamp <= endOfDay)
                .OrderByDescending(r => r.Timestamp)
                .ToListAsync();
        }
        return BadRequest("Invalid date format");
    }

    
    [HttpGet("devices/{id}/logs")]
    public async Task<ActionResult<IEnumerable<DeviceLog>>> GetDeviceLogs(string id)
    {
        return await _context.DeviceLogs.Where(l => l.DeviceId == id).OrderByDescending(l => l.Timestamp).ToListAsync();
    }

    [HttpPost("devices/{id}/logs")]
    public async Task<ActionResult<DeviceLog>> AddDeviceLog(string id, [FromBody] DeviceLog newLog)
    {
        var device = await _context.ElectricDevices.FindAsync(id);
        if (device == null) return NotFound();
        device.Status = newLog.NewStatus;
        newLog.DeviceId = id;
        newLog.Timestamp = DateTime.UtcNow;
        _context.DeviceLogs.Add(newLog);
        await _context.SaveChangesAsync();
        return Ok(newLog);
    }
      [HttpPost("reports")]
public async Task<ActionResult<IEnumerable<ConsumptionReportItem>>> GenerateConsumptionReport([FromBody] ReportQueryParameters queryParams)
{
    var query = _context.ElectricReadings.AsQueryable()
        .Where(r => r.Timestamp >= queryParams.FromDate && r.Timestamp < queryParams.ToDate.AddDays(1));

    if (!string.IsNullOrEmpty(queryParams.Location) && queryParams.Location != "All")
    {
        query = query.Where(r => r.Device.Location == queryParams.Location);
    }
    
    var reportItems = await query
        .GroupBy(r => new { r.DeviceId, r.Device.Name, r.Device.Location })
        .Select(g => new ConsumptionReportItem
        {
            DeviceId = g.Key.DeviceId,
            DeviceName = g.Key.Name,
            Location = g.Key.Location,
            TotalConsumption = g.Sum(r => r.ConsumptionSinceLast),
            // NEW: Group the readings by day to create the sparkline data
            DailyConsumption = g
                .GroupBy(r => r.Timestamp.Date)
                .Select(dailyGroup => new DailyConsumption
                {
                    Date = dailyGroup.Key,
                    Consumption = dailyGroup.Sum(r => r.ConsumptionSinceLast)
                })
                .OrderBy(d => d.Date)
                .ToList()
        })
        .OrderByDescending(item => item.TotalConsumption)
        .ToListAsync();

    return Ok(reportItems);
}
}