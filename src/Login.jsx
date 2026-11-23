import React, { useState } from "react";
import { Eye, EyeOff, Globe2, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import "./Login.css";

const DEMO_EMAIL = "admin@gmail.com";
const DEMO_PASSWORD = "Admin@123";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });

  const validate = () => {
    const next = { email: "", password: "" };
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      next.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      next.email = "Enter a valid email address.";
    }

    if (!password) {
      next.password = "Password is required.";
    } else if (password.length < 6) {
      next.password = "Password must be at least 6 characters.";
    }

    setFieldErrors(next);
    return !next.email && !next.password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);

    // Brief delay to surface the loading state for this demo auth flow
    await new Promise((resolve) => setTimeout(resolve, 650));

    const emailOk = email.trim().toLowerCase() === DEMO_EMAIL;
    const passwordOk = password === DEMO_PASSWORD;

    if (!emailOk || !passwordOk) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
      return;
    }

    setLoading(false);
    onLogin();
  };

  return (
    <div className="login-page">
      <div className="login-orb login-orb-a" aria-hidden="true" />
      <div className="login-orb login-orb-b" aria-hidden="true" />
      <div className="login-orb login-orb-c" aria-hidden="true" />

      <div className="login-shell">
        <aside className="login-hero" aria-hidden="true">
          <div className="login-hero-badge">
            <ShieldCheck size={14} />
            Admin access
          </div>
          <div className="login-hero-brand">
            <div className="login-hero-icon">
              <Globe2 size={22} />
            </div>
            <div>
              <strong>Belize Tourism</strong>
              <span>Analytics</span>
            </div>
          </div>
          <h2>Vibrant tourism intelligence for decision-makers</h2>
          <p>
            Sign in to explore arrivals, markets, spending and cruise analytics
            across Central America and the Caribbean.
          </p>
        </aside>

        <section className="login-card">
          <div className="login-card-head">
            <div className="login-card-icon">
              <Lock size={18} />
            </div>
            <div>
              <h1>Admin Login</h1>
              <p>Use your demo credentials to open the dashboard</p>
            </div>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <label className={`login-field ${fieldErrors.email ? "has-error" : ""}`}>
              <span>Email</span>
              <div className="login-input-wrap">
                <Mail size={16} className="login-input-icon" aria-hidden="true" />
                <input
                  type="email"
                  name="email"
                  autoComplete="username"
                  placeholder="admin@gmail.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: "" }));
                    if (error) setError("");
                  }}
                  disabled={loading}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
                />
              </div>
              {fieldErrors.email && (
                <em id="login-email-error" className="login-field-error">{fieldErrors.email}</em>
              )}
            </label>

            <label className={`login-field ${fieldErrors.password ? "has-error" : ""}`}>
              <span>Password</span>
              <div className="login-input-wrap">
                <Lock size={16} className="login-input-icon" aria-hidden="true" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: "" }));
                    if (error) setError("");
                  }}
                  disabled={loading}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
                />
                <button
                  type="button"
                  className="login-toggle-password"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && (
                <em id="login-password-error" className="login-field-error">{fieldErrors.password}</em>
              )}
            </label>

            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="login-spinner" />
                  Signing in…
                </>
              ) : (
                "Sign in to dashboard"
              )}
            </button>
          </form>

          <p className="login-hint">
            Demo: <code>admin@gmail.com</code> / <code>Admin@123</code>
          </p>
        </section>
      </div>
    </div>
  );
}
