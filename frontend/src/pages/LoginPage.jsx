import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const response = await loginUser(email, password);

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
            Manage support tickets, communicate with your team,
            and resolve customer issues efficiently.
          </p>

          <div className="brand-features">
            <div className="brand-feature">
              <span>✓</span>
              Manage support tickets
            </div>

            <div className="brand-feature">
              <span>✓</span>
              Track ticket progress
            </div>

            <div className="brand-feature">
              <span>✓</span>
              Collaborate with support agents
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Welcome back</h2>
            <p>Sign in to your SupportFlow account</p>
          </div>

          <form onSubmit={handleSubmit}>
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
              <div className="password-label">
                <label htmlFor="password">
                  Password
                </label>

                <button
                  type="button"
                  className="forgot-password"
                >
                  Forgot password?
                </button>
              </div>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
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
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account?{" "}
            <Link to="/register">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;