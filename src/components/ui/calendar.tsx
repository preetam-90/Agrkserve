"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
    /** Pass an array of booked dates to highlight them in red */
    bookedDates?: Date[]
}

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    bookedDates = [],
    modifiers: externalModifiers,
    modifiersClassNames: externalModifiersClassNames,
    ...props
}: CalendarProps) {
    const mergedModifiers = {
        booked: bookedDates,
        ...externalModifiers,
    }

    const mergedModifierClassNames = {
        booked:
            "!bg-rose-500/10 !text-rose-400 font-semibold ring-1 ring-rose-500/30 !rounded-xl",
        ...externalModifiersClassNames,
    }

    return (
        <div className={cn(
            "mx-auto w-fit p-8 bg-[#040a16]/80 backdrop-blur-3xl border border-emerald-500/10 rounded-[3rem]",
            "shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9),0_0_20px_rgba(16,185,129,0.05)]",
            "relative overflow-hidden group",
            className
        )}>
            {/* Mesh gradient background effect */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_10%,#10b98115_0%,transparent_50%)]" />
                <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_90%,#06b6d410_0%,transparent_50%)]" />
            </div>

            {/* Dynamic background glows */}
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-emerald-500/10 blur-[100px] pointer-events-none group-hover:bg-emerald-500/20 transition-colors duration-1000" />
            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-emerald-500/10 blur-[100px] pointer-events-none group-hover:bg-emerald-500/20 transition-colors duration-1000" />

            <DayPicker
                showOutsideDays={showOutsideDays}
                className="relative z-10"
                classNames={{
                    months: "flex flex-col sm:flex-row space-y-6 sm:space-x-8 sm:space-y-0",
                    month: "space-y-8",

                    // Month Caption Header
                    month_caption: "flex justify-center relative items-center h-12 mb-4",
                    caption_label: "text-lg font-black tracking-[0.25em] uppercase text-emerald-50 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]",

                    // Navigation - Attached to the sides of the month area
                    nav: "flex items-center justify-between absolute inset-x-0 top-0 h-12 z-20 pointer-events-none",
                    button_previous: cn(
                        "flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-500 pointer-events-auto",
                        "bg-white/5 border border-white/10 text-white/40 shadow-xl backdrop-blur-md",
                        "hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/30 hover:scale-110",
                        "active:scale-95 cursor-pointer translate-x-[-15px] group/nav"
                    ),
                    button_next: cn(
                        "flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-500 pointer-events-auto",
                        "bg-white/5 border border-white/10 text-white/40 shadow-xl backdrop-blur-md",
                        "hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/30 hover:scale-110",
                        "active:scale-95 cursor-pointer translate-x-[15px] group/nav"
                    ),

                    // Grid Layout
                    month_grid: "w-full border-collapse",
                    weekdays: "flex justify-between mb-6 px-1",
                    weekday: cn(
                        "text-emerald-500/30 w-12 h-10 flex items-center justify-center",
                        "font-black text-[0.7rem] uppercase tracking-[0.35em]"
                    ),
                    week: "flex w-full mt-2 justify-between gap-2",

                    // Day styling
                    day: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                    day_button: cn(
                        "h-12 w-12 p-0 font-bold transition-all duration-500 rounded-2xl relative z-10 text-white/40",
                        "hover:bg-emerald-500/10 hover:text-emerald-400 hover:scale-110",
                        "focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    ),

                    // Today
                    today: "today text-emerald-400 font-black",

                    // Selection & Range
                    selected: cn(
                        "bg-emerald-500/10 text-emerald-400 font-black",
                        "aria-selected:bg-emerald-500 aria-selected:text-[#010816] aria-selected:shadow-[0_15px_30px_-10px_rgba(16,185,129,0.7)]",
                        "aria-selected:rounded-2xl aria-selected:scale-105 active:scale-95"
                    ),

                    range_start: "day-range-start !rounded-2xl",
                    range_end: "day-range-end !rounded-2xl",
                    range_middle: cn(
                        "!bg-emerald-500/15 !text-emerald-200 !rounded-none",
                        "first:rounded-l-2xl last:rounded-r-2xl"
                    ),

                    // Modifiers
                    outside: "text-white/5 opacity-10",
                    disabled: "text-white/5 cursor-not-allowed pointer-events-none opacity-20",
                    hidden: "invisible",
                    ...classNames,
                }}
                modifiers={mergedModifiers}
                modifiersClassNames={mergedModifierClassNames}
                components={{
                    Chevron: ({ orientation }) => {
                        const Icon = orientation === "left" ? ChevronLeft : ChevronRight
                        return <Icon className="h-6 w-6 transition-transform duration-300 group-hover/nav:scale-110" />
                    },
                }}
                footer={
                    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 mt-12 pt-10 border-t border-white/5">
                        <Legend color="bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" label="Selected" />
                        <Legend color="bg-emerald-500/20 ring-1 ring-emerald-500/40" label="Range" />
                        <Legend color="bg-white/5 border border-white/10" label="Available" />
                        <Legend color="bg-rose-500/20 ring-1 ring-rose-500/30" label="Booked" />
                    </div>
                }
                {...props}
            />

            <style jsx global>{`
                .today::after {
                    content: '';
                    position: absolute;
                    bottom: 6px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 4px;
                    height: 4px;
                    background-color: #10b981;
                    border-radius: 50%;
                    box-shadow: 0 0 8px #10b981;
                }
                .day-range-start, .day-range-end {
                    z-index: 20 !important;
                }
            `}</style>
        </div>
    )
}

function Legend({ color, label }: { color: string; label: string }) {
    return (
        <span className="flex items-center gap-2.5">
            <span className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", color)} />
            <span className="text-[10px] text-white/35 font-black uppercase tracking-[0.15em] whitespace-nowrap">{label}</span>
        </span>
    )
}

Calendar.displayName = "Calendar"

export { Calendar }