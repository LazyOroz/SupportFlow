using Microsoft.EntityFrameworkCore;
using SupportFlow.Application.Comments.DTOs;
using SupportFlow.Application.Comments.Interfaces;
using SupportFlow.Domain.Entities;
using SupportFlow.Domain.Enums;
using SupportFlow.Infrastructure.Persistence;

namespace SupportFlow.Infrastructure.Services;

public class CommentService : ICommentService
{
    private readonly SupportFlowDbContext _dbContext;

    public CommentService(SupportFlowDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<CommentResponse> CreateAsync(
        Guid ticketId,
        Guid authorId,
        UserRole authorRole,
        CreateCommentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Content))
        {
            throw new InvalidOperationException(
                "Comment content cannot be empty.");
        }

        var ticket = await _dbContext.Tickets
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == ticketId);

        if (ticket is null)
        {
            throw new KeyNotFoundException(
                "Ticket not found.");
        }

        var hasAccess = authorRole switch
        {
            UserRole.Customer =>
                ticket.CreatedById == authorId,

            UserRole.Agent =>
                ticket.AssignedToId == authorId,

            UserRole.Admin => true,

            _ => false
        };

        if (!hasAccess)
        {
            throw new UnauthorizedAccessException(
                "You do not have access to this ticket.");
        }

        if (authorRole == UserRole.Customer && request.IsInternal)
        {
            throw new UnauthorizedAccessException(
                "Customers cannot create internal comments.");
        }

        var comment = new Comment
        {
            Id = Guid.NewGuid(),
            Content = request.Content.Trim(),
            TicketId = ticketId,
            AuthorId = authorId,
            IsInternal = request.IsInternal,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Comments.Add(comment);
        await _dbContext.SaveChangesAsync();

        return await MapToResponseAsync(comment);
    }

    public async Task<IReadOnlyList<CommentResponse>> GetByTicketAsync(
        Guid ticketId,
        Guid userId,
        UserRole userRole)
    {
        var ticket = await _dbContext.Tickets
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == ticketId);

        if (ticket is null)
        {
            throw new KeyNotFoundException(
                "Ticket not found.");
        }

        var hasAccess = userRole switch
        {
            UserRole.Customer =>
                ticket.CreatedById == userId,

            UserRole.Agent =>
                ticket.AssignedToId == userId,

            UserRole.Admin => true,

            _ => false
        };

        if (!hasAccess)
        {
            throw new UnauthorizedAccessException(
                "You do not have access to this ticket.");
        }

        var query = _dbContext.Comments
            .AsNoTracking()
            .Include(x => x.Author)
            .Where(x => x.TicketId == ticketId);

        if (userRole == UserRole.Customer)
        {
            query = query.Where(x => !x.IsInternal);
        }

        var comments = await query
            .OrderBy(x => x.CreatedAt)
            .ToListAsync();

        return comments
            .Select(MapToResponse)
            .ToList();
    }

    private async Task<CommentResponse> MapToResponseAsync(
        Comment comment)
    {
        var author = await _dbContext.Users
            .AsNoTracking()
            .FirstAsync(x => x.Id == comment.AuthorId);

        return new CommentResponse
        {
            Id = comment.Id,
            Content = comment.Content,
            TicketId = comment.TicketId,
            AuthorId = comment.AuthorId,
            AuthorName = $"{author.FirstName} {author.LastName}",
            AuthorRole = author.Role.ToString(),
            IsInternal = comment.IsInternal,
            CreatedAt = comment.CreatedAt
        };
    }

    private static CommentResponse MapToResponse(
        Comment comment)
    {
        return new CommentResponse
        {
            Id = comment.Id,
            Content = comment.Content,
            TicketId = comment.TicketId,
            AuthorId = comment.AuthorId,
            AuthorName =
                $"{comment.Author.FirstName} {comment.Author.LastName}",
            AuthorRole = comment.Author.Role.ToString(),
            IsInternal = comment.IsInternal,
            CreatedAt = comment.CreatedAt
        };
    }
}