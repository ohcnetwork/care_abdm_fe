import { clsx, type ClassValue } from "clsx"
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";
import phoneCodesJson from "@/static/countryPhoneAndFlags.json";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type DateLike = Parameters<typeof dayjs>[0];

const DATE_FORMAT = "DD/MM/YYYY";
const TIME_FORMAT = "hh:mm A";
const DATE_TIME_FORMAT = `${TIME_FORMAT}; ${DATE_FORMAT}`;

export const formatDateTime = (date: DateLike, format?: string) => {
  const obj = dayjs(date);

  if (format) {
    return obj.format(format);
  }

  // If time is 00:00:00 of local timezone, format as date only
  if (obj.isSame(obj.startOf("day"))) {
    return obj.format(DATE_FORMAT);
  }

  return obj.format(DATE_TIME_FORMAT);
};

type CountryData = {
  flag: string;
  name: string;
  code: string;
};

export const parsePhoneNumber = (phoneNumber: string, countryCode?: string) => {
  if (!phoneNumber) return "";
  if (phoneNumber === "+91") return "";
  const phoneCodes: Record<string, CountryData> = phoneCodesJson;
  let parsedNumber = phoneNumber.replace(/[-+() ]/g, "");
  if (countryCode && phoneCodes[countryCode]) {
    parsedNumber = phoneCodes[countryCode].code + parsedNumber;
  } else if (!phoneNumber.startsWith("+")) {
    return undefined;
  }
  parsedNumber = "+" + parsedNumber;
  return parsedNumber;
};