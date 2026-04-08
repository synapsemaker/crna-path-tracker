"use server";

// Server actions wrapping the catalog client.
//
// These exist because /schools/[id]/page.tsx is a client component that
// loads its data via useEffect, and the catalog client needs server-side
// access to END_TIDAL_API_KEY (which must not be exposed to the browser).

import { getCatalogProgramById, type CatalogProgram } from "./catalog";

export async function fetchCatalogProgramById(
  id: string
): Promise<CatalogProgram | null> {
  return getCatalogProgramById(id);
}
