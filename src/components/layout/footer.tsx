
import Link from "next/link";
import {
  ArrowUpRight,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Wrench,
} from "lucide-react";

const popularCategories = [
  "Smartphone Repair",
  "Laptop & PC",
  "Air Conditioner",
  "Refrigerator",
];

export default function Footer() {
  return (
    <footer className="bg-[#101d33] text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">

          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
                <Wrench size={29} />
              </span>
              <span>
                <span className="block text-3xl font-bold tracking-tight text-white">
                  Fix<span className="text-blue-400">Mate</span>
                </span>
                <span className="mt-1 block text-[9px] font-semibold tracking-[0.18em] text-blue-300">
                  REPAIR. RESTORE. RELAX.
                </span>
              </span>
            </Link>

            <p className="mt-7 max-w-sm text-sm leading-7 text-slate-300">
              Reliable repair services for the devices and appliances
              that make your everyday life easier.
            </p>

            <div className="mt-7 flex items-center gap-3">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-600 text-slate-300 transition hover:border-blue-500 hover:bg-blue-600 hover:text-white"
              >
                <Facebook size={19} />
              </a>

              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-600 text-slate-300 transition hover:border-pink-500 hover:bg-pink-600 hover:text-white"
              >
                <Instagram size={19} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-7 text-lg font-bold text-white">
              Quick Links
            </h3>
            <ul className="space-y-5 text-sm">
              <li><Link className="transition hover:text-blue-400" href="/">Home</Link></li>
              <li><Link className="transition hover:text-blue-400" href="/services">Our Services</Link></li>
              <li><Link className="transition hover:text-blue-400" href="/about">About Us</Link></li>
              <li><Link className="transition hover:text-blue-400" href="/sign-up">Join FixMate</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-7 text-lg font-bold text-white">
              Popular Categories
            </h3>
            <ul className="space-y-5 text-sm">
              {popularCategories.map((category) => (
                <li key={category}>
                  <Link
                    href="/services"
                    className="transition hover:text-blue-400"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-7 text-lg font-bold text-white">
              Contact
            </h3>

            <div className="space-y-5 text-sm">
              <a
                href="mailto:fixmate@gmail.com"
                className="flex items-center gap-3 transition hover:text-blue-400"
              >
                <Mail size={21} className="shrink-0 text-blue-400" />
                <span>fixmate@gmail.com</span>
              </a>

              <a
                href="tel:01234567890"
                className="flex items-center gap-3 transition hover:text-blue-400"
              >
                <Phone size={21} className="shrink-0 text-blue-400" />
                <span>01234567890</span>
              </a>

              <div className="flex items-center gap-3">
                <MapPin size={21} className="shrink-0 text-blue-400" />
                <span>Dhaka, Bangladesh</span>
              </div>

              <Link
                href="/about"
                className="inline-flex items-center gap-2 pt-2 text-blue-300 transition hover:text-white"
              >
                Learn more <ArrowUpRight size={17} />
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-16 flex flex-col justify-between gap-4 border-t border-slate-700 pt-7 text-sm text-slate-400 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} FixMate. All rights reserved.</p>
          <p>Made for easier everyday living.</p>
        </div>
      </div>
    </footer>
  );
}
