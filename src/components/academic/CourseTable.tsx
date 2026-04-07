"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GRADES, GRADE_MAP, COURSE_STATUSES } from "@/lib/constants";
import { calculateGPA, calculateScienceGPA } from "@/lib/gpa";
import type { Course } from "@/lib/types";
import Field from "@/components/forms/Field";
import SelectField from "@/components/forms/SelectField";
import CheckboxField from "@/components/forms/CheckboxField";
import FormActions from "@/components/forms/FormActions";
import StatusBadge from "@/components/ui/StatusBadge";
import styles from "./CourseTable.module.css";

type Props = {
  courses: Course[];
  userId: string;
};

export default function CourseTable({ courses: initial, userId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [courses, setCourses] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [credits, setCredits] = useState("");
  const [grade, setGrade] = useState("");
  const [isScience, setIsScience] = useState(false);
  const [status, setStatus] = useState("planned");
  const [semester, setSemester] = useState("");

  const gradePoints = grade ? GRADE_MAP[grade] ?? null : null;
  const overallGPA = calculateGPA(courses);
  const scienceGPA = calculateScienceGPA(courses);

  function resetForm() {
    setCourseName("");
    setCourseCode("");
    setCredits("");
    setGrade("");
    setIsScience(false);
    setStatus("planned");
    setSemester("");
    setAdding(false);
    setEditingId(null);
  }

  function startEdit(c: Course) {
    setEditingId(c.id);
    setAdding(true);
    setCourseName(c.course_name);
    setCourseCode(c.course_code ?? "");
    setCredits(c.credits.toString());
    setGrade(c.grade ?? "");
    setIsScience(c.is_science);
    setStatus(c.status);
    setSemester(c.semester ?? "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const data = {
      user_id: userId,
      course_name: courseName,
      course_code: courseCode || null,
      credits: parseFloat(credits),
      grade: grade || null,
      grade_points: gradePoints,
      is_science: isScience,
      status,
      semester: semester || null,
    };

    if (editingId) {
      const { data: updated } = await supabase
        .from("courses")
        .update(data)
        .eq("id", editingId)
        .select()
        .single();
      if (updated) {
        setCourses((prev) =>
          prev.map((c) => (c.id === editingId ? updated : c))
        );
      }
    } else {
      const { data: created } = await supabase
        .from("courses")
        .insert(data)
        .select()
        .single();
      if (created) {
        setCourses((prev) => [created, ...prev]);
      }
    }

    setSaving(false);
    resetForm();
    router.refresh();
  }

  async function handleDelete(id: string) {
    await supabase.from("courses").delete().eq("id", id);
    setCourses((prev) => prev.filter((c) => c.id !== id));
    router.refresh();
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <span className={styles.sectionLabel}>GPA Calculator</span>
          <div className={styles.gpaRow}>
            <div className={styles.gpaItem}>
              <span className={styles.gpaValue}>
                {overallGPA?.toFixed(2) ?? "—"}
              </span>
              <span className={styles.gpaLabel}>Overall</span>
            </div>
            <div className={styles.gpaItem}>
              <span className={styles.gpaValue}>
                {scienceGPA?.toFixed(2) ?? "—"}
              </span>
              <span className={styles.gpaLabel}>Science</span>
            </div>
          </div>
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)} className={styles.addBtn}>
            + Add course
          </button>
        )}
      </div>

      {adding && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <Field label="Course name" value={courseName} onChange={setCourseName} required />
            <Field label="Course code" value={courseCode} onChange={setCourseCode} placeholder="e.g. CHEM 201" />
            <Field label="Credits" value={credits} onChange={setCredits} type="number" required step="0.5" min={0} />
            <SelectField label="Grade" value={grade} onChange={setGrade} options={GRADES} placeholder="Select grade" />
            <SelectField label="Status" value={status} onChange={setStatus} options={COURSE_STATUSES} />
            <Field label="Semester" value={semester} onChange={setSemester} placeholder="e.g. Fall 2025" />
          </div>
          {gradePoints !== null && (
            <div className={styles.gradePoints}>
              Grade points: {gradePoints.toFixed(2)}
            </div>
          )}
          <div style={{ marginTop: 8 }}>
            <CheckboxField label="Science course" checked={isScience} onChange={setIsScience} />
          </div>
          <FormActions saving={saving} submitLabel={editingId ? "Update" : "Add"} onCancel={resetForm} />
        </form>
      )}

      {courses.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Course</th>
              <th>Credits</th>
              <th>Grade</th>
              <th>Sci</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className={styles.courseName}>{c.course_name}</div>
                  {c.course_code && (
                    <div className={styles.courseCode}>{c.course_code}</div>
                  )}
                </td>
                <td>{c.credits}</td>
                <td>{c.grade ?? "—"}</td>
                <td>{c.is_science ? "Yes" : ""}</td>
                <td><StatusBadge status={c.status} /></td>
                <td>
                  <div className={styles.rowActions}>
                    <button onClick={() => startEdit(c)} className={styles.rowBtn}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(c.id)} className={styles.rowBtnDanger}>
                      ×
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
