namespace SupportFlow.Application.Comments.DTOs;

public class CommentResponse
{
    public Guid Id { get; set; }

    public string Content { get; set; } = string.Empty;

    public Guid TicketId { get; set; }

    public Guid AuthorId { get; set; }

    public string AuthorName { get; set; } = string.Empty;

    public string AuthorRole { get; set; } = string.Empty;

    public bool IsInternal { get; set; }

    public DateTime CreatedAt { get; set; }
}
