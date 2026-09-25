using SupportFlow.Domain.Enums;

namespace SupportFlow.Domain.Entities;

public class Ticket
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string TicketNumber { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public TicketStatus Status { get; set; } = TicketStatus.Open;

    public TicketPriority Priority { get; set; } = TicketPriority.Medium;

    public TicketCategory Category { get; set; } = TicketCategory.General;

    public Guid CreatedById { get; set; }

    public User CreatedBy { get; set; } = null!;

    public Guid? AssignedToId { get; set; }

    public User? AssignedTo { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public DateTime? ResolvedAt { get; set; }

    public ICollection<Comment> Comments { get; set; }
        = new List<Comment>();
}