import Link from "next/link";
import { cn } from "@/lib/utils";


export default function Logo({className}) {
  return (
    <Link href="/">
      <h1 className={cn("text-2xl font-bold tracking-tight  uppercase ", className)}>
        New<span className="text-red-700">Fashion</span>
      </h1>
    </Link>
  );
}
