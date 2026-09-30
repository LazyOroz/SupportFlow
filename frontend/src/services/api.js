const API_URL = "http://localhost:8080/api";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("supportflow_token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data = null;

  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    data = await response.json();
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.title ||
        "Something went wrong. Please try again."
    );
  }

  return data;
}

export function registerUser(firstName, lastName, email, password) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      firstName,
      lastName,
      email,
      password,
    }),
  });
}

export function loginUser(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

export function getCurrentUser() {
  return request("/auth/me");
}

export function getMyTickets() {
  return request("/tickets");
}

export function createTicket(title, description, priority, category) {
  return request("/tickets", {
    method: "POST",
    body: JSON.stringify({
      title,
      description,
      priority,
      category,
    }),
  });
}

export function getTicketById(ticketId) {
  return request(`/tickets/${ticketId}`);
}

export function getTicketComments(ticketId) {
  return request(`/tickets/${ticketId}/comments`);
}

export function addTicketComment(ticketId, content) {
  return request(`/tickets/${ticketId}/comments`, {
    method: "POST",
    body: JSON.stringify({
      content,
      isInternal: false,
    }),
  });
}

export function addInternalNote(ticketId, content) {
  return request(`/tickets/${ticketId}/comments`, {
    method: "POST",
    body: JSON.stringify({
      content,
      isInternal: true,
    }),
  });
}

export function getAssignedTickets() {
  return request("/tickets/assigned-to-me");
}

export function getAllTickets() {
  return request("/tickets/all");
}

export function assignTicket(ticketId, agentId) {
  return request(`/tickets/${ticketId}/assign/${agentId}`, {
    method: "PATCH",
  });
}

export function updateTicketStatus(ticketId, status) {
  return request(`/tickets/${ticketId}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      status,
    }),
  });
}

export function getAgents() {
  return request("/users/agents");
}

export default request;