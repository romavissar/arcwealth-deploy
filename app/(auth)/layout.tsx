export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-3 py-8 text-gray-900 dark:bg-gray-950 dark:text-gray-100 sm:px-4 sm:py-10">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
        {children}
      </div>
    </div>
  );
}
