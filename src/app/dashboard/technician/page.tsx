
"use client";

import { useCallback, useEffect, useState } from "react";
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
  RefreshCw,
  UserRound,
  Wrench,
  XCircle,
  CreditCard,
} from "lucide-react";
import { authenticatedRequest } from "@/lib/api";

interface Technician {
  name: string;
  email: string;
  role: string;
  image?: string;
  area?: string;
}

interface Booking {
  _id: string;
  serviceTitle: string;
  serviceImage?: string;
  category?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  preferredDate: string;
  problemDescription: string;
  status: string;
  finalAmount: number;
  paymentStatus: string;
  createdAt: string;
}

interface Service {
  _id: string;
  title: string;
  category: string;
  approvalStatus: string;
  isAvailable: boolean;
  basePrice: number;
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
  cancelled: "bg-slate-100 text-slate-600",
};

function formatDate(value?: string) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function TechnicianDashboardPage() {
  const router = useRouter();

  const [technician, setTechnician] = useState<Technician | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [profileResponse, bookingResponse, serviceResponse] =
        await Promise.all([
          authenticatedRequest<ApiResponse<Technician>>("/api/users/me"),
          authenticatedRequest<ApiResponse<Booking[]>>(
            "/api/technician/bookings",
          ),
          authenticatedRequest<ApiResponse<Service[]>>("/api/services/mine"),
        ]);

      setTechnician(profileResponse.data);
      setBookings(bookingResponse.data || []);
      setServices(serviceResponse.data || []);
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
  }, [router]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const requestedBookings = bookings.filter(
    (booking) => booking.status === "requested",
  ).length;

  const acceptedBookings = bookings.filter(
    (booking) => booking.status === "accepted",
  ).length;

  const activeBookings = bookings.filter(
    (booking) => booking.status === "in-progress",
  ).length;

  const completedBookings = bookings.filter(
    (booking) => booking.status === "completed",
  ).length;

  const pendingServices = services.filter(
    (service) => service.approvalStatus === "pending",
  ).length;

  const approvedServices = services.filter(
    (service) => service.approvalStatus === "approved",
  ).length;

  const rejectedServices = services.filter(
    (service) => service.approvalStatus === "rejected",
  ).length;

  const completedRevenue = bookings
    .filter(
      (booking) =>
        booking.status === "completed" &&
        booking.paymentStatus === "paid",
    )
    .reduce(
      (total, booking) => total + Number(booking.finalAmount || 0),
      0,
    );

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
              Technician Workspace
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Welcome back{technician?.name ? `, ${technician.name}` : ""}!
            </h1>

            <p className="mt-2 text-slate-500">
              Manage your repair services and take care of customer requests.
            </p>
          </div>

          <Link
            href="/dashboard/technician/services/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Add New Service
          </Link>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <XCircle size={18} />
            {error}
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Services"
            value={services.length}
            icon={<Package size={22} />}
            color="blue"
          />

          <StatCard
            label="New Requests"
            value={requestedBookings}
            icon={<Clock3 size={22} />}
            color="amber"
          />

          <StatCard
            label="Active Repairs"
            value={acceptedBookings + activeBookings}
            icon={<Wrench size={22} />}
            color="violet"
          />

          <StatCard
            label="Completed Jobs"
            value={completedBookings}
            icon={<CheckCircle2 size={22} />}
            color="green"
          />
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Service Overview
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Track your service approval progress.
                </p>
              </div>

              <Package className="text-blue-600" size={24} />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <OverviewItem
                label="Approved"
                value={approvedServices}
                color="green"
              />

              <OverviewItem
                label="Pending Approval"
                value={pendingServices}
                color="amber"
              />

              <OverviewItem
                label="Rejected"
                value={rejectedServices}
                color="red"
              />
            </div>

            <Link
              href="/dashboard/technician/services"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Manage My Services <ArrowRight size={16} />
            </Link>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white">
            <CreditCardIcon />

            <p className="mt-5 text-sm font-medium text-blue-100">
              Total Received
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              ${completedRevenue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>

            <p className="mt-3 text-xs leading-5 text-blue-100">
              Based on completed bookings marked as paid in your records.
            </p>
          </div>
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Recent Repair Requests
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Latest requests from your customers.
                </p>
              </div>

              <CalendarDays className="text-blue-600" size={22} />
            </div>

            {bookings.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <Wrench className="mx-auto h-12 w-12 text-slate-300" />

                <h3 className="mt-4 font-semibold text-slate-900">
                  No repair requests yet
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Customer requests for your services will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {bookings.slice(0, 6).map((booking) => (
                  <div key={booking._id} className="p-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900">
                          {booking.serviceTitle || "Repair Service"}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Customer: {booking.customerName}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays size={14} />
                            {formatDate(booking.preferredDate)}
                          </span>

                          <span className="inline-flex items-center gap-1">
                            <MapPin size={14} />
                            {booking.address}
                          </span>
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
                          <span className="text-xs font-medium text-amber-600">
                            Action required
                          </span>
                        )}

                        {booking.status === "completed" && (
                          <span className="text-xs font-medium text-green-600">
                            Final: ${Number(booking.finalAmount || 0).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-slate-100 px-6 py-4">
              <Link
                href="/dashboard/technician/bookings"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Manage All Requests <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <UserRound size={22} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">My Profile</h2>
                  <p className="text-xs text-slate-500">
                    Technician information
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div>
                  <p className="text-xs text-slate-400">Name</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {technician?.name || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="mt-1 break-all font-medium text-slate-800">
                    {technician?.email || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Service Area</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {technician?.area || "Not provided"}
                  </p>
                </div>
              </div>

              <Link
                href="/profile"
                className="mt-5 flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                Edit Profile <ArrowRight size={16} />
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="font-bold text-slate-900">Booking Pipeline</h2>

              <div className="mt-5 space-y-4">
                <PipelineItem
                  label="Requested"
                  value={requestedBookings}
                  color="bg-amber-500"
                />

                <PipelineItem
                  label="Accepted"
                  value={acceptedBookings}
                  color="bg-blue-500"
                />

                <PipelineItem
                  label="In Progress"
                  value={activeBookings}
                  color="bg-violet-500"
                />

                <PipelineItem
                  label="Completed"
                  value={completedBookings}
                  color="bg-green-500"
                />
              </div>

              <Link
                href="/dashboard/technician/bookings"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Open Booking Manager <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={loadDashboard}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <RefreshCw size={16} />
            Refresh Dashboard
          </button>
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

        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors[color]}`}
        >
          {icon}
        </span>
      </div>

      <p className="mt-4 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function OverviewItem({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "green" | "amber" | "red";
}) {
  const colors = {
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <div className="rounded-xl border border-slate-100 p-4">
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${colors[color]}`}
      >
        {label}
      </span>

      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function PipelineItem({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
        <span className="text-sm text-slate-600">{label}</span>
      </div>

      <span className="text-sm font-bold text-slate-900">{value}</span>
    </div>
  );
}

function CreditCardIcon() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
      <CreditCard size={25} />
    </div>
  );
}
