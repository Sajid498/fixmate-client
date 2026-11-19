
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Clock3,
  Headphones,
  Smartphone,
  Laptop,
  Snowflake,
  Tv,
  Zap,
  Star,
  Wrench,
  Search,
  Monitor,
  Settings,
  Home,
  BadgeCheck,
  CircleDollarSign,
} from "lucide-react";

const categories = [
  {
    name: "Smartphone Repair",
    description: "Screen, battery and hardware",
    icon: Smartphone,
    value: "Smartphone",
    color: "blue",
  },
  {
    name: "Laptop & PC",
    description: "Hardware and software solutions",
    icon: Laptop,
    value: "Laptop",
    color: "purple",
  },
  {
    name: "Air Conditioner",
    description: "Cooling and maintenance",
    icon: Snowflake,
    value: "AC",
    color: "cyan",
  },
  {
    name: "Refrigerator",
    description: "Cooling and appliance repair",
    icon: Settings,
    value: "Refrigerator",
    color: "green",
  },
  {
    name: "Television",
    description: "Display and connection issues",
    icon: Tv,
    value: "TV",
    color: "orange",
  },
  {
    name: "Electrical",
    description: "Electrical repair solutions",
    icon: Zap,
    value: "Electrical",
    color: "yellow",
  },
  {
    name: "Home Appliances",
    description: "Repairs for everyday appliances",
    icon: Home,
    value: "",
    color: "pink",
  },
  {
    name: "Other Repairs",
    description: "Find help for other devices",
    icon: Wrench,
    value: "",
    color: "indigo",
  },
];

const steps = [
  {
    number: "01",
    title: "Find Your Service",
    description:
      "Explore repair categories and discover a service that matches your needs.",
    icon: Search,
  },
  {
    number: "02",
    title: "Book a Technician",
    description:
      "Describe your problem and select a convenient repair appointment.",
    icon: Smartphone,
  },
  {
    number: "03",
    title: "Get It Repaired",
    description:
      "Your technician handles the repair and keeps you updated.",
    icon: Wrench,
  },
  {
    number: "04",
    title: "Pay Securely",
    description:
      "Review the completed job and pay securely through our platform.",
    icon: CheckCircle2,
  },
];

const benefits = [
  {
    icon: ShieldCheck,
    title: "Verified Technicians",
    description:
      "Our service approval process helps customers discover trusted repair providers.",
  },
  {
    icon: Clock3,
    title: "Convenient Booking",
    description:
      "Request a repair based on your preferred date and service requirements.",
  },
  {
    icon: CircleDollarSign,
    title: "Transparent Pricing",
    description:
      "Review service pricing and your final repair amount before payment.",
  },
  {
    icon: Headphones,
    title: "Easy Job Tracking",
    description:
      "Follow your repair progress through your personal customer dashboard.",
  },
];

const trustItems = [
  "Easy online booking",
  "Technician approval system",
  "Secure online payment",
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-content">
            <span className="eyebrow">
              <Star size={14} fill="currentColor" />
              YOUR SMART REPAIR PARTNER
            </span>

            <h1>
              Broken Things?
              <br />
              We Make Them <span>Work Again.</span>
            </h1>

            <p className="hero-description">
              From smartphones to home appliances, discover reliable
              repair services and connect with skilled technicians.
              Get your everyday essentials working again with FixMate.
            </p>

            <div className="hero-actions">
              <Link href="/services" className="btn btn-primary">
                Explore Services <ArrowRight size={17} />
              </Link>

              <Link href="/about" className="btn btn-outline">
                Discover FixMate
              </Link>
            </div>

            <div className="hero-trust">
              {trustItems.map((item) => (
                <span key={item}>
                  <CheckCircle2 size={16} />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-placeholder">
              <div className="hero-main-icon">
                <Wrench size={64} strokeWidth={1.5} />
              </div>
              <strong>Repair Made Simple</strong>
              <span>Your trusted repair partner</span>
            </div>

            <div className="floating-card floating-card-top">
              <span className="floating-icon">
                <BadgeCheck size={22} />
              </span>
              <span>
                <strong>Quality First</strong>
                <small>Approved service providers</small>
              </span>
            </div>

            <div className="floating-card floating-card-bottom">
              <span className="floating-icon">
                <Clock3 size={22} />
              </span>
              <span>
                <strong>Easy Scheduling</strong>
                <small>Book at your convenience</small>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">EXPLORE OUR SERVICES</span>
            <h2>What Do You Need Fixed?</h2>
            <p>
              Choose a category and find the right repair solution
              for your device or home appliance.
            </p>
          </div>

          <div className="category-grid">
            {categories.map((category) => {
              const Icon = category.icon;

              return (
                <Link
                  key={category.name}
                  href={
                    category.value
                      ? `/services?category=${encodeURIComponent(category.value)}`
                      : "/services"
                  }
                  className="category-card"
                >
                  <span className={`category-icon category-${category.color}`}>
                    <Icon size={24} />
                  </span>

                  <h3>{category.name}</h3>
                  <p>{category.description}</p>

                  <span className="category-arrow">
                    <ArrowRight size={17} />
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="section-link">
            <Link href="/services" className="text-link">
              Explore all repair services <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section how-section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">SIMPLE PROCESS</span>
            <h2>How FixMate Works</h2>
            <p>
              Getting your devices repaired doesn't have to be complicated.
              Follow four simple steps.
            </p>
          </div>

          <div className="steps-grid">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <article key={step.number} className="step-card">
                  <div className="step-card-top">
                    <span className="step-number">{step.number}</span>
                    <span className="step-icon">
                      <Icon size={23} />
                    </span>
                  </div>

                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">THE FIXMATE DIFFERENCE</span>
            <h2>A Better Way to Get Things Fixed</h2>
            <p>
              A convenient platform designed to make repair services
              easier to discover, request and manage.
            </p>
          </div>

          <div className="benefit-grid">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <article key={benefit.title} className="benefit-card">
                  <span className="benefit-icon">
                    <Icon size={25} />
                  </span>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="container stats-grid">
          <div className="stats-heading">
            <span className="eyebrow">OUR COMMITMENT</span>
            <h2>Repair Services Designed Around You.</h2>
            <p>
              From discovering services to tracking repairs and making
              payments, FixMate brings the process together in one place.
            </p>
          </div>

          <div className="stats-items">
            <div className="stat-item">
              <span><ShieldCheck size={24} /></span>
              <div>
                <strong>Quality Focused</strong>
                <small>Service approval process</small>
              </div>
            </div>

            <div className="stat-item">
              <span><Monitor size={24} /></span>
              <div>
                <strong>Multiple Categories</strong>
                <small>Devices and home appliances</small>
              </div>
            </div>

            <div className="stat-item">
              <span><Clock3 size={24} /></span>
              <div>
                <strong>Trackable Repairs</strong>
                <small>Follow your booking progress</small>
              </div>
            </div>

            <div className="stat-item">
              <span><CircleDollarSign size={24} /></span>
              <div>
                <strong>Secure Checkout</strong>
                <small>Online payment integration</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-panel">
            <span className="cta-label">
              YOUR REPAIR JOURNEY STARTS HERE
            </span>

            <h2>Ready to Get Things Fixed?</h2>

            <p>
              Discover repair services, connect with technicians and
              make your repair experience easier with FixMate.
            </p>

            <div className="cta-actions">
              <Link href="/services" className="btn">
                Find a Repair Service <ArrowRight size={17} />
              </Link>

              <Link href="/sign-up" className="cta-secondary">
                Create an Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
