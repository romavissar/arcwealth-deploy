"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-1", className)}
      classNames={{
        root: "w-[18.5rem] text-gray-900 dark:text-gray-100",
        months: "flex flex-col gap-2",
        month: "space-y-3",
        month_caption: "relative flex h-10 items-center justify-center",
        caption_label: "text-sm font-semibold tracking-tight",
        nav: "absolute inset-x-0 top-0 z-10 flex items-center justify-between px-0.5",
        button_previous:
          "relative z-20 pointer-events-auto inline-flex h-10 w-10 cursor-pointer touch-manipulation items-center justify-center rounded-md text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100",
        button_next:
          "relative z-20 pointer-events-auto inline-flex h-10 w-10 cursor-pointer touch-manipulation items-center justify-center rounded-md text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100",
        month_grid: "w-full border-collapse table-fixed",
        weekdays: "border-b border-gray-200 dark:border-gray-700",
        weekday: "h-9 w-10 pb-1 text-center text-xs font-medium text-gray-500 dark:text-gray-400",
        week: "h-10",
        day: "p-0 text-center",
        day_button:
          "h-10 w-10 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:hover:bg-gray-800 dark:focus-visible:ring-offset-gray-900",
        selected:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "ring-1 ring-inset ring-primary/60",
        outside: "text-gray-400 opacity-60 dark:text-gray-500",
        disabled: "opacity-40",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ className, orientation, ...iconProps }) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("h-4 w-4", className)} {...iconProps} />
          ) : (
            <ChevronRight className={cn("h-4 w-4", className)} {...iconProps} />
          ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
