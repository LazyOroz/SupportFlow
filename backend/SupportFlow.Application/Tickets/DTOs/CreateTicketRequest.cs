using SupportFlow.Domain.Enums;

namespace SupportFlow.Application.Tickets.DTOs;

public class CreateTicketRequest
{
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public TicketPriority Priority { get; set; }
        = TicketPriority.Medium;

    public TicketCategory Category { get; set; }
        = TicketCategory.General;
}