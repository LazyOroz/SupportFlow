import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getAgents,
  getAllTickets,
} from "../services/api";

function AdminAgentsPage() {
  const navigate = useNavigate();

  const [agents, setAgents] = useState([]);
  const [tickets, setTickets] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setError("");
      setIsLoading(true);

      const [agentsData, ticketsData] =
        await Promise.all([
          getAgents(),
          getAllTickets(),
        ]);

      setAgents(
        Array.isArray(agentsData)
          ? agentsData
          : agentsData?.items ?? []
      );

      setTickets(
        Array.isArray(ticketsData)
          ? ticketsData
          : ticketsData?.items ?? []
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function getAssignedTickets(agentId) {
    return tickets.filter(
      (ticket) => ticket.assignedToId === agentId
    );
  }

  function getActiveTickets(agentId) {
    return getAssignedTickets(agentId).filter(
      (ticket) =>
        ticket.status === "Open" ||
        ticket.status === "InProgress"
    );
  }

  function handleLogout() {
    localStorage.removeItem("supportflow_token");
    localStorage.removeItem("supportflow_user");

    navigate("/login");
  }

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
              className="nav-item"
              onClick={() =>
                navigate("/admin/tickets")
              }
            >
              <span>▤</span>
              All Tickets
            </button>

            <button
              className="nav-item active"
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
            <h1>Agents</h1>

            <p>
              View support agents and their workload.
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

        <section className="tickets-panel">
          <div className="panel-header">
            <div>
              <h2>Support Agents</h2>

              <p>
                {agents.length}{" "}
                {agents.length === 1
                  ? "agent"
                  : "agents"}{" "}
                registered.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="tickets-empty">
              Loading agents...
            </div>
          ) : agents.length === 0 ? (
            <div className="tickets-empty">
              <div className="empty-icon">
                ♙
              </div>

              <h3>No agents</h3>

              <p>
                There are currently no active agents.
              </p>
            </div>
          ) : (
            <div className="agents-grid">
              {agents.map((agent) => {
                const assigned =
                  getAssignedTickets(agent.id);

                const active =
                  getActiveTickets(agent.id);

                const resolved =
                  assigned.filter(
                    (ticket) =>
                      ticket.status === "Resolved" ||
                      ticket.status === "Closed"
                  ).length;

                return (
                  <div
                    className="agent-card"
                    key={agent.id}
                  >
                    <div className="agent-card-top">
                      <div className="agent-avatar">
                        {agent.firstName
                          ?.charAt(0)
                          .toUpperCase() ?? "A"}
                      </div>

                      <div>
                        <h3>
                          {agent.firstName}{" "}
                          {agent.lastName}
                        </h3>

                        <p>{agent.email}</p>
                      </div>

                      <span className="agent-active-badge">
                        Active
                      </span>
                    </div>

                    <div className="agent-card-stats">
                      <div>
                        <strong>
                          {assigned.length}
                        </strong>

                        <span>Assigned</span>
                      </div>

                      <div>
                        <strong>
                          {active.length}
                        </strong>

                        <span>Active</span>
                      </div>

                      <div>
                        <strong>
                          {resolved}
                        </strong>

                        <span>Resolved</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminAgentsPage;