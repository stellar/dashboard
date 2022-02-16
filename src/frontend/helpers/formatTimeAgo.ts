import { formatDistance } from "date-fns";
import enLocale from "date-fns/locale/en-US";

export const formatTimeAgo = (date: string) =>
  formatDistance(new Date(date), new Date(), {
    addSuffix: true,
    locale: enLocale,
  });
