using Microsoft.AspNetCore.Identity;

namespace Crm.Api.Auth;

public static class AuthEndpoints
{
    public static RouteGroupBuilder MapAuthEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/register", async (
            RegisterRequest req,
            UserManager<ApplicationUser> userManager
        ) =>
        {
            var email = req.Email.Trim().ToLowerInvariant();

            var existing = await userManager.FindByEmailAsync(email);
            if (existing is not null)
                return Results.BadRequest(new { message = "Email is already registered." });

            var user = new ApplicationUser
            {
                Email = email,
                UserName = email,
                EmailConfirmed = true // za dev; kasnije true tek nakon potvrde maila
            };

            var result = await userManager.CreateAsync(user, req.Password);
            if (!result.Succeeded)
                return Results.BadRequest(new { errors = result.Errors.Select(e => e.Description) });

            // Default rola za nove korisnike (možemo kasnije promijeniti)
            await userManager.AddToRoleAsync(user, Roles.Sales);

            return Results.Ok(new { message = "Registered." });
        });

        group.MapPost("/login", async (
            LoginRequest req,
            SignInManager<ApplicationUser> signInManager,
            UserManager<ApplicationUser> userManager,
            IJwtTokenService jwt
        ) =>
        {
            var email = req.Email.Trim().ToLowerInvariant();
            var user = await userManager.FindByEmailAsync(email);
            if (user is null)
                return Results.Unauthorized();

            var check = await signInManager.CheckPasswordSignInAsync(user, req.Password, lockoutOnFailure: true);
            if (!check.Succeeded)
                return Results.Unauthorized();

            var token = await jwt.CreateAccessTokenAsync(user);
            return Results.Ok(new AuthResponse(token));
        });

        return group;
    }
}

public static class Roles
{
    public const string Admin = "Admin";
    public const string Sales = "Sales";
    public const string Partner = "Partner";
}