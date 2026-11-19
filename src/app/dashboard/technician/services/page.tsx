
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Edit3,
  LoaderCircle,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Wrench,
  X,
  XCircle,
} from "lucide-react";
import { authenticatedRequest } from "@/lib/api";
import { toast } from "sonner";

type ServiceMode = "Home Visit" | "Shop Drop-off";
type ApprovalStatus = "pending" | "approved" | "rejected";

interface Service {
  _id: string;
  title: string;
  category: string;
  description: string;
  image?: string;
  basePrice: number;
  estimatedDuration: string;
  serviceMode: ServiceMode;
  serviceArea: string;
  approvalStatus: ApprovalStatus;
  isAvailable: boolean;
  createdAt?: string;
}

interface ServiceForm {
  title: string;
  category: string;
  description: string;
  image: string;
  basePrice: string;
  estimatedDuration: string;
  serviceMode: ServiceMode;
  serviceArea: string;
}

const initialForm: ServiceForm = {
  title: "",
  category: "Smartphone",
  description: "",
  image: "",
  basePrice: "",
  estimatedDuration: "",
  serviceMode: "Home Visit",
  serviceArea: "",
};

const categories = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
];

function statusStyle(status: ApprovalStatus) {
  if (status === "approved") {
    return "bg-green-50 text-green-700";
  }

  if (status === "rejected") {
    return "bg-red-50 text-red-700";
  }

  return "bg-amber-50 text-amber-700";
}

function formatStatus(status: ApprovalStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function TechnicianServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>(initialForm);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);

      const result = await authenticatedRequest<{
        success: boolean;
        count: number;
        data: Service[];
      }>("/api/services/mine");

      setServices(result.data || []);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load services."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingId(service._id);
    setForm({
      title: service.title,
      category: service.category,
      description: service.description,
      image: service.image || "",
      basePrice: String(service.basePrice),
      estimatedDuration: service.estimatedDuration,
      serviceMode: service.serviceMode,
      serviceArea: service.serviceArea,
    });
    setModalOpen(true);
  };

  const updateField = (
    field: keyof ServiceForm,
    value: string
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const price = Number(form.basePrice);

    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Enter a valid service price.");
      return;
    }

    setSaving(true);

    const payload = {
      ...form,
      basePrice: price,
      image: form.image.trim(),
    };

    try {
      if (editingId) {
        await authenticatedRequest(`/api/services/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        toast.success(
          "Service updated. It has been sent for admin approval again."
        );
      } else {
        await authenticatedRequest("/api/services", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        toast.success("Service submitted for admin approval.");
      }

      setModalOpen(false);
      setEditingId(null);
      setForm(initialForm);
      await loadServices();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save service."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this service? This action cannot be undone."
    );

    if (!confirmed) return;

    setDeletingId(serviceId);

    try {
      await authenticatedRequest(`/api/services/${serviceId}`, {
        method: "DELETE",
      });

      setServices((current) =>
        current.filter((service) => service._id !== serviceId)
      );

      toast.success("Service deleted successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete service."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleAvailability = async (service: Service) => {
    setUpdatingId(service._id);

    try {
      await authenticatedRequest(
        `/api/services/${service._id}/availability`,
        {
          method: "PATCH",
          body: JSON.stringify({
            isAvailable: !service.isAvailable,
          }),
        }
      );

      setServices((current) =>
        current.map((item) =>
          item._id === service._id
            ? { ...item, isAvailable: !item.isAvailable }
            : item
        )
      );

      toast.success(
        service.isAvailable
          ? "Service is now unavailable."
          : "Service is now available."
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update availability."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.title.toLowerCase().includes(search.toLowerCase()) ||
      service.category.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      service.approvalStatus === filter;

    return matchesSearch && matchesFilter;
  });

  const approvedCount = services.filter(
    (service) => service.approvalStatus === "approved"
  ).length;

  const pendingCount = services.filter(
    (service) => service.approvalStatus === "pending"
  ).length;

  const rejectedCount = services.filter(
    (service) => service.approvalStatus === "rejected"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/dashboard/technician"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-600"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
              Technician Workspace
            </p>
            <h1 className="text-3xl font-bold text-slate-900">
              My Services
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Create and manage your repair services.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={19} />
            Add New Service
          </button>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-500">Total Services</span>
              <Wrench className="text-blue-600" size={21} />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {services.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-500">Approved</span>
              <CheckCircle2 className="text-green-600" size={21} />
            </div>
            <p className="text-3xl font-bold text-green-700">
              {approvedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-500">Pending Review</span>
              <Clock3 className="text-amber-600" size={21} />
            </div>
            <p className="text-3xl font-bold text-amber-700">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-500">Rejected</span>
              <XCircle className="text-red-600" size={21} />
            </div>
            <p className="text-3xl font-bold text-red-700">
              {rejectedCount}
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={19}
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by service name or category..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="all">All Services</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>

          <button
            onClick={loadServices}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="text-center">
              <LoaderCircle
                className="mx-auto mb-3 animate-spin text-blue-600"
                size={35}
              />
              <p className="text-sm text-slate-500">
                Loading your services...
              </p>
            </div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <Wrench
              className="mx-auto mb-4 text-slate-300"
              size={45}
            />
            <h3 className="text-lg font-semibold text-slate-800">
              {services.length === 0
                ? "No services yet"
                : "No matching services found"}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {services.length === 0
                ? "Add your first repair service to start receiving customer requests."
                : "Try changing your search term or approval filter."}
            </p>
            {services.length === 0 && (
              <button
                onClick={openCreateModal}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus size={18} />
                Create Service
              </button>
            )}
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
                      <Wrench size={48} className="text-slate-300" />
                    </div>
                  )}

                  <span
                    className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(service.approvalStatus)}`}
                  >
                    {formatStatus(service.approvalStatus)}
                  </span>
                </div>

                <div className="p-5">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                      {service.category}
                    </span>
                    <span className="text-lg font-bold text-slate-900">
                      ৳{service.basePrice.toLocaleString("en-BD")}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900">
                    {service.title}
                  </h2>

                  <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-6 text-slate-500">
                    {service.description}
                  </p>

                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <Clock3 size={16} />
                      {service.estimatedDuration}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      {service.serviceArea}
                    </div>
                    <div className="flex items-center gap-2">
                      <Wrench size={16} />
                      {service.serviceMode}
                    </div>
                  </div>

                  {service.approvalStatus === "rejected" && (
                    <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs leading-5 text-red-700">
                      This service was rejected by the admin. Edit and resubmit it for review.
                    </p>
                  )}

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <button
                      onClick={() => handleAvailability(service)}
                      disabled={
                        updatingId === service._id ||
                        service.approvalStatus !== "approved"
                      }
                      className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                        service.isAvailable
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {updatingId === service._id
                        ? "Updating..."
                        : service.isAvailable
                          ? "Available"
                          : "Unavailable"}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(service)}
                        aria-label="Edit service"
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Edit3 size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(service._id)}
                        disabled={deletingId === service._id}
                        aria-label="Delete service"
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        {deletingId === service._id ? (
                          <LoaderCircle size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4">
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingId ? "Edit Service" : "Create New Service"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {editingId
                    ? "Update your repair service details."
                    : "Provide accurate information about your service."}
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                disabled={saving}
                aria-label="Close modal"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Service Title
                  </label>
                  <input
                    required
                    minLength={3}
                    maxLength={100}
                    value={form.title}
                    onChange={(event) =>
                      updateField("title", event.target.value)
                    }
                    placeholder="e.g. Smartphone Screen Replacement"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Category
                  </label>
                  <select
                    required
                    value={form.category}
                    onChange={(event) =>
                      updateField("category", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Base Price (BDT)
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.basePrice}
                    onChange={(event) =>
                      updateField("basePrice", event.target.value)
                    }
                    placeholder="e.g. 500"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Estimated Duration
                  </label>
                  <input
                    required
                    minLength={2}
                    maxLength={50}
                    value={form.estimatedDuration}
                    onChange={(event) =>
                      updateField("estimatedDuration", event.target.value)
                    }
                    placeholder="e.g. 1-2 hours"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Service Mode
                  </label>
                  <select
                    required
                    value={form.serviceMode}
                    onChange={(event) =>
                      updateField(
                        "serviceMode",
                        event.target.value as ServiceMode
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="Home Visit">Home Visit</option>
                    <option value="Shop Drop-off">Shop Drop-off</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Service Area
                  </label>
                  <input
                    required
                    value={form.serviceArea}
                    onChange={(event) =>
                      updateField("serviceArea", event.target.value)
                    }
                    placeholder="e.g. Dhanmondi, Mohammadpur, Dhaka"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Service Image URL
                  </label>
                  <input
                    type="url"
                    value={form.image}
                    onChange={(event) =>
                      updateField("image", event.target.value)
                    }
                    placeholder="https://example.com/service-image.jpg"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Service Description
                  </label>
                  <textarea
                    required
                    minLength={20}
                    maxLength={2000}
                    rows={5}
                    value={form.description}
                    onChange={(event) =>
                      updateField("description", event.target.value)
                    }
                    placeholder="Explain what your repair service includes..."
                    className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <p className="mt-1 text-right text-xs text-slate-400">
                    {form.description.length}/2000
                  </p>
                </div>
              </div>

              {editingId && (
                <p className="rounded-xl bg-amber-50 p-3 text-sm leading-5 text-amber-800">
                  Updating a service will reset its approval status to Pending until an admin reviews it again.
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      {editingId ? "Save Changes" : "Submit for Approval"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
