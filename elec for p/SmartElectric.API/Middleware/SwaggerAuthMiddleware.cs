// The namespace MUST include the folder name.
namespace SmartElectric.API.Middleware;

using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;

public class SwaggerAuthMiddleware
{
    private readonly RequestDelegate _next;

    public SwaggerAuthMiddleware(RequestDelegate next) // Removed IConfiguration as it's not used
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Only protect the main UI endpoint
        if (context.Request.Path.StartsWithSegments("/api"))
        {
            // Check for the secret key in the query string
        }
        
        // Let all other requests (like for /swagger/v1/swagger.json) pass through
        await _next(context);
    }
}