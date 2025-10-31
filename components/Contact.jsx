"use client";

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { Phone, Mail, MapPin, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import axios from "axios";
import Container from "./Container";

// API function
const sendMessage = async (formData) => {
  const { data } = await axios.post("/api/messages", formData);
  return data;
};

export default function Contact() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const mutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      toast.success("Message sent successfully!");
      reset();
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  const onSubmit = (data) => {
    // Map email to userEmail to match Mongoose schema
    const payload = { ...data, email: data.email };
    mutation.mutate(payload);
  };

  return (
    <Container className="px-2 py-2">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 lg:mb-8 mb-2">
        <Link href="/" className="hover:text-[#f69224]">
          Home
        </Link>{" "}
        / <span className="text-gray-800 font-medium">Contact</span>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
        {/* Contact Info */}
        <div className="bg-white p-8 rounded-xl shadow-sm text-sm w-full lg:w-3/12 flex-1">
          {/* Call */}
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-[#f69224]/10 flex items-center justify-center text-[#f69224]">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Call To Us</h3>
              <p className="text-gray-600 mb-1">
                We are available 24/7, 7 days a week.
              </p>
              <p className="text-gray-800 font-medium">
                Phone: +880 1968 536 050
              </p>
            </div>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* Write */}
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-[#6fd300]/10 flex items-center justify-center text-[#6fd300]">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Write To Us</h3>
              <p className="text-gray-600 mb-1">
                Fill out our form and we’ll contact you within 24 hours.
              </p>
              <p className="text-gray-800 font-medium">
                Email: soulcraft1801@gmail.com
              </p>
            </div>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* Visit */}
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-[#f69224]/10 flex items-center justify-center text-[#f69224]">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Visit Our Office</h3>
              <p className="text-gray-600">
                House 21, Road 3, Block C, Banani, Dhaka, Bangladesh.
              </p>
            </div>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* WhatsApp */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#6fd300]/10 flex items-center justify-center text-[#6fd300]">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Chat on WhatsApp</h3>
              <p className="text-gray-600 mb-2">
                Reach us instantly via WhatsApp for quick support.
              </p>
              <Link
                href="https://wa.me/+8801968536050"
                target="_blank"
                className="text-[#6fd300] font-medium hover:underline"
              >
                Message on WhatsApp →
              </Link>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-8 rounded-xl shadow-sm w-full lg:w-8/12">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Your Name *"
                  {...register("name", { required: "Name is required" })}
                  className="w-full border border-gray-300 bg-gray-50 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#f69224]"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Your Email *"
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
                  })}
                  className="w-full border border-gray-300 bg-gray-50 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#f69224]"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Your Phone *"
                  {...register("phone", { required: "Phone is required" })}
                  className="w-full border border-gray-300 bg-gray-50 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#f69224]"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <textarea
                placeholder="Your Message"
                rows={6}
                {...register("message", { required: "Message is required" })}
                className="w-full border border-gray-300 bg-gray-50 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#f69224]"
              ></textarea>
              {errors.message && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.message.message}
                </p>
              )}
            </div>

            <div className="text-right">
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="bg-[#f69224] hover:bg-[#e27e1e] text-white font-semibold px-6 rounded-none py-4"
              >
                {mutation.isPending ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Container>
  );
}
