import { parse } from "date-fns";
import enLocale from "date-fns/locale/en-US";

export const parseDateFromFormat = (
  formattedDate: string,
  formatString: string,
): Date => {
  return parse(formattedDate, formatString, new Date(), { locale: enLocale });
};
