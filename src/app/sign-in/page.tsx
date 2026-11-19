
"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const result = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
      });

      if (result.error) {
        throw new Error(result.error.message || "Invalid email or password.");
      }

      const role = result.data?.user?.role;
      const dashboardByRole: Record<string, string> = {
        customer: "/dashboard/customer",
        technician: "/dashboard/technician",
        admin: "/dashboard/admin",
      };

      const requestedDestination = searchParams.get("callbackURL");
      const destination =
        requestedDestination &&
        requestedDestination.startsWith("/") &&
        !requestedDestination.startsWith("//") &&
        !requestedDestination.startsWith("/sign-in") &&
        !requestedDestination.startsWith("/sign-up")
          ? requestedDestination
          : dashboardByRole[role || ""] || "/";

      toast.success("Welcome back to FixMate.");
      router.replace("/");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Sign in failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-background-shape auth-shape-one" />
      <div className="auth-background-shape auth-shape-two" />

      <div className="auth-container auth-signin-container">
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
              WELCOME BACK TO FIXMATE
            </span>

            <h1>
              Your repairs,
              <br />
              <span>made easier.</span>
            </h1>

            <p>
              Sign in to manage your repair requests, connect with
              technicians, and keep track of your services.
            </p>

            <div className="auth-benefits">
              <div>
                <CheckCircle2 size={19} />
                <span>Manage your repair activities</span>
              </div>
              <div>
                <CheckCircle2 size={19} />
                <span>Stay updated on repair progress</span>
              </div>
              <div>
                <CheckCircle2 size={19} />
                <span>Access your FixMate dashboard</span>
              </div>
            </div>
          </div>

          <div className="auth-information-footer">
            Smart repairs. Reliable people. Peace of mind.
          </div>
        </div>

        <div className="auth-form-side">
          <div className="auth-form-card auth-signin-card">
            <div className="auth-form-heading">
              <span className="auth-form-kicker">WELCOME BACK</span>
              <h2>Sign in to FixMate</h2>
              <p>Enter your account details to continue.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label htmlFor="signin-email">Email address</label>
                <div className="auth-input-wrap">
                  <Mail size={18} />
                  <input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="signin-password">Password</label>
                <div className="auth-input-wrap">
                  <LockKeyhole size={18} />
                  <input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
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
              </div>

              <button
                type="submit"
                className="btn btn-primary auth-submit-button"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <p className="auth-switch-text">
              Don't have an account?{" "}
              <Link href="/sign-up">Create an account</Link>
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

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <section className="auth-page">
          <div className="auth-form-card">
            <p>Loading sign-in page...</p>
          </div>
        </section>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
