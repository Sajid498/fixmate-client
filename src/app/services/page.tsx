
import type { Metadata } from "next";
import ServicesCatalogue from "@/components/services/services-catalogue";

export const metadata: Metadata = {
  title: "Repair Services",
  description:
    "Explore smartphone, laptop, AC, refrigerator, television and home appliance repair services with FixMate.",
};

type ServicesPageProps = {
  searchParams: Promise<{
    category?: string;
  }>;
};

export default async function ServicesPage({
  searchParams,
}: ServicesPageProps) {
  const params = await searchParams;

  return (
    <ServicesCatalogue initialCategory={params.category ?? "All"} />
  );
}
