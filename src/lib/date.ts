// Date/time utility functions for flights and calendars.

export const formatDuration = (minutes: number): string => {
  if (minutes < 0) return "0m";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${String(remainingMinutes).padStart(2, "0")}m`;
};

export const formatDateTime = (
  dateParts: readonly number[],
  timeParts: readonly number[]
): string => {
  const [year = 1970, month = 1, day = 1] = dateParts;
  const [hours = 0, minutes = 0] = timeParts;

  const y = String(year).padStart(4, "0");
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  const h = String(hours).padStart(2, "0");
  const min = String(minutes).padStart(2, "0");

  return `${y}-${m}-${d}T${h}:${min}`;
};

export const addDays = (dateStr: string, days: number): string => {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0]!;
};

export const daysBetween = (startStr: string, endStr: string): number => {
  const start = new Date(startStr + "T00:00:00Z").getTime();
  const end = new Date(endStr + "T00:00:00Z").getTime();
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
};

export const isValidDate = (dateStr: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr + "T00:00:00Z");
  return !isNaN(d.getTime()) && d.toISOString().startsWith(dateStr);
};
