using System.Text;
using Crm.Api.Auth;
using Crm.Api.Data;
using Crm.Api.Seed;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS (Next.js dev server)
const string corsPolicy = "Frontend";
builder.Services.AddCors(options =>
{
    options.AddPolicy(corsPolicy, p =>
        p.WithOrigins("http://localhost:3000")
         .AllowAnyHeader()
         .AllowAnyMethod()
         .AllowCredentials()
    );
});

// Db + Identity
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var cs = builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseSqlServer(cs);
});

builder.Services
    .AddIdentityCore<ApplicationUser>(options =>
    {
        options.User.RequireUniqueEmail = true;

        // Dev-friendly password rules (možeš pooštriti)
        options.Password.RequiredLength = 8;
        options.Password.RequireDigit = true;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequireUppercase = false;
        options.Password.RequireLowercase = false;

        options.Lockout.MaxFailedAccessAttempts = 10;
    })
    .AddRoles<IdentityRole>()
    .AddSignInManager()
    .AddEntityFrameworkStores<ApplicationDbContext>();

// JWT
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
var jwt = builder.Configuration.GetSection("Jwt").Get<JwtOptions>()!;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false; // dev
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidIssuer = jwt.Issuer,
            ValidAudience = jwt.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)),
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ClockSkew = TimeSpan.FromSeconds(10),
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseCors(corsPolicy);

app.UseAuthentication();
app.UseAuthorization();

// API routes
var api = app.MapGroup("/api");
api.MapGroup("/auth").MapAuthEndpoints();

// Health
api.MapGet("/health", () => Results.Ok(new { status = "ok" }));

// Seed roles + optional admin user (after services are ready)
await DbSeeder.SeedAsync(app);

app.Run();