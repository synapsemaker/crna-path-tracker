export const SCHOOL_STATUSES = [
  "Researching",
  "Planning to Apply",
  "Applied",
  "Interviewed",
  "Accepted",
  "Waitlisted",
  "Declined",
  "Withdrawn",
] as const;

export const CERTIFICATION_NAMES = [
  "CCRN",
  "ACLS",
  "BLS",
  "PALS",
  "TNCC",
  "Other",
] as const;

export const CERTIFICATION_STATUSES = [
  "Active",
  "Expired",
  "In Progress",
] as const;

export const COURSE_STATUSES = [
  "planned",
  "in_progress",
  "completed",
] as const;

export const LETTER_STATUSES = [
  "Pending",
  "Submitted",
  "Received",
] as const;

export const ESSAY_STATUSES = [
  "Brainstorm",
  "Drafting",
  "Reviewing",
  "Submitted",
] as const;

export const CONFERENCE_STATUSES = [
  "Planning",
  "Attended",
  "Upcoming",
] as const;

export const PUBLICATION_ROLES = [
  "First author",
  "Co-author",
  "Corresponding author",
] as const;

export const VOLUNTEER_STATUSES = ["Ongoing", "Completed"] as const;

export const GRADE_MAP: Record<string, number> = {
  "A+": 4.0,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  "D-": 0.7,
  F: 0.0,
};

export const GRADES = Object.keys(GRADE_MAP);
