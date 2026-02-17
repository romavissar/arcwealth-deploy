# Prompt: Friends and Viewable Profiles (Students)

Use this prompt to implement **viewable profiles** and a **friends** system for ArcWealth. Students can view each other’s profiles, send and accept friend requests, and manage friends and friend requests. The **Profile** area in the app becomes a section with **submenus**: one for the user’s own profile, one for their friends list, and one for friend requests. Friend requests can be sent from the **Leaderboard** and from the **Classroom** (People tab).

---

## 1. Concepts

### Viewable profiles (students)
- **Students can view other students’ profiles.** When a student views another student’s profile, they see appropriate public info (e.g. username, avatar, rank, level, XP, streak, achievements, progress) — similar to what is shown on the current “own profile” page but for another user. Teachers and admins may also be allowed to view student profiles; define in implementation.
- **Own profile** remains at the current profile page (e.g. `/profile`); it is the “My profile” submenu under Profile.
- **Another user’s profile** is viewable at a route like `/profile/[userId]` (or `/profile/user/[userId]`). Access control: only users who are allowed to see that profile (e.g. other students, or same classroom) can open it. Return 403 or 404 if the viewer is not allowed.

### Friends
- **Friends** are a symmetric relationship: if A is friends with B, then B is friends with A. Store this in a `friends` or `friendships` table (e.g. two rows or one row with (user_id_1, user_id_2) normalized so the pair is unique).
- **Friend requests** are one-way: user A sends a request to user B. Until B accepts, they are not friends. Store in a `friend_requests` table with e.g. `from_user_id`, `to_user_id`, `created_at`, and optionally `status` (e.g. pending / accepted / declined). When B accepts, create the friendship and remove or mark the request as accepted.
- **Who can be friends:** Restrict to **students** (or “students and teachers” if you want teachers in the social graph). Define clearly: e.g. only students can send friend requests to other students; teachers/admins may or may not participate. For simplicity, **students can add other students as friends**; teachers and admins do not need to be in the friends system unless you extend it later.

### Profile menu structure
- The **Profile** item in the sidebar (or top nav) should lead to a **Profile section** that has **submenus**:
  1. **My profile** — the current “view/edit my profile” page (e.g. `/profile`).
  2. **Friends** — list of the current user’s friends (with links to their profiles, avatar, username, rank/level). From here the user can open a friend’s profile.
  3. **Friend requests** — list of **incoming** friend requests (who requested me) with actions **Accept** / **Decline**, and optionally **outgoing** requests (pending requests I sent) so the user can cancel them.
- The exact UI can be: under `/profile` a sub-nav or tabs for “My profile”, “Friends”, “Friend requests”; or routes like `/profile`, `/profile/friends`, `/profile/requests`. Keep URLs clear and consistent.

---

## 2. Where to send friend requests

- **Leaderboard:** On the leaderboard, each row is a user (e.g. student). Add a control (e.g. “Add friend” or “Send request”) next to each user who is not already a friend and who has not already received a pending request from the current user. If there is already a pending request (from them to me or from me to them), show “Pending” or “Request sent” and do not allow duplicate requests.
- **Classroom (People tab):** In the student view of the classroom, the “People” tab lists the teacher and classmates. For each **classmate** (not the teacher), show an “Add friend” / “Send request” control if they are not already friends and no pending request exists. Same logic as on the leaderboard.
- **Optional:** From a user’s **profile page** (`/profile/[userId]`), when viewing another student’s profile, show an “Add friend” / “Send request” button with the same rules.

---

## 3. Access control

- **Viewing another user’s profile:** Only users who are allowed to see that profile can open `/profile/[userId]`. Define the rule: e.g. “students can view other students’ profiles” (and optionally: same classroom only, or any student). Enforce server-side on the profile page and any API that returns another user’s profile data.
- **Sending friend requests:** Only students (or the roles you define) can send friend requests. A user cannot send a request to themselves. Prevent duplicate requests (one pending request per pair). Optionally: only allow sending requests to users in the same classroom, or to any student; specify in implementation.
- **Accepting/declining:** Only the **recipient** of a friend request can accept or decline it.
- **Friends list and requests list:** Each user sees only their own friends and their own incoming/outgoing requests.

---

## 4. Data model (conceptual)

### New tables

1. **Friend requests**
   - e.g. `friend_requests`: `id`, `from_user_id`, `to_user_id`, `created_at`, optional `status` (`pending` / `accepted` / `declined`).
   - Unique constraint on `(from_user_id, to_user_id)` so at most one pending request per direction (or one per pair if you allow re-request after decline).
   - When a request is accepted: insert into friendships and delete or update the request.

2. **Friendships**
   - e.g. `friends` or `friendships`: `user_id_1`, `user_id_2` (both reference `user_profiles.id`), `created_at`. Ensure `user_id_1 < user_id_2` (or similar) so the pair is unique and you can query “all friends of user X” easily.
   - Or: two rows per friendship `(user_id, friend_user_id)` for simpler “list my friends” queries. Choose one and stay consistent.

### Existing
- `user_profiles` — use for avatar, username, rank, level, xp, etc. when showing a profile or a friend row.
- `user_progress`, `user_achievements` (or equivalent) — use to show progress and achievements on viewable profiles.

---

## 5. Routes and UI (suggested)

### Profile section (submenus)
- **My profile** — `/profile` (current page). Content: current “own profile” view (avatar, username, rank, level, XP, streak, achievements link, etc.).
- **Friends** — `/profile/friends`. Content: list of friends (avatar, username, rank, level; link to `/profile/[userId]`). Optionally “Remove friend” action.
- **Friend requests** — `/profile/requests` (or `/profile/friend-requests`). Content: two subsections or tabs — “Incoming” (requests others sent to me; Accept / Decline) and “Outgoing” (requests I sent; optional Cancel).

### View another user’s profile
- **Route:** `/profile/[userId]`. Content: same kind of info as “My profile” but for user `[userId]` (read-only). Show “Add friend” / “Send request” if the viewer is a student, the profile is a student, they are not the same user, and they are not already friends and no pending request exists.

### Leaderboard
- Add an action per row: “Add friend” / “Send request” (or “Pending” / “Friends” when applicable). Only show for users who are allowed to send requests (e.g. students). Hide for the current user’s row.

### Classroom (student view) — People tab
- For each **classmate** (not the teacher), show “Add friend” / “Send request” (or “Pending” / “Friends”). Same rules as leaderboard.

### Profile nav (sidebar or within Profile)
- Under **Profile**, show sub-items: **My profile**, **Friends**, **Friend requests**. Clicking Profile in the sidebar can go to `/profile` (My profile) by default, with the submenu visible on the profile section pages so the user can switch to Friends or Friend requests.

---

## 6. Implementation notes

- **Guards:** Every route and server action that returns another user’s profile data must check that the current user is allowed to view that profile (e.g. student viewing student). Every action that creates a friend request or friendship must check roles and prevent self-requests and duplicates.
- **Idempotency:** Sending a friend request when one already exists (same direction or reverse) should not create a duplicate; return a clear state (e.g. “Already sent” or “Already friends”).
- **Profile submenu:** Implement the Profile section so that when the user is on `/profile`, `/profile/friends`, or `/profile/requests`, a shared layout or component shows the submenu (My profile | Friends | Friend requests) and highlights the current page. The sidebar can keep a single “Profile” link that goes to `/profile`; the submenu is inside the profile section.
- **Teachers:** If teachers are not part of the friends system, hide “Add friend” for teacher rows and do not show teachers in friends lists. Only student–student friendships.

---

## 7. Summary checklist

- [ ] **Viewable profiles:** Students can open another student’s profile at e.g. `/profile/[userId]` and see public info (username, avatar, rank, level, XP, streak, achievements). Access control enforced server-side.
- [ ] **Friends:** Table (e.g. `friends` or `friendships`) storing symmetric friend relationships. Only students can be friends (or define otherwise).
- [ ] **Friend requests:** Table `friend_requests` with from/to and status. Send request → pending; accept → create friendship and clear request. Prevent self-request and duplicate requests.
- [ ] **Profile section submenus:** Under Profile: **My profile** (`/profile`), **Friends** (`/profile/friends`), **Friend requests** (`/profile/requests`). Submenu visible on all profile section pages.
- [ ] **Send request from Leaderboard:** “Add friend” / “Send request” (or Pending/Friends) on each row for eligible users.
- [ ] **Send request from Classroom (People):** “Add friend” / “Send request” (or Pending/Friends) for each classmate in the student view.
- [ ] **Optional:** “Add friend” on another user’s profile page (`/profile/[userId]`) when applicable.
- [ ] **Friends list:** List of friends with link to their profile; optional “Remove friend”.
- [ ] **Friend requests page:** Incoming (Accept/Decline) and optionally Outgoing (Cancel). Only recipient can accept/decline.

Use this as the single source of truth when implementing the friends and viewable-profiles feature.
