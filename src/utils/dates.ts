import { addDays, format, isPast, isToday as isTodayFn, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

export const formatDate = (date: string) => format(parseISO(date), "d MMMM yyyy", { locale: ru });
export const formatDateShort = (date: string) => format(parseISO(date), "d MMM", { locale: ru });
export const isToday = (date: string) => isTodayFn(parseISO(date));
export const isOverdue = (date: string) => isPast(parseISO(date)) && !isToday(date);
export const addDaysToISO = (date: string, days: number) => format(addDays(parseISO(date), days), "yyyy-MM-dd");
export const sortByDate = <T extends Record<string, unknown>>(items: T[], dateField: keyof T) =>
  [...items].sort((a, b) => String(a[dateField]).localeCompare(String(b[dateField])));
