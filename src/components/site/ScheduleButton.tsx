import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site-config";
import { CalendarClock } from "lucide-react";

export function ScheduleButton({
  size = "lg",
  variant = "default",
  className,
  label = "Schedule a Consultation",
}: {
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline";
  className?: string;
  label?: string;
}) {
  return (
    <Button asChild size={size} variant={variant} className={className}>
      <a href={SITE.calendlyUrl} target="_blank" rel="noreferrer">
        <CalendarClock className="mr-1 h-4 w-4" />
        {label}
      </a>
    </Button>
  );
}
