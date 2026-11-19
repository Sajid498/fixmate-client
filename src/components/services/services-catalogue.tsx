"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpDown,
  Clock3,
  Laptop,
  MapPin,
  Refrigerator,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Snowflake,
  Star,
  Tv,
  WashingMachine,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const categories = [
  "All",
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
];

const serviceModes = ["All", "Home Visit", "Shop Drop-off"];

const sortOptions = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price-low" },
  { label: "Price: High to Low", value: "price-high" },
];

const categoryIcons: Record<string, LucideIcon> = {
  Smartphone,
  "Laptop & PC": Laptop,
  AC: Snowflake,
  Refrigerator,
  TV:Tv,
  "Washing Machine": WashingMachine,
  Electrical: Zap,
};

const categoryColors: Record<string, string> = {
  Smartphone: "blue",
  "Laptop & PC": "purple",
  AC: "cyan",
  Refrigerator: "green",
  TV: "orange",
  "Washing Machine": "pink",
  Electrical: "yellow",
};

type Service = {
  _id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  basePrice: number;
  estimatedDuration: string;
  serviceMode: string;
  serviceArea: string;
  technicianName: string;
  technicianEmail: string;
  approvalStatus: string;
  isAvailable: boolean;
  createdAt: string;
};

type ServicesResponse = {
  success: boolean;
  message?: string;
  count: number;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  data: Service[];
};

type ServicesCatalogueProps = {
  initialCategory?: string;
};

export default function ServicesCatalogue({
  initialCategory = "All",
}: ServicesCatalogueProps) {
  const validCategory = categories.includes(initialCategory)
    ? initialCategory
    : "All";

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(validCategory);
  const [mode, setMode] = useState("All");
  const [area, setArea] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [totalServices, setTotalServices] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadServices = useCallback(
    async (signal: AbortSignal) => {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: String(page),
        limit: "12",
        sort,
      });

      if (search.trim()) params.set("search", search.trim());
      if (category !== "All") params.set("category", category);
      if (mode !== "All") params.set("serviceMode", mode);
      if (area.trim()) params.set("serviceArea", area.trim());

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/services?${params.toString()}`,
          {
            method: "GET",
            cache: "no-store",
            signal,
          },
        );

        const result = (await response.json()) as ServicesResponse;

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load repair services.");
        }

        setServices(result.data || []);
        setTotalServices(result.pagination?.total ?? result.count ?? 0);
        setTotalPages(result.pagination?.totalPages ?? 0);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setServices([]);
        setTotalServices(0);
        setTotalPages(0);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load repair services. Please try again.",
        );
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    },
    [page, search, category, mode, area, sort],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      loadServices(controller.signal);
    }, 300);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [loadServices]);

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setMode("All");
    setArea("");
    setSort("newest");
    setPage(1);
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    category !== "All" ||
    mode !== "All" ||
    area.trim() !== "" ||
    sort !== "newest";

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setPage(1);
  };

  const handleModeChange = (value: string) => {
    setMode(value);
    setPage(1);
  };

  const getIcon = (serviceCategory: string) =>
    categoryIcons[serviceCategory] || Wrench;

  const getColor = (serviceCategory: string) =>
    categoryColors[serviceCategory] || "blue";

  return (
    <div className="services-page">
      <section className="services-hero">
        <div className="container">
          <span className="eyebrow">
            <Wrench size={14} />
            FIND YOUR REPAIR SOLUTION
          </span>

          <h1>
            Discover the Right
            <br />
            <span>Repair Service.</span>
          </h1>

          <p>
            Explore repair services, compare options and find
            technicians for your devices and home appliances.
          </p>

          <div className="services-search">
            <Search size={21} />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="What needs to be repaired?"
              aria-label="Search repair services"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="services-hero-note">
            <span>
              <Star size={15} fill="currentColor" />
              Multiple repair categories
            </span>
            <span>
              <MapPin size={15} />
              Convenient service options
            </span>
          </div>
        </div>
      </section>

      <section className="services-catalogue-section">
        <div className="container">
          <div className="catalogue-heading">
            <div>
              <span className="eyebrow">OUR REPAIR CATALOGUE</span>
              <h2>Explore Repair Services</h2>
              <p>Choose a service that matches your repair needs.</p>
            </div>

            <div className="catalogue-count">
              <strong>{totalServices}</strong>
              <span>Services found</span>
            </div>
          </div>

          <div className="catalogue-layout">
            <aside className="filter-panel">
              <div className="filter-heading">
                <div>
                  <SlidersHorizontal size={19} />
                  <h3>Filters</h3>
                </div>
                {hasActiveFilters && (
                  <button type="button" onClick={clearFilters}>
                    Reset
                  </button>
                )}
              </div>

              <div className="filter-group">
                <h4>Categories</h4>
                <div className="filter-options">
                  {categories.map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => handleCategoryChange(item)}
                      className={`filter-option ${
                        category === item ? "filter-option-active" : ""
                      }`}
                    >
                      <span>{item}</span>
                      {category === item && (
                        <span className="filter-check">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-divider" />

              <div className="filter-group">
                <h4>Service Mode</h4>
                <div className="filter-options">
                  {serviceModes.map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => handleModeChange(item)}
                      className={`filter-option ${
                        mode === item ? "filter-option-active" : ""
                      }`}
                    >
                      <span>{item}</span>
                      {mode === item && (
                        <span className="filter-check">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-divider" />

              <div className="filter-group">
                <h4>Service Area</h4>
                <input
                  type="text"
                  value={area}
                  onChange={(event) => {
                    setArea(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Enter area or city"
                  aria-label="Filter by service area"
                />
              </div>
            </aside>

            <div className="catalogue-results">
              <div className="results-toolbar">
                <p>
                  Showing <strong>{services.length}</strong> of{" "}
                  <strong>{totalServices}</strong> repair services
                </p>

                <label className="sort-control">
                  <ArrowUpDown size={16} />
                  <select
                    value={sort}
                    onChange={(event) => {
                      setSort(event.target.value);
                      setPage(1);
                    }}
                    aria-label="Sort services"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {loading ? (
                <div className="services-empty-state">
                  <span>
                    <Wrench size={32} />
                  </span>
                  <h3>Loading repair services...</h3>
                  <p>Please wait while we find available services.</p>
                </div>
              ) : error ? (
                <div className="services-empty-state">
                  <span>
                    <ShieldCheck size={32} />
                  </span>
                  <h3>Unable to load services</h3>
                  <p>{error}</p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      const controller = new AbortController();
                      loadServices(controller.signal);
                    }}
                  >
                    Try Again
                  </button>
                </div>
              ) : services.length > 0 ? (
                <>
                  <div className="services-card-grid">
                    {services.map((service) => {
                      const Icon = getIcon(service.category);
                      const color = getColor(service.category);

                      return (
                        <article className="service-card" key={service._id}>
                          <div
                            className={`service-card-visual service-${color}`}
                          >
                            <span className="service-category-label">
                              {service.category}
                            </span>

                            {service.image ? (
                              <img
                                src={service.image}
                                alt={service.title}
                                className="service-card-image"
                              />
                            ) : (
                              <div className="service-visual-icon">
                                <Icon size={48} strokeWidth={1.5} />
                              </div>
                            )}

                            <span className="service-visual-caption">
                              FIXMATE REPAIR SERVICE
                            </span>
                          </div>

                          <div className="service-card-content">
                            <div className="service-card-title-row">
                              <h3>{service.title}</h3>
                            </div>

                            <p className="service-description">
                              {service.description}
                            </p>

                            <div className="service-technician">
                              <span className="technician-avatar">
                                <Wrench size={17} />
                              </span>
                              <span>
                                <small>Service provider</small>
                                <strong>{service.technicianName}</strong>
                              </span>
                            </div>

                            <div className="service-meta">
                              <span>
                                <Clock3 size={14} />
                                {service.estimatedDuration}
                              </span>
                              <span>
                                <MapPin size={14} />
                                {service.serviceArea}
                              </span>
                            </div>

                            <div className="service-card-bottom">
                              <div className="service-price">
                                <small>Starting from</small>
                                <strong>${service.basePrice}</strong>
                              </div>

                              <Link
                                href={`/services/${service._id}`}
                                className="service-details-link"
                              >
                                View Details <ArrowRight size={16} />
                              </Link>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {totalPages > 1 && (
                    <div className="services-pagination">
                      <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage((current) => current - 1)}
                      >
                        Previous
                      </button>

                      <span>
                        Page {page} of {totalPages}
                      </span>

                      <button
                        type="button"
                        disabled={page >= totalPages}
                        onClick={() => setPage((current) => current + 1)}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="services-empty-state">
                  <span>
                    <Search size={32} />
                  </span>
                  <h3>No services found</h3>
                  <p>
                    Try another search term or adjust your filters
                    to discover available repair services.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={clearFilters}
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}