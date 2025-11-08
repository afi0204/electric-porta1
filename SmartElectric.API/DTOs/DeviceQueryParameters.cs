// DTOs/DeviceQueryParameters.cs
using Microsoft.AspNetCore.Mvc;

namespace SmartElectric.API.DTOs;

public class DeviceQueryParameters
{
    private const int MaxPageSize = 50;
    public int PageNumber { get; set; } = 1;

    private int _pageSize = 10;
    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = (value > MaxPageSize) ? MaxPageSize : value;
    }

    // Filtering
    public string? Status { get; set; }
    public string? Location { get; set; }
    public string? SearchTerm { get; set; }

    // Sorting
    public string? SortBy { get; set; } = "lastReadingTimestamp";
    public string? SortOrder { get; set; } = "desc";
}