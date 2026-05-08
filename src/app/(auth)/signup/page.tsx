import Link from "next/link";
import { BrandLogo } from "@/components/shell/BrandLogo";
import { SignupForm } from "./SignupForm";

export default function SignupPage() {
  return (
    <main className="flex min-h-svh flex-1 flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <BrandLogo />
          <h1 className="text-2xl font-extrabold tracking-tight">
            Join the Brand Sport League
          </h1>
          <p className="text-sm text-muted-foreground">
            Only whitelisted family emails can register.
          </p>
        </div>

        <SignupForm />

        <p className="text-center text-sm">
          Already a champion?{" "}
          <Link href="/login" className="font-semibold text-gold">
            Log in →
          </Link>
        </p>
      </div>
    </main>
  );
}
