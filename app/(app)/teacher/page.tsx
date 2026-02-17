import { redirect } from "next/navigation";

/** My students is now under Classroom. Redirect to classroom. */
export default async function TeacherPage() {
  redirect("/classroom");
}
