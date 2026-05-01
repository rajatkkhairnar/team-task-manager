/**
 * Locale-safe date formatting utilities.
 * 
 * Using a fixed locale ("en-US") prevents hydration mismatches
 * between server and client when their system locales differ.
 */

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US");
}

export function formatDateLong(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString("en-US");
}
