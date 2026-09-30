using SupportFlow.Application.Comments.DTOs;
using SupportFlow.Domain.Enums;

namespace SupportFlow.Application.Comments.Interfaces;

public interface ICommentService
{
    Task<CommentResponse> CreateAsync(
        Guid ticketId,
        Guid authorId,
        UserRole authorRole,
        CreateCommentRequest request);

    Task<IReadOnlyList<CommentResponse>> GetByTicketAsync(
        Guid ticketId,
        Guid userId,
        UserRole userRole);
}