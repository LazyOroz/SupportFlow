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

    Task<PagedResult<TicketResponse>> GetAllTicketsAsync(
        TicketQueryRequest query);

    Task<IReadOnlyList<TicketResponse>> GetAssignedTicketsAsync(
        Guid agentId);

    Task<TicketResponse?> GetByIdAsync(
        Guid ticketId,
        Guid userId,
        UserRole userRole);

    Task<TicketResponse?> UpdateStatusAsync(
        Guid ticketId,
        TicketStatus status,
        Guid userId,
        UserRole userRole);

    Task<TicketResponse?> AssignToAgentAsync(
        Guid ticketId,
        Guid agentId);
}