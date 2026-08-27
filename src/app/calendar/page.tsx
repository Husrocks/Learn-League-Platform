"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Flame } from "lucide-react";

export default function CalendarPage() {
  const { currentUser } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!currentUser || !isMounted) return null;

  // Simple calendar generation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const today = new Date();
  
  // Mock active days logic
  const getDayStatus = (day: number) => {
    if (year === today.getFullYear() && month === today.getMonth() && day > today.getDate()) {
      return "future";
    }
    // Deterministic for visual effect, except today is always active
    if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
      return "active";
    }
    return (day % 3 !== 0) ? "active" : "inactive";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500 pb-12">
      
      <header className="space-y-4 border-b border-[var(--color-border)] pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-md bg-[var(--color-accent)]/20 flex items-center justify-center">
            <CalendarIcon className="w-6 h-6 text-[var(--color-accent)]" />
          </div>
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-white">Learning Calendar</h1>
            <p className="text-[var(--color-muted-foreground)] mt-1 flex items-center gap-2">
              Track your daily consistency. Current streak: {currentUser.streak} <Flame className="w-4 h-4 text-[var(--color-accent)]" />
            </p>
          </div>
        </div>
      </header>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <h2 className="text-xl font-medium text-white">
            {monthNames[month]} {year}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-[var(--color-surface-hover)] rounded-md transition-colors">
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-[var(--color-surface-hover)] rounded-md transition-colors">
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-px bg-[var(--color-border)]">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="bg-[var(--color-surface)] p-3 text-center text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-[var(--color-border)]">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-[var(--color-surface)]/50 min-h-[100px]" />
          ))}
          
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const status = getDayStatus(day);
            const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
            
            return (
              <div 
                key={day} 
                className={`min-h-[100px] p-2 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] transition-colors ${isToday ? 'ring-inset ring-2 ring-[var(--color-accent)]' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-sm font-medium ${isToday ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted-foreground)]'}`}>
                    {day}
                  </span>
                  {status === "active" && (
                    <Flame className="w-4 h-4 text-[var(--color-accent)]" />
                  )}
                </div>
                
                {status === "active" && (
                  <div className="mt-3">
                    <div className="w-full bg-[var(--color-accent)]/20 text-[var(--color-accent)] text-[10px] font-medium px-1.5 py-0.5 rounded-sm truncate">
                      Goal met
                    </div>
                  </div>
                )}
                
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
