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

    public async Task<PagedResult<TicketResponse>> GetAllTicketsAsync(
        TicketQueryRequest query)
    {
        var ticketsQuery = _dbContext.Tickets
            .AsNoTracking()
            .AsQueryable();

        // Search by ticket number, title or description
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim();

            ticketsQuery = ticketsQuery.Where(x =>
                x.TicketNumber.Contains(search) ||
                x.Title.Contains(search) ||
                x.Description.Contains(search));
        }

        // Filter by status
        if (query.Status.HasValue)
        {
            ticketsQuery = ticketsQuery.Where(x =>
                x.Status == query.Status.Value);
        }

        // Filter by priority
        if (query.Priority.HasValue)
        {
            ticketsQuery = ticketsQuery.Where(x =>
                x.Priority == query.Priority.Value);
        }

        // Filter by category
        if (query.Category.HasValue)
        {
            ticketsQuery = ticketsQuery.Where(x =>
                x.Category == query.Category.Value);
        }

        // Filter by assigned agent
        if (query.AssignedToId.HasValue)
        {
            ticketsQuery = ticketsQuery.Where(x =>
                x.AssignedToId == query.AssignedToId.Value);
        }

        // Protect pagination from invalid values
        var page = query.Page < 1
            ? 1
            : query.Page;

        var pageSize = query.PageSize switch
        {
            < 1 => 20,
            > 100 => 100,
            _ => query.PageSize
        };

        // Count BEFORE Skip/Take
        var totalCount = await ticketsQuery.CountAsync();

        var totalPages = totalCount == 0
            ? 0
            : (int)Math.Ceiling(
                totalCount / (double)pageSize);

        var tickets = await ticketsQuery
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<TicketResponse>
        {
            Items = tickets
                .Select(MapToResponse)
                .ToList(),

            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages
        };
    }

    public async Task<IReadOnlyList<TicketResponse>> GetAssignedTicketsAsync(
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

    public async Task<TicketResponse?> GetByIdAsync(
        Guid ticketId,
        Guid userId,
        UserRole userRole)
    {
        var ticket = await _dbContext.Tickets
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == ticketId);

        if (ticket is null)
        {
            return null;
        }

        var hasAccess = userRole switch
        {
            UserRole.Customer =>
                ticket.CreatedById == userId,

            UserRole.Agent =>
                ticket.AssignedToId == userId,

            UserRole.Admin =>
                true,

            _ => false
        };

        if (!hasAccess)
        {
            throw new UnauthorizedAccessException(
                "You do not have access to this ticket.");
        }

        return MapToResponse(ticket);
    }

    public async Task<TicketResponse?> UpdateStatusAsync(
        Guid ticketId,
        TicketStatus status,
        Guid userId,
        UserRole userRole)
    {
        var ticket = await _dbContext.Tickets
            .FirstOrDefaultAsync(x => x.Id == ticketId);

        if (ticket is null)
        {
            return null;
        }

        // Admin can update any ticket.
        // Agent can update only a ticket assigned to them.
        if (userRole == UserRole.Agent &&
            ticket.AssignedToId != userId)
        {
            throw new UnauthorizedAccessException(
                "You can only update tickets assigned to you.");
        }

        if (userRole != UserRole.Agent &&
            userRole != UserRole.Admin)
        {
            throw new UnauthorizedAccessException(
                "You do not have permission to update ticket status.");
        }

        // Check whether the status transition is allowed.
        var isValidTransition = ticket.Status switch
        {
            TicketStatus.Open =>
                status == TicketStatus.InProgress,

            TicketStatus.InProgress =>
                status == TicketStatus.Resolved,

            TicketStatus.Resolved =>
                status == TicketStatus.Closed,

            TicketStatus.Closed =>
                false,

            _ => false
        };

        if (!isValidTransition)
        {
            throw new InvalidOperationException(
                $"Cannot change ticket status from {ticket.Status} to {status}.");
        }

        ticket.Status = status;
        ticket.UpdatedAt = DateTime.UtcNow;

        if (status == TicketStatus.Resolved &&
            ticket.ResolvedAt is null)
        {
            ticket.ResolvedAt = DateTime.UtcNow;
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