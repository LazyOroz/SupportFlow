import { Navigate } from "react-router-dom";

function ProtectedRoute({
  children,
  allowedRoles,
}) {
  const token = localStorage.getItem(
    "supportflow_token"
  );

  const storedUser = localStorage.getItem(
    "supportflow_user"
  );

  if (!token || !storedUser) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  let user;

  try {
    user = JSON.parse(storedUser);
  } catch {
    localStorage.removeItem(
      "supportflow_token"
    );

    localStorage.removeItem(
      "supportflow_user"
    );

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;