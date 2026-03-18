"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowserClient } from "@/lib/supabase/client";
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
        if (error.message?.toLowerCase().includes("already registered")) {
          toast.error("Account already exists. Please sign in instead.");
        } else {
          toast.error(error.message);
        }
        return;
      }
      toast.success("Success!");
      router.refresh();
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F7F7] px-6 py-10">
      {/* Logo */}
      <div className="flex items-baseline mb-8">
        <span className="font-bold text-3xl text-[#FF5A5F] tracking-tight">D8</span>
        <span className="font-bold text-3xl text-[#222222] tracking-tight">Advisr</span>
      </div>

      <div className="w-full max-w-md rounded-3xl border border-[#EBEBEB] bg-white px-6 py-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-[#222222]">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-[#555555]">Email Address</label>
            {/* CHANGE 6: Input field styles */}
            <input
              {...register("email")}
              type="email"
              placeholder="name@example.com"
              className="w-full px-4 py-3.5 rounded-xl border border-[#EBEBEB] bg-[#F7F7F7] focus:bg-white focus:outline-none focus:border-[#FF5A5F] focus:ring-1 focus:ring-[#FF5A5F] transition-all text-[#222222] placeholder:text-gray-400"
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-[#555555]">Password</label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                className="w-full px-4 py-3.5 pr-16 rounded-xl border border-[#EBEBEB] bg-[#F7F7F7] focus:bg-white focus:outline-none focus:border-[#FF5A5F] focus:ring-1 focus:ring-[#FF5A5F] transition-all text-[#222222] placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#555555] font-medium"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <p className="text-xs text-[#888888]">Must be at least 8 characters</p>
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* CHANGE 7: Sign Up button style */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF5A5F] text-white py-4 rounded-xl font-semibold text-[17px] shadow-[0_8px_20px_-6px_rgba(255,90,95,0.5)] active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {loading ? "Please wait..." : mode === "signup" ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-[#999999]">
          <span className="h-px flex-1 bg-[#EBEBEB]" />
          <span>OR</span>
          <span className="h-px flex-1 bg-[#EBEBEB]" />
        </div>

        {/* CHANGE 5: Real Google SVG */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#EBEBEB] bg-white px-4 py-3.5 text-sm font-semibold text-[#222222] transition hover:bg-[#F7F7F7] disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-[#555555]">
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
