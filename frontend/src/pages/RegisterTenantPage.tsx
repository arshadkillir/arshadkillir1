import { useState, FormEvent, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiFetch, { ApiError } from "@/api";
import styles from "./Login.module.css"; // Reuse login styles for consistency

interface FormErrors {
  form?: string[];
  tenantName?: string[];
  ownerName?: string[];
  email?: string[];
  password?: string[];
}

interface Plan {
  id: string;
  name: string;
  price: number;
}

export default function RegisterTenantPage() {
  const [tenantName, setTenantName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const [formErrors, setFormErrors] = useState<FormErrors | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);

  const navigate = useNavigate();

  // ✅ Email validation
  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  // ✅ Shake animation trigger
  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  // ✅ Fetch subscription plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setPlansLoading(true);
        const fetchedPlans = await apiFetch<Plan[]>("/auth/plans");
        setPlans(fetchedPlans || []);
        if (fetchedPlans?.length) {
          setSelectedPlanId(fetchedPlans[0].id);
        }
      } catch {
        setPlansError("Could not load subscription plans. Please try again later.");
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormErrors(null);
    setSuccessMessage(null);

    // ✅ Client-side validation
    if (!validateEmail(email)) {
      setFormErrors({ email: ["Please enter a valid email address."] });
      triggerShake();
      return;
    }

    if (password !== confirmPassword) {
      setFormErrors({ password: ["Passwords do not match."] });
      triggerShake();
      return;
    }

    setLoading(true);

    try {
      await apiFetch("/auth/register-tenant", {
        method: "POST",
        body: JSON.stringify({
          tenantName,
          ownerName,
          email,
          password,
          planId: selectedPlanId,
        }),
      });

      setSuccessMessage("Business registered successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      if (err instanceof ApiError && err.issues) {
        setFormErrors(err.issues);
      } else {
        setFormErrors({ form: [err.message || "An unknown error occurred"] });
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
        <h1>Register Your Business</h1>
        <p>Create an account for your POS system.</p>

        {formErrors?.form && <p className={styles.error}>{formErrors.form[0]}</p>}
        {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

        <form onSubmit={handleSubmit}>
          {/* ✅ Tenant Name */}
          <label htmlFor="tenantName">Business Name</label>
          <input
            id="tenantName"
            type="text"
            value={tenantName}
            onChange={(e) => setTenantName(e.target.value)}
            required
            placeholder="e.g., My Awesome Restaurant"
            className={styles.input}
          />
          {formErrors?.tenantName && (
            <p className={styles.fieldError}>{formErrors.tenantName[0]}</p>
          )}

          {/* ✅ Owner Name */}
          <label htmlFor="ownerName">Owner Name</label>
          <input
            id="ownerName"
            type="text"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            required
            placeholder="e.g., John Doe"
            className={styles.input}
          />
          {formErrors?.ownerName && (
            <p className={styles.fieldError}>{formErrors.ownerName[0]}</p>
          )}

          {/* ✅ Email */}
          <label htmlFor="email">Owner's Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="e.g., owner@example.com"
            className={styles.input}
          />
          {formErrors?.email && (
            <p className={styles.fieldError}>{formErrors.email[0]}</p>
          )}

          {/* ✅ Password + Toggle + Caps Lock */}
          <label htmlFor="password">Password</label>
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
          {formErrors?.password && (
            <p className={styles.fieldError}>{formErrors.password[0]}</p>
          )}

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

          {/* ✅ Subscription Plans */}
          <label>Choose Your Plan</label>
          {plansLoading && <p>Loading plans...</p>}
          {plansError && <p className={styles.error}>{plansError}</p>}

          <div className={styles.planSelector}>
            {plans.map((plan) => (
              <label key={plan.id} className={styles.planOption}>
                <input
                  type="radio"
                  name="plan"
                  value={plan.id}
                  checked={selectedPlanId === plan.id}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                />
                <div>
                  <strong>{plan.name}</strong>
                  <span> – ${plan.price}/month</span>
                </div>
              </label>
            ))}
          </div>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? "Registering..." : "Register Business"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1rem" }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
