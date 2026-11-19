
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  User,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

type AccountRole = "customer" | "technician";

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AccountRole>("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  const passwordRules = {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
  };

  const passwordValid =
    passwordRules.length &&
    passwordRules.uppercase &&
    passwordRules.lowercase;

  const nameValid = name.trim().length >= 2;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);

    if (!nameValid) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!emailValid) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!passwordValid) {
      toast.error("Please meet all password requirements.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || result.error || "Registration failed.",
        );
      }

toast.success("Your FixMate account has been created.");

const destination =
  role === "technician"
    ? "/dashboard/technician"
    : "/dashboard/customer";

router.replace(destination);
router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-background-shape auth-shape-one" />
      <div className="auth-background-shape auth-shape-two" />

      <div className="auth-container">
        <div className="auth-information">
          <Link href="/" className="auth-brand">
            <span className="auth-brand-icon">
              <Wrench size={25} strokeWidth={2.5} />
            </span>
            <span>
              Fix<span>Mate</span>
              <small>REPAIR. RESTORE. RELAX.</small>
            </span>
          </Link>

          <div className="auth-information-content">
            <span className="auth-eyebrow">
              <ShieldCheck size={15} />
              YOUR TRUSTED REPAIR PARTNER
            </span>

            <h1>
              Make repairs
              <br />
              <span>simple again.</span>
            </h1>

            <p>
              Join FixMate to connect with reliable repair professionals
              and get your devices and home appliances working again.
            </p>

            <div className="auth-benefits">
              <div>
                <CheckCircle2 size={19} />
                <span>Find skilled repair professionals</span>
              </div>
              <div>
                <CheckCircle2 size={19} />
                <span>Track your repair requests easily</span>
              </div>
              <div>
                <CheckCircle2 size={19} />
                <span>Pay after your repair is completed</span>
              </div>
            </div>
          </div>

          <div className="auth-information-footer">
            Smart repairs. Reliable people. Peace of mind.
          </div>
        </div>

        <div className="auth-form-side">
          <div className="auth-form-card">
            <div className="auth-form-heading">
              <span className="auth-form-kicker">GET STARTED</span>
              <h2>Create your account</h2>
              <p>Enter your details to join the FixMate community.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label htmlFor="signup-name">Full name</label>
                <div className="auth-input-wrap">
                  <User size={18} />
                  <input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
                {touched && !nameValid && (
                  <span className="auth-field-error">
                    Please enter at least 2 characters.
                  </span>
                )}
              </div>

              <div className="auth-field">
                <label htmlFor="signup-email">Email address</label>
                <div className="auth-input-wrap">
                  <Mail size={18} />
                  <input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
                {touched && !emailValid && (
                  <span className="auth-field-error">
                    Enter a valid email address.
                  </span>
                )}
              </div>

              <div className="auth-field">
                <label htmlFor="signup-password">Password</label>
                <div className="auth-input-wrap">
                  <LockKeyhole size={18} />
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="auth-password-rules">
                  <span className={passwordRules.length ? "rule-valid" : ""}>
                    <CheckCircle2 size={13} />
                    At least 6 characters
                  </span>
                  <span className={passwordRules.uppercase ? "rule-valid" : ""}>
                    <CheckCircle2 size={13} />
                    One uppercase letter
                  </span>
                  <span className={passwordRules.lowercase ? "rule-valid" : ""}>
                    <CheckCircle2 size={13} />
                    One lowercase letter
                  </span>
                </div>
              </div>

              <div className="auth-field">
                <label>Choose your account type</label>

                <div className="auth-role-options">
                  <button
                    type="button"
                    className={`auth-role-card ${
                      role === "customer" ? "auth-role-selected" : ""
                    }`}
                    onClick={() => setRole("customer")}
                    aria-pressed={role === "customer"}
                  >
                    <span className="auth-role-icon">
                      <User size={21} />
                    </span>
                    <span className="auth-role-text">
                      <strong>Customer</strong>
                      <small>Find and request repairs</small>
                    </span>
                    <span className="auth-role-radio" />
                  </button>

                  <button
                    type="button"
                    className={`auth-role-card ${
                      role === "technician" ? "auth-role-selected" : ""
                    }`}
                    onClick={() => setRole("technician")}
                    aria-pressed={role === "technician"}
                  >
                    <span className="auth-role-icon">
                      <Wrench size={21} />
                    </span>
                    <span className="auth-role-text">
                      <strong>Technician</strong>
                      <small>Offer professional services</small>
                    </span>
                    <span className="auth-role-radio" />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary auth-submit-button"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <p className="auth-switch-text">
              Already have an account?{" "}
              <Link href="/sign-in">Sign in</Link>
            </p>

            <div className="auth-security-note">
              <ShieldCheck size={15} />
              Your account information is securely protected.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
