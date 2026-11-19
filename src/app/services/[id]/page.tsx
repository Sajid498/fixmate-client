
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

const services = [
  {
    id: "sample-phone-screen",
    title: "Smartphone Screen Replacement",
    category: "Smartphone",
    description:
      "Professional screen replacement for cracked, damaged or unresponsive smartphone displays. Our service providers inspect your device, identify display issues and help restore your phone's usability.",
    price: 45,
    duration: "1–2 hours",
    mode: "Shop Drop-off",
    technician: "Rahim Electronics",
    area: "Dhaka",
    icon: Smartphone,
    color: "blue",
    features: [
      "Screen damage inspection",
      "Professional replacement service",
      "Display functionality testing",
      "Device condition verification",
    ],
  },
  {
    id: "sample-laptop-repair",
    title: "Laptop Hardware Repair",
    category: "Laptop & PC",
    description:
      "Diagnosis and repair for laptop hardware, keyboard, charging and performance issues. Get professional assistance for common laptop problems.",
    price: 60,
    duration: "2–4 hours",
    mode: "Home Visit",
    technician: "TechCare Solutions",
    area: "Dhaka",
    icon: Laptop,
    color: "purple",
    features: [
      "Hardware diagnosis",
      "Keyboard and charging inspection",
      "Performance troubleshooting",
      "Repair recommendations",
    ],
  },
  {
    id: "sample-ac-service",
    title: "Air Conditioner Servicing",
    category: "AC",
    description:
      "AC cleaning, cooling inspection and maintenance to keep your room comfortable. A technician visits your location to inspect your air conditioner.",
    price: 35,
    duration: "1–2 hours",
    mode: "Home Visit",
    technician: "CoolFix Experts",
    area: "Dhaka",
    icon: Snowflake,
    color: "cyan",
    features: [
      "Cooling performance inspection",
      "Air filter cleaning",
      "General maintenance",
      "Service recommendations",
    ],
  },
  {
    id: "sample-fridge-repair",
    title: "Refrigerator Repair",
    category: "Refrigerator",
    description:
      "Troubleshooting cooling problems, unusual noises and common refrigerator faults. Get professional assistance for your household refrigerator.",
    price: 50,
    duration: "2–3 hours",
    mode: "Home Visit",
    technician: "Appliance Care",
    area: "Dhaka",
    icon: Refrigerator,
    color: "green",
    features: [
      "Cooling problem diagnosis",
      "Noise inspection",
      "Component assessment",
      "Repair recommendations",
    ],
  },
  {
    id: "sample-tv-repair",
    title: "LED TV Repair",
    category: "TV",
    description:
      "Professional diagnosis for display, sound, power and connectivity problems. Get help identifying common television faults.",
    price: 40,
    duration: "2–3 hours",
    mode: "Shop Drop-off",
    technician: "Vision Repair Hub",
    area: "Dhaka",
    icon: Tv,
    color: "orange",
    features: [
      "Display inspection",
      "Sound troubleshooting",
      "Power problem diagnosis",
      "Connectivity inspection",
    ],
  },
  {
    id: "sample-electrical",
    title: "Home Electrical Repair",
    category: "Electrical",
    description:
      "Help with switches, sockets, wiring faults and common household electrical issues. A service provider can visit your home to inspect the problem.",
    price: 30,
    duration: "1–2 hours",
    mode: "Home Visit",
    technician: "SafeVolt Services",
    area: "Dhaka",
    icon: Zap,
    color: "yellow",
    features: [
      "Electrical fault inspection",
      "Switch and socket assessment",
      "Wiring problem diagnosis",
      "Safety recommendations",
    ],
  },
  {
    id: "sample-washing-machine",
    title: "Washing Machine Repair",
    category: "Washing Machine",
    description:
      "Repair support for drainage, spinning, water supply and washing machine faults. Get help diagnosing common appliance problems.",
    price: 55,
    duration: "2–3 hours",
    mode: "Home Visit",
    technician: "HomeTech Repair",
    area: "Dhaka",
    icon: WashingMachine,
    color: "pink",
    features: [
      "Drainage problem inspection",
      "Spinning system diagnosis",
      "Water supply assessment",
      "Repair recommendations",
    ],
  },
  {
    id: "sample-phone-battery",
    title: "Smartphone Battery Replacement",
    category: "Smartphone",
    description:
      "Battery inspection and replacement for devices with poor battery performance. Get assistance with common smartphone battery issues.",
    price: 25,
    duration: "1 hour",
    mode: "Shop Drop-off",
    technician: "MobileCare Center",
    area: "Dhaka",
    icon: Smartphone,
    color: "blue",
    features: [
      "Battery condition inspection",
      "Battery replacement service",
      "Charging functionality testing",
      "Device performance verification",
    ],
  },
];

type Service = (typeof services)[number];

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const service = services.find((item) => item.id === id);

  return {
    title: service ? service.title : "Service Not Found",
    description: service?.description ?? "Explore repair services with FixMate.",
  };
}

export default async function ServiceDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const service: Service | undefined = services.find((item) => item.id === id);

  if (!service) {
    notFound();
  }

  const Icon = service.icon;

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
                  {service.duration}
                </span>
                <span>
                  <MapPin size={17} />
                  {service.area}
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

            <div className={`service-details-visual service-${service.color}`}>
              <span className="service-details-visual-label">
                {service.category}
              </span>
              <div className="service-details-main-icon">
                <Icon size={88} strokeWidth={1.4} />
              </div>
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
                  {service.features.map((feature) => (
                    <div key={feature} className="service-feature-item">
                      <CheckCircle2 size={19} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="details-content-card" id="request-information">
                <span className="eyebrow">BOOKING INFORMATION</span>
                <h2>Ready to Request a Repair?</h2>
                <p>
                  Sign in as a customer to submit your repair request.
                  You can provide your preferred date, contact information
                  and a description of the problem during booking.
                </p>

                <Link
                  href={`/sign-in?callbackURL=${encodeURIComponent(`/services/${service.id}`)}`}
                  className="btn btn-primary details-signin-button"
                >
                  Sign In to Continue
                  <ArrowRight size={17} />
                </Link>

                <p className="details-booking-note">
                  Booking submission will be available after authentication
                  and backend integration are completed.
                </p>
              </div>
            </div>

            <aside className="service-details-sidebar">
              <div className="details-price-card">
                <span>Starting from</span>
                <strong>${service.price}</strong>
                <small>Final price may depend on the repair requirements.</small>
                <div className="details-price-divider" />

                <div className="details-information-row">
                  <Clock3 size={18} />
                  <span>
                    <small>Estimated duration</small>
                    <strong>{service.duration}</strong>
                  </span>
                </div>

                <div className="details-information-row">
                  <MapPin size={18} />
                  <span>
                    <small>Service area</small>
                    <strong>{service.area}</strong>
                  </span>
                </div>

                <div className="details-information-row">
                  <CalendarCheck size={18} />
                  <span>
                    <small>Service mode</small>
                    <strong>{service.mode}</strong>
                  </span>
                </div>
              </div>

              <div className="technician-details-card">
                <span className="eyebrow">SERVICE PROVIDER</span>
                <div className="technician-details-avatar">
                  <Wrench size={27} />
                </div>
                <h3>{service.technician}</h3>
                <p>FixMate service provider</p>

                <div className="technician-details-area">
                  <MapPin size={15} />
                  {service.area}
                </div>
              </div>

              <div className="details-trust-card">
                <ShieldCheck size={25} />
                <div>
                  <strong>Service Approval</strong>
                  <p>Services are intended to be reviewed by FixMate administrators before publication.</p>
                </div>
              </div>

              <div className="details-help-card">
                <Headphones size={23} />
                <strong>Need help?</strong>
                <p>Explore our service catalogue to find another repair solution.</p>
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
