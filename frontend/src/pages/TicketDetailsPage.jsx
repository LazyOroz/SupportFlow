import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getTicketById,
  getTicketComments,
  addTicketComment,
  addInternalNote,
  updateTicketStatus,
} from "../services/api";

function TicketDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const storedUser = localStorage.getItem("supportflow_user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("reply");

  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [error, setError] = useState("");

  const isAgent = user?.role === "Agent";
  const isAdmin = user?.role === "Admin";

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    try {
      setError("");

      const [ticketData, commentsData] = await Promise.all([
        getTicketById(id),
        getTicketComments(id),
      ]);

      setTicket(ticketData);
      setComments(commentsData ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSendMessage(event) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    try {
      setError("");
      setIsSending(true);

      if (messageType === "internal") {
        await addInternalNote(id, trimmedMessage);
        } else {
        await addTicketComment(id, trimmedMessage);
        }

      setMessage("");

      const updatedComments =
        await getTicketComments(id);

      setComments(updatedComments ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  }

  async function handleStatusChange(newStatus) {
    try {
      setError("");
      setIsUpdatingStatus(true);

      await updateTicketStatus(id, newStatus);

      const updatedTicket =
        await getTicketById(id);

      setTicket(updatedTicket);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  function formatDate(date) {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleString();
  }

  function isMyComment(comment) {
    if (!user) {
      return false;
    }

    return (
      comment.authorId === user.userId ||
      comment.authorEmail === user.email
    );
  }

  function handleBack() {
    if (isAgent || isAdmin) {
      navigate("/dashboard");
      return;
    }

    navigate("/tickets");
  }

  if (isLoading) {
    return (
      <div className="ticket-details-page">
        <div className="ticket-details-container">
          <div className="ticket-details-card">
            Loading ticket...
          </div>
        </div>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="ticket-details-page">
        <div className="ticket-details-container">
          <button
            className="back-button"
            onClick={handleBack}
          >
            ← Back
          </button>

          <div className="dashboard-error">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return null;
  }

  return (
    <div className="ticket-details-page">
      <div className="ticket-details-container">

        <button
          className="back-button"
          onClick={handleBack}
        >
          ← Back
        </button>

        <div className="ticket-details-top">
          <div>
            <span className="ticket-details-number">
              {ticket.ticketNumber}
            </span>

            <h1>{ticket.title}</h1>
          </div>

          <span
            className={`status-badge status-${ticket.status.toLowerCase()}`}
          >
            {ticket.status}
          </span>
        </div>

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        {isAgent && (
          <div className="agent-actions-card">
            <div>
              <strong>Agent actions</strong>

              <p>
                Update the status of this support ticket.
              </p>
            </div>

            <div className="agent-actions-buttons">

              {ticket.status === "Open" && (
                <button
                  className="start-working-button"
                  disabled={isUpdatingStatus}
                  onClick={() =>
                    handleStatusChange("InProgress")
                  }
                >
                  {isUpdatingStatus
                    ? "Updating..."
                    : "Start Working"}
                </button>
              )}

              {ticket.status === "InProgress" && (
                <button
                  className="resolve-ticket-button"
                  disabled={isUpdatingStatus}
                  onClick={() =>
                    handleStatusChange("Resolved")
                  }
                >
                  {isUpdatingStatus
                    ? "Updating..."
                    : "Mark as Resolved"}
                </button>
              )}

              {ticket.status === "Resolved" && (
                <div className="ticket-completed-message">
                  ✓ Ticket resolved
                </div>
              )}

              {ticket.status === "Closed" && (
                <div className="ticket-completed-message">
                  ✓ Ticket closed
                </div>
              )}

            </div>
          </div>
        )}

        <div className="ticket-details-grid">

          <section className="ticket-details-card">
            <h2>Description</h2>

            <p className="ticket-description">
              {ticket.description}
            </p>
          </section>

          <aside className="ticket-details-card">
            <h2>Ticket information</h2>

            <div className="ticket-info-list">

              <div className="ticket-info-item">
                <span>Status</span>
                <strong>{ticket.status}</strong>
              </div>

              <div className="ticket-info-item">
                <span>Priority</span>
                <strong>{ticket.priority}</strong>
              </div>

              <div className="ticket-info-item">
                <span>Category</span>
                <strong>{ticket.category}</strong>
              </div>

              <div className="ticket-info-item">
                <span>Created</span>

                <strong>
                  {formatDate(ticket.createdAt)}
                </strong>
              </div>

              <div className="ticket-info-item">
                <span>Updated</span>

                <strong>
                  {formatDate(ticket.updatedAt)}
                </strong>
              </div>

              <div className="ticket-info-item">
                <span>Assigned agent</span>

                <strong>
                  {ticket.assignedToName ||
                    ticket.assignedToEmail ||
                    "Not assigned"}
                </strong>
              </div>

            </div>
          </aside>

        </div>

        <section className="ticket-details-card conversation-card">

          <div className="conversation-header">
            <div>
              <h2>Conversation</h2>

              <p>
                Messages between the customer and support team.
              </p>
            </div>
          </div>

          {comments.length === 0 ? (
            <div className="conversation-empty">
              <div className="empty-icon">
                💬
              </div>

              <h3>No messages yet</h3>

              <p>
                Send the first message about this ticket.
              </p>
            </div>
          ) : (
            <div className="messages-list">

              {comments.map((comment) => {
                const mine = isMyComment(comment);

                return (
                  <div
                    key={comment.id}
                    className={
                      mine
                        ? "message-row message-row-mine"
                        : "message-row"
                    }
                  >
                    <div
                    className={
                        comment.isInternal
                        ? "message-bubble internal-note-bubble"
                        : mine
                            ? "message-bubble message-bubble-mine"
                            : "message-bubble"
                    }
                    >
                        {comment.isInternal && (
                        <div className="internal-note-label">
                            🔒 INTERNAL NOTE
                        </div>
                        )}
                      <div className="message-author">
                        {mine
                          ? "You"
                          : comment.authorName ||
                            comment.authorEmail ||
                            "User"}
                      </div>

                      <div className="message-content">
                        {comment.content}
                      </div>

                      <div className="message-date">
                        {formatDate(comment.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}

            </div>
          )}

          <form
            className="message-form"
            onSubmit={handleSendMessage}
          >
            {(isAgent || isAdmin) && (
            <div className="message-type-selector">
                <button
                type="button"
                className={
                    messageType === "reply"
                    ? "message-type-button active"
                    : "message-type-button"
                }
                onClick={() => setMessageType("reply")}
                >
                Reply to Customer
                </button>

                <button
                type="button"
                className={
                    messageType === "internal"
                    ? "message-type-button internal active"
                    : "message-type-button internal"
                }
                onClick={() => setMessageType("internal")}
                >
                🔒 Internal Note
                </button>
            </div>
            )}
            <textarea
              placeholder={
                messageType === "internal"
                    ? "Write an internal note..."
                    : "Write a reply..."
                }
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              disabled={isSending}
              required
            />

            <div className="message-form-footer">
              <span>
                Your message will be visible in this ticket.
              </span>

              <button
                type="submit"
                className="create-ticket-button"
                disabled={
                  isSending || !message.trim()
                }
              >
                {isSending
                  ? "Sending..."
                  : "Send"}
              </button>
            </div>
          </form>

        </section>

      </div>
    </div>
  );
}

export default TicketDetailsPage;