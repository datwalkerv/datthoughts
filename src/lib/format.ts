const long = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});
const short = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

/** September 12, 2026 */
export const formatDate = (date: Date) => long.format(date);
/** Sep 12 */
export const formatShortDate = (date: Date) => short.format(date);
export const isoDate = (date: Date) => date.toISOString().slice(0, 10);
export const readingLabel = (minutes: number) => `${minutes} min read`;
