"use client";

import { usePathname } from "next/navigation";

export default function DashNavbar() {
  const pathname = usePathname();

  return (
    <nav>
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex-none">
          <label
            htmlFor="my-drawer-2"
            className="mx-4 drawer-button lg:hidden cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block h-5 w-5 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </label>
        </div>

        <div className="flex-none flex items-center space-x-4">
          <span className="text-md font-bold text-gray-700"></span>
          
        </div>
      </div>
    </nav>
  );
}
