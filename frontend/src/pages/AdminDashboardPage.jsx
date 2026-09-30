import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getAllTickets,
  getAgents,
  assignTicket,
} from "../services/api";

function AdminDashboardPage() {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("supportflow_user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);

  const [selectedAgents, setSelectedAgents] = useState({});

  const [isLoading, setIsLoading] = useState(true);
  const [assigningId, setAssigningId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setError("");
      setIsLoading(true);

      const [ticketsData, agentsData] =
        await Promise.all([
          getAllTickets(),
          getAgents(),
        ]);

      const ticketItems = Array.isArray(ticketsData)
        ? ticketsData
        : ticketsData?.items ?? [];

      const agentItems = Array.isArray(agentsData)
        ? agentsData
        : agentsData?.items ?? [];

      setTickets(ticketItems);
      setAgents(agentItems);

      if (agentItems.length > 0) {
        const defaults = {};

        ticketItems.forEach((ticket) => {
          defaults[ticket.id] =
            ticket.assignedToId ||
            agentItems[0].id;
        });

        setSelectedAgents(defaults);
      }
    } catch (err) {
      setError(err.message);
      setTickets([]);
      setAgents([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAssign(ticketId) {
    const agentId = selectedAgents[ticketId];

    if (!agentId) {
      setError("Please select an agent.");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setAssigningId(ticketId);

      await assignTicket(ticketId, agentId);

      const selectedAgent = agents.find(
        (agent) => agent.id === agentId
      );

      if (selectedAgent) {
        setSuccess(
          `Ticket assigned to ${selectedAgent.firstName} ${selectedAgent.lastName}.`
        );
      } else {
        setSuccess("Ticket successfully assigned.");
      }

      const ticketsData = await getAllTickets();

      setTickets(
        Array.isArray(ticketsData)
          ? ticketsData
          : ticketsData?.items ?? []
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setAssigningId(null);
    }
  }

  function handleAgentChange(ticketId, agentId) {
    setSelectedAgents((current) => ({
      ...current,
      [ticketId]: agentId,
    }));
  }

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
      <aside className="sidebar">
        <div>
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              S
            </div>

            <span>SupportFlow</span>
          </div>

          <nav className="sidebar-nav">
            <button className="nav-item active">
              <span>⌂</span>
              Dashboard
            </button>

            <button
            className="nav-item"
            onClick={() => navigate("/admin/tickets")}
            >
            <span>▤</span>
            All Tickets
            </button>

            <button
            className="nav-item"
            onClick={() => navigate("/admin/agents")}
            >
            <span>♙</span>
            Agents
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
            <h1>Admin Dashboard</h1>

            <p>
              Manage support tickets and agents.
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
                  : "Administrator"}
              </strong>

              <span>Admin</span>
            </div>
          </div>
        </header>

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        {success && (
          <div className="admin-success">
            {success}
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
              <h2>All Tickets</h2>

              <p>
                View tickets and assign them to
                support agents.
              </p>
            </div>

            <div className="admin-agent-count">
              {agents.length}{" "}
              {agents.length === 1
                ? "agent"
                : "agents"}
            </div>
          </div>

          {isLoading ? (
            <div className="tickets-empty">
              Loading dashboard...
            </div>
          ) : tickets.length === 0 ? (
            <div className="tickets-empty">
              <div className="empty-icon">
                ▤
              </div>

              <h3>No tickets</h3>

              <p>
                There are no support tickets yet.
              </p>
            </div>
          ) : (
            <div className="admin-ticket-table">
              <div className="admin-ticket-header">
                <span>Ticket</span>
                <span>Priority</span>
                <span>Status</span>
                <span>Agent</span>
                <span>Action</span>
              </div>

              {tickets.map((ticket) => (
                <div
                  className="admin-ticket-row"
                  key={ticket.id}
                >
                  <button
                    className="admin-ticket-name"
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

                  <span>
                    {ticket.priority}
                  </span>

                  <span
                    className={`status-badge status-${ticket.status.toLowerCase()}`}
                  >
                    {ticket.status}
                  </span>

                  <div className="admin-agent-select-wrapper">
                    {agents.length === 0 ? (
                      <span className="no-agents-text">
                        No agents
                      </span>
                    ) : (
                      <select
                        className="admin-agent-select"
                        value={
                          selectedAgents[
                            ticket.id
                          ] ?? ""
                        }
                        onChange={(event) =>
                          handleAgentChange(
                            ticket.id,
                            event.target.value
                          )
                        }
                      >
                        {agents.map((agent) => (
                          <option
                            key={agent.id}
                            value={agent.id}
                          >
                            {agent.firstName}{" "}
                            {agent.lastName} —{" "}
                            {agent.email}
                          </option>
                        ))}
                      </select>
                    )}

                    {ticket.assignedToName && (
                      <small>
                        Currently:{" "}
                        {ticket.assignedToName}
                      </small>
                    )}
                  </div>

                  <button
                    className="assign-button"
                    disabled={
                      assigningId === ticket.id ||
                      agents.length === 0
                    }
                    onClick={() =>
                      handleAssign(ticket.id)
                    }
                  >
                    {assigningId === ticket.id
                      ? "Assigning..."
                      : ticket.assignedToId
                        ? "Reassign"
                        : "Assign"}
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

export default AdminDashboardPage;