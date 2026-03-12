"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowserClient } from "@/lib/supabase/client";
import D8Logo from "@/components/ui/D8Logo";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type AuthFormValues = z.infer<typeof authSchema>;

type Screen02AuthProps = {
  mode: "signup" | "signin";
};

export default function Screen02Auth({ mode }: Screen02AuthProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const redirectUrl = mode === "signup" ? "/onboarding/preferences" : "/home";

  const onSubmit = async (values: AuthFormValues) => {
    setLoading(true);
    try {
      const action =
        mode === "signup"
          ? supabaseBrowserClient.auth.signUp({
              email: values.email,
              password: values.password,
            })
          : supabaseBrowserClient.auth.signInWithPassword({
              email: values.email,
              password: values.password,
            });

      const { error } = await action;
      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Success!");
      router.push(redirectUrl);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const { error } = await supabaseBrowserClient.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: new URL("/auth/callback", appUrl).toString(),
        },
      });
      if (error) {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 py-10 text-text-secondary">
      <D8Logo size="md" showWordmark />
      <div className="w-full max-w-md rounded-3xl border border-border bg-white px-6 py-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-text-primary">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-text-secondary">
              Email Address
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="name@example.com"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-base text-text-primary outline-none transition focus:border-brand"
            />
            {errors.email && (
              <p className="text-xs text-warning">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-text-secondary">
              Password
            </label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 pr-12 text-base text-text-primary outline-none transition focus:border-brand"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <p className="text-xs text-text-secondary">Must be at least 8 characters</p>
            {errors.password && (
              <p className="text-xs text-warning">{errors.password.message}</p>
            )}
          </div>

          <PrimaryButton label={mode === "signup" ? "Sign Up" : "Sign In"} onPress={handleSubmit(onSubmit)} disabled={loading} loading={loading} />
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-text-secondary">
          <span className="h-px flex-1 bg-border" />
          <span>OR</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <button
          onClick={handleGoogle}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-white px-4 py-3 text-sm font-medium text-text-secondary transition hover:border-text-primary"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#d5d5d5] bg-white text-xs font-bold text-[#4285F4]">
            G
          </span>
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-text-secondary">
          {mode === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
          <Link
            href={mode === "signup" ? "/login" : "/signup"}
            className="font-semibold text-[#FF5A5F]"
          >
            {mode === "signup" ? "Sign In" : "Sign Up"}
          </Link>
        </p>
      </div>
    </div>
  );
}
