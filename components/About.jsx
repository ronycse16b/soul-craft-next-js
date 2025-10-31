import Image from "next/image";
import Link from "next/link";
import {
  Store,
  DollarSign,
  ShoppingBag,
  BarChart3,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";
import FeatureInfo from "./FeatureInfo";

export default function About() {
  const stats = [
    {
      id: 1,
      title: "Active Sellers on Soul Craft",
      value: "8.5k+",
      icon: <Store className="h-8 w-8" />,
    },
    {
      id: 2,
      title: "Monthly Fashion Sales",
      value: "25k+",
      icon: <DollarSign className="h-8 w-8" />,
      highlight: true,
    },
    {
      id: 3,
      title: "Active Customers in Bangladesh",
      value: "50k+",
      icon: <ShoppingBag className="h-8 w-8" />,
    },
    {
      id: 4,
      title: "Annual Sales Growth",
      value: "32%",
      icon: <BarChart3 className="h-8 w-8" />,
    },
  ];

  const team = [
    {
      id: 1,
      name: "Momim Ahmed",
      role: "Founder & CEO",
      image: "/image 46.png",
    },
    {
      id: 2,
      name: "Asif Iqbal",
      role: "Creative Director",
      image: "/image 47.png",
    },
    {
      id: 3,
      name: "Nusrat Jahan",
      role: "Operations Head",
      image: "/image 51.png",
    },
    {
      id: 4,
      name: "Nusrat Jahan",
      role: "Operations Head",
      image: "/image 51.png",
    },
  ];

  return (
    <div className="px-3 py-10">
      {/* Our Story Section */}
      <section className="grid md:grid-cols-2 gap-10 items-center mb-16">
        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-800">Our Story</h2>
          <p className="text-gray-600 mb-4 leading-relaxed">
            <span className="font-semibold text-[#f69224]">Soul Craft</span> is
            a proudly Bangladeshi online fashion marketplace, dedicated to
            bringing the best of local and global fashion right to your
            doorstep. Founded in Dhaka, we connect passionate shoppers with
            quality clothing, shoes, and accessories from trusted local and
            international brands.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Since our launch, Soul Craft has become a trusted name in online
            fashion retail, serving thousands of happy customers every month. We
            focus on delivering premium fashion products at fair prices —
            because we believe style should be accessible to everyone.
          </p>
          <p className="text-gray-600 mt-4 leading-relaxed">
            From traditional wear to modern street styles, Soul Craft celebrates
            Bangladesh’s vibrant fashion culture — built by our people, for our
            people.
          </p>
        </div>

        <div className="flex justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#f69224]/10 to-[#6fd300]/10 rounded-3xl blur-3xl"></div>
          <Image
            src="/about.png"
            alt="About Soul Craft"
            width={450}
            height={450}
            className="rounded-xl relative z-10 shadow-lg object-cover"
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        {stats.map((item) => (
          <div
            key={item.id}
            className={`flex flex-col items-center justify-center text-center border rounded-lg p-6 shadow-sm transition-all duration-300 ${
              item.highlight
                ? "bg-gradient-to-r from-[#f69224] to-[#6fd300] text-white shadow-md scale-105"
                : "bg-white hover:shadow-md"
            }`}
          >
            <div
              className={`flex items-center justify-center w-14 h-14 rounded-full mb-3 ${
                item.highlight
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {item.icon}
            </div>
            <h3 className="text-2xl font-semibold">{item.value}</h3>
            <p
              className={`text-sm mt-1 ${
                item.highlight ? "text-white/90" : "text-gray-600"
              }`}
            >
              {item.title}
            </p>
          </div>
        ))}
      </section>

      {/* Team Section */}
      <section>
        <h2 className="text-xl font-bold  mb-10 text-gray-800">
          Meet Our Team
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 text-center mb-10">
          {team?.map((member) => (
            <div key={member.id} className="group border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="relative w-[220px] h-[220px] mx-auto overflow-hidden rounded-full  bg-gray-200 ">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-contain group-hover:scale-105 rounded-full transition-transform duration-300"
                />
              </div>
              <h4 className="text-lg font-semibold mt-4">{member.name}</h4>
              <p className="text-gray-500 text-sm mb-3">{member.role}</p>
              <div className="flex justify-center gap-4 text-gray-600 text-lg">
                <Link
                  href="#"
                  className="hover:text-[#f69224] transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </Link>
                <Link
                  href="#"
                  className="hover:text-[#f69224] transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </Link>
                <Link
                  href="#"
                  className="hover:text-[#f69224] transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
        <FeatureInfo/>
      </section>
    </div>
  );
}
