using Microsoft.EntityFrameworkCore;
using SupportFlow.Application.Auth.DTOs;
using SupportFlow.Application.Auth.Interfaces;
using SupportFlow.Domain.Entities;
using SupportFlow.Domain.Enums;
using SupportFlow.Infrastructure.Persistence;
using SupportFlow.Infrastructure.Services;

namespace SupportFlow.Tests.Auth;

public class AuthServiceTests
{
    private static SupportFlowDbContext CreateDbContext()
    {
        var options =
            new DbContextOptionsBuilder<SupportFlowDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

        return new SupportFlowDbContext(options);
    }

    private sealed class FakeJwtTokenGenerator
        : IJwtTokenGenerator
    {
        public string GenerateToken(User user)
        {
            return $"test-token-{user.Id}";
        }
    }

    private static AuthService CreateAuthService(
        SupportFlowDbContext dbContext)
    {
        return new AuthService(
            dbContext,
            new FakeJwtTokenGenerator());
    }

    [Fact]
    public async Task Register_NewUser_ShouldCreateCustomer()
    {
        await using var dbContext = CreateDbContext();

        var service = CreateAuthService(dbContext);

        var request = new RegisterRequest
        {
            FirstName = "Orozobek",
            LastName = "Israilov",
            Email = "TEST@SUPPORTFLOW.DEV",
            Password = "Test12345!"
        };

        var result = await service.RegisterAsync(request);

        Assert.NotEqual(Guid.Empty, result.UserId);
        Assert.Equal("Orozobek", result.FirstName);
        Assert.Equal("Israilov", result.LastName);

        Assert.Equal(
            "test@supportflow.dev",
            result.Email);

        Assert.Equal(
            UserRole.Customer.ToString(),
            result.Role);

        Assert.False(
            string.IsNullOrWhiteSpace(result.Token));

        var user = await dbContext.Users
            .SingleAsync();

        Assert.Equal(
            "test@supportflow.dev",
            user.Email);

        Assert.Equal(
            UserRole.Customer,
            user.Role);

        Assert.True(user.IsActive);
    }

    [Fact]
    public async Task Register_ShouldHashPassword()
    {
        await using var dbContext = CreateDbContext();

        var service = CreateAuthService(dbContext);

        const string password = "Test12345!";

        var request = new RegisterRequest
        {
            FirstName = "Test",
            LastName = "User",
            Email = "hash@test.com",
            Password = password
        };

        await service.RegisterAsync(request);

        var user = await dbContext.Users
            .SingleAsync();

        Assert.NotEqual(
            password,
            user.PasswordHash);

        Assert.True(
            BCrypt.Net.BCrypt.Verify(
                password,
                user.PasswordHash));
    }

    [Fact]
    public async Task Register_DuplicateEmail_ShouldThrowException()
    {
        await using var dbContext = CreateDbContext();

        var service = CreateAuthService(dbContext);

        var firstRequest = new RegisterRequest
        {
            FirstName = "First",
            LastName = "User",
            Email = "duplicate@test.com",
            Password = "Test12345!"
        };

        await service.RegisterAsync(firstRequest);

        var secondRequest = new RegisterRequest
        {
            FirstName = "Second",
            LastName = "User",
            Email = "DUPLICATE@TEST.COM",
            Password = "Another12345!"
        };

        var exception =
            await Assert.ThrowsAsync<InvalidOperationException>(
                () => service.RegisterAsync(secondRequest));

        Assert.Equal(
            "A user with this email already exists.",
            exception.Message);
    }

    [Fact]
    public async Task Login_ValidCredentials_ShouldSucceed()
    {
        await using var dbContext = CreateDbContext();

        const string password = "Test12345!";

        var user = new User
        {
            Id = Guid.NewGuid(),
            FirstName = "Test",
            LastName = "Customer",
            Email = "login@test.com",

            PasswordHash =
                BCrypt.Net.BCrypt.HashPassword(password),

            Role = UserRole.Customer,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.Users.Add(user);

        await dbContext.SaveChangesAsync();

        var service = CreateAuthService(dbContext);

        var request = new LoginRequest
        {
            Email = "LOGIN@TEST.COM",
            Password = password
        };

        var result = await service.LoginAsync(request);

        Assert.Equal(user.Id, result.UserId);
        Assert.Equal(user.Email, result.Email);

        Assert.Equal(
            UserRole.Customer.ToString(),
            result.Role);

        Assert.Equal(
            $"test-token-{user.Id}",
            result.Token);
    }

    [Fact]
    public async Task Login_WrongPassword_ShouldThrowUnauthorized()
    {
        await using var dbContext = CreateDbContext();

        var user = new User
        {
            Id = Guid.NewGuid(),
            FirstName = "Test",
            LastName = "Customer",
            Email = "wrongpassword@test.com",

            PasswordHash =
                BCrypt.Net.BCrypt.HashPassword(
                    "CorrectPassword123!"),

            Role = UserRole.Customer,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.Users.Add(user);

        await dbContext.SaveChangesAsync();

        var service = CreateAuthService(dbContext);

        var request = new LoginRequest
        {
            Email = user.Email,
            Password = "WrongPassword123!"
        };

        var exception =
            await Assert.ThrowsAsync<UnauthorizedAccessException>(
                () => service.LoginAsync(request));

        Assert.Equal(
            "Invalid email or password.",
            exception.Message);
    }

    [Fact]
    public async Task Login_UnknownEmail_ShouldThrowUnauthorized()
    {
        await using var dbContext = CreateDbContext();

        var service = CreateAuthService(dbContext);

        var request = new LoginRequest
        {
            Email = "unknown@test.com",
            Password = "Test12345!"
        };

        var exception =
            await Assert.ThrowsAsync<UnauthorizedAccessException>(
                () => service.LoginAsync(request));

        Assert.Equal(
            "Invalid email or password.",
            exception.Message);
    }

    [Fact]
    public async Task Login_DisabledUser_ShouldThrowUnauthorized()
    {
        await using var dbContext = CreateDbContext();

        const string password = "Test12345!";

        var user = new User
        {
            Id = Guid.NewGuid(),
            FirstName = "Disabled",
            LastName = "User",
            Email = "disabled@test.com",

            PasswordHash =
                BCrypt.Net.BCrypt.HashPassword(password),

            Role = UserRole.Customer,
            IsActive = false,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.Users.Add(user);

        await dbContext.SaveChangesAsync();

        var service = CreateAuthService(dbContext);

        var request = new LoginRequest
        {
            Email = user.Email,
            Password = password
        };

        var exception =
            await Assert.ThrowsAsync<UnauthorizedAccessException>(
                () => service.LoginAsync(request));

        Assert.Equal(
            "User account is disabled.",
            exception.Message);
    }
}