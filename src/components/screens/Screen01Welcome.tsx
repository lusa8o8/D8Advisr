"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import PrimaryButton from "@/components/ui/PrimaryButton";
import D8Logo from "@/components/ui/D8Logo";

export default function Screen01Welcome() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-6 text-center text-text-secondary">
      <div className="flex flex-col items-center gap-3">
        <D8Logo size="lg" />
        <div className="text-3xl font-bold">
          <span className="text-[#FF5A5F]">D8</span>
          <span className="text-text-primary">Advisr</span>
        </div>
        <p className="text-base text-text-secondary">
          Plan unforgettable dates &amp;
          <br />
          group experiences — <span className="italic text-[#FF5A5F]">effortlessly.</span>
        </p>
      </div>

      <div className="w-full max-w-xs space-y-3">
        <PrimaryButton
          label="Get Started"
          onPress={() => router.push("/signup")}
        />
        <Link
          href="/login"
          className="block text-sm font-semibold text-text-secondary underline-offset-4 hover:text-text-primary"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
