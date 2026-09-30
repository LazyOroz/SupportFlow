using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SupportFlow.Domain.Enums;
using SupportFlow.Infrastructure.Persistence;

namespace SupportFlow.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly SupportFlowDbContext _dbContext;

    public UsersController(SupportFlowDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet("agents")]
    public async Task<IActionResult> GetAgents()
    {
        var agents = await _dbContext.Users
            .AsNoTracking()
            .Where(user =>
                user.Role == UserRole.Agent &&
                user.IsActive)
            .OrderBy(user => user.FirstName)
            .ThenBy(user => user.LastName)
            .Select(user => new
            {
                user.Id,
                user.FirstName,
                user.LastName,
                user.Email
            })
            .ToListAsync();

        return Ok(agents);
    }
}