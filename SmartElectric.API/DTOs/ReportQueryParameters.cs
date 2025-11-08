// In DTOs/ReportQueryParameters.cs
namespace SmartElectric.API.DTOs;

public class ReportQueryParameters
{
    // Dates will be sent as strings in ISO format (e.g., "2023-10-26T00:00:00.000Z")
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    
    // Optional filter
    public string? Location { get; set; }
}