using Microsoft.EntityFrameworkCore;
using SupportFlow.Domain.Entities;
using SupportFlow.Domain.Enums;
using SupportFlow.Infrastructure.Persistence;
using SupportFlow.Infrastructure.Services;

namespace SupportFlow.Tests.Tickets;

public class TicketServiceTests
{
    private static SupportFlowDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<SupportFlowDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new SupportFlowDbContext(options);
    }

    private static Ticket CreateTicket(
        Guid agentId,
        TicketStatus status)
    {
        return new Ticket
        {
            Id = Guid.NewGuid(),
            TicketNumber = $"SF-TEST-{Guid.NewGuid():N}",
            Title = "Test ticket",
            Description = "Ticket created for automated testing.",
            Status = status,
            Priority = TicketPriority.Medium,
            Category = TicketCategory.Technical,
            CreatedById = Guid.NewGuid(),
            AssignedToId = agentId,
            CreatedAt = DateTime.UtcNow
        };
    }

    [Fact]
    public async Task UpdateStatus_OpenToInProgress_ShouldSucceed()
    {
        await using var dbContext = CreateDbContext();

        var agentId = Guid.NewGuid();
        var ticket = CreateTicket(
            agentId,
            TicketStatus.Open);

        dbContext.Tickets.Add(ticket);
        await dbContext.SaveChangesAsync();

        var service = new TicketService(dbContext);

        var result = await service.UpdateStatusAsync(
            ticket.Id,
            TicketStatus.InProgress,
            agentId,
            UserRole.Agent);

        Assert.NotNull(result);
        Assert.Equal(
            TicketStatus.InProgress,
            result.Status);

        Assert.NotNull(result.UpdatedAt);
        Assert.Null(result.ResolvedAt);
    }

    [Fact]
    public async Task UpdateStatus_InProgressToResolved_ShouldSetResolvedAt()
    {
        await using var dbContext = CreateDbContext();

        var agentId = Guid.NewGuid();
        var ticket = CreateTicket(
            agentId,
            TicketStatus.InProgress);

        dbContext.Tickets.Add(ticket);
        await dbContext.SaveChangesAsync();

        var service = new TicketService(dbContext);

        var result = await service.UpdateStatusAsync(
            ticket.Id,
            TicketStatus.Resolved,
            agentId,
            UserRole.Agent);

        Assert.NotNull(result);
        Assert.Equal(
            TicketStatus.Resolved,
            result.Status);

        Assert.NotNull(result.ResolvedAt);
        Assert.NotNull(result.UpdatedAt);
    }

    [Fact]
    public async Task UpdateStatus_ResolvedToClosed_ShouldPreserveResolvedAt()
    {
        await using var dbContext = CreateDbContext();

        var agentId = Guid.NewGuid();

        var originalResolvedAt = DateTime.UtcNow.AddMinutes(-10);

        var ticket = CreateTicket(
            agentId,
            TicketStatus.Resolved);

        ticket.ResolvedAt = originalResolvedAt;

        dbContext.Tickets.Add(ticket);
        await dbContext.SaveChangesAsync();

        var service = new TicketService(dbContext);

        var result = await service.UpdateStatusAsync(
            ticket.Id,
            TicketStatus.Closed,
            agentId,
            UserRole.Agent);

        Assert.NotNull(result);
        Assert.Equal(
            TicketStatus.Closed,
            result.Status);

        Assert.Equal(
            originalResolvedAt,
            result.ResolvedAt);
    }

    [Fact]
    public async Task UpdateStatus_ClosedToOpen_ShouldThrowException()
    {
        await using var dbContext = CreateDbContext();

        var agentId = Guid.NewGuid();

        var ticket = CreateTicket(
            agentId,
            TicketStatus.Closed);

        ticket.ResolvedAt = DateTime.UtcNow;

        dbContext.Tickets.Add(ticket);
        await dbContext.SaveChangesAsync();

        var service = new TicketService(dbContext);

        var exception =
            await Assert.ThrowsAsync<InvalidOperationException>(
                () => service.UpdateStatusAsync(
                    ticket.Id,
                    TicketStatus.Open,
                    agentId,
                    UserRole.Agent));

        Assert.Contains(
            "Cannot change ticket status",
            exception.Message);
    }

    [Fact]
    public async Task UpdateStatus_UnassignedAgent_ShouldThrowUnauthorized()
    {
        await using var dbContext = CreateDbContext();

        var assignedAgentId = Guid.NewGuid();
        var anotherAgentId = Guid.NewGuid();

        var ticket = CreateTicket(
            assignedAgentId,
            TicketStatus.Open);

        dbContext.Tickets.Add(ticket);
        await dbContext.SaveChangesAsync();

        var service = new TicketService(dbContext);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => service.UpdateStatusAsync(
                ticket.Id,
                TicketStatus.InProgress,
                anotherAgentId,
                UserRole.Agent));
    }

    [Fact]
    public async Task UpdateStatus_Admin_ShouldUpdateTicket()
    {
        await using var dbContext = CreateDbContext();

        var agentId = Guid.NewGuid();
        var adminId = Guid.NewGuid();

        var ticket = CreateTicket(
            agentId,
            TicketStatus.Open);

        dbContext.Tickets.Add(ticket);
        await dbContext.SaveChangesAsync();

        var service = new TicketService(dbContext);

        var result = await service.UpdateStatusAsync(
            ticket.Id,
            TicketStatus.InProgress,
            adminId,
            UserRole.Admin);

        Assert.NotNull(result);
        Assert.Equal(
            TicketStatus.InProgress,
            result.Status);
    }
}