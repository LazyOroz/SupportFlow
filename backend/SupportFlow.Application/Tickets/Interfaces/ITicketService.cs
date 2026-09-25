using SupportFlow.Application.Tickets.DTOs;
using SupportFlow.Domain.Enums;

namespace SupportFlow.Application.Tickets.Interfaces;

public interface ITicketService
{
    Task<TicketResponse> CreateAsync(
        CreateTicketRequest request,
        Guid createdById);

    Task<IReadOnlyList<TicketResponse>> GetMyTicketsAsync(
        Guid userId);

    Task<TicketResponse?> GetByIdAsync(
        Guid ticketId,
        Guid userId);

    Task<TicketResponse?> UpdateStatusAsync(
        Guid ticketId,
        TicketStatus status);

    Task<TicketResponse?> AssignToAgentAsync(
        Guid ticketId,
        Guid agentId);

    Task<IReadOnlyList<TicketResponse>> GetAssignedToMeAsync(
        Guid agentId);
}