using SupportFlow.Domain.Entities;

namespace SupportFlow.Application.Auth.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
}