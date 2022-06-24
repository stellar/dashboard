import { format } from "date-fns";
import enLocale from "date-fns/locale/en-US";

export const formatDate = (date: string | Date, formatString: string) => {
  const d = typeof date === "string" ? new Date(date) : date;
  const options = {
    locale: enLocale,
  };

  return format(d, formatString, options);
};
