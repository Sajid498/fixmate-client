
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Eye,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Wrench,
  X,
  XCircle,
  UserRound,
  CalendarDays,
  Banknote,
} from "lucide-react";
import { authenticatedRequest } from "@/lib/api";
import { toast } from "sonner";

type ApprovalStatus = "pending" | "approved" | "rejected";

interface AdminService {
  _id: string;
  title: string;
  category: string;
  description: string;
  image?: string;
  basePrice: number;
  estimatedDuration: string;
  serviceMode: "Home Visit" | "Shop Drop-off";
  serviceArea: string;
  technicianId?: string;
  technicianName?: string;
  technicianEmail?: string;
  approvalStatus: ApprovalStatus;
  isAvailable: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const statusOptions = [
  { value: "all", label: "All Services" },
  { value: "pending", label: "Pending Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function formatDate(value?: string) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusClass(status: ApprovalStatus) {
  const styles: Record<ApprovalStatus, string> = {
    pending: "bg-amber-50 text-amber-700",
    approved: "bg-green-50 text-green-700",
    rejected: "bg-red-50 text-red-700",
  };

  return styles[status];
}

function formatStatus(status: ApprovalStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedService, setSelectedService] =
    useState<AdminService | null>(null);

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);

      const query =
        filter === "all"
          ? ""
          : `?approvalStatus=${encodeURIComponent(filter)}`;

      const result = await authenticatedRequest<{
        success: boolean;
        count: number;
        data: AdminService[];
      }>(`/api/admin/services${query}`);

      setServices(result.data || []);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load technician services."
      );
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const filteredServices = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return services;

    return services.filter(
      (service) =>
        service.title?.toLowerCase().includes(term) ||
        service.category?.toLowerCase().includes(term) ||
        service.technicianName?.toLowerCase().includes(term) ||
        service.technicianEmail?.toLowerCase().includes(term) ||
        service.serviceArea?.toLowerCase().includes(term)
    );
  }, [services, search]);

  const counts = useMemo(
    () => ({
      total: services.length,
      pending: services.filter(
        (service) => service.approvalStatus === "pending"
      ).length,
      approved: services.filter(
        (service) => service.approvalStatus === "approved"
      ).length,
      rejected: services.filter(
        (service) => service.approvalStatus === "rejected"
      ).length,
    }),
    [services]
  );

  const updateApproval = async (
    service: AdminService,
    approvalStatus: "approved" | "rejected"
  ) => {
    if (service.approvalStatus !== "pending") {
      toast.error("Only pending services can be reviewed.");
      return;
    }

    const action = approvalStatus === "approved" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${service.title}"?`
    );

    if (!confirmed) return;

    setUpdatingId(service._id);

    try {
      await authenticatedRequest(
        `/api/admin/services/${service._id}/approval`,
        {
          method: "PATCH",
          body: JSON.stringify({ approvalStatus }),
        }
      );

      setServices((current) =>
        current.map((item) =>
          item._id === service._id
            ? { ...item, approvalStatus }
            : item
        )
      );

      setSelectedService((current) =>
        current?._id === service._id
          ? { ...current, approvalStatus }
          : current
      );

      toast.success(
        approvalStatus === "approved"
          ? "Service approved successfully."
          : "Service rejected successfully."
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update service approval."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/dashboard/admin"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-600"
        >
          <ArrowLeft size={17} />
          Back to Admin Dashboard
        </Link>

        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
              Administration
            </p>
            <h1 className="text-3xl font-bold text-slate-900">
              Service Management
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Review technician services and manage approval requests.
            </p>
          </div>

          <button
            onClick={loadServices}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh Services
          </button>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total Services",
              value: counts.total,
              icon: Wrench,
              color: "bg-blue-50 text-blue-600",
            },
            {
              label: "Pending Review",
              value: counts.pending,
              icon: Clock3,
              color: "bg-amber-50 text-amber-600",
            },
            {
              label: "Approved",
              value: counts.approved,
              icon: CheckCircle2,
              color: "bg-green-50 text-green-600",
            },
            {
              label: "Rejected",
              value: counts.rejected,
              icon: XCircle,
              color: "bg-red-50 text-red-600",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <div className={`rounded-xl p-3 ${item.color}`}>
                    <Icon size={21} />
                  </div>
                </div>
                <p className="mt-4 text-3xl font-bold text-slate-900">
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, category, technician or area..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">
            Technician Services
          </h2>
          <p className="text-xs text-slate-500">
            {filteredServices.length} matching services
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="text-center">
              <LoaderCircle
                size={35}
                className="mx-auto mb-3 animate-spin text-blue-600"
              />
              <p className="text-sm text-slate-500">
                Loading services...
              </p>
            </div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <Wrench
              size={42}
              className="mx-auto mb-4 text-slate-300"
            />
            <h3 className="font-semibold text-slate-800">
              No services found
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Try changing your search or approval filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredServices.map((service) => (
              <article
                key={service._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative h-48 bg-slate-100">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Wrench size={45} className="text-slate-300" />
                    </div>
                  )}

                  <span
                    className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${statusClass(service.approvalStatus)}`}
                  >
                    {formatStatus(service.approvalStatus)}
                  </span>
                </div>

                <div className="p-5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                      {service.category}
                    </span>
                    <span className="text-lg font-bold text-slate-900">
                      ৳{Number(service.basePrice || 0).toLocaleString("en-BD")}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {service.title}
                  </h3>

                  <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-6 text-slate-500">
                    {service.description}
                  </p>

                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <UserRound size={15} />
                      <span className="truncate">
                        {service.technicianName || "Technician"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin size={15} />
                      <span className="truncate">
                        {service.serviceArea || "Area not specified"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock3 size={15} />
                      {service.estimatedDuration || "Duration not specified"}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        service.isAvailable
                          ? "bg-green-50 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {service.isAvailable ? "Available" : "Unavailable"}
                    </span>

                    <button
                      onClick={() => setSelectedService(service)}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Eye size={15} />
                      View Details
                    </button>
                  </div>

                  {service.approvalStatus === "pending" && (
                    <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
                      <button
                        onClick={() =>
                          updateApproval(service, "approved")
                        }
                        disabled={updatingId === service._id}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                      >
                        {updatingId === service._id ? (
                          <LoaderCircle
                            size={15}
                            className="animate-spin"
                          />
                        ) : (
                          <CheckCircle2 size={15} />
                        )}
                        Approve
                      </button>

                      <button
                        onClick={() =>
                          updateApproval(service, "rejected")
                        }
                        disabled={updatingId === service._id}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        <XCircle size={15} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4">
          <div className="my-8 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Service Review
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review the service and technician details.
                </p>
              </div>

              <button
                onClick={() => setSelectedService(null)}
                aria-label="Close service details"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={21} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {selectedService.image && (
                <div className="h-56 overflow-hidden rounded-xl bg-slate-100">
                  <img
                    src={selectedService.image}
                    alt={selectedService.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    {selectedService.category}
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-slate-900">
                    {selectedService.title}
                  </h3>
                </div>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusClass(selectedService.approvalStatus)}`}
                >
                  {formatStatus(selectedService.approvalStatus)}
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Service Description
                </p>
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {selectedService.description}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-400">Base Price</p>
                  <p className="mt-1 flex items-center gap-2 font-bold text-slate-900">
                    <Banknote size={17} />
                    ৳{Number(selectedService.basePrice || 0).toLocaleString("en-BD")}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Estimated Duration</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {selectedService.estimatedDuration || "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Service Mode</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {selectedService.serviceMode || "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Service Area</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {selectedService.serviceArea || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <UserRound size={18} className="text-blue-600" />
                  <h4 className="font-semibold text-slate-900">
                    Technician Information
                  </h4>
                </div>

                <p className="text-sm font-semibold text-slate-800">
                  {selectedService.technicianName || "Not available"}
                </p>
                <p className="mt-1 break-all text-sm text-slate-500">
                  {selectedService.technicianEmail || "Email not available"}
                </p>
                <p className="mt-3 text-xs text-slate-400">
                  Submitted: {formatDate(selectedService.createdAt)}
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-between">
                <button
                  onClick={() => setSelectedService(null)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>

                {selectedService.approvalStatus === "pending" && (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      onClick={() =>
                        updateApproval(selectedService, "rejected")
                      }
                      disabled={updatingId === selectedService._id}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <XCircle size={16} />
                      Reject
                    </button>

                    <button
                      onClick={() =>
                        updateApproval(selectedService, "approved")
                      }
                      disabled={updatingId === selectedService._id}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle2 size={16} />
                      Approve Service
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
