
import Link from "next/link";
import {
  ArrowUpRight,
  Mail,
  MapPin,
  Wrench,
  Globe,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand">
          <Link href="/" className="brand footer-logo">
            <span className="brand-icon">
              <Wrench size={23} strokeWidth={2.5} />
            </span>
            <span>
              Fix<span className="brand-accent">Mate</span>
              <small>REPAIR. RESTORE. RELAX.</small>
            </span>
          </Link>

          <p>
            Reliable repair services for the devices and appliances
            that make your everyday life easier.
          </p>

          <div className="footer-socials">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              Facebook
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              Instagram
            </a>
          </div>
        </div>

        <div className="footer-column">
          <h3>Quick Links</h3>
          <Link href="/">Home</Link>
          <Link href="/services">Our Services</Link>
          <Link href="/about">About Us</Link>
          <Link href="/sign-up">Join FixMate</Link>
        </div>

        <div className="footer-column">
          <h3>Popular Categories</h3>
          <Link href="/services?category=Smartphone">
            Smartphone Repair
          </Link>
          <Link href="/services?category=Laptop">
            Laptop & PC
          </Link>
          <Link href="/services?category=AC">
            Air Conditioner
          </Link>
          <Link href="/services?category=Refrigerator">
            Refrigerator
          </Link>
        </div>

        <div className="footer-column footer-contact">
          <h3>Contact</h3>
          <p>
            <Mail size={17} />
            Contact details coming soon
          </p>
          <p>
            <MapPin size={17} />
            Dhaka, Bangladesh
          </p>
          <Link href="/about" className="footer-contact-link">
            Learn more <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} FixMate. All rights reserved.</p>
        <p>Made for easier everyday living.</p>
      </div>
    </footer>
  );
}
