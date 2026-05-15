import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";

export default function SignupPage() {
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "", role: "user" });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/books" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);
    try {
      const result = await signup(form);
      if (result.message?.toLowerCase().includes("pending")) {
        setSuccessMessage("Your admin account is pending approval. You can log in once approved.");
        return;
      }
      navigate("/books", { replace: true });
    } catch (submitError) {
      setError(submitError.message || "Failed to sign up.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="app auth-page">
      <h1>Sign up</h1>
      <p className="subtitle">Create an account to use the library.</p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Username
          <input
            value={form.username}
            onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
            autoComplete="username"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            autoComplete="new-password"
            required
          />
        </label>
        <label>
          Account type
          <select
            value={form.role}
            onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
          >
            <option value="user">User (browse and favourites)</option>
            <option value="admin">Admin (requires approval)</option>
          </select>
        </label>
        {form.role === "admin" ? (
          <p className="notice">
            Admin accounts require approval from an existing administrator before you can log in.
          </p>
        ) : null}
        {error ? <p className="error">{error}</p> : null}
        {successMessage ? <p className="success">{successMessage}</p> : null}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Sign up"}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </main>
  );
}
