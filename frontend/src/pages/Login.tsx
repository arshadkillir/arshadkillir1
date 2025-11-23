import { useState, FormEvent, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import styles from "./Login.module.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [tenant, setTenant] = useState(""); // ✅ Multi-tenant support
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // ✅ Toggle visibility
  const [capsLock, setCapsLock] = useState(false); // ✅ Caps Lock warning
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false); // ✅ Shake animation
  const [loading, setLoading] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  // ✅ Role-based redirect after login
  useEffect(() => {
    if (!user) return;

    if (user.role === "OWNER") navigate("/dashboard", { replace: true });
    else if (user.role === "MANAGER") navigate("/reports", { replace: true });
    else if (user.role === "STAFF") navigate("/pos", { replace: true });
    else navigate(from, { replace: true });
  }, [user]);

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      triggerShake();
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Invalid credentials.");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLock(e.getModifierState("CapsLock"));
  };

  return (
    <div className={styles.container}>
      {loading && (
        <div className={styles.skeletonOverlay}>
          <div className={styles.skeletonCard}></div>
        </div>
      )}

      <div className={`${styles.formContainer} ${shake ? styles.shake : ""}`}>
        <img src="/nandeyal.png" alt="Company Logo" className={styles.logo} />

        <h1>POS Login</h1>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit}>
          {/* ✅ Multi-tenant field */}
          <label htmlFor="tenant">Business / Tenant ID</label>
          <input
            id="tenant"
            type="text"
            value={tenant}
            onChange={(e) => setTenant(e.target.value)}
            placeholder="e.g., nandeyal-pos"
            className={styles.input}
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
            disabled={loading}
          />

          <label htmlFor="password">Password</label>
          <div className={styles.passwordWrapper}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              required
              className={styles.input}
              disabled={loading}
            />
            <button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          {/* ✅ Caps Lock warning */}
          {capsLock && (
            <p className={styles.capsWarning}>Caps Lock is ON</p>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className={styles.linksRow}>
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>

        <p className={styles.registerText}>
          Don't have an account?{" "}
          <Link to="/register-tenant">Register your business</Link>
        </p>
      </div>
    </div>
  );
}
