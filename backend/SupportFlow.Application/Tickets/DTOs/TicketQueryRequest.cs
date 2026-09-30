using SupportFlow.Domain.Enums;

namespace SupportFlow.Application.Tickets.DTOs;

public class TicketQueryRequest
{
    public string? Search { get; set; }

    public TicketStatus? Status { get; set; }

    public TicketPriority? Priority { get; set; }

    public TicketCategory? Category { get; set; }

    public Guid? AssignedToId { get; set; }

    public int Page { get; set; } = 1;

    public int PageSize { get; set; } = 20;
}