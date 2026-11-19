
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  MapPin,
  Package,
  Plus,
  UserRound,
  Wrench,
  XCircle,
} from "lucide-react";
import { authenticatedRequest } from "@/lib/api";

interface Customer {
  name: string;
  email: string;
  image?: string;
}

interface Booking {
  _id: string;
  serviceTitle?: string;
  service?: {
    title?: string;
    category?: string;
  };
  technicianName?: string;
  status: "requested" | "accepted" | "rejected" | "in-progress" | "completed";
  paymentStatus?: "paid" | "unpaid";
  finalAmount?: number;
  preferredDate?: string;
  address?: string;
  createdAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
}

const statusStyles: Record<string, string> = {
  requested: "bg-amber-100 text-amber-700",
  accepted: "bg-blue-100 text-blue-700",
  "in-progress": "bg-violet-100 text-violet-700",
  completed: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

function formatDate(value?: string) {
  if (!value) return "Date not provided";

  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function CustomerDashboardPage() {
  const router = useRouter();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const [profileResponse, bookingResponse] = await Promise.all([
        authenticatedRequest<ApiResponse<Customer>>("/api/users/me"),
        authenticatedRequest<ApiResponse<Booking[]>>("/api/bookings/mine"),
      ]);

      setCustomer(profileResponse.data);
      setBookings(bookingResponse.data || []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load dashboard.";

      if (message.toLowerCase().includes("session")) {
        router.replace("/sign-in");
        return;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function cancelBooking(bookingId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this repair request?",
    );

    if (!confirmed) return;

    setCancellingId(bookingId);
    setError("");
    setNotice("");

    try {
      const response = await authenticatedRequest<{
        success: boolean;
        message?: string;
      }>(`/api/bookings/${bookingId}/cancel`, {
        method: "PATCH",
      });

      setNotice(response.message || "Booking cancelled successfully.");

      setBookings((current) =>
        current.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: "rejected" }
            : booking,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to cancel booking.",
      );
    } finally {
      setCancellingId(null);
    }
  }

  const totalBookings = bookings.length;
  const requestedBookings = bookings.filter(
    (booking) => booking.status === "requested",
  ).length;
  const activeBookings = bookings.filter(
    (booking) =>
      booking.status === "accepted" || booking.status === "in-progress",
  ).length;
  const completedBookings = bookings.filter(
    (booking) => booking.status === "completed",
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <LoaderCircle className="h-9 w-9 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Customer Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Welcome back{customer?.name ? `, ${customer.name}` : ""}!
            </h1>
            <p className="mt-2 text-slate-500">
              Manage your repair requests and track your service progress.
            </p>
          </div>

          <Link
            href="/services"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Book a Repair
          </Link>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <XCircle size={18} />
            {error}
          </div>
        )}

        {notice && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {notice}
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Bookings"
            value={totalBookings}
            icon={<Package size={22} />}
            color="blue"
          />
          <StatCard
            label="Requested"
            value={requestedBookings}
            icon={<Clock3 size={22} />}
            color="amber"
          />
          <StatCard
            label="Active Repairs"
            value={activeBookings}
            icon={<Wrench size={22} />}
            color="violet"
          />
          <StatCard
            label="Completed"
            value={completedBookings}
            icon={<CheckCircle2 size={22} />}
            color="green"
          />
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-3">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Recent Repair Requests
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Keep track of your latest bookings.
                </p>
              </div>
              <CalendarDays className="text-blue-600" size={22} />
            </div>

            {bookings.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <Wrench size={28} />
                </div>
                <h3 className="mt-5 font-semibold text-slate-900">
                  No repair requests yet
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Browse available services and book your first repair.
                </p>
                <Link
                  href="/services"
                  className="mt-5 inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700"
                >
                  Explore Services <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {bookings.slice(0, 6).map((booking) => (
                  <div key={booking._id} className="p-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900">
                          {booking.serviceTitle ||
                            booking.service?.title ||
                            booking.service?.category ||
                            "Repair Service"}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Technician: {booking.technicianName || "Assigned technician"}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays size={14} />
                            {formatDate(booking.preferredDate || booking.createdAt)}
                          </span>
                          {booking.address && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin size={14} />
                              {booking.address}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                            statusStyles[booking.status] ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {booking.status.replace("-", " ")}
                        </span>

                        {booking.status === "requested" && (
                          <button
                            type="button"
                            onClick={() => cancelBooking(booking._id)}
                            disabled={cancellingId === booking._id}
                            className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                          >
                            {cancellingId === booking._id
                              ? "Cancelling..."
                              : "Cancel Request"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {bookings.length > 6 && (
              <div className="border-t border-slate-100 px-6 py-4 text-center">
                <Link
                  href="/dashboard/customer/bookings"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  View All Bookings <ArrowRight className="ml-1 inline" size={15} />
                </Link>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <UserRound size={22} />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">My Account</h2>
                  <p className="text-xs text-slate-500">Personal information</p>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div>
                  <p className="text-xs text-slate-400">Name</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {customer?.name || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="mt-1 break-all font-medium text-slate-800">
                    {customer?.email || "Not provided"}
                  </p>
                </div>
              </div>

              <Link
                href="/profile"
                className="mt-5 flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                Manage Profile <ArrowRight size={16} />
              </Link>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white">
              <Wrench size={28} />
              <h2 className="mt-5 text-lg font-bold">
                Need a repair?
              </h2>
              <p className="mt-2 text-sm leading-6 text-blue-100">
                Find reliable technicians for your appliances and electronic devices.
              </p>
              <Link
                href="/services"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Find a Technician <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "amber" | "violet" | "green";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
    green: "bg-green-50 text-green-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors[color]}`}>
          {icon}
        </span>
      </div>
      <p className="mt-4 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
