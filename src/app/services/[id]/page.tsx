
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  MapPin,
  ShieldCheck,
  Smartphone,
  Laptop,
  Snowflake,
  Refrigerator,
  Tv,
  Zap,
  WashingMachine,
  Wrench,
  CalendarCheck,
  Headphones,
} from "lucide-react";
import ServiceBookingForm from "@/components/services/service-booking-form";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Service = {
  _id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  basePrice: number;
  estimatedDuration: string;
  serviceMode: "Home Visit" | "Shop Drop-off";
  serviceArea: string;
  technicianName: string;
  technicianEmail: string;
  approvalStatus: string;
  isAvailable: boolean;
  createdAt: string;
};

type ServiceResponse = {
  success: boolean;
  message?: string;
  data?: Service;
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function getService(id: string): Promise<Service | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/services/${encodeURIComponent(id)}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) return null;

    const result = (await response.json()) as ServiceResponse;

    if (!result.success || !result.data) return null;

    return result.data;
  } catch {
    return null;
  }
}

function getCategoryIcon(category: string) {
  const icons: Record<string, typeof Wrench> = {
    Smartphone,
    "Laptop & PC": Laptop,
    AC: Snowflake,
    Refrigerator,
    TV: Tv,
    "Washing Machine": WashingMachine,
    Electrical: Zap,
  };

  return icons[category] || Wrench;
}

function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    Smartphone: "blue",
    "Laptop & PC": "purple",
    AC: "cyan",
    Refrigerator: "green",
    TV: "orange",
    "Washing Machine": "pink",
    Electrical: "yellow",
  };

  return colors[category] || "blue";
}

function getFeatures(category: string) {
  const features: Record<string, string[]> = {
    Smartphone: [
      "Device problem inspection",
      "Professional repair assistance",
      "Device functionality assessment",
      "Repair recommendations",
    ],
    "Laptop & PC": [
      "Hardware problem diagnosis",
      "System and component inspection",
      "Performance troubleshooting",
      "Repair recommendations",
    ],
    AC: [
      "Cooling performance inspection",
      "Air conditioner assessment",
      "General maintenance support",
      "Service recommendations",
    ],
    Refrigerator: [
      "Cooling problem diagnosis",
      "Component inspection",
      "Performance assessment",
      "Repair recommendations",
    ],
    TV: [
      "Display and sound inspection",
      "Power problem diagnosis",
      "Connectivity assessment",
      "Repair recommendations",
    ],
    "Washing Machine": [
      "Washing machine inspection",
      "Drainage and spinning assessment",
      "Water supply inspection",
      "Repair recommendations",
    ],
    Electrical: [
      "Electrical fault inspection",
      "Switch and socket assessment",
      "Wiring problem diagnosis",
      "Safety recommendations",
    ],
  };

  return (
    features[category] || [
      "Initial problem inspection",
      "Professional repair assistance",
      "Device condition assessment",
      "Repair recommendations",
    ]
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const service = await getService(id);

  return {
    title: service ? service.title : "Service Not Found",
    description:
      service?.description ?? "Explore repair services with FixMate.",
  };
}

export default async function ServiceDetailsPage({
  params,
}: PageProps) {
  const { id } = await params;
  const service = await getService(id);

  if (!service) {
    notFound();
  }

  const Icon = getCategoryIcon(service.category);
  const color = getCategoryColor(service.category);
  const features = getFeatures(service.category);

  return (
    <div className="service-details-page">
      <section className="service-details-hero">
        <div className="container">
          <Link href="/services" className="back-to-services">
            <ArrowLeft size={17} />
            Back to Services
          </Link>

          <div className="service-details-breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/services">Services</Link>
            <span>/</span>
            <span>{service.category}</span>
          </div>

          <div className="service-details-layout">
            <div className="service-details-information">
              <span className="eyebrow">
                <Wrench size={14} />
                FIXMATE REPAIR SERVICE
              </span>

              <span className="service-details-category">
                {service.category}
              </span>

              <h1>{service.title}</h1>

              <p className="service-details-description">
                {service.description}
              </p>

              <div className="service-details-highlights">
                <span>
                  <Clock3 size={17} />
                  {service.estimatedDuration}
                </span>
                <span>
                  <MapPin size={17} />
                  {service.serviceArea}
                </span>
              </div>

              <div className="service-details-actions">
                <a href="#request-information" className="btn btn-primary">
                  Request This Service
                  <ArrowRight size={17} />
                </a>

                <Link href="/services" className="btn btn-outline">
                  Explore More
                </Link>
              </div>
            </div>

            <div className={`service-details-visual service-${color}`}>
              <span className="service-details-visual-label">
                {service.category}
              </span>

              {service.image ? (
                <img
                  src={service.image}
                  alt={service.title}
                  className="service-details-image"
                />
              ) : (
                <div className="service-details-main-icon">
                  <Icon size={88} strokeWidth={1.4} />
                </div>
              )}

              <strong>Professional Repair Support</strong>
              <span>Reliable solutions with FixMate</span>
            </div>
          </div>
        </div>
      </section>

      <section className="service-details-content section">
        <div className="container">
          <div className="service-details-content-grid">
            <div className="service-details-main">
              <div className="details-content-card">
                <span className="eyebrow">SERVICE OVERVIEW</span>
                <h2>About This Service</h2>
                <p>{service.description}</p>
              </div>

              <div className="details-content-card">
                <span className="eyebrow">WHAT IS INCLUDED</span>
                <h2>Service Features</h2>

                <div className="service-feature-list">
                  {features.map((feature) => (
                    <div key={feature} className="service-feature-item">
                      <CheckCircle2 size={19} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="details-content-card"
                id="request-information"
              >
                <ServiceBookingForm
                  serviceId={service._id}
                  technicianEmail={service.technicianEmail}
                />
              </div>
            </div>

            <aside className="service-details-sidebar">
              <div className="details-price-card">
                <span>Starting from</span>
                <strong>${service.basePrice}</strong>
                <small>
                  Final price may depend on the repair requirements.
                </small>

                <div className="details-price-divider" />

                <div className="details-information-row">
                  <Clock3 size={18} />
                  <span>
                    <small>Estimated duration</small>
                    <strong>{service.estimatedDuration}</strong>
                  </span>
                </div>

                <div className="details-information-row">
                  <MapPin size={18} />
                  <span>
                    <small>Service area</small>
                    <strong>{service.serviceArea}</strong>
                  </span>
                </div>

                <div className="details-information-row">
                  <CalendarCheck size={18} />
                  <span>
                    <small>Service mode</small>
                    <strong>{service.serviceMode}</strong>
                  </span>
                </div>
              </div>

              <div className="technician-details-card">
                <span className="eyebrow">SERVICE PROVIDER</span>

                <div className="technician-details-avatar">
                  <Wrench size={27} />
                </div>

                <h3>{service.technicianName}</h3>
                <p>FixMate service provider</p>

                <div className="technician-details-area">
                  <MapPin size={15} />
                  {service.serviceArea}
                </div>
              </div>

              <div className="details-trust-card">
                <ShieldCheck size={25} />
                <div>
                  <strong>Service Approval</strong>
                  <p>
                    This service has been approved by FixMate administrators.
                  </p>
                </div>
              </div>

              <div className="details-help-card">
                <Headphones size={23} />
                <strong>Need help?</strong>
                <p>
                  Explore our service catalogue to find another repair
                  solution.
                </p>
                <Link href="/services">
                  Browse Services <ArrowRight size={15} />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
