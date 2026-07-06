import type { Metadata } from "next";

import StoreDirectoryExperience from "@/components/StoreDirectoryExperience";
import {
  buildUniversalProfilesItunesMeta,
  pathWithSearchParams,
  type MetadataSearchParams,
} from "@/lib/universalProfilesApp";

export const dynamic = "force-static";

interface SearchPageProps {
  searchParams?: Promise<MetadataSearchParams>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const resolvedSearchParams = searchParams ? await searchParams : {};

  return {
    title: "Search Apps | LUKSO UP! Store",
    description: "Search and browse all apps in the LUKSO UP! Store.",
    alternates: {
      canonical: "/store",
    },
    itunes: buildUniversalProfilesItunesMeta(
      pathWithSearchParams("/search", resolvedSearchParams),
    ),
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default function SearchPageRoute() {
  return <StoreDirectoryExperience />;
}
