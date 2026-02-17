import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getFriendRequests } from "@/app/actions/friends";
import { FriendRequestActions } from "./FriendRequestActions";

export default async function ProfileRequestsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { error, incoming, outgoing } = await getFriendRequests();
  if (error) return <p className="text-red-600 dark:text-red-400">{error}</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Friend requests</h1>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Incoming</h2>
        {!incoming?.length ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No pending requests.</p>
        ) : (
          <ul className="space-y-2">
            {incoming.map((r) => (
              <li
                key={r.id}
                className="flex items-center gap-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-4"
              >
                <Link href={`/profile/${r.otherUserId}`} className="flex items-center gap-3 min-w-0 flex-1">
                  {r.otherAvatarUrl ? (
                    <Image
                      src={r.otherAvatarUrl}
                      alt=""
                      width={40}
                      height={40}
                      className="rounded-full object-cover h-10 w-10 shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 flex items-center justify-center font-medium text-sm shrink-0">
                      {r.otherUsername.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium text-gray-900 dark:text-gray-100 truncate">{r.otherUsername}</span>
                </Link>
                <FriendRequestActions requestId={r.id} direction="incoming" />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Outgoing</h2>
        {!outgoing?.length ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No pending requests you sent.</p>
        ) : (
          <ul className="space-y-2">
            {outgoing.map((r) => (
              <li
                key={r.id}
                className="flex items-center gap-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-4"
              >
                <Link href={`/profile/${r.otherUserId}`} className="flex items-center gap-3 min-w-0 flex-1">
                  {r.otherAvatarUrl ? (
                    <Image
                      src={r.otherAvatarUrl}
                      alt=""
                      width={40}
                      height={40}
                      className="rounded-full object-cover h-10 w-10 shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 flex items-center justify-center font-medium text-sm shrink-0">
                      {r.otherUsername.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium text-gray-900 dark:text-gray-100 truncate">{r.otherUsername}</span>
                </Link>
                <FriendRequestActions requestId={r.id} direction="outgoing" />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
