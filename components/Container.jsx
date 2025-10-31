import { cn } from "@/lib/utils";

export default function Container({ children, className }) {
  return (
    <div className={cn("max-w-[1264px] mx-auto px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}
