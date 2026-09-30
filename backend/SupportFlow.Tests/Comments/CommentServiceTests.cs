using Microsoft.EntityFrameworkCore;
using SupportFlow.Application.Comments.DTOs;
using SupportFlow.Domain.Entities;
using SupportFlow.Domain.Enums;
using SupportFlow.Infrastructure.Persistence;
using SupportFlow.Infrastructure.Services;

namespace SupportFlow.Tests.Comments;

public class CommentServiceTests
{
    private static SupportFlowDbContext CreateDbContext()
    {
        var options =
            new DbContextOptionsBuilder<SupportFlowDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

        return new SupportFlowDbContext(options);
    }

    private static User CreateUser(
        Guid id,
        string firstName,
        UserRole role)
    {
        return new User
        {
            Id = id,
            FirstName = firstName,
            LastName = "Test",
            Email = $"{Guid.NewGuid():N}@test.com",
            PasswordHash = "test-hash",
            Role = role,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
    }

    private static Ticket CreateTicket(
        Guid customerId,
        Guid? agentId = null)
    {
        return new Ticket
        {
            Id = Guid.NewGuid(),
            TicketNumber = $"SF-TEST-{Guid.NewGuid():N}",
            Title = "Comment test ticket",
            Description =
                "Ticket created for comment service testing.",
            Status = TicketStatus.Open,
            Priority = TicketPriority.Medium,
            Category = TicketCategory.Technical,
            CreatedById = customerId,
            AssignedToId = agentId,
            CreatedAt = DateTime.UtcNow
        };
    }

    [Fact]
    public async Task Create_CustomerPublicComment_ShouldSucceed()
    {
        await using var dbContext = CreateDbContext();

        var customerId = Guid.NewGuid();

        var customer = CreateUser(
            customerId,
            "Customer",
            UserRole.Customer);

        var ticket = CreateTicket(customerId);

        dbContext.Users.Add(customer);
        dbContext.Tickets.Add(ticket);

        await dbContext.SaveChangesAsync();

        var service = new CommentService(dbContext);

        var request = new CreateCommentRequest
        {
            Content = "I still need help with this issue.",
            IsInternal = false
        };

        var result = await service.CreateAsync(
            ticket.Id,
            customerId,
            UserRole.Customer,
            request);

        Assert.NotNull(result);
        Assert.Equal(request.Content, result.Content);
        Assert.False(result.IsInternal);
        Assert.Equal(customerId, result.AuthorId);
        Assert.Equal(ticket.Id, result.TicketId);
    }

    [Fact]
    public async Task Create_CustomerInternalComment_ShouldThrowUnauthorized()
    {
        await using var dbContext = CreateDbContext();

        var customerId = Guid.NewGuid();

        var customer = CreateUser(
            customerId,
            "Customer",
            UserRole.Customer);

        var ticket = CreateTicket(customerId);

        dbContext.Users.Add(customer);
        dbContext.Tickets.Add(ticket);

        await dbContext.SaveChangesAsync();

        var service = new CommentService(dbContext);

        var request = new CreateCommentRequest
        {
            Content = "Customer tries internal note.",
            IsInternal = true
        };

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => service.CreateAsync(
                ticket.Id,
                customerId,
                UserRole.Customer,
                request));
    }

    [Fact]
    public async Task Create_AssignedAgentInternalComment_ShouldSucceed()
    {
        await using var dbContext = CreateDbContext();

        var customerId = Guid.NewGuid();
        var agentId = Guid.NewGuid();

        var customer = CreateUser(
            customerId,
            "Customer",
            UserRole.Customer);

        var agent = CreateUser(
            agentId,
            "Agent",
            UserRole.Agent);

        var ticket = CreateTicket(
            customerId,
            agentId);

        dbContext.Users.AddRange(customer, agent);
        dbContext.Tickets.Add(ticket);

        await dbContext.SaveChangesAsync();

        var service = new CommentService(dbContext);

        var request = new CreateCommentRequest
        {
            Content = "Internal agent note.",
            IsInternal = true
        };

        var result = await service.CreateAsync(
            ticket.Id,
            agentId,
            UserRole.Agent,
            request);

        Assert.NotNull(result);
        Assert.True(result.IsInternal);
        Assert.Equal(agentId, result.AuthorId);
        Assert.Equal("Agent", result.AuthorRole);
    }

    [Fact]
    public async Task Create_UnassignedAgent_ShouldThrowUnauthorized()
    {
        await using var dbContext = CreateDbContext();

        var customerId = Guid.NewGuid();
        var assignedAgentId = Guid.NewGuid();
        var anotherAgentId = Guid.NewGuid();

        var customer = CreateUser(
            customerId,
            "Customer",
            UserRole.Customer);

        var assignedAgent = CreateUser(
            assignedAgentId,
            "AssignedAgent",
            UserRole.Agent);

        var anotherAgent = CreateUser(
            anotherAgentId,
            "AnotherAgent",
            UserRole.Agent);

        var ticket = CreateTicket(
            customerId,
            assignedAgentId);

        dbContext.Users.AddRange(
            customer,
            assignedAgent,
            anotherAgent);

        dbContext.Tickets.Add(ticket);

        await dbContext.SaveChangesAsync();

        var service = new CommentService(dbContext);

        var request = new CreateCommentRequest
        {
            Content = "I should not have access.",
            IsInternal = false
        };

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => service.CreateAsync(
                ticket.Id,
                anotherAgentId,
                UserRole.Agent,
                request));
    }

    [Fact]
    public async Task GetByTicket_Customer_ShouldNotSeeInternalComments()
    {
        await using var dbContext = CreateDbContext();

        var customerId = Guid.NewGuid();
        var agentId = Guid.NewGuid();

        var customer = CreateUser(
            customerId,
            "Customer",
            UserRole.Customer);

        var agent = CreateUser(
            agentId,
            "Agent",
            UserRole.Agent);

        var ticket = CreateTicket(
            customerId,
            agentId);

        dbContext.Users.AddRange(customer, agent);
        dbContext.Tickets.Add(ticket);

        dbContext.Comments.AddRange(
            new Comment
            {
                Id = Guid.NewGuid(),
                Content = "Public response",
                TicketId = ticket.Id,
                AuthorId = agentId,
                IsInternal = false,
                CreatedAt = DateTime.UtcNow
            },
            new Comment
            {
                Id = Guid.NewGuid(),
                Content = "Secret internal note",
                TicketId = ticket.Id,
                AuthorId = agentId,
                IsInternal = true,
                CreatedAt = DateTime.UtcNow
            });

        await dbContext.SaveChangesAsync();

        var service = new CommentService(dbContext);

        var result = await service.GetByTicketAsync(
            ticket.Id,
            customerId,
            UserRole.Customer);

        Assert.Single(result);

        Assert.Equal(
            "Public response",
            result[0].Content);

        Assert.False(result[0].IsInternal);
    }

    [Fact]
    public async Task GetByTicket_AssignedAgent_ShouldSeeAllComments()
    {
        await using var dbContext = CreateDbContext();

        var customerId = Guid.NewGuid();
        var agentId = Guid.NewGuid();

        var customer = CreateUser(
            customerId,
            "Customer",
            UserRole.Customer);

        var agent = CreateUser(
            agentId,
            "Agent",
            UserRole.Agent);

        var ticket = CreateTicket(
            customerId,
            agentId);

        dbContext.Users.AddRange(customer, agent);
        dbContext.Tickets.Add(ticket);

        dbContext.Comments.AddRange(
            new Comment
            {
                Id = Guid.NewGuid(),
                Content = "Public comment",
                TicketId = ticket.Id,
                AuthorId = customerId,
                IsInternal = false,
                CreatedAt = DateTime.UtcNow
            },
            new Comment
            {
                Id = Guid.NewGuid(),
                Content = "Internal comment",
                TicketId = ticket.Id,
                AuthorId = agentId,
                IsInternal = true,
                CreatedAt = DateTime.UtcNow
            });

        await dbContext.SaveChangesAsync();

        var service = new CommentService(dbContext);

        var result = await service.GetByTicketAsync(
            ticket.Id,
            agentId,
            UserRole.Agent);

        Assert.Equal(2, result.Count);

        Assert.Contains(
            result,
            x => x.IsInternal);

        Assert.Contains(
            result,
            x => !x.IsInternal);
    }
}