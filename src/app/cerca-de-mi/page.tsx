import type { Metadata } from "next";
import { NearMeFinder } from "@/components/NearMeFinder";

export const metadata: Metadata = { title: "Cerca de mí" };

export default function CercaDeMiPage() {
  return <NearMeFinder />;
}
