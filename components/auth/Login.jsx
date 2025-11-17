"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Container from "../Container";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      emailOrPhone: "",
      password: "",
    },
  });

  const validateEmailOrPhone = (value) => {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const isBDPhone = /^(?:\+88|88)?01[3-9]\d{8}$/.test(value);
    return (
      isEmail || isBDPhone || "Enter a valid email or Bangladeshi mobile number"
    );
  };

  const onSubmit = async (data) => {
    try {
      setError(null);
      const res = await signIn("credentials", {
        emailOrPhone: data.emailOrPhone,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid credentials");
      } else {
        const session = await getSession();
        if (
          session?.user?.role === "admin" ||
          session?.user?.role === "moderator"
        ) {
          toast.success("Logged in successfully", { position: "top-right" });
          router.push("/dashboard");
        } else {
          router.push("/account");
        }
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      setError("Something went wrong");
    }
  };

  return (
    <section className="w-full min-h-[80vh] bg-gradient-to-t from-white to-gray-100 flex items-center sm:py-10">
      <Container className="w-full flex flex-col-reverse md:flex-row justify-between items-center gap-10 px-1 ">
        {/* Left Image */}
        <div className="flex justify-center w-full md:w-1/2">
          <Image
            src="/auth.png"
            alt="Login Illustration"
            width={480}
            height={480}
            className="object-contain drop-shadow-lg"
          />
        </div>

        {/* Login Box */}
        <div className="w-full max-w-md bg-white md:rounded-md shadow-black md:shadow-2xl p-8 ">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 tracking-tight">
            Welcome Back
          </h2>

          <p className="text-sm text-gray-600 mb-6">
            Log in to{" "}
            <span className="text-primary font-semibold">Soul Craft</span>
          </p>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 bg-red-100 p-2 rounded mb-3 font-medium shadow-sm animate-pulse">
              {error}
            </p>
          )}

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Email / Phone */}
            <div className="flex flex-col space-y-1">
              <label className="text-gray-700 text-sm font-medium">
                Email / Mobile
              </label>
              <input
                type="text"
                placeholder="Enter your email or mobile number"
                {...register("emailOrPhone", {
                  required: "Email or Mobile is required",
                  validate: validateEmailOrPhone,
                })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:outline-none transition"
              />
              {errors.emailOrPhone && (
                <p className="text-xs text-red-500">
                  {errors.emailOrPhone.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col space-y-1">
              <label className="text-gray-700 text-sm font-medium">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:outline-none transition"
              />
              {errors.password && (
                <p className="text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold shadow-md"
            >
              {isSubmitting ? "Logging in..." : "Log In"}
            </Button>

            {/* Google Login */}
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 border-gray-300 py-2 rounded-lg shadow-sm hover:bg-gray-50"
              onClick={() => signIn("google", { callbackUrl: "/account" })}
            >
              <Image src="/google.png" alt="Google" width={20} height={20} />
              Continue with Google
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm mt-6 text-gray-600">
            Don’t have an account?{" "}
            <Link
              href="/auth/sign-up"
              className="text-primary font-semibold hover:underline"
            >
              Sign up now
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}
