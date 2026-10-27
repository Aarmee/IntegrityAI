/**
 * Utility functions for institutional cohort matching (Degree Program & Semester).
 * Ensures students only submit to authorized coursework for their academic term.
 */

/**
 * Normalizes course / degree strings to canonical tokens for matching.
 */
export function normalizeCourse(course?: string | null): string {
  if (!course) return '';
  const c = course.trim().toLowerCase();
  if (c === 'all programs' || c === 'all courses' || c === 'all') return 'ALL';
  if (c.includes('mca') || c.includes('master of computer applications')) return 'MCA';
  if (c.includes('bca') || c.includes('bachelor of computer applications')) return 'BCA';
  if (c.includes('ai & data science') || c.includes('ai and data science')) return 'BTECH_AIDS';
  if (c.includes('information technology') || (c.includes('b.tech') && c.includes('it'))) return 'BTECH_IT';
  if (c.includes('b.tech') && (c.includes('computer science') || c.includes('cs') || c.includes('cse'))) return 'BTECH_CS';
  if (c.includes('m.tech') && (c.includes('ai') || c.includes('artificial intelligence'))) return 'MTECH_AI';
  if (c.includes('m.tech') && (c.includes('computer science') || c.includes('cs'))) return 'MTECH_CS';
  // Fallback: strip punctuation and whitespace
  return c.replace(/[^a-z0-9]/g, '');
}

/**
 * Normalizes semester strings to standard digit representation (e.g. "Semester 3" -> "3").
 */
export function normalizeSemester(sem?: string | null): string {
  if (!sem) return '';
  const s = sem.trim().toLowerCase();
  if (s === 'all semesters' || s === 'all') return 'ALL';
  const match = s.match(/\d+/);
  return match ? match[0] : s;
}

/**
 * Checks whether an assignment's target cohort matches a student's enrolled cohort.
 */
export function matchesCohort(
  assignmentCourse?: string | null,
  assignmentSemester?: string | null,
  studentCourse?: string | null,
  studentSemester?: string | null
): boolean {
  const aNormCourse = normalizeCourse(assignmentCourse);
  const sNormCourse = normalizeCourse(studentCourse);

  const courseMatch =
    !aNormCourse ||
    aNormCourse === 'ALL' ||
    !sNormCourse ||
    aNormCourse === sNormCourse;

  const aNormSem = normalizeSemester(assignmentSemester);
  const sNormSem = normalizeSemester(studentSemester);

  const semesterMatch =
    !aNormSem ||
    aNormSem === 'ALL' ||
    !sNormSem ||
    aNormSem === sNormSem;

  return courseMatch && semesterMatch;
}

/**
 * Formats a clean display badge for course and semester.
 */
export function formatCohortLabel(course?: string | null, semester?: string | null): string {
  const c = course || 'All Programs';
  const s = semester ? (semester.startsWith('Semester') ? semester : `Semester ${semester}`) : 'All Semesters';
  return `${c} • ${s}`;
}

/**
 * Calculates human-readable deadline text and whether it has elapsed.
 */
export function formatDeadline(isoString?: string): { text: string; isPast: boolean } {
  if (!isoString) return { text: 'No deadline set', isPast: false };
  try {
    const d = new Date(isoString);
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const isPast = diffMs < 0;
    const absDiffDays = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
    const absDiffHours = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60));

    if (isPast) {
      if (absDiffDays > 0) return { text: `${absDiffDays}d ago`, isPast: true };
      return { text: `${absDiffHours}h ago`, isPast: true };
    }
    if (absDiffDays > 0) return { text: `Due in ${absDiffDays}d`, isPast: false };
    return { text: `Due in ${absDiffHours}h`, isPast: false };
  } catch {
    return { text: isoString, isPast: false };
  }
}

