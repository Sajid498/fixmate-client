
import type { Metadata } from "next";
import ServicesCatalogue from "@/components/services/services-catalogue";

export const metadata: Metadata = {
  title: "Repair Services",
  description:
    "Explore smartphone, laptop, AC, refrigerator, television and home appliance repair services with FixMate.",
};

type SearchParamValue = string | string[] | undefined;

type ServicesPageProps = {
  searchParams: Promise<{
    category?: SearchParamValue;
    search?: SearchParamValue;
    serviceMode?: SearchParamValue;
    serviceArea?: SearchParamValue;
    sort?: SearchParamValue;
    page?: SearchParamValue;
  }>;
};

function getParam(value: SearchParamValue): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function ServicesPage({
  searchParams,
}: ServicesPageProps) {
  const params = await searchParams;

  return (
    <ServicesCatalogue
      initialCategory={getParam(params.category) || "All"}
      initialSearch={getParam(params.search)}
      initialMode={getParam(params.serviceMode) || "All"}
      initialArea={getParam(params.serviceArea)}
      initialSort={getParam(params.sort) || "newest"}
      initialPage={getParam(params.page) || "1"}
    />
  );
}
