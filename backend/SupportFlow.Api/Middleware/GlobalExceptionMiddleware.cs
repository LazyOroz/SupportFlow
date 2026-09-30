using System.Net;
using System.Text.Json;

namespace SupportFlow.Api.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(
        HttpContext context,
        Exception exception)
    {
        var statusCode = exception switch
        {
            UnauthorizedAccessException =>
                HttpStatusCode.Forbidden,

            InvalidOperationException =>
                HttpStatusCode.BadRequest,

            KeyNotFoundException =>
                HttpStatusCode.NotFound,

            _ =>
                HttpStatusCode.InternalServerError
        };

        if (statusCode == HttpStatusCode.InternalServerError)
        {
            _logger.LogError(
                exception,
                "An unexpected error occurred.");
        }
        else
        {
            _logger.LogWarning(
                exception,
                "Request failed with status code {StatusCode}.",
                (int)statusCode);
        }

        var message = statusCode ==
                      HttpStatusCode.InternalServerError
            ? "An unexpected server error occurred."
            : exception.Message;

        var response = new
        {
            statusCode = (int)statusCode,
            message
        };

        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/json";

        var json = JsonSerializer.Serialize(response);

        await context.Response.WriteAsync(json);
    }
}