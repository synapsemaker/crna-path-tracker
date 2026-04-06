export type AcademicProfile = {
  id: string;
  user_id: string;
  gre_verbal: number | null;
  gre_quantitative: number | null;
  gre_writing: number | null;
  created_at: string;
  updated_at: string;
};

export type Course = {
  id: string;
  user_id: string;
  course_name: string;
  course_code: string | null;
  credits: number;
  grade: string | null;
  grade_points: number | null;
  is_science: boolean;
  status: "planned" | "in_progress" | "completed";
  semester: string | null;
  created_at: string;
};

export type School = {
  id: string;
  user_id: string;
  name: string;
  program_name: string | null;
  location: string | null;
  degree_type: string | null;
  program_length: string | null;
  application_deadline: string | null;
  interview_date: string | null;
  decision_date: string | null;
  deposit_due: string | null;
  app_fee: number | null;
  min_gpa: number | null;
  min_gre_verbal: number | null;
  min_gre_quantitative: number | null;
  min_icu_hours: number | null;
  requires_ccrn: boolean;
  tuition: number | null;
  website: string | null;
  notes: string | null;
  status: SchoolStatus;
  created_at: string;
};

export type SchoolStatus =
  | "Researching"
  | "Planning to Apply"
  | "Applied"
  | "Interviewed"
  | "Accepted"
  | "Waitlisted"
  | "Declined"
  | "Withdrawn";

export type ShadowingHour = {
  id: string;
  user_id: string;
  date: string | null;
  facility: string | null;
  crna_name: string | null;
  hours: number | null;
  cases_observed: string | null;
  notes: string | null;
  created_at: string;
};

export type Certification = {
  id: string;
  user_id: string;
  name: "CCRN" | "ACLS" | "BLS" | "PALS" | "TNCC" | "Other";
  other_name: string | null;
  certification_number: string | null;
  issue_date: string | null;
  expiration_date: string | null;
  status: "Active" | "Expired" | "In Progress";
  created_at: string;
};

export type HospitalUnit = {
  id: string;
  user_id: string;
  hospital_name: string;
  unit_name: string | null;
  position: string | null;
  start_date: string | null;
  end_date: string | null;
  current: boolean;
  patient_population: string | null;
  key_experience: string | null;
  created_at: string;
};

export type LetterOfRec = {
  id: string;
  user_id: string;
  recommender_name: string;
  recommender_title: string | null;
  recommender_email: string | null;
  relationship: string | null;
  request_date: string | null;
  due_date: string | null;
  status: "Pending" | "Submitted" | "Received";
  school_name: string | null;
  notes: string | null;
  created_at: string;
};

export type Essay = {
  id: string;
  user_id: string;
  school_name: string | null;
  prompt_text: string | null;
  word_limit: number | null;
  draft: string | null;
  status: "Brainstorm" | "Drafting" | "Reviewing" | "Submitted";
  deadline: string | null;
  key_points: string | null;
  created_at: string;
};

export type NetworkContact = {
  id: string;
  user_id: string;
  name: string;
  profession: string | null;
  affiliation: string | null;
  email: string | null;
  meeting_date: string | null;
  follow_up_date: string | null;
  notes: string | null;
  created_at: string;
};

export type Publication = {
  id: string;
  user_id: string;
  title: string;
  authors: string | null;
  journal_name: string | null;
  publication_year: number | null;
  doi: string | null;
  role: "First author" | "Co-author" | "Corresponding author" | null;
  apa_citation: string | null;
  created_at: string;
};

export type Conference = {
  id: string;
  user_id: string;
  name: string;
  organization: string | null;
  location: string | null;
  date: string | null;
  status: "Planning" | "Attended" | "Upcoming";
  key_takeaways: string | null;
  cost: number | null;
  notes: string | null;
  created_at: string;
};

export type VolunteerWork = {
  id: string;
  user_id: string;
  organization: string;
  role: string | null;
  start_date: string | null;
  end_date: string | null;
  hours: number | null;
  description: string | null;
  status: "Ongoing" | "Completed";
  created_at: string;
};
