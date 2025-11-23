import { useState, FormEvent } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import apiFetch, { ApiError } from "@/api";
import styles from "./Login.module.css"; // Reuse login styles

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!token) {
      setErrorMessage("Invalid or missing reset token.");
      triggerShake();
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      triggerShake();
      return;
    }

    setLoading(true);

    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });

      setSuccessMessage("Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      if (err instanceof ApiError && err.issues) {
        setErrorMessage(err.issues.password?.[0] || "Something went wrong.");
      } else {
        setErrorMessage(err.message || "Unable to reset password.");
      }
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* ✅ Loading skeleton overlay */}
      {loading && (
        <div className={styles.skeletonOverlay}>
          <div className={styles.skeletonCard}></div>
        </div>
      )}

      <div className={`${styles.formContainer} ${shake ? styles.shake : ""}`}>
        <h1>Reset Password</h1>
        <p>Enter your new password below.</p>

        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

        <form onSubmit={handleSubmit}>
          {/* ✅ New Password */}
          <label htmlFor="password">New Password</label>
          <div className={styles.passwordWrapper}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => setCapsLock(e.getModifierState("CapsLock"))}
              required
              className={styles.input}
            />
            <button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          {capsLock && <p className={styles.capsWarning}>Caps Lock is ON</p>}

          {/* ✅ Confirm Password */}
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={styles.input}
          />

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1rem" }}>
          Remember your password? <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
