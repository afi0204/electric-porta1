// --- All using statements at the top of the file ---
using Microsoft.EntityFrameworkCore;
using SmartElectric.API.Data;
using SmartElectric.API.Middleware; // For your custom Swagger middleware
using Newtonsoft.Json.Serialization;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer; // For JWT
using Microsoft.IdentityModel.Tokens; // For JWT
using System.Text; // For JWT

var builder = WebApplication.CreateBuilder(args);

// --- 1. Service Configuration ---

// Add CORS Policy
builder.Services.AddCors(options => {
    options.AddPolicy("AllowAny", policy => 
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

// Configure Controllers with Newtonsoft.Json
builder.Services.AddControllers()
    .AddNewtonsoftJson(options => {
        options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
        options.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
    });

// Configure Database Context
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));
    
// --- ADD JWT AUTHENTICATION SERVICES ---
// This was missing. It's needed for the [Authorize] attribute to work.
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

// Configure Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { 
        Version = "v1", 
        Title = "Smart Electric API" 
    });
    // This adds the "Authorize" button to Swagger UI
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter JWT with Bearer into field",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement {
        { 
            new OpenApiSecurityScheme { 
                Reference = new OpenApiReference { 
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer" 
                } 
            },
            new string[] { } 
        } 
    });
});

// Kestrel configuration for ports
builder.WebHost.ConfigureKestrel(serverOptions => {
    serverOptions.ListenAnyIP(9092);
    serverOptions.ListenAnyIP(9091, listenOptions => {
        listenOptions.UseHttps(); 
    });
});


// --- 2. Build the Application ---
var app = builder.Build();

// --- 3. Configure the HTTP Request Pipeline (Order is important!) ---

// Use our custom middleware to protect the Swagger docs
app.UseMiddleware<SwaggerAuthMiddleware>();

// Use the standard Swagger middleware
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Smart Electric API v1");
    options.RoutePrefix = "api"; 
});

// Standard middleware pipeline
app.UseHttpsRedirection();
app.UseCors("AllowAny");

// Add authentication and authorization to the pipeline
// These must be after routing and before MapControllers.
app.UseAuthentication();
app.UseAuthorization(); 

app.MapControllers();

app.Run();