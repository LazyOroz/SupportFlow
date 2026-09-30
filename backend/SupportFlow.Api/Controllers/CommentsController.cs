using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SupportFlow.Application.Comments.DTOs;
using SupportFlow.Application.Comments.Interfaces;
using SupportFlow.Domain.Enums;

namespace SupportFlow.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/tickets/{ticketId:guid}/comments")]
public class CommentsController : ControllerBase
{
    private readonly ICommentService _commentService;

    public CommentsController(ICommentService commentService)
    {
        _commentService = commentService;
    }

    // POST: /api/tickets/{ticketId}/comments
    [HttpPost]
    public async Task<ActionResult<CommentResponse>> Create(
        Guid ticketId,
        [FromBody] CreateCommentRequest request)
    {
        var userId = GetCurrentUserId();
        var userRole = GetCurrentUserRole();

        if (userId is null || userRole is null)
        {
            return Unauthorized(new
            {
                message = "Invalid user information."
            });
        }

        try
        {
            var comment = await _commentService.CreateAsync(
                ticketId,
                userId.Value,
                userRole.Value,
                request);

            return Ok(comment);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // GET: /api/tickets/{ticketId}/comments
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CommentResponse>>> GetAll(
        Guid ticketId)
    {
        var userId = GetCurrentUserId();
        var userRole = GetCurrentUserRole();

        if (userId is null || userRole is null)
        {
            return Unauthorized(new
            {
                message = "Invalid user information."
            });
        }

        try
        {
            var comments = await _commentService.GetByTicketAsync(
                ticketId,
                userId.Value,
                userRole.Value);

            return Ok(comments);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                message = ex.Message
            });
        }
    }

    private Guid? GetCurrentUserId()
    {
        var value = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (Guid.TryParse(value, out var userId))
        {
            return userId;
        }

        return null;
    }

    private UserRole? GetCurrentUserRole()
    {
        var value = User.FindFirstValue(
            ClaimTypes.Role);

        if (Enum.TryParse<UserRole>(
            value,
            ignoreCase: true,
            out var role))
        {
            return role;
        }

        return null;
    }
}