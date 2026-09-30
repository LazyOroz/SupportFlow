import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAssignedTickets } from "../services/api";

function AgentDashboardPage() {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("supportflow_user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTickets() {
      try {
        setError("");
        setIsLoading(true);

        const data = await getAssignedTickets();

        setTickets(
          Array.isArray(data)
            ? data
            : data?.items ?? []
        );
      } catch (err) {
        setError(err.message);
        setTickets([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadTickets();
  }, []);

  function handleLogout() {
    localStorage.removeItem("supportflow_token");
    localStorage.removeItem("supportflow_user");

    navigate("/login");
  }

  const openTickets = tickets.filter(
    (ticket) => ticket.status === "Open"
  ).length;

  const inProgressTickets = tickets.filter(
    (ticket) => ticket.status === "InProgress"
  ).length;

  const resolvedTickets = tickets.filter(
    (ticket) =>
      ticket.status === "Resolved" ||
      ticket.status === "Closed"
  ).length;

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}

      <aside className="sidebar">
        <div>
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              S
            </div>

            <span>SupportFlow</span>
          </div>

          <nav className="sidebar-nav">
            <button
              className="nav-item active"
              onClick={() => navigate("/dashboard")}
            >
              <span>⌂</span>
              Dashboard
            </button>

            <button
              className="nav-item"
              onClick={() => {
                document
                  .getElementById("assigned-tickets")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }}
            >
              <span>▤</span>
              Assigned Tickets
            </button>
          </nav>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Sign out
        </button>
      </aside>

      {/* MAIN */}

      <main className="dashboard-main">
        {/* HEADER */}

        <header className="dashboard-header">
          <div>
            <h1>Agent Dashboard</h1>

            <p>
              Manage tickets assigned to you.
            </p>
          </div>

          <div className="user-profile">
            <div className="user-avatar">
              {user?.firstName
                ?.charAt(0)
                .toUpperCase() ?? "A"}
            </div>

            <div>
              <strong>
                {user
                  ? `${user.firstName} ${user.lastName}`
                  : "Agent"}
              </strong>

              <span>Agent</span>
            </div>
          </div>
        </header>

        {/* ERROR */}

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        {/* STATISTICS */}

        <section className="stats-grid">
          <div className="stat-card">
            <div>
              <span className="stat-label">
                Assigned tickets
              </span>

              <strong className="stat-number">
                {tickets.length}
              </strong>
            </div>

            <div className="stat-icon">
              ▤
            </div>
          </div>

          <div className="stat-card">
            <div>
              <span className="stat-label">
                Open
              </span>

              <strong className="stat-number">
                {openTickets}
              </strong>
            </div>

            <div className="stat-icon">
              ○
            </div>
          </div>

          <div className="stat-card">
            <div>
              <span className="stat-label">
                In progress
              </span>

              <strong className="stat-number">
                {inProgressTickets}
              </strong>
            </div>

            <div className="stat-icon">
              ◷
            </div>
          </div>

          <div className="stat-card">
            <div>
              <span className="stat-label">
                Resolved
              </span>

              <strong className="stat-number">
                {resolvedTickets}
              </strong>
            </div>

            <div className="stat-icon">
              ✓
            </div>
          </div>
        </section>

        {/* ASSIGNED TICKETS */}

        <section
          className="tickets-panel"
          id="assigned-tickets"
        >
          <div className="panel-header">
            <div>
              <h2>Assigned Tickets</h2>

              <p>
                Tickets currently assigned to you.
              </p>
            </div>

            <div className="agent-ticket-count">
              {tickets.length}{" "}
              {tickets.length === 1
                ? "ticket"
                : "tickets"}
            </div>
          </div>

          {isLoading ? (
            <div className="tickets-empty">
              Loading tickets...
            </div>
          ) : tickets.length === 0 ? (
            <div className="tickets-empty">
              <div className="empty-icon">
                ✓
              </div>

              <h3>No assigned tickets</h3>

              <p>
                You don't have any tickets assigned
                to you yet.
              </p>
            </div>
          ) : (
            <div className="agent-ticket-table">
              {/* TABLE HEADER */}

              <div className="agent-ticket-table-header">
                <span>Ticket</span>
                <span>Priority</span>
                <span>Category</span>
                <span>Status</span>
                <span>Action</span>
              </div>

              {/* TABLE ROWS */}

              {tickets.map((ticket) => (
                <div
                  className="agent-ticket-table-row"
                  key={ticket.id}
                >
                  <button
                    className="agent-ticket-name"
                    onClick={() =>
                      navigate(
                        `/tickets/${ticket.id}`
                      )
                    }
                  >
                    <span>
                      {ticket.ticketNumber}
                    </span>

                    <strong>
                      {ticket.title}
                    </strong>
                  </button>

                  <span className="agent-table-value">
                    {ticket.priority}
                  </span>

                  <span className="agent-table-value">
                    {ticket.category}
                  </span>

                  <span
                    className={`status-badge status-${ticket.status.toLowerCase()}`}
                  >
                    {ticket.status}
                  </span>

                  <button
                    className="agent-ticket-open-button"
                    onClick={() =>
                      navigate(
                        `/tickets/${ticket.id}`
                      )
                    }
                  >
                    Open →
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AgentDashboardPage;