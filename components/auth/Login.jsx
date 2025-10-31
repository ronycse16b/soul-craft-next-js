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

  // ✅ Validate Bangladeshi number pattern
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
        // toast.error("Invalid credentials");
        setError('Invalid credentials');
      } else {
        const session = await getSession();
        if (session?.user?.role === "admin") {

          toast.success("Logged in successfully",{
            position: "top-right",
          });
         
          router.push("/dashboard");
        } else {
          router.push("/account");
        }
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      // toast.error("Something went wrong");
      setError('Something went wrong');
    }
  };

  return (
    <section className="w-full min-h-[80vh] bg-white flex items-center">
      <Container className="flex flex-col-reverse md:flex-row justify-between items-center gap-10 py-8">
        {/* Left Side Image */}
        <div className="flex justify-center w-full md:w-1/2">
          <Image
            src="/auth.png"
            alt="E-commerce Illustration"
            width={500}
            height={500}
            className="object-contain"
          />
        </div>

        {/* Right Side Form */}
        <div className="w-full sm:p-8 p-2 max-w-md">
          <h2 className="text-2xl font-bold mb-2">
            Log in to <span className="text-primary">Soul Craft</span>
          </h2>
          <p className="text-sm text-gray-600 mb-6">Enter your details below</p>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email or Mobile */}

            {error && <p className="text-sm text-red-500 bg-red-100 p-2 font-bold animate-pulse italic shadow">{error}</p>}
            <div className="flex flex-col space-y-2">
              <input
                type="text"
                placeholder="Email or Mobile Number"
                {...register("emailOrPhone", {
                  required: "Email or Mobile is required",
                  validate: validateEmailOrPhone,
                })}
                className="w-full border-b px-3 border-gray-300 focus:outline-none focus:border-[#f69224] py-2"
              />
              {errors.emailOrPhone && (
                <p className="text-sm text-red-500">
                  {errors.emailOrPhone.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col space-y-2">
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
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-destructive hover:bg-destructive/90 text-white font-semibold rounded px-6 py-2 w-full"
              >
                {isSubmitting ? "Logging in..." : "Log In Now"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full flex justify-center items-center gap-2 rounded-none cursor-pointer border"
                onClick={() => signIn("google", { callbackUrl: "/account" })}
              >
                <Image src="/google.png" alt="Google" width={20} height={20} />
                Continue with Google
              </Button>
            </div>

            {/* Footer Links */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-4">
              <p className="text-sm">
                Don’t have an account?{" "}
                <Link
                  href="/auth/sign-up"
                  className="text-[#f69224] font-medium hover:underline"
                >
                  Sign up now
                </Link>
              </p>
            </div>
          </form>
        </div>
      </Container>
    </section>
  );
}
