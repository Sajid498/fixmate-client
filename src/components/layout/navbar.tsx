
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Wrench,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const navigationLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "About Us", href: "/about" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  const role = session?.user?.role;

  const dashboardHref =
    role === "admin"
      ? "/dashboard/admin"
      : role === "technician"
        ? "/dashboard/technician"
        : "/dashboard/customer";

  const dashboardLabel =
    role === "admin"
      ? "Admin Dashboard"
      : role === "technician"
        ? "Technician Dashboard"
        : "Dashboard";

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      setMenuOpen(false);
      toast.success("You have signed out successfully.");
      router.replace("/");
      router.refresh();
    } catch {
      toast.error("Unable to sign out. Please try again.");
    }
  };

  return (
    <header className="site-header">
      <div className="navbar container">
        <Link
          href="/"
          className="brand"
          onClick={() => setMenuOpen(false)}
        >
          <span className="brand-icon">
            <Wrench size={23} strokeWidth={2.5} />
          </span>
          <span>
            Fix<span className="brand-accent">Mate</span>
            <small>REPAIR. RESTORE. RELAX.</small>
          </span>
        </Link>

        <nav className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`nav-link ${
                pathname === link.href ? "nav-link-active" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="mobile-auth-links">
            {!isPending &&
              (session ? (
                <>
                  <Link
                    href={dashboardHref}
                    onClick={() => setMenuOpen(false)}
                  >
                    <LayoutDashboard size={16} />
                    {dashboardLabel}
                  </Link>
                  <button type="button" onClick={handleSignOut}>
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="mobile-signup"
                    onClick={() => setMenuOpen(false)}
                  >
                    Get Started <ArrowRight size={16} />
                  </Link>
                </>
              ))}
          </div>
        </nav>

        <div className="nav-actions">
          {!isPending &&
            (session ? (
              <>
                <Link href={dashboardHref} className="nav-signin">
                  {dashboardLabel}
                </Link>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSignOut}
                >
                  Sign Out <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link href="/sign-in" className="nav-signin">
                  Sign In
                </Link>
                <Link href="/sign-up" className="btn btn-primary">
                  Get Started <ArrowRight size={16} />
                </Link>
              </>
            ))}
        </div>

        <button
          className="mobile-menu-button"
          onClick={() => setMenuOpen((previous) => !previous)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}
