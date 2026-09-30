import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyTickets } from "../services/api";

function MyTicketsPage() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTickets() {
      try {
        const data = await getMyTickets();
        setTickets(data ?? []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadTickets();
  }, []);

  return (
    <div className="tickets-page">
      <div className="tickets-page-container">

        <div className="tickets-page-header">
          <div>
            <button
              className="back-button"
              onClick={() => navigate("/dashboard")}
            >
              ← Back to dashboard
            </button>

            <h1>My Tickets</h1>

            <p>
              View and manage your support requests.
            </p>
          </div>

          <button
            className="create-ticket-button"
            onClick={() => navigate("/tickets/create")}
          >
            + Create ticket
          </button>
        </div>

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        <div className="my-tickets-card">

          {isLoading ? (
            <div className="tickets-empty">
              Loading tickets...
            </div>
          ) : tickets.length === 0 ? (
            <div className="tickets-empty">
              <div className="empty-icon">
                ▤
              </div>

              <h3>No tickets yet</h3>

              <p>
                You haven't created any support tickets yet.
              </p>

              <button
                className="create-ticket-button"
                onClick={() => navigate("/tickets/create")}
              >
                + Create ticket
              </button>
            </div>
          ) : (
            <div className="ticket-list">
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  className="my-ticket-row"
                  onClick={() =>
                    navigate(`/tickets/${ticket.id}`)
                  }
                >
                  <div className="ticket-main-info">
                    <span className="ticket-number">
                      {ticket.ticketNumber}
                    </span>

                    <strong>
                      {ticket.title}
                    </strong>

                    <span className="ticket-category">
                      {ticket.category}
                    </span>
                  </div>

                  <div className="ticket-meta">
                    <span
                      className={`status-badge status-${ticket.status.toLowerCase()}`}
                    >
                      {ticket.status}
                    </span>

                    <span className="priority-text">
                      {ticket.priority}
                    </span>

                    <span className="ticket-arrow">
                      →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default MyTicketsPage;