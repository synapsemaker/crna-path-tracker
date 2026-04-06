-- CRNA Path Tracker: Initial schema
-- 12 tables, all scoped to user_id with per-user RLS

create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. academic_profile (one per user)
-- ============================================================
create table academic_profile (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  gre_verbal integer,
  gre_quantitative integer,
  gre_writing numeric(3,1),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

-- ============================================================
-- 2. courses (GPA calculator)
-- ============================================================
create table courses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_name text not null,
  course_code text,
  credits numeric(3,1) not null,
  grade text,
  grade_points numeric(3,2),
  is_science boolean default false,
  status text check (status in ('planned', 'in_progress', 'completed')) default 'planned',
  semester text,
  created_at timestamptz default now()
);

-- ============================================================
-- 3. schools
-- ============================================================
create table schools (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  program_name text,
  location text,
  degree_type text,
  program_length text,
  application_deadline date,
  interview_date date,
  decision_date date,
  deposit_due date,
  app_fee numeric(8,2),
  min_gpa numeric(3,2),
  min_gre_verbal integer,
  min_gre_quantitative integer,
  min_icu_hours integer,
  requires_ccrn boolean default false,
  tuition numeric(10,2),
  website text,
  notes text,
  status text check (status in (
    'Researching', 'Planning to Apply', 'Applied', 'Interviewed',
    'Accepted', 'Waitlisted', 'Declined', 'Withdrawn'
  )) default 'Researching',
  created_at timestamptz default now()
);

-- ============================================================
-- 4. shadowing_hours
-- ============================================================
create table shadowing_hours (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date,
  facility text,
  crna_name text,
  hours numeric(5,1),
  cases_observed text,
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- 5. certifications
-- ============================================================
create table certifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text check (name in ('CCRN', 'ACLS', 'BLS', 'PALS', 'TNCC', 'Other')) not null,
  other_name text,
  certification_number text,
  issue_date date,
  expiration_date date,
  status text check (status in ('Active', 'Expired', 'In Progress')) default 'In Progress',
  created_at timestamptz default now()
);

-- ============================================================
-- 6. hospital_units (Experience)
-- ============================================================
create table hospital_units (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  hospital_name text not null,
  unit_name text,
  position text,
  start_date date,
  end_date date,
  current boolean default false,
  patient_population text,
  key_experience text,
  created_at timestamptz default now()
);

-- ============================================================
-- 7. letters_of_rec
-- ============================================================
create table letters_of_rec (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recommender_name text not null,
  recommender_title text,
  recommender_email text,
  relationship text,
  request_date date,
  due_date date,
  status text check (status in ('Pending', 'Submitted', 'Received')) default 'Pending',
  school_name text,
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- 8. essays
-- ============================================================
create table essays (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  school_name text,
  prompt_text text,
  word_limit integer,
  draft text,
  status text check (status in ('Brainstorm', 'Drafting', 'Reviewing', 'Submitted')) default 'Brainstorm',
  deadline date,
  key_points text,
  created_at timestamptz default now()
);

-- ============================================================
-- 9. network
-- ============================================================
create table network (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  profession text,
  affiliation text,
  email text,
  meeting_date date,
  follow_up_date date,
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- 10. publications
-- ============================================================
create table publications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  authors text,
  journal_name text,
  publication_year integer,
  doi text,
  role text check (role in ('First author', 'Co-author', 'Corresponding author')),
  apa_citation text,
  created_at timestamptz default now()
);

-- ============================================================
-- 11. conferences
-- ============================================================
create table conferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  organization text,
  location text,
  date date,
  status text check (status in ('Planning', 'Attended', 'Upcoming')) default 'Upcoming',
  key_takeaways text,
  cost numeric(8,2),
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- 12. volunteer_work
-- ============================================================
create table volunteer_work (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization text not null,
  role text,
  start_date date,
  end_date date,
  hours numeric(6,1),
  description text,
  status text check (status in ('Ongoing', 'Completed')) default 'Ongoing',
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
alter table academic_profile enable row level security;
alter table courses enable row level security;
alter table schools enable row level security;
alter table shadowing_hours enable row level security;
alter table certifications enable row level security;
alter table hospital_units enable row level security;
alter table letters_of_rec enable row level security;
alter table essays enable row level security;
alter table network enable row level security;
alter table publications enable row level security;
alter table conferences enable row level security;
alter table volunteer_work enable row level security;

-- Per-user policies (SELECT, INSERT, UPDATE, DELETE)
-- academic_profile
create policy "select own" on academic_profile for select using (auth.uid() = user_id);
create policy "insert own" on academic_profile for insert with check (auth.uid() = user_id);
create policy "update own" on academic_profile for update using (auth.uid() = user_id);
create policy "delete own" on academic_profile for delete using (auth.uid() = user_id);

-- courses
create policy "select own" on courses for select using (auth.uid() = user_id);
create policy "insert own" on courses for insert with check (auth.uid() = user_id);
create policy "update own" on courses for update using (auth.uid() = user_id);
create policy "delete own" on courses for delete using (auth.uid() = user_id);

-- schools
create policy "select own" on schools for select using (auth.uid() = user_id);
create policy "insert own" on schools for insert with check (auth.uid() = user_id);
create policy "update own" on schools for update using (auth.uid() = user_id);
create policy "delete own" on schools for delete using (auth.uid() = user_id);

-- shadowing_hours
create policy "select own" on shadowing_hours for select using (auth.uid() = user_id);
create policy "insert own" on shadowing_hours for insert with check (auth.uid() = user_id);
create policy "update own" on shadowing_hours for update using (auth.uid() = user_id);
create policy "delete own" on shadowing_hours for delete using (auth.uid() = user_id);

-- certifications
create policy "select own" on certifications for select using (auth.uid() = user_id);
create policy "insert own" on certifications for insert with check (auth.uid() = user_id);
create policy "update own" on certifications for update using (auth.uid() = user_id);
create policy "delete own" on certifications for delete using (auth.uid() = user_id);

-- hospital_units
create policy "select own" on hospital_units for select using (auth.uid() = user_id);
create policy "insert own" on hospital_units for insert with check (auth.uid() = user_id);
create policy "update own" on hospital_units for update using (auth.uid() = user_id);
create policy "delete own" on hospital_units for delete using (auth.uid() = user_id);

-- letters_of_rec
create policy "select own" on letters_of_rec for select using (auth.uid() = user_id);
create policy "insert own" on letters_of_rec for insert with check (auth.uid() = user_id);
create policy "update own" on letters_of_rec for update using (auth.uid() = user_id);
create policy "delete own" on letters_of_rec for delete using (auth.uid() = user_id);

-- essays
create policy "select own" on essays for select using (auth.uid() = user_id);
create policy "insert own" on essays for insert with check (auth.uid() = user_id);
create policy "update own" on essays for update using (auth.uid() = user_id);
create policy "delete own" on essays for delete using (auth.uid() = user_id);

-- network
create policy "select own" on network for select using (auth.uid() = user_id);
create policy "insert own" on network for insert with check (auth.uid() = user_id);
create policy "update own" on network for update using (auth.uid() = user_id);
create policy "delete own" on network for delete using (auth.uid() = user_id);

-- publications
create policy "select own" on publications for select using (auth.uid() = user_id);
create policy "insert own" on publications for insert with check (auth.uid() = user_id);
create policy "update own" on publications for update using (auth.uid() = user_id);
create policy "delete own" on publications for delete using (auth.uid() = user_id);

-- conferences
create policy "select own" on conferences for select using (auth.uid() = user_id);
create policy "insert own" on conferences for insert with check (auth.uid() = user_id);
create policy "update own" on conferences for update using (auth.uid() = user_id);
create policy "delete own" on conferences for delete using (auth.uid() = user_id);

-- volunteer_work
create policy "select own" on volunteer_work for select using (auth.uid() = user_id);
create policy "insert own" on volunteer_work for insert with check (auth.uid() = user_id);
create policy "update own" on volunteer_work for update using (auth.uid() = user_id);
create policy "delete own" on volunteer_work for delete using (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_courses_user on courses (user_id);
create index idx_schools_user on schools (user_id);
create index idx_schools_deadline on schools (application_deadline) where application_deadline is not null;
create index idx_shadowing_user on shadowing_hours (user_id);
create index idx_certifications_user on certifications (user_id);
create index idx_hospital_units_user on hospital_units (user_id);
create index idx_letters_user on letters_of_rec (user_id);
create index idx_essays_user on essays (user_id);
create index idx_network_user on network (user_id);
create index idx_publications_user on publications (user_id);
create index idx_conferences_user on conferences (user_id);
create index idx_volunteer_user on volunteer_work (user_id);
