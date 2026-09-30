import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";

function RegisterPage() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const response = await registerUser(
        firstName,
        lastName,
        email,
        password
      );

      localStorage.setItem(
        "supportflow_token",
        response.token
      );

      localStorage.setItem(
        "supportflow_user",
        JSON.stringify({
          userId: response.userId,
          firstName: response.firstName,
          lastName: response.lastName,
          email: response.email,
          role: response.role,
        })
      );

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <div className="brand-logo">S</div>

          <h1>SupportFlow</h1>

          <p>
            Create your account and start managing support
            requests in one place.
          </p>

          <div className="brand-features">
            <div className="brand-feature">
              <span>✓</span>
              Create and track support tickets
            </div>

            <div className="brand-feature">
              <span>✓</span>
              Communicate with support agents
            </div>

            <div className="brand-feature">
              <span>✓</span>
              Follow ticket progress
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Create account</h2>
            <p>Get started with SupportFlow</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="name-row">
              <div className="form-group">
                <label htmlFor="firstName">
                  First name
                </label>

                <input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(event) =>
                    setFirstName(event.target.value)
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">
                  Last name
                </label>

                <input
                  id="lastName"
                  type="text"
                  placeholder="Smith"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(event) =>
                    setLastName(event.target.value)
                  }
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Create a password"
                autoComplete="new-password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />
            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="primary-button"
              disabled={isLoading}
            >
              {isLoading
                ? "Creating account..."
                : "Create account"}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?{" "}
            <Link to="/login">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;