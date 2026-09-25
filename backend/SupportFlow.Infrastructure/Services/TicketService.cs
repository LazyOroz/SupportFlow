using Microsoft.EntityFrameworkCore;
using SupportFlow.Application.Tickets.DTOs;
using SupportFlow.Application.Tickets.Interfaces;
using SupportFlow.Domain.Entities;
using SupportFlow.Domain.Enums;
using SupportFlow.Infrastructure.Persistence;

namespace SupportFlow.Infrastructure.Services;

public class TicketService : ITicketService
{
    private readonly SupportFlowDbContext _dbContext;

    public TicketService(SupportFlowDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<TicketResponse> CreateAsync(
        CreateTicketRequest request,
        Guid createdById)
    {
        var userExists = await _dbContext.Users
            .AnyAsync(x =>
                x.Id == createdById &&
                x.IsActive);

        if (!userExists)
        {
            throw new InvalidOperationException(
                "User does not exist or is inactive.");
        }

        var ticket = new Ticket
        {
            Id = Guid.NewGuid(),
            TicketNumber = GenerateTicketNumber(),
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            Status = TicketStatus.Open,
            Priority = request.Priority,
            Category = request.Category,
            CreatedById = createdById,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Tickets.Add(ticket);

        await _dbContext.SaveChangesAsync();

        return MapToResponse(ticket);
    }

    public async Task<IReadOnlyList<TicketResponse>> GetMyTicketsAsync(
        Guid userId)
    {
        var tickets = await _dbContext.Tickets
            .AsNoTracking()
            .Where(x => x.CreatedById == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return tickets
            .Select(MapToResponse)
            .ToList();
    }

    public async Task<TicketResponse?> GetByIdAsync(
        Guid ticketId,
        Guid userId)
    {
        var ticket = await _dbContext.Tickets
            .AsNoTracking()
            .FirstOrDefaultAsync(x =>
                x.Id == ticketId &&
                x.CreatedById == userId);

        if (ticket is null)
        {
            return null;
        }

        return MapToResponse(ticket);
    }

    public async Task<TicketResponse?> UpdateStatusAsync(
        Guid ticketId,
        TicketStatus status)
    {
        var ticket = await _dbContext.Tickets
            .FirstOrDefaultAsync(x => x.Id == ticketId);

        if (ticket is null)
        {
            return null;
        }

        ticket.Status = status;
        ticket.UpdatedAt = DateTime.UtcNow;

        if (status == TicketStatus.Resolved)
        {
            ticket.ResolvedAt = DateTime.UtcNow;
        }
        else
        {
            ticket.ResolvedAt = null;
        }

        await _dbContext.SaveChangesAsync();

        return MapToResponse(ticket);
    }

    public async Task<TicketResponse?> AssignToAgentAsync(
        Guid ticketId,
        Guid agentId)
    {
        var ticket = await _dbContext.Tickets
            .FirstOrDefaultAsync(x => x.Id == ticketId);

        if (ticket is null)
        {
            return null;
        }

        var agentExists = await _dbContext.Users
            .AnyAsync(x =>
                x.Id == agentId &&
                x.Role == UserRole.Agent &&
                x.IsActive);

        if (!agentExists)
        {
            throw new InvalidOperationException(
                "Agent does not exist or is inactive.");
        }

        ticket.AssignedToId = agentId;
        ticket.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return MapToResponse(ticket);
    }

    public async Task<IReadOnlyList<TicketResponse>> GetAssignedToMeAsync(
        Guid agentId)
    {
        var tickets = await _dbContext.Tickets
            .AsNoTracking()
            .Where(x => x.AssignedToId == agentId)
            .OrderByDescending(x => x.UpdatedAt ?? x.CreatedAt)
            .ToListAsync();

        return tickets
            .Select(MapToResponse)
            .ToList();
    }

    private static TicketResponse MapToResponse(
        Ticket ticket)
    {
        return new TicketResponse
        {
            Id = ticket.Id,
            TicketNumber = ticket.TicketNumber,
            Title = ticket.Title,
            Description = ticket.Description,
            Status = ticket.Status,
            Priority = ticket.Priority,
            Category = ticket.Category,
            CreatedById = ticket.CreatedById,
            AssignedToId = ticket.AssignedToId,
            CreatedAt = ticket.CreatedAt,
            UpdatedAt = ticket.UpdatedAt,
            ResolvedAt = ticket.ResolvedAt
        };
    }

    private static string GenerateTicketNumber()
    {
        var randomPart = Guid.NewGuid()
            .ToString("N")[..6]
            .ToUpperInvariant();

        return $"SF-{DateTime.UtcNow:yyyyMMdd}-{randomPart}";
    }
}