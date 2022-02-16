import { format } from "date-fns";
import enLocale from "date-fns/locale/en-US";

export const formatFullDateTimeUtc = (date: string) => {
  const d = new Date(date);
  const options = {
    locale: enLocale,
  };

  const fullDate = format(d, "PPPP", options);
  const localTime = format(d, "p", options);
  const utcTime = d.toLocaleTimeString("en-US", {
    timeZone: "UTC",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  return `${fullDate} at ${utcTime} UTC (${localTime} local time)`;
};
