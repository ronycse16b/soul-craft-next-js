"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare } from "lucide-react";

export default function WhatsAppFloatingButton() {
  const whatsAppMessage = `Hello, I'm interested in your product.
Could you tell me more about it?`;

  // URL-encode for WhatsApp
  const encodedMessage = encodeURIComponent(whatsAppMessage);

  // Example WhatsApp link
  const whatsappLink = `https://wa.me/8801968536050?text=${encodedMessage}`;

  const [visible, setVisible] = useState(true);

  // Optional: hide button on scroll down
  useEffect(() => {
    let lastScroll = 0;
    const handleScroll = () => {
      const current = window.scrollY;
      setVisible(current < lastScroll || current < 100);
      lastScroll = current;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-16 lg:bottom-8 right-2 z-50 flex flex-col items-center gap-2"
        >
          {/* Tooltip message */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:flex bg-white px-3 py-2 rounded-lg shadow-lg text-gray-800 font-medium text-sm whitespace-nowrap"
          >
            Need help?
          </motion.div>

          {/* WhatsApp button */}
          <motion.a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 bg-green-600 hover:bg-green-500 rounded-full flex items-center justify-center shadow-lg cursor-pointer text-white"
          >
            <MessageSquare className="w-7 h-7" />
          </motion.a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
