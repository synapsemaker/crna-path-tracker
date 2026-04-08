// Tracker-side client for the End Tidal CRNA programs catalog
// (Capnograph /api/programs/[slug]). Used by:
//   - /schools/new?program=<slug>  → prefill the form
//   - /schools/[id]/page.tsx       → look up the canonical program when
//                                    evaluating the requirements checklist

// ── Types (mirror Capnograph schema) ──────────────────────────────

export type RequirementCategory = "prereqs" | "certifications" | "experience";
export type RequirementLogic = "ALL" | "ANY" | "N_OF";
export type RequirementSeverity = "required" | "recommended";

export type PrereqOption = { course: string };
export type CertOption = { cert: string };
export type ExperienceOption = {
  type: string;
  min_years?: number;
  min_hours?: number;
};
export type RequirementOption = PrereqOption | CertOption | ExperienceOption;

export type RequirementGroup = {
  id?: string;
  category: RequirementCategory;
  severity: RequirementSeverity;
  logic: RequirementLogic;
  count: number | null;
  options: RequirementOption[];
  notes: string | null;
  display_order: number;
};

export type CatalogProgram = {
  id: string;
  slug: string;
  program_name: string;
  city: string | null;
  state: string | null;
  degree_type: string | null;
  program_length_months: number | null;
  app_deadline: string | null;
  rolling_admissions: boolean;
  app_fee: number | null;
  suggested_gpa: number | null;
  gre_min_verbal: number | null;
  gre_min_quant: number | null;
  gre_required: string | null;
  tuition_in_state: number | null;
  tuition_out_state: number | null;
  website: string | null;
  requirements: RequirementGroup[];
};

// ── Fetch helpers ────────────────────────────────────────────────

async function catalogFetch<T>(path: string): Promise<T | null> {
  const apiUrl = process.env.END_TIDAL_API_URL;
  const apiKey = process.env.END_TIDAL_API_KEY;
  if (!apiUrl || !apiKey) {
    console.warn("END_TIDAL_API_URL or END_TIDAL_API_KEY missing");
    return null;
  }
  try {
    const res = await fetch(`${apiUrl}${path}`, {
      headers: { "x-api-key": apiKey },
      // Cache aggressively — catalog rarely changes
      next: { revalidate: 3600 },
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      console.warn(`catalog fetch ${res.status} for ${path}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error("catalog fetch error:", err);
    return null;
  }
}

export async function getCatalogProgramBySlug(
  slug: string
): Promise<CatalogProgram | null> {
  return catalogFetch<CatalogProgram>(`/programs/${encodeURIComponent(slug)}`);
}

export async function getCatalogProgramById(
  id: string
): Promise<CatalogProgram | null> {
  // No /programs/by-id/[id] endpoint yet — list all and find. For 155 rows
  // and a daily ISR cache this is fine. Optimize to a dedicated endpoint
  // if/when the catalog grows past a few hundred rows.
  const all = await catalogFetch<CatalogProgram[]>(`/programs`);
  if (!all) return null;
  return all.find((p) => p.id === id) ?? null;
}

// ── Tracker-side mapping: catalog program → School form prefill ───

import type { School } from "./types";

export function catalogProgramToSchoolPrefill(
  p: CatalogProgram
): Partial<School> {
  // Compute summary scalars from the requirement groups for the Tracker's
  // simpler per-school fields (icu_years_required, requires_gre, requires_ccrn,
  // min_shadowing_hours). Where the catalog has rich OR-logic, we pick the
  // most permissive interpretation for the user's tracked target.
  const minIcuYears = minIcuYearsFromRequirements(p.requirements);
  const requiresCcrn = requirementsContainCert(p.requirements, "CCRN");
  const minShadowing = minShadowingHoursFromRequirements(p.requirements);
  const requiresGre = p.gre_required === "Required";

  return {
    program_name: p.program_name,
    location: [p.city, p.state].filter(Boolean).join(", ") || null,
    degree_type: p.degree_type,
    program_length: p.program_length_months
      ? `${p.program_length_months} months`
      : null,
    application_deadline: parseSimpleDeadline(p.app_deadline),
    rolling_admissions: p.rolling_admissions,
    app_fee: p.app_fee,
    min_gpa: p.suggested_gpa,
    min_gre_verbal: p.gre_min_verbal,
    min_gre_quantitative: p.gre_min_quant,
    icu_years_required: minIcuYears,
    requires_ccrn: requiresCcrn,
    requires_gre: requiresGre,
    min_shadowing_hours: minShadowing,
    tuition: p.tuition_in_state,
    website: p.website,
    source_program_id: p.id, // canonical UUID — survives slug renames
    status: "Researching",
  };
}

// ── Requirement evaluation (used by /schools/[id]/page.tsx checklist) ──

export type ChecklistItem = {
  label: string;
  met: boolean | null; // null = can't determine
  detail: string;
};

export function evaluateRequirementGroup(
  group: RequirementGroup,
  userData: {
    completedCourses: Set<string>; // PrereqCourse identifiers
    activeCerts: Set<string>; // uppercase cert names
    experienceYearsByType: Record<string, number>; // type → years
    shadowingHours: number;
  }
): ChecklistItem {
  let metCount = 0;
  let total = 0;
  const labelParts: string[] = [];

  if (group.category === "prereqs") {
    for (const opt of group.options as PrereqOption[]) {
      total++;
      if (userData.completedCourses.has(opt.course)) metCount++;
      labelParts.push(opt.course);
    }
  } else if (group.category === "certifications") {
    for (const opt of group.options as CertOption[]) {
      total++;
      if (userData.activeCerts.has(opt.cert.toUpperCase())) metCount++;
      labelParts.push(opt.cert);
    }
  } else if (group.category === "experience") {
    for (const opt of group.options as ExperienceOption[]) {
      total++;
      if (opt.type === "shadowing") {
        if (
          opt.min_hours != null &&
          userData.shadowingHours >= opt.min_hours
        ) {
          metCount++;
        } else if (opt.min_hours == null && userData.shadowingHours > 0) {
          metCount++;
        }
        labelParts.push(`shadowing${opt.min_hours ? ` ≥${opt.min_hours}h` : ""}`);
      } else {
        const years = userData.experienceYearsByType[opt.type] ?? 0;
        if (opt.min_years != null && years >= opt.min_years) metCount++;
        else if (opt.min_years == null && years > 0) metCount++;
        labelParts.push(`${opt.type}${opt.min_years ? ` ≥${opt.min_years}y` : ""}`);
      }
    }
  }

  let met: boolean | null;
  if (group.logic === "ALL") met = metCount === total;
  else if (group.logic === "ANY") met = metCount >= 1;
  else met = metCount >= (group.count ?? total); // N_OF

  const logicLabel =
    group.logic === "ALL"
      ? "All of"
      : group.logic === "ANY"
      ? "Any of"
      : `${group.count ?? "?"} of`;

  return {
    label: `${group.category} · ${logicLabel}: ${labelParts.join(", ")}`,
    met,
    detail: `${metCount}/${total} satisfied`,
  };
}

// ── Internal helpers ──────────────────────────────────────────────

function minIcuYearsFromRequirements(reqs: RequirementGroup[]): number | null {
  let min: number | null = null;
  for (const g of reqs) {
    if (g.category !== "experience" || g.severity !== "required") continue;
    for (const opt of g.options as ExperienceOption[]) {
      if (opt.type === "icu" && opt.min_years != null) {
        if (min == null || opt.min_years < min) min = opt.min_years;
      }
    }
  }
  return min;
}

function requirementsContainCert(
  reqs: RequirementGroup[],
  cert: string
): boolean {
  const target = cert.toUpperCase();
  return reqs.some(
    (g) =>
      g.category === "certifications" &&
      g.severity === "required" &&
      (g.options as CertOption[]).some(
        (o) => o.cert?.toUpperCase() === target
      )
  );
}

function minShadowingHoursFromRequirements(
  reqs: RequirementGroup[]
): number | null {
  let min: number | null = null;
  for (const g of reqs) {
    if (g.category !== "experience" || g.severity !== "required") continue;
    for (const opt of g.options as ExperienceOption[]) {
      if (opt.type === "shadowing" && opt.min_hours != null) {
        if (min == null || opt.min_hours < min) min = opt.min_hours;
      }
    }
  }
  return min;
}

// Parses a Notion-style free-text deadline ("November", "early November",
// "Nov 15", "rolling") into an ISO date string when possible. Same logic
// as the previous Meridian implementation. Returns null for non-dates.
function parseSimpleDeadline(text: string | null | undefined): string | null {
  if (!text) return null;
  const cleaned = text.trim();
  if (!cleaned) return null;
  if (
    /\b(rolling|tba|tbd|varies|varied|continuous|ongoing|n\/a|na|unknown)\b/i.test(
      cleaned
    )
  ) {
    return null;
  }
  if (/\d/.test(cleaned)) {
    const direct = new Date(cleaned);
    if (!isNaN(direct.getTime())) return direct.toISOString().split("T")[0];
  }
  const months: Record<string, number> = {
    january: 1, jan: 1, february: 2, feb: 2, march: 3, mar: 3,
    april: 4, apr: 4, may: 5, june: 6, jun: 6, july: 7, jul: 7,
    august: 8, aug: 8, september: 9, sep: 9, sept: 9,
    october: 10, oct: 10, november: 11, nov: 11, december: 12, dec: 12,
  };
  const lower = cleaned.toLowerCase();
  for (const [name, num] of Object.entries(months)) {
    if (new RegExp(`\\b${name}\\b`).test(lower)) {
      const now = new Date();
      const year = now.getMonth() + 1 > num ? now.getFullYear() + 1 : now.getFullYear();
      let day = 1;
      if (/\blate\b/.test(lower)) day = 28;
      else if (/\bmid/.test(lower)) day = 15;
      return `${year}-${String(num).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }
  return null;
}
