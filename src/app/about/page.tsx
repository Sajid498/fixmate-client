
import Link from "next/link";
import {
  ShieldCheck,
  Users,
  Wrench,
  Clock,
  HeartHandshake,
  Target,
} from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Trusted Technicians",
    description:
      "Find skilled technicians and explore services before requesting a repair.",
  },
  {
    icon: Clock,
    title: "Convenient Booking",
    description:
      "Submit repair requests and follow their progress from your dashboard.",
  },
  {
    icon: HeartHandshake,
    title: "Customer First",
    description:
      "We aim to make the repair experience straightforward, transparent, and reliable.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 px-6 py-20 text-white">
        <div className="mx-auto max-w-6xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
            About FixMate
          </p>

          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
            Making Home Repairs Easier and More Reliable
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-blue-100 md:text-lg">
            FixMate connects customers with technicians for everyday repair
            needs. Our goal is to make finding services, requesting repairs,
            and tracking bookings easier.
          </p>

          <Link
            href="/services"
            className="mt-8 inline-flex rounded-lg bg-white px-7 py-3 font-semibold text-blue-900 transition hover:bg-blue-50"
          >
            Explore Services
          </Link>
        </div>
      </section>

      {/* Introduction */}
      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-3 font-semibold uppercase tracking-wider text-blue-700">
            Who We Are
          </p>

          <h2 className="text-3xl font-bold md:text-4xl">
            Your Repair Service Companion
          </h2>

          <p className="mt-6 leading-8 text-gray-600">
            Finding the right person for a repair should not be complicated.
            FixMate provides a platform where customers can discover available
            repair services, submit booking requests, and monitor service
            progress.
          </p>

          <p className="mt-4 leading-8 text-gray-600">
            Technicians can manage their services and bookings, while
            administrators oversee service approvals, users, bookings, and
            payments.
          </p>
        </div>

        <div className="rounded-2xl bg-blue-50 p-8 md:p-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-900 text-white">
            <Wrench size={32} />
          </div>

          <h3 className="mt-6 text-2xl font-bold text-blue-950">
            One Platform, Three Roles
          </h3>

          <p className="mt-3 leading-7 text-gray-600">
            Customers request repairs, technicians provide services, and
            administrators help keep the platform organized.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-semibold uppercase tracking-wider text-blue-700">
              Our Purpose
            </p>

            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              What Drives FixMate
            </h2>

            <p className="mt-5 leading-8 text-gray-600">
              We want to simplify the connection between people who need
              repairs and the technicians who can provide them.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <Target className="text-blue-700" size={32} />
              <h3 className="mt-5 text-xl font-bold">Our Mission</h3>
              <p className="mt-3 leading-7 text-gray-600">
                To make repair-service discovery and booking more accessible,
                organized, and convenient.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <Users className="text-blue-700" size={32} />
              <h3 className="mt-5 text-xl font-bold">Our Vision</h3>
              <p className="mt-3 leading-7 text-gray-600">
                To build a dependable platform where customers and service
                professionals can connect with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <p className="font-semibold uppercase tracking-wider text-blue-700">
            Why FixMate
          </p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">
            Designed Around Your Needs
          </h2>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="rounded-2xl border border-gray-200 p-8 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                  <Icon size={28} />
                </div>

                <h3 className="mt-6 text-xl font-bold">
                  {feature.title}
                </h3>

                <p className="mt-3 leading-7 text-gray-600">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-950 px-6 py-16 text-center text-white">
        <h2 className="text-3xl font-bold">
          Need Help With a Repair?
        </h2>

        <p className="mx-auto mt-4 max-w-xl leading-7 text-blue-100">
          Explore the available services and find a repair solution that
          meets your needs.
        </p>

        <Link
          href="/services"
          className="mt-7 inline-flex rounded-lg bg-white px-7 py-3 font-semibold text-blue-950 transition hover:bg-blue-50"
        >
          Browse Services
        </Link>
      </section>
    </main>
  );
}
