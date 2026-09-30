import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyTickets } from "../services/api";

function DashboardPage() {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("supportflow_user");
  const user = storedUser ? JSON.parse(storedUser) : null;

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

  const recentTickets = tickets.slice(0, 5);

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div>
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">S</div>
            <span>SupportFlow</span>
          </div>

          <nav className="sidebar-nav">
            <button className="nav-item active">
              <span>⌂</span>
              Dashboard
            </button>

            <button
            className="nav-item"
            onClick={() => navigate("/tickets")}
            >
            <span>▤</span>
            My Tickets
            </button>

            <button
            className="nav-item"
            onClick={() => navigate("/tickets/create")}
            >
            <span>＋</span>
            Create Ticket
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

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>
              Welcome back, {user?.firstName ?? "User"}.
            </p>
          </div>

          <div className="user-profile">
            <div className="user-avatar">
              {user?.firstName?.charAt(0).toUpperCase() ?? "U"}
            </div>

            <div>
              <strong>
                {user
                  ? `${user.firstName} ${user.lastName}`
                  : "User"}
              </strong>

              <span>{user?.role ?? "Customer"}</span>
            </div>
          </div>
        </header>

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        <section className="stats-grid">
          <div className="stat-card">
            <div>
              <span className="stat-label">
                Total tickets
              </span>

              <strong className="stat-number">
                {tickets.length}
              </strong>
            </div>

            <div className="stat-icon">▤</div>
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

            <div className="stat-icon">○</div>
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

            <div className="stat-icon">◷</div>
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

            <div className="stat-icon">✓</div>
          </div>
        </section>

        <section className="tickets-panel">
          <div className="panel-header">
            <div>
              <h2>Recent tickets</h2>
              <p>Your latest support requests</p>
            </div>

            <button
            className="create-ticket-button"
            onClick={() => navigate("/tickets/create")}
            >
            + Create ticket
            </button>
          </div>

          {isLoading ? (
            <div className="tickets-empty">
              Loading tickets...
            </div>
          ) : recentTickets.length === 0 ? (
            <div className="tickets-empty">
              <div className="empty-icon">▤</div>

              <h3>No tickets yet</h3>

              <p>
                Create your first support ticket to get started.
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
              {recentTickets.map((ticket) => (
                <div
                  className="ticket-row"
                  key={ticket.id}
                >
                  <div>
                    <strong>{ticket.title}</strong>

                    <span className="ticket-number">
                      {ticket.ticketNumber}
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default DashboardPage;