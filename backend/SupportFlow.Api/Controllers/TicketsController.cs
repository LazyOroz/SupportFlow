using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SupportFlow.Application.Tickets.DTOs;
using SupportFlow.Application.Tickets.Interfaces;

namespace SupportFlow.Api.Controllers;

[ApiController]
[Route("api/tickets")]
[Authorize]
public class TicketsController : ControllerBase
{
    private readonly ITicketService _ticketService;

    public TicketsController(ITicketService ticketService)
    {
        _ticketService = ticketService;
    }

    // POST: /api/tickets
    [HttpPost]
    public async Task<ActionResult<TicketResponse>> Create(
        CreateTicketRequest request)
    {
        var userId = GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized(new
            {
                message = "Invalid user identifier."
            });
        }

        var ticket = await _ticketService.CreateAsync(
            request,
            userId.Value);

        return StatusCode(
            StatusCodes.Status201Created,
            ticket);
    }

    // GET: /api/tickets
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TicketResponse>>> GetMyTickets()
    {
        var userId = GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized(new
            {
                message = "Invalid user identifier."
            });
        }

        var tickets = await _ticketService.GetMyTicketsAsync(
            userId.Value);

        return Ok(tickets);
    }

    // GET: /api/tickets/{id}
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TicketResponse>> GetById(
        Guid id)
    {
        var userId = GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized(new
            {
                message = "Invalid user identifier."
            });
        }

        var ticket = await _ticketService.GetByIdAsync(
            id,
            userId.Value);

        if (ticket is null)
        {
            return NotFound(new
            {
                message = "Ticket not found."
            });
        }

        return Ok(ticket);
    }

    // PATCH: /api/tickets/{id}/status
    [Authorize(Roles = "Agent,Admin")]
    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult<TicketResponse>> UpdateStatus(
        Guid id,
        UpdateTicketStatusRequest request)
    {
        var ticket = await _ticketService.UpdateStatusAsync(
            id,
            request.Status);

        if (ticket is null)
        {
            return NotFound(new
            {
                message = "Ticket not found."
            });
        }

        return Ok(ticket);
    }

    // PATCH: /api/tickets/{ticketId}/assign/{agentId}
    [Authorize(Roles = "Admin")]
    [HttpPatch("{ticketId:guid}/assign/{agentId:guid}")]
    public async Task<ActionResult<TicketResponse>> AssignToAgent(
        Guid ticketId,
        Guid agentId)
    {
        try
        {
            var ticket = await _ticketService.AssignToAgentAsync(
                ticketId,
                agentId);

            if (ticket is null)
            {
                return NotFound(new
                {
                    message = "Ticket not found."
                });
            }

            return Ok(ticket);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    private Guid? GetCurrentUserId()
    {
        var userIdValue = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userIdValue, out var userId))
        {
            return null;
        }

        return userId;
    }
}