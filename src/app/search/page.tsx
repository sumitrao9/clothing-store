import { Suspense } from "react";
import SearchExperience from "@/components/SearchExperience";

export const dynamic = "force-dynamic";

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ paddingTop: 160, textAlign: "center" }}>Loading…</div>}>
      <SearchExperience />
    </Suspense>
  );
}
