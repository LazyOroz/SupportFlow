import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getAllTickets,
  getAgents,
  assignTicket,
} from "../services/api";

function AdminTicketsPage() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);

  const [selectedAgents, setSelectedAgents] = useState({});

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isLoading, setIsLoading] = useState(true);
  const [assigningId, setAssigningId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setError("");
      setIsLoading(true);

      const [ticketsData, agentsData] = await Promise.all([
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

      const defaults = {};

      ticketItems.forEach((ticket) => {
        defaults[ticket.id] =
          ticket.assignedToId ||
          agentItems[0]?.id ||
          "";
      });

      setSelectedAgents(defaults);
    } catch (err) {
      setError(err.message);
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

      const agent = agents.find(
        (item) => item.id === agentId
      );

      setSuccess(
        agent
          ? `Ticket assigned to ${agent.firstName} ${agent.lastName}.`
          : "Ticket successfully assigned."
      );

      await loadTickets();
    } catch (err) {
      setError(err.message);
    } finally {
      setAssigningId(null);
    }
  }

  async function loadTickets() {
    const data = await getAllTickets();

    setTickets(
      Array.isArray(data)
        ? data
        : data?.items ?? []
    );
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

  const filteredTickets = tickets.filter((ticket) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      ticket.title?.toLowerCase().includes(query) ||
      ticket.ticketNumber?.toLowerCase().includes(query) ||
      ticket.description?.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "All" ||
      ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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

            <button
              className="nav-item"
              onClick={() => navigate("/dashboard")}
            >
              <span>⌂</span>
              Dashboard
            </button>

            <button
              className="nav-item active"
              onClick={() =>
                navigate("/admin/tickets")
              }
            >
              <span>▤</span>
              All Tickets
            </button>

            <button
              className="nav-item"
              onClick={() =>
                navigate("/admin/agents")
              }
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
            <h1>All Tickets</h1>

            <p>
              Search, filter and manage support tickets.
            </p>
          </div>

          <button
            className="create-ticket-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard
          </button>
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

        <section className="tickets-panel">

          <div className="admin-tickets-toolbar">

            <input
              className="admin-ticket-search"
              type="text"
              placeholder="Search by ticket number or title..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            <select
              className="admin-status-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="All">
                All statuses
              </option>

              <option value="Open">
                Open
              </option>

              <option value="InProgress">
                In Progress
              </option>

              <option value="Resolved">
                Resolved
              </option>

              <option value="Closed">
                Closed
              </option>
            </select>

          </div>

          <div className="admin-ticket-results">
            Showing {filteredTickets.length} of{" "}
            {tickets.length} tickets
          </div>

          {isLoading ? (
            <div className="tickets-empty">
              Loading tickets...
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="tickets-empty">
              <div className="empty-icon">
                🔎
              </div>

              <h3>No tickets found</h3>

              <p>
                Try changing your search or filter.
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

              {filteredTickets.map((ticket) => (
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

                  <div className="admin-ticket-actions">

                    <button
                      className="admin-open-ticket-button"
                      onClick={() =>
                        navigate(
                          `/tickets/${ticket.id}`
                        )
                      }
                    >
                      Open
                    </button>

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

                </div>
              ))}

            </div>
          )}

        </section>

      </main>

    </div>
  );
}

export default AdminTicketsPage;