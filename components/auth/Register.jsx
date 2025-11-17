"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Container from "../Container";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

export default function Register() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const bdMobileRegex = /^01[3-9]\d{8}$/;

  const onSubmit = async (data) => {
    const payload = {
      name: data.name.trim(),
      password: data.password.trim(),
      emailOrPhone: data.emailOrPhone.trim(),
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/sign-up`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const response = await res.json();

      if (!res.ok) {
        setError(response.message);
      } else {
        toast.success("Account created successfully!");
        reset();
        router.push("/auth/sign-in");
      }
    } catch (error) {
      setError(error?.message || "Something went wrong");
    }
  };

  return (
    <section className="w-full min-h-[80vh] bg-gradient-to-t from-white to-gray-100 flex items-center sm:py-10">
      <Container className="w-full flex flex-col-reverse md:flex-row justify-between items-center gap-10 px-1">
        {/* Left Image with beautiful shape */}
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

        {/* Register Box */}
        <div className="w-full max-w-md bg-white md:rounded-md shadow-black md:shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 tracking-tight">
            Create an Account
          </h2>

          <p className="text-sm text-gray-600 mb-6">
            Join <span className="text-primary font-semibold">Soul Craft</span>
          </p>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 bg-red-100 p-2 rounded mb-3 font-medium shadow-sm animate-pulse">
              {error}
            </p>
          )}

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Full Name */}
            <div className="flex flex-col space-y-1">
              <label className="text-gray-700 text-sm font-medium">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                {...register("name", { required: "Name is required" })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:outline-none transition"
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Email / Mobile */}
            <div className="flex flex-col space-y-1">
              <label className="text-gray-700 text-sm font-medium">
                Email / Mobile
              </label>
              <input
                type={isMobile ? "tel" : "email"}
                placeholder={isMobile ? "Mobile Number" : "Email Address"}
                {...register("emailOrPhone", {
                  required: "This field is required",
                  validate: (value) =>
                    isMobile
                      ? bdMobileRegex.test(value) ||
                        "Invalid Bangladeshi mobile number"
                      : /\S+@\S+\.\S+/.test(value) || "Invalid email address",
                })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:outline-none transition"
              />
              {errors.emailOrPhone && (
                <p className="text-xs text-red-500">
                  {errors.emailOrPhone.message}
                </p>
              )}
            </div>

            {/* Switch Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="mobileCheckbox"
                className="w-4 h-4 accent-primary"
                onChange={() => setIsMobile(!isMobile)}
              />
              <label
                htmlFor="mobileCheckbox"
                className="text-sm text-gray-600 cursor-pointer"
              >
                Register with Mobile Number
              </label>
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

            {/* Register Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold shadow-md"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>

            {/* Google Login */}
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 border-gray-300 py-2 rounded-lg shadow-sm hover:bg-gray-50"
            >
              <Image src="/google.png" alt="Google" width={20} height={20} />
              Sign up with Google
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm mt-6 text-gray-600">
            Already have an account?{" "}
            <Link
              href="/auth/sign-in"
              className="text-primary font-semibold hover:underline"
            >
              Sign in now
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}
