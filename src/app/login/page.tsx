"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase-client";
import Image from "next/image";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 lg:flex lg:flex-col lg:items-center lg:justify-center">
        <div className="max-w-md space-y-6 px-8 text-center text-white">
          <div className="flex justify-center">
            <div className="rounded-full bg-white p-2 shadow-xl">
              <Image
                src="/logo.png"
                alt="Anvil Lanka Travels"
                width={80}
                height={80}
                className="rounded-full"
              />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Anvil Lanka Travels
            </h1>
            <p className="text-sm font-medium uppercase tracking-widest text-primary-200 mt-1">
              Admin Panel
            </p>
          </div>
          <p className="text-lg text-primary-100">
            Manage tours, bookings, and customer inquiries
            across your travel platform.
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-4 lg:w-1/2">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="mb-4 flex items-center justify-center gap-3 lg:justify-start">
              <Image
                src="/logo.png"
                alt="Anvil Lanka Travels"
                width={48}
                height={48}
                className="rounded-full"
              />
              <div className="lg:hidden">
                <span className="text-xl font-bold text-gray-900 block leading-tight">
                  Anvil Lanka Travels
                </span>
                <span className="text-xs font-medium uppercase tracking-wider text-primary-600">
                  Admin Panel
                </span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-1 text-sm text-gray-500">
              Sign in with your Google account to continue
            </p>
          </div>

          <div className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-inset ring-red-600/20">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              {loading ? "Signing in..." : "Sign in with Google"}
            </button>

            <p className="text-center text-xs text-gray-400">
              Only authorized admin accounts can access the dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
