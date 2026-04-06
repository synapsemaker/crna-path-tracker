const STATUS_COLORS: Record<string, string> = {
  // Schools
  Researching: "var(--taupe)",
  "Planning to Apply": "var(--accent)",
  Applied: "var(--accent)",
  Interviewed: "var(--accent)",
  Accepted: "#3a7d44",
  Waitlisted: "#b08d3a",
  Declined: "#a05050",
  Withdrawn: "var(--taupe-light)",
  // Certifications
  Active: "#3a7d44",
  Expired: "#a05050",
  "In Progress": "#b08d3a",
  // Letters
  Pending: "#b08d3a",
  Submitted: "var(--accent)",
  Received: "#3a7d44",
  // Essays
  Brainstorm: "var(--taupe)",
  Drafting: "var(--accent)",
  Reviewing: "#b08d3a",
  // Courses
  planned: "var(--taupe-light)",
  in_progress: "#b08d3a",
  completed: "#3a7d44",
  // Conferences
  Planning: "var(--taupe)",
  Attended: "#3a7d44",
  Upcoming: "var(--accent)",
  // Volunteer
  Ongoing: "var(--accent)",
  Completed: "#3a7d44",
};

type Props = {
  status: string;
};

export default function StatusBadge({ status }: Props) {
  const color = STATUS_COLORS[status] ?? "var(--taupe)";
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.6rem",
        fontWeight: 400,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color,
        padding: "3px 8px",
        border: `1px solid ${color}`,
        borderRadius: 2,
        whiteSpace: "nowrap",
      }}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
