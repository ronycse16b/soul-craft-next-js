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

  const emailOrPhone = watch("emailOrPhone");

  // Bangladesh Mobile Number Regex (starts with 01 + 9 more digits)
  const bdMobileRegex = /^01[3-9]\d{8}$/;

  const onSubmit = async (data) => {
    const payload = {
      name: data.name.trim(),
      password: data.password.trim(),
      emailOrPhone: data.emailOrPhone.trim(),
    };

    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

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
    <section className="w-full sm:py-12 sm:my-10 py-4 bg-white">
      <Container className="flex flex-col-reverse md:flex-row items-center gap-10">
        {/* Left Side */}
        <div className="flex justify-center w-full md:w-1/2">
          <Image
            src="/auth.png"
            alt="E-commerce Illustration"
            width={500}
            height={500}
            className="object-contain"
          />
        </div>

        {/* Right Side */}
        <div className="w-full md:w-1/2 max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-2">Create an account</h2>
          <p className="text-sm text-gray-600 mb-6">Enter your details below</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}

            {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 animate-pulse ">{error}</p>}
            <div>
              <input
                type="text"
                placeholder="Full Name"
                {...register("name", { required: "Name is required" })}
                className="w-full border-b px-3 border-gray-300 focus:outline-none focus:border-[#f69224] py-2"
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors?.name?.message}</p>
              )}
            </div>

            {/* Email / Mobile */}
            <div className="flex items-center gap-3">
              <input
                type={isMobile ? "tel" : "email"}
                placeholder={isMobile ? "Mobile Number" : "Email"}
                {...register("emailOrPhone", {
                  required: "This field is required",
                  validate: (value) =>
                    isMobile
                      ? bdMobileRegex.test(value) ||
                        "Invalid Bangladeshi mobile number"
                      : /\S+@\S+\.\S+/.test(value) || "Invalid email address",
                })}
                className="flex-1 border-b px-3 border-gray-300 focus:outline-none focus:border-[#f69224] py-2"
              />
            </div>
            {errors.emailOrPhone && (
              <p className="text-red-500 text-sm">
                {errors.emailOrPhone.message}
              </p>
            )}

            {/* Checkbox for switching */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="mobileCheckbox"
                className="w-4 h-4 accent-[#f69224]"
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
            <div>
              <input
                type="password"
                placeholder="Password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                className="w-full border-b px-3 border-gray-300 focus:outline-none focus:border-[#f69224] py-2"
              />
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold rounded-none"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>

            {/* Google Signup */}
            <Button
              type="button"
              variant="outline"
              className="w-full flex justify-center items-center gap-2 rounded-none cursor-pointer"
            >
              <Image src="/google.png" alt="Google" width={20} height={20} />
              Sign up with Google
            </Button>
          </form>

          <p className="text-sm text-center mt-6">
            Already have an account?{" "}
            <Link
              href="/auth/sign-in"
              className="text-[#f69224] font-medium hover:underline"
            >
              Sign in now
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}
