# Prompt: Classroom Feature

Use this prompt to implement a **classroom** feature for ArcWealth. Each teacher has their own classroom. Teachers can send messages to all their students, create assignments with due dates, and (after the due date) see which students completed each assignment. Students see their classroom: class members, announcements, and assignments. The existing **My students** experience is moved into the classroom. Admins get an **All Classrooms** panel to select and view any teacher’s classroom.

**Access rule:** Students and teachers only have access to **their own** classroom(s). Admins can view any classroom but do not have “one single classroom” — they choose which classroom to look at.

---

## 1. Concepts

### Classroom
- **One classroom per teacher.** The classroom is the set of students linked to that teacher (via existing `student_teacher`: `teacher_user_id` → teacher, `student_user_id` → students in that class).
- A classroom can be represented implicitly (teacher + their students) or by a dedicated `classrooms` table with `teacher_user_id` and optional name/description. Students are members by being in `student_teacher` for that teacher.
- **No shared/global classroom:** each teacher’s classroom is separate. Admins do not have a single classroom; they have a way to **select** which teacher’s classroom to view.

### Teacher (classroom owner)
- Can send **messages/announcements** to all students in their classroom.
- Can create **assignments** (e.g. “Complete learn topic 1.1.3 by date X”). After the due date passes, the teacher can see **which students completed it** (and optionally which did not).
- Sees their **students** in the classroom (current “My students” content: list, progress, XP, achievements, streak, nudge, congratulate). This replaces the standalone “My students” tab: **move My students into the Classroom feature** (e.g. Classroom → “Students” or “My students” section).

### Student
- Has access to **their** classroom only (the classroom of the teacher they are linked to in `student_teacher`).
- Can see:
  - **People in the class:** teacher and fellow students (names/usernames; no need to expose full emails if privacy is a concern).
  - **Announcements/messages** from the teacher (chronological list).
  - **Assignments:** list of assignments (e.g. “Complete 1.1.3 by &lt;date&gt;”) with due dates; optionally show completion status (e.g. “Done” if they completed that topic).

### Admin
- **All Classrooms** panel (not one single classroom):
  - List or dropdown of **all classrooms** (e.g. “Ms. Smith’s class”, “Mr. Jones’s class” — labeled by teacher name/email).
  - Admin **selects a classroom** to view it.
  - In the selected classroom view, admin sees the same kind of content the teacher would: students, announcements, assignments, and (after due date) assignment completion. Admin may be read-only or have the same management powers as the teacher for that classroom (e.g. post announcements, create assignments); specify in implementation.
- Admin does **not** see a single merged classroom; they always choose which teacher’s classroom to inspect.

---

## 2. Access control (important)

- **Students:** Can only access the classroom for which they are a student (i.e. the teacher they are linked to in `student_teacher`). No access to other teachers’ classrooms.
- **Teachers:** Can only access **their own** classroom (the one where they are the teacher). No access to other teachers’ classrooms or to admin-only areas except the admin panel for the admin user.
- **Admin:** Can access the admin panel and the **All Classrooms** view; from there they select a classroom and view it. They do not automatically “own” a classroom; they switch between classrooms by selection.
- All classroom routes and API/actions must enforce these rules **server-side** (e.g. verify current user is the classroom’s teacher, or a student in that classroom, or admin).

---

## 3. Data model (conceptual)

### Existing (keep)
- `student_teacher` — links each student to one teacher (defines classroom membership).
- `user_profiles` — role, email, username, etc.
- `user_progress` — topic completion (topic_id, user_id, status, completed_at, etc.).
- Curriculum/topics (e.g. topic_id like 1.1.3).

### New / extended

1. **Classroom messages (announcements)**
   - Table e.g. `classroom_messages` or `teacher_announcements`:
     - `id`, `teacher_user_id` (classroom owner), `content` (text or rich text), `created_at`.
   - Only the teacher (or admin acting on that classroom) can create. Students in that classroom can read (query by teacher_user_id; for students, the teacher_user_id is the one from their `student_teacher` row).

2. **Assignments**
   - Table e.g. `classroom_assignments`:
     - `id`, `teacher_user_id`, `topic_id` (e.g. `1.1.3` — “complete this learn topic”), `due_date` (date or timestamp), `title` or `description` (optional), `created_at`.
   - “Complete learn level 1.1.3 by date X” → one row with that topic_id and due_date.

3. **Assignment completion (for teacher view after due date)**
   - **Option A (recommended):** No separate table. After the due date, for each student in the classroom, check `user_progress` for that `topic_id`: if status is `completed` and `completed_at <= due_date` (or `completed_at` is not null for “completed by due” semantics), count as completed. Optionally allow “completed after due” for reporting.
   - **Option B:** Table `assignment_completions` (assignment_id, student_user_id, completed_at) for explicit tracking. Populate from user_progress when teacher views “who completed,” or when student completes the topic (trigger or job). Prefer Option A unless you need extra metadata (e.g. “marked complete by teacher”).

---

## 4. Routes and UI (suggested)

### Teacher
- **Classroom (teacher view)** — e.g. `/classroom` or `/teacher/classroom`. Replaces or subsumes the current “My students” page.
  - **Sections:**
    - **Students** (current “My students” content): list of students in the class with progress, XP, rank, level, streak, achievements; actions: Nudge, Congratulate.
    - **Announcements:** form to post a new message; list of past messages (newest first). Optionally edit/delete own messages.
    - **Assignments:** form to create assignment (pick topic e.g. 1.1.3, set due date, optional title); list of assignments. For each assignment **after due date**: “View completion” → list of students who completed it (and optionally who did not), e.g. from `user_progress` for that topic_id.
  - Sidebar/nav: **replace “My students”** with **“Classroom”** (or “My classroom”) that goes to this page.

### Student
- **Classroom (student view)** — e.g. `/classroom`.
  - **Sections:**
    - **People:** teacher and classmates (names; minimal info).
    - **Announcements:** read-only list of teacher messages (newest first).
    - **Assignments:** list of assignments (topic + due date); show “Done” or “Not done” per assignment based on `user_progress` for that topic.
  - Guard: only if user is a student in exactly one classroom (one teacher in `student_teacher`); redirect or 403 if not a student or not linked to a teacher.

### Admin
- **All Classrooms** — e.g. `/admin/classrooms` or a section inside `/admin`.
  - List/dropdown of classrooms (by teacher name or email). Admin selects one.
  - After selection: show the **same structure** as the teacher’s classroom view (students, announcements, assignments, completion after due date) for the **selected** classroom. Admin can be read-only or allowed to post/edit like the teacher; define in implementation.
  - Do **not** show one “global” classroom; always “select a classroom” then view that one.

---

## 5. Notifications and emails (optional)

- Optionally: when teacher posts an announcement, notify students (in-app and/or email via Resend). When teacher creates an assignment, optionally notify students.
- Reuse existing patterns (nudge/congratulations) for consistency.

---

## 6. Implementation notes

- **Guards:** For every classroom route and server action: resolve “current user’s classroom” (if teacher: my classroom; if student: the classroom I belong to; if admin: the classroom I selected). Then enforce: teacher can only see their classroom; student only their classroom; admin can see any classroom by selection.
- **Moving My students:** Remove or redirect the old “My students” nav item; make “Classroom” the entry point for teachers. The “Students” tab/section inside Classroom is the former My students content.
- **Topic IDs:** Assignments reference curriculum topic_ids (e.g. 1.1.3). Use existing `user_progress` and topic/lesson metadata for display (e.g. “Complete lesson 1.1.3 – Impulse Spending by Feb 25”).
- **Due date semantics:** Define clearly: “completed by due date” = `user_progress.completed_at <= due_date` (or status = completed and completed_at set). After due date, teacher sees list of completions (and non-completions) for that assignment.

---

## 7. Summary checklist

- [ ] **One classroom per teacher**; students and teachers only access their own classroom(s).
- [ ] **Teacher classroom:** Students list (move “My students” here), announcements/messages, assignments (topic + due date), and after due date — view who completed each assignment.
- [ ] **Student classroom:** Class people, read-only announcements, assignments list with completion status.
- [ ] **Admin:** “All Classrooms” panel — select a classroom (by teacher), then view that classroom’s content (no single global classroom).
- [ ] **DB:** `classroom_messages` (or equivalent), `classroom_assignments`; completion derived from `user_progress` (or explicit table if needed).
- [ ] **Nav:** Replace “My students” with “Classroom” for teachers; add “Classroom” for students; add “All Classrooms” (or under Admin) for admin.
- [ ] **Guards:** Server-side checks so students/teachers only see their own classroom; admin can only see classrooms by selection.

Use this as the single source of truth when implementing the classroom feature.
