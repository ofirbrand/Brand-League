import Link from "next/link";
import { BrandLogo } from "@/components/shell/BrandLogo";
import { ResetPasswordForm } from "./ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-svh flex-1 flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <BrandLogo />
          <h1 className="text-2xl font-extrabold tracking-tight">
            Forgot your password?
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and we&apos;ll send a reset link.
          </p>
        </div>

        <ResetPasswordForm />

        <p className="text-center text-sm">
          <Link href="/login" className="text-muted-foreground hover:underline">
            ← Back to log in
          </Link>
        </p>
      </div>
    </main>
  );
}
