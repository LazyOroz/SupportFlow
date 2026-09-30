import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTicket } from "../services/api";

function CreateTicketPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [category, setCategory] = useState("General");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      await createTicket(
        title,
        description,
        priority,
        category
      );

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="create-ticket-page">
      <div className="create-ticket-container">
        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to dashboard
        </button>

        <div className="create-ticket-card">
          <div className="create-ticket-header">
            <h1>Create a new ticket</h1>
            <p>
              Describe your issue and our support team will help you.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">
                Title
              </label>

              <input
                id="title"
                type="text"
                placeholder="Briefly describe your issue"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                minLength={3}
                maxLength={200}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                placeholder="Tell us more about the problem..."
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                minLength={10}
                maxLength={5000}
                required
              />
            </div>

            <div className="ticket-form-row">
              <div className="form-group">
                <label htmlFor="priority">
                  Priority
                </label>

                <select
                  id="priority"
                  value={priority}
                  onChange={(event) =>
                    setPriority(event.target.value)
                  }
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="category">
                  Category
                </label>

                <select
                  id="category"
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                >
                  <option value="General">General</option>
                  <option value="Technical">Technical</option>
                  <option value="Billing">Billing</option>
                  <option value="Account">Account</option>
                  <option value="FeatureRequest">
                    Feature Request
                  </option>
                  <option value="Bug">Bug</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <div className="ticket-form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="create-ticket-button"
                disabled={isLoading}
              >
                {isLoading
                  ? "Creating..."
                  : "Create ticket"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateTicketPage;