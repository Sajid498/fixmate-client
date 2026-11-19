
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowRight,
  Smartphone,
  Laptop,
  Snowflake,
  Refrigerator,
  Tv,
  Zap,
  WashingMachine,
  Star,
  Clock3,
  MapPin,
  Wrench,
  X,
} from "lucide-react";

const services = [
  {
    id: "sample-phone-screen",
    title: "Smartphone Screen Replacement",
    category: "Smartphone",
    description:
      "Professional screen replacement for cracked, damaged or unresponsive smartphone displays.",
    price: 45,
    duration: "1–2 hours",
    mode: "Shop Drop-off",
    technician: "Rahim Electronics",
    area: "Dhaka",
    icon: Smartphone,
    color: "blue",
    createdAt: "2026-11-18",
  },
  {
    id: "sample-laptop-repair",
    title: "Laptop Hardware Repair",
    category: "Laptop & PC",
    description:
      "Diagnosis and repair for laptop hardware, keyboard, charging and performance issues.",
    price: 60,
    duration: "2–4 hours",
    mode: "Home Visit",
    technician: "TechCare Solutions",
    area: "Dhaka",
    icon: Laptop,
    color: "purple",
    createdAt: "2026-11-17",
  },
  {
    id: "sample-ac-service",
    title: "Air Conditioner Servicing",
    category: "AC",
    description:
      "AC cleaning, cooling inspection and maintenance to keep your room comfortable.",
    price: 35,
    duration: "1–2 hours",
    mode: "Home Visit",
    technician: "CoolFix Experts",
    area: "Dhaka",
    icon: Snowflake,
    color: "cyan",
    createdAt: "2026-11-16",
  },
  {
    id: "sample-fridge-repair",
    title: "Refrigerator Repair",
    category: "Refrigerator",
    description:
      "Troubleshooting cooling problems, unusual noises and common refrigerator faults.",
    price: 50,
    duration: "2–3 hours",
    mode: "Home Visit",
    technician: "Appliance Care",
    area: "Dhaka",
    icon: Refrigerator,
    color: "green",
    createdAt: "2026-11-15",
  },
  {
    id: "sample-tv-repair",
    title: "LED TV Repair",
    category: "TV",
    description:
      "Professional diagnosis for display, sound, power and connectivity problems.",
    price: 40,
    duration: "2–3 hours",
    mode: "Shop Drop-off",
    technician: "Vision Repair Hub",
    area: "Dhaka",
    icon: Tv,
    color: "orange",
    createdAt: "2026-11-14",
  },
  {
    id: "sample-electrical",
    title: "Home Electrical Repair",
    category: "Electrical",
    description:
      "Help with switches, sockets, wiring faults and common household electrical issues.",
    price: 30,
    duration: "1–2 hours",
    mode: "Home Visit",
    technician: "SafeVolt Services",
    area: "Dhaka",
    icon: Zap,
    color: "yellow",
    createdAt: "2026-11-13",
  },
  {
    id: "sample-washing-machine",
    title: "Washing Machine Repair",
    category: "Washing Machine",
    description:
      "Repair support for drainage, spinning, water supply and washing machine faults.",
    price: 55,
    duration: "2–3 hours",
    mode: "Home Visit",
    technician: "HomeTech Repair",
    area: "Dhaka",
    icon: WashingMachine,
    color: "pink",
    createdAt: "2026-11-12",
  },
  {
    id: "sample-phone-battery",
    title: "Smartphone Battery Replacement",
    category: "Smartphone",
    description:
      "Battery inspection and replacement for devices with poor battery performance.",
    price: 25,
    duration: "1 hour",
    mode: "Shop Drop-off",
    technician: "MobileCare Center",
    area: "Dhaka",
    icon: Smartphone,
    color: "blue",
    createdAt: "2026-11-11",
  },
];

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
  const [sort, setSort] = useState("newest");

  const filteredServices = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = services.filter((service) => {
      const matchesSearch =
        !normalizedSearch ||
        service.title.toLowerCase().includes(normalizedSearch) ||
        service.category.toLowerCase().includes(normalizedSearch) ||
        service.description.toLowerCase().includes(normalizedSearch) ||
        service.technician.toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        category === "All" || service.category === category;

      const matchesMode = mode === "All" || service.mode === mode;

      return matchesSearch && matchesCategory && matchesMode;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      return (
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
      );
    });
  }, [search, category, mode, sort]);

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setMode("All");
    setSort("newest");
  };

  const hasActiveFilters =
    search !== "" || category !== "All" || mode !== "All" || sort !== "newest";

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
              onChange={(event) => setSearch(event.target.value)}
              placeholder="What needs to be repaired?"
              aria-label="Search repair services"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="services-hero-note">
            <span><Star size={15} fill="currentColor" /> Multiple repair categories</span>
            <span><MapPin size={15} /> Convenient service options</span>
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
              <strong>{filteredServices.length}</strong>
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
                      onClick={() => setCategory(item)}
                      className={`filter-option ${
                        category === item ? "filter-option-active" : ""
                      }`}
                    >
                      <span>{item}</span>
                      {category === item && <span className="filter-check">✓</span>}
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
                      onClick={() => setMode(item)}
                      className={`filter-option ${
                        mode === item ? "filter-option-active" : ""
                      }`}
                    >
                      <span>{item}</span>
                      {mode === item && <span className="filter-check">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            <div className="catalogue-results">
              <div className="results-toolbar">
                <p>
                  Showing <strong>{filteredServices.length}</strong> repair services
                </p>

                <label className="sort-control">
                  <ArrowUpDown size={16} />
                  <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value)}
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

              {filteredServices.length > 0 ? (
                <div className="services-card-grid">
                  {filteredServices.map((service) => {
                    const Icon = service.icon;

                    return (
                      <article className="service-card" key={service.id}>
                        <div className={`service-card-visual service-${service.color}`}>
                          <span className="service-category-label">
                            {service.category}
                          </span>
                          <div className="service-visual-icon">
                            <Icon size={48} strokeWidth={1.5} />
                          </div>
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
                              <strong>{service.technician}</strong>
                            </span>
                          </div>

                          <div className="service-meta">
                            <span><Clock3 size={14} /> {service.duration}</span>
                            <span><MapPin size={14} /> {service.area}</span>
                          </div>

                          <div className="service-card-bottom">
                            <div className="service-price">
                              <small>Starting from</small>
                              <strong>${service.price}</strong>
                            </div>

                            <Link
                              href={`/services/${service.id}`}
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
              ) : (
                <div className="services-empty-state">
                  <span><Search size={32} /></span>
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
