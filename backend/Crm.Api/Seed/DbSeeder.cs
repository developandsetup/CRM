using Crm.Api.Auth;
using Microsoft.AspNetCore.Identity;

namespace Crm.Api.Seed;

public static class DbSeeder
{
    public static async Task SeedAsync(WebApplication app)
    {
        using var scope = app.Services.CreateScope();

        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        // Roles
        await EnsureRoleAsync(roleManager, Roles.Admin);
        await EnsureRoleAsync(roleManager, Roles.Sales);
        await EnsureRoleAsync(roleManager, Roles.Partner);

        // Optional: dev admin user from config
        var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var adminEmail = config["Seed:AdminEmail"];
        var adminPassword = config["Seed:AdminPassword"];

        if (!string.IsNullOrWhiteSpace(adminEmail) && !string.IsNullOrWhiteSpace(adminPassword))
        {
            var email = adminEmail.Trim().ToLowerInvariant();
            var user = await userManager.FindByEmailAsync(email);
            if (user is null)
            {
                user = new ApplicationUser { Email = email, UserName = email, EmailConfirmed = true };
                var created = await userManager.CreateAsync(user, adminPassword);
                if (created.Succeeded)
                    await userManager.AddToRoleAsync(user, Roles.Admin);
            }
            else
            {
                if (!await userManager.IsInRoleAsync(user, Roles.Admin))
                    await userManager.AddToRoleAsync(user, Roles.Admin);
            }
        }
    }

    private static async Task EnsureRoleAsync(RoleManager<IdentityRole> roleManager, string roleName)
    {
        if (!await roleManager.RoleExistsAsync(roleName))
            await roleManager.CreateAsync(new IdentityRole(roleName));
    }
}