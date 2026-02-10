
export interface HijriDate {
  day: number;
  month: number;
  year: number;
  monthName: string;
}

export interface CalendarDay {
  date: Date;
  hijri: HijriDate;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export interface DailyInsight {
  topic: string;
  content: string;
  emoji: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  color: string;
  time?: string;
}
