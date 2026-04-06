type GradedCourse = {
  credits: number;
  grade_points: number | null;
  is_science?: boolean;
};

export function calculateGPA(courses: GradedCourse[]): number | null {
  const completed = courses.filter(
    (c) => c.grade_points !== null && c.credits > 0
  );
  if (completed.length === 0) return null;

  const totalPoints = completed.reduce(
    (sum, c) => sum + c.credits * c.grade_points!,
    0
  );
  const totalCredits = completed.reduce((sum, c) => sum + c.credits, 0);

  return totalCredits > 0
    ? Math.round((totalPoints / totalCredits) * 100) / 100
    : null;
}

export function calculateScienceGPA(courses: GradedCourse[]): number | null {
  return calculateGPA(courses.filter((c) => c.is_science));
}
