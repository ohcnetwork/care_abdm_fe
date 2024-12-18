import { clsx, type ClassValue } from "clsx"
import dayjs from "@/lib/dayjs";
import { twMerge } from "tailwind-merge";
import phoneCodesJson from "@/static/countryPhoneAndFlags.json";
import { AREACODES, IN_LANDLINE_AREA_CODES } from "@/static/phoneCodes";

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

export type CountryData = {
  flag: string;
  name: string;
  code: string;
};

export const formatPhoneNumber = (phoneNumber: string) => {
  if (phoneNumber.startsWith("+91")) {
    phoneNumber = phoneNumber.startsWith("+910")
      ? phoneNumber.slice(4)
      : phoneNumber.slice(3);
    const landline_code = IN_LANDLINE_AREA_CODES.find((code) =>
      phoneNumber.startsWith(code)
    );
    if (landline_code === undefined)
      return "+91" + " " + phoneNumber.slice(0, 5) + " " + phoneNumber.slice(5);
    const subscriber_no_length = 10 - landline_code.length;
    return (
      "+91" +
      " " +
      landline_code +
      " " +
      phoneNumber.slice(
        landline_code.length,
        subscriber_no_length / 2 + landline_code.length
      ) +
      " " +
      phoneNumber.slice(subscriber_no_length / 2 + landline_code.length)
    );
  } else if (phoneNumber.startsWith("1800")) {
    return "1800" + " " + phoneNumber.slice(4, 7) + " " + phoneNumber.slice(7);
  } else if (phoneNumber.startsWith("+")) {
    const countryCode = getCountryCode(phoneNumber);
    if (!countryCode) return phoneNumber;
    const phoneCodes: Record<string, CountryData> = phoneCodesJson;
    return (
      "+" +
      phoneCodes[countryCode].code +
      " " +
      phoneNumber.slice(phoneCodes[countryCode].code.length + 1)
    );
  }
  return phoneNumber;
};

export const getCountryCode = (phoneNumber: string) => {
  if (phoneNumber.startsWith("+")) {
    const phoneCodes: Record<string, CountryData> = phoneCodesJson;
    const phoneCodesArr = Object.keys(phoneCodes);
    phoneNumber = phoneNumber.slice(1);
    const allMatchedCountries: { name: string; code: string }[] = [];
    for (let i = 0; i < phoneCodesArr.length; i++) {
      if (
        phoneNumber.startsWith(
          phoneCodes[phoneCodesArr[i]].code.replace(/-/g, "")
        )
      ) {
        allMatchedCountries.push({
          name: phoneCodesArr[i],
          code: phoneCodes[phoneCodesArr[i]].code.replace(/-/g, ""),
        });
      }
    }
    // returns the country which is longest in case there are multiple matches
    if (allMatchedCountries.length === 0) return undefined;
    const matchedCountry = allMatchedCountries.reduce((max, country) =>
      max.code > country.code ? max : country
    );
    const sameCodeCountries = allMatchedCountries.filter(
      (country) => country.code === matchedCountry.code
    );
    if (matchedCountry === undefined) return undefined;
    // some countries share same country code but differ in area codes
    // The area codes are checked for such countries
    if (matchedCountry.code == "1") {
      const areaCode = phoneNumber.substring(1, 4);
      return (
        sameCodeCountries.find((country) =>
          AREACODES[country.name]?.includes(areaCode)
        )?.name ?? "US"
      );
    } else if (matchedCountry.code === "262") {
      const areaCode = phoneNumber.substring(3, 6);
      return sameCodeCountries.find((country) =>
        AREACODES[country.name]?.includes(areaCode)
      )?.name;
    } else if (matchedCountry.code === "61") {
      const areaCode = phoneNumber.substring(2, 7);
      return (
        sameCodeCountries.find((country) =>
          AREACODES[country.name]?.includes(areaCode)
        )?.name ?? "AU"
      );
    } else if (matchedCountry.code === "599") {
      const areaCode = phoneNumber.substring(3, 4);
      return (
        sameCodeCountries.find((country) =>
          AREACODES[country.name]?.includes(areaCode)
        )?.name ?? "CW"
      );
    } else if (matchedCountry.code == "7") {
      const areaCode = phoneNumber.substring(1, 2);
      return (
        sameCodeCountries.find((country) =>
          AREACODES[country.name]?.includes(areaCode)
        )?.name ?? "RU"
      );
    } else if (matchedCountry.code == "47") {
      const areaCode = phoneNumber.substring(2, 4);
      return (
        sameCodeCountries.find((country) =>
          AREACODES[country.name]?.includes(areaCode)
        )?.name ?? "NO"
      );
    }
    return matchedCountry.name;
  }
  return undefined;
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

export const compareBy = <T extends object>(key: keyof T) => {
  return (a: T, b: T) => {
    return a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0;
  };
};

/**
 * A utility method to format an array of string to human readable format.
 *
 * @param values Array of strings to be made human readable.
 * @returns Human readable version of the list of strings
 */
export const humanizeStrings = (strings: readonly string[], empty = "") => {
  if (strings.length === 0) {
    return empty;
  }

  if (strings.length === 1) {
    return strings[0];
  }

  const [last, ...items] = [...strings].reverse();
  return `${items.reverse().join(", ")} and ${last}`;
};