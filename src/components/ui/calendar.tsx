import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface CalendarProps {
  className?: string;
  selected?: Date | { from: Date; to?: Date };
  onSelect?: (date: Date | { from: Date; to?: Date } | undefined) => void;
  mode?: "single" | "range";
  numberOfMonths?: number;
  initialFocus?: boolean;
  defaultMonth?: Date;
}

function Calendar({
  className,
  selected,
  onSelect,
  mode = "single",
  numberOfMonths = 1,
  ...props
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(
    props.defaultMonth || new Date()
  );

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );

    if (mode === "single") {
      onSelect?.(clickedDate);
    } else if (mode === "range") {
      if (!selected || typeof selected === "object" && "from" in selected) {
        const rangeSelected = selected as { from: Date; to?: Date } | undefined;
        if (!rangeSelected?.from || (rangeSelected.from && rangeSelected.to)) {
          onSelect?.({ from: clickedDate });
        } else {
          const from = rangeSelected.from;
          const to = clickedDate;
          if (to < from) {
            onSelect?.({ from: to, to: from });
          } else {
            onSelect?.({ from, to });
          }
        }
      }
    }
  };

  const isDateSelected = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    if (mode === "single") {
      return selected instanceof Date && 
             selected.toDateString() === date.toDateString();
    } else if (mode === "range" && selected && typeof selected === "object" && "from" in selected) {
      const rangeSelected = selected as { from: Date; to?: Date };
      if (!rangeSelected.to) {
        return rangeSelected.from.toDateString() === date.toDateString();
      }
      return date >= rangeSelected.from && date <= rangeSelected.to;
    }
    
    return false;
  };

  const isToday = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className={cn("p-3", className)}>
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousMonth}
          className="h-7 w-7 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="text-sm font-medium">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={goToNextMonth}
          className="h-7 w-7 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground p-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="p-2" />
        ))}
        
        {days.map((day) => (
          <Button
            key={day}
            variant={isDateSelected(day) ? "default" : "ghost"}
            size="sm"
            onClick={() => handleDateClick(day)}
            className={cn(
              "h-9 w-9 p-0 font-normal",
              isToday(day) && !isDateSelected(day) && "bg-accent text-accent-foreground",
              isDateSelected(day) && "bg-primary text-primary-foreground"
            )}
          >
            {day}
          </Button>
        ))}
      </div>
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };