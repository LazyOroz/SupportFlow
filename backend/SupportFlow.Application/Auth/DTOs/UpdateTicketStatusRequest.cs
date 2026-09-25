using SupportFlow.Domain.Enums;

namespace SupportFlow.Application.Tickets.DTOs;

public class UpdateTicketStatusRequest
{
    public TicketStatus Status { get; set; }
}