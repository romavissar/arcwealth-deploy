import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <Link href="/" className="font-bold text-xl text-primary">
          ArcWealth
        </Link>
        <SignUp
          appearance={{
            layout: {
              logoPlacement: "none",
            },
            variables: {
              colorPrimary: "#4F46E5",
              colorText: "#111827",
              colorTextSecondary: "#6b7280",
              colorBackground: "#ffffff",
              colorInputBackground: "#f9fafb",
              colorInputText: "#111827",
              colorBorder: "#e5e7eb",
              borderRadius: "0.75rem",
            },
            elements: {
              rootBox: "w-full mx-auto",
              card: "w-full shadow-sm border border-gray-200 rounded-xl",
              headerTitle: "hidden",
              headerSubtitle: "text-gray-500",
              footer: "hidden",
              footerAction: "hidden",
              footerPages: "hidden",
              formButtonPrimary:
                "bg-primary hover:opacity-90 text-white font-medium",
              formFieldInput:
                "border-gray-200 bg-gray-50 focus:ring-primary focus:border-primary",
              dividerLine: "bg-gray-200",
              dividerText: "text-gray-500",
            },
          }}
          afterSignUpUrl="/dashboard"
          signInUrl="/sign-in"
        />
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
