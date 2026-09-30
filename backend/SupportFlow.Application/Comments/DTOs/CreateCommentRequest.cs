namespace SupportFlow.Application.Comments.DTOs;

public class CreateCommentRequest
{
    public string Content { get; set; } = string.Empty;

    public bool IsInternal { get; set; } = false;
}