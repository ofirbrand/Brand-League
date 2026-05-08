import { Suspense } from "react";
import { LoginForm } from "./LoginForm";
import { BrandLogo } from "@/components/shell/BrandLogo";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-svh flex-1 flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <BrandLogo />
          <h1 className="text-2xl font-extrabold tracking-tight">
            Welcome back, champ
          </h1>
          <p className="text-sm text-muted-foreground">
            Log in to claim your spot on the podium.
          </p>
        </div>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>

        <div className="space-y-2 text-center text-sm">
          <p>
            New family member?{" "}
            <Link href="/signup" className="font-semibold text-gold">
              Sign up →
            </Link>
          </p>
          <p>
            <Link
              href="/reset-password"
              className="text-muted-foreground hover:underline"
            >
              Forgot password?
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
