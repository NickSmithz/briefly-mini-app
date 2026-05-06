import { addDays, format, isBefore, isToday as dfIsToday, parseISO, startOfDay } from "date-fns";
import { ru } from "date-fns/locale";

export function formatDate(date: string): string {
  if (!date) return "Без даты";
  return format(parseISO(date), "d MMMM yyyy", { locale: ru });
}

export function formatDateShort(date: string): string {
  if (!date) return "Без даты";
  return format(parseISO(date), "d MMM", { locale: ru });
}

export function isToday(date: string): boolean {
  return Boolean(date) && dfIsToday(parseISO(date));
}

export function isOverdue(date: string): boolean {
  return Boolean(date) && isBefore(parseISO(date), startOfDay(new Date()));
}

export function addDaysToISO(date: string, days: number): string {
  return format(addDays(parseISO(date), days), "yyyy-MM-dd");
}

export function sortByDate<T>(items: T[], dateField: keyof T): T[] {
  return [...items].sort((a, b) => String(a[dateField] || "").localeCompare(String(b[dateField] || "")));
}
