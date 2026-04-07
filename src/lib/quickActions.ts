// Smart quick actions — return the most useful action based on user gaps

import type { ReadinessSnapshot } from "./readiness";

export type QuickAction = {
  label: string;
  description: string;
  href: string;
};

export function getQuickActions(snapshot: ReadinessSnapshot, schoolsWithDeadlinesNext60d: number): QuickAction[] {
  const actions: QuickAction[] = [];
  const componentsByLabel = Object.fromEntries(
    snapshot.components.map((c) => [c.label, c])
  );

  // Highest priority: missing GPA (no courses)
  if (componentsByLabel["GPA"]?.status === "missing") {
    actions.push({
      label: "Add courses",
      description: "Calculate your GPA",
      href: "/academic",
    });
  }

  // No schools added
  if (componentsByLabel["Schools"]?.status === "missing") {
    actions.push({
      label: "Add a school",
      description: "Start your target list",
      href: "/schools/new",
    });
  }

  // ICU experience missing
  if (componentsByLabel["ICU experience"]?.status === "missing") {
    actions.push({
      label: "Add ICU role",
      description: "Programs require 1–2+ years",
      href: "/experience",
    });
  }

  // CCRN missing
  if (componentsByLabel["CCRN"]?.status === "missing") {
    actions.push({
      label: "Add CCRN",
      description: "Required by most programs",
      href: "/certifications",
    });
  }

  // Shadowing low or missing
  if (
    componentsByLabel["Shadowing"]?.status === "missing" ||
    componentsByLabel["Shadowing"]?.status === "weak"
  ) {
    actions.push({
      label: "Log shadowing",
      description: "Target 20–40 hours",
      href: "/shadowing",
    });
  }

  // Essays missing with deadlines approaching
  if (
    schoolsWithDeadlinesNext60d > 0 &&
    componentsByLabel["Essays"]?.status === "missing"
  ) {
    actions.push({
      label: "Start essays",
      description: `${schoolsWithDeadlinesNext60d} deadline${schoolsWithDeadlinesNext60d > 1 ? "s" : ""} in next 60 days`,
      href: "/more/essays",
    });
  }

  // Letters missing or weak
  if (
    componentsByLabel["Letters"]?.status === "missing" ||
    (componentsByLabel["Letters"]?.status === "weak" && snapshot.score > 30)
  ) {
    actions.push({
      label: "Request letters",
      description: "Most programs require 3",
      href: "/more/letters",
    });
  }

  // Fallback if user is far along
  if (actions.length === 0) {
    actions.push({
      label: "Update profile",
      description: "Keep your data current",
      href: "/academic",
    });
  }

  return actions.slice(0, 5);
}
