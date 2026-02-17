# Prompt: User Roles, Admin Panel, and Teacher–Student System

Use this prompt to implement a role-based system for ArcWealth with **admin**, **teacher**, and **student** roles, an **admin panel**, and **teacher dashboards** to view connected students’ progress.

---

## 1. User roles

### Admin
- **Who:** Only the user with email **`romavissar@gmail.com`** is an admin.
- **Powers:**
  - Access the **admin panel** (e.g. `/admin` or `/settings/admin`, protected so only admin can open it).
  - Configure **allowed student email endings** (e.g. `@student.goaisb.ro`).
  - See a list of all **teachers** and all **students**.
  - **Assign students to a teacher** (each student is linked to exactly one teacher).
  - Optionally promote a user to **teacher** (e.g. by email or user id).

### Teacher
- **Who:** Users explicitly **assigned as teacher by an admin** (e.g. via admin panel: “Add teacher” by email or select user).
- **Powers:**
  - Access a **teacher dashboard** (e.g. `/teacher` or `/dashboard/teacher`) showing only **their** connected students.
  - View per-student:
    - **Learn progress:** which levels/topics are completed (e.g. from `user_progress` / curriculum level).
    - **Achievements:** which achievements are unlocked (from `user_achievements`).
    - **XP** (total), **rank**, **level**, and **streak** (from `user_profiles` or equivalent).
  - No access to admin panel; cannot change student email rules or assign other teachers’ students.

### Student
- **Who:** Any user whose email **ends with** one of the **admin-configured suffixes** (e.g. `@student.goaisb.ro`). Optionally, students can also be users that an admin has explicitly **assigned to a teacher** (so “student” = has a teacher + optionally matches an allowed email ending).
- **Behaviour:**
  - Uses the app as today (learn path, XP, achievements, streak, rank).
  - Is **linked to exactly one teacher** (set in admin panel). That teacher can see this student’s activity as above.
  - Students do not see the admin panel or the teacher dashboard (unless you later add a “view my progress” summary for students).

---

## 2. Admin panel (admin only)

- **Route:** e.g. `/admin` (or under `/settings/admin`). Guard: redirect or 403 if current user’s email is not `romavissar@gmail.com`.
- **Sections:**

  1. **Student email endings**
     - List of allowed suffixes (e.g. `@student.goaisb.ro`, `@school.edu`).
     - Add / remove / edit suffixes.
     - Stored in DB (e.g. `settings` or `admin_config` table, or a single row with a JSON array of strings). New users whose email **ends with** one of these can be treated as students (and optionally auto-assigned or flagged for assignment to a teacher).

  2. **Teachers**
     - List of all users with role **teacher** (e.g. from `user_profiles.role` or a `user_roles` table).
     - “Add teacher”: e.g. by email or by selecting a user (if you have a user list). That user’s role is set to teacher.

  3. **Students**
     - List of all **students** (users with role student and/or email ending in an allowed suffix, and/or users linked to a teacher).
     - For each student: show email, linked teacher (if any), and optionally last activity / XP / rank.
     - **Assign to teacher:** dropdown (or picker) to set “Teacher” for each student. Store in DB (e.g. `student_teacher` table: `student_user_id`, `teacher_user_id`), so each student has at most one teacher.

- **Data model (conceptual):**
  - `admin_config` or `settings`: e.g. `allowed_student_email_endings: string[]`.
  - `user_profiles`: add `role: 'admin' | 'teacher' | 'student' | 'user'` (or a separate `user_roles` table).
  - `student_teacher`: `(student_user_id, teacher_user_id)` with unique on `student_user_id` so one teacher per student.

- **Determining “student”:**
  - Either: user’s email ends with one of the allowed suffixes, **or** user has a row in `student_teacher` (or has role student). Optionally sync: when admin adds an email ending, existing users matching it get role student or become assignable; when admin assigns a teacher, that user is treated as student.

---

## 3. Teacher dashboard (teachers only)

- **Route:** e.g. `/teacher` or `/dashboard/teacher`. Guard: only users with role **teacher** (and optionally admin for testing).
- **Content:**
  - List of **students linked to this teacher** (query `student_teacher` where `teacher_user_id = currentUser.id`).
  - For each student, show:
    - **Identity:** name/email (or username).
    - **Learn progress:** which levels/topics completed (from `user_progress`: e.g. count completed per level, or list of completed `topic_id`s; optionally map to “Level 1”, “Level 2”, etc. from your curriculum).
    - **Achievements:** list of unlocked achievements (from `user_achievements` joined with `achievements` for titles/icons).
    - **XP** (total), **rank**, **level**, **streak** (from `user_profiles`).
  - Optional: filters (e.g. by level completed), sort by XP or streak, and “last active” from `user_profiles.last_activity_date` or `updated_at`.

- **Data:** All read-only; teacher does not modify student data. Use existing tables: `user_profiles`, `user_progress`, `user_achievements`, `achievements`, and `student_teacher`.

---

## 4. Implementation notes

- **Auth:** Keep using Clerk; role and `student_teacher` live in your DB (Supabase). On sign-in/sync (e.g. `ensureUserInSupabase` or webhook), you can set `role` from:
  - Admin: if email === `romavissar@gmail.com` then role = admin.
  - Teacher: if user id in “teachers” list then role = teacher.
  - Student: if email matches an allowed ending or user is in `student_teacher` then role = student (or leave as “user” and derive “is student” by link to teacher).
- **Security:** Admin panel and teacher dashboard must check role (and for admin, optionally double-check email) server-side; do not rely only on hiding UI.
- **UI:** Reuse existing components (e.g. tables, cards) and styling (Tailwind, your design system). Admin and teacher routes can live under `app/(app)/admin/` and `app/(app)/teacher/` with layout checks that redirect non-authorized users to dashboard or sign-in.

---

## 5. Summary checklist

- [ ] **Roles:** admin (only romavissar@gmail.com), teacher (assigned by admin), student (email ending set by admin + link to teacher).
- [ ] **Admin panel:** view teachers and students; set allowed student email endings; assign each student to a teacher.
- [ ] **Teacher dashboard:** view connected students only; for each, show completed levels, achievements, XP, rank, level, streak.
- [ ] **DB:** store allowed email endings, role per user (or equivalent), and `student_teacher` (student_user_id, teacher_user_id).
- [ ] **Guards:** admin route only for admin; teacher route only for teacher (and optionally admin).

Use this as the single source of truth when implementing the feature.
