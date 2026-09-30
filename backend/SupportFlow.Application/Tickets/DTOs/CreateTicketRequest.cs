using System.ComponentModel.DataAnnotations;
using SupportFlow.Domain.Enums;

namespace SupportFlow.Application.Tickets.DTOs;

public class CreateTicketRequest
{
    [Required(ErrorMessage = "Title is required.")]
    [StringLength(
        200,
        MinimumLength = 3,
        ErrorMessage = "Title must be between 3 and 200 characters.")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Description is required.")]
    [StringLength(
        5000,
        MinimumLength = 10,
        ErrorMessage = "Description must be between 10 and 5000 characters.")]
    public string Description { get; set; } = string.Empty;

    [EnumDataType(
        typeof(TicketPriority),
        ErrorMessage = "Invalid ticket priority.")]
    public TicketPriority Priority { get; set; }
        = TicketPriority.Medium;

    [EnumDataType(
        typeof(TicketCategory),
        ErrorMessage = "Invalid ticket category.")]
    public TicketCategory Category { get; set; }
        = TicketCategory.General;
}