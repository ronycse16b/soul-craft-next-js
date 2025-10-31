"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Container from "./Container";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function MusicExperience() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // ✅ Fetch active advertisement via TanStack Query
  const {
    data: ads,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["advertisement"],
    queryFn: async () => {
      const res = await axios.get("/api/advertisement/client");
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
  });

  const ad = ads?.[0]; // Only one active ad to show

  // ⏱ Countdown Timer Logic
  useEffect(() => {
    if (!ad?.endTime) return;
    const end = new Date(ad.endTime).getTime();

    const timer = setInterval(() => {
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        clearInterval(timer);
        return setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [ad]);

  // 💬 Loading / Error states
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16 text-gray-400">
        Loading...
      </div>
    );
  }

  if (isError || !ad) {
    return null; // hide section if no active ad
  }

  // 🎨 UI
  return (
    <Container className="px-0">
      <section className="relative w-full py-16 bg-gradient-to-r from-black via-gray-900 to-gray-800 text-white overflow-hidden">
        <div className="container mx-auto px-8 lg:px-16 flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Left Side */}
          <div className="lg:w-1/2 space-y-6">
            <h3 className="text-lg font-semibold text-green-500 uppercase">
              {ad?.title || "Categories"}
            </h3>
            {ad?.description && (
              <p className="text-gray-300 max-w-lg">{ad?.description}</p>
            )}

            {/* Countdown Timer */}
            <div className="flex gap-6 mb-8 mt-4">
              {Object.entries(timeLeft).map(([label, value]) => (
                <div
                  key={label}
                  className="text-center bg-white rounded-full w-14 h-14 flex flex-col items-center justify-center text-gray-800 shadow-lg"
                >
                  <div className="text-sm font-semibold">
                    {String(value).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] capitalize">{label}</div>
                </div>
              ))}
            </div>

            {/* Button */}
            <Button
              asChild
              className="bg-rose-600 hover:bg-green-600 text-white px-8 py-4 rounded-none text-lg font-semibold transition-all duration-300"
            >
              <a href={ad.buttonLink}>{ad.buttonText}</a>
            </Button>
          </div>

          {/* Right Side */}
          <div className="lg:w-1/2 flex justify-center">
            <Image
              src={ad.image}
              alt={ad.title}
              width={400}
              height={400}
              priority
              className="object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </section>
    </Container>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import Image from "next/image";
// import { Button } from "@/components/ui/button";
// import Container from "./Container";

// export default function MusicExperience() {
//   const [timeLeft, setTimeLeft] = useState({
//     days: 5,
//     hours: 23,
//     minutes: 59,
//     seconds: 35,
//   });

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setTimeLeft((prev) => {
//         let { days, hours, minutes, seconds } = prev;
//         if (seconds > 0) seconds--;
//         else if (minutes > 0) {
//           seconds = 59;
//           minutes--;
//         } else if (hours > 0) {
//           minutes = 59;
//           hours--;
//         } else if (days > 0) {
//           hours = 23;
//           days--;
//         }
//         return { days, hours, minutes, seconds };
//       });
//     }, 1000);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <Container className="px-0">
//       <section className="relative w-full py-16  bg-gradient-to-r from-black via-gray-900 to-gray-800 text-white">
//         <div className="container mx-auto px-16 flex flex-col lg:flex-row items-center justify-between">
//           {/* Left Side: Text & Timer */}
//           <div className="lg:w-1/2 mb-10 lg:mb-0">
//             <h3 className="text-lg font-semibold text-green-500 uppercase mb-2">
//               Categories
//             </h3>
//             <h2 className="text-xl sm:text-4xl font-bold mb-6 leading-tight">
//               Enhance Your Music Experience
//             </h2>

//             {/* Countdown Timer */}
//             <div className="flex gap-6 mb-8">
//               {Object.entries(timeLeft).map(([label, value]) => (
//                 <div key={label} className="text-center bg-white  shadow-destructive rounded-full w-12 h-12  flex flex-col items-center justify-center text-gray-800 shadow-lg">
//                   <div className="text-sm  text-black font-semibold">
//                     {String(value).padStart(2, "0")}
//                   </div>
//                   <div className="text-[10px]  text-black">{label}</div>
//                 </div>
//               ))}
//             </div>

//             {/* CTA Button */}
//             <Button className="bg-rose-600 hover:bg-green-600 text-white px-8 py-4 rounded-none  text-lg font-semibold ">
//               Buy Now!
//             </Button>
//           </div>

//           {/* Right Side: Product Image */}
//           <div className="lg:w-1/2 flex justify-center">
//             <Image
//               src="/music.png"
//               alt="JBL Speaker"
//               width={400}
//               height={400}
//               className="object-contain drop-shadow-xl"
//             />
//           </div>
//         </div>
//       </section>
//     </Container>
//   );
// }
