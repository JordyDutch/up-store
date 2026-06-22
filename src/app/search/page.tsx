import type { Metadata } from "next";

import StoreDirectoryExperience from "@/components/StoreDirectoryExperience";

export const metadata: Metadata = {
  title: "Search Apps | LUKSO UP! Store",
  description: "Search and browse all apps in the LUKSO UP! Store.",
};

export default function SearchPageRoute() {
  return <StoreDirectoryExperience />;
}
