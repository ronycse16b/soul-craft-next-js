import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowRight,
} from "lucide-react";
import Container from "./Container";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12 px-6 md:px-20">
      <Container className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
        {/* Exclusive */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Soul Craft</h3>
          <p className="text-sm mb-3">Subscribe</p>
          <p className="text-xs mb-4">Get 10% off your first order</p>
          <div className="flex items-center border border-gray-500 rounded-sm overflow-hidden w-52">
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-transparent text-xs text-white px-3 py-2 flex-1 outline-none placeholder-gray-400"
            />
            <button className="bg-white text-black px-3 py-2 hover:bg-gray-300 transition">
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Support</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            111 Bijoy sarani, Dhaka,
            <br /> DH 1515, Bangladesh.
          </p>
          <p className="text-xs text-gray-400 mt-3">soulcraft1801@gmail.com</p>
          <p className="text-xs text-gray-400 mt-2">+880 1968 536 050</p>
        </div>

        {/* Account */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Account</h3>
          <ul className="space-y-2 text-xs text-gray-400 cursor-pointer">
            <li>
              <Link href="/account">My Account</Link>
            </li>
            <li>
              <Link href="/auth/login">Register / Login</Link>
            </li>
            <li>
              <Link href="/cart">cart</Link>
            </li>
           
            <li>
              <Link href="/shop">Shop</Link>
            </li>
          </ul>
        </div>

        {/* Quick Link */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Link</h3>
          <ul className="space-y-2 text-xs text-gray-400 cursor-pointer">
            <li>Privacy Policy</li>
            <li>Terms Of Use</li>
            <li>FAQ</li>
            <li>Contact</li>
          </ul>
        </div>

        {/* Download App */}
        <div>
        

          {/* Social Icons */}
          <div className="flex space-x-4 text-gray-400 mt-4">
            <Facebook className="w-4 h-4 hover:text-white cursor-pointer" />
            <Twitter className="w-4 h-4 hover:text-white cursor-pointer" />
            <Instagram className="w-4 h-4 hover:text-white cursor-pointer" />
            <Linkedin className="w-4 h-4 hover:text-white cursor-pointer" />
          </div>
        </div>
      </Container>

      {/* Bottom Line */}
      <div className="border-t border-gray-700 mt-10 pt-6 text-center text-xs text-gray-500">
        © Copyright SOUL CRAFT. All rights reserved
      </div>
    </footer>
  );
}
