export interface TimeZoneCity {
  label: string;
  timeZone: string;
  latitude: number;
  longitude: number;
}

const FALLBACK_CITY: TimeZoneCity = {
  label: "Kutna Hora",
  timeZone: "Europe/Prague",
  latitude: 49.9484,
  longitude: 15.2682,
};

const KNOWN_TIME_ZONE_CITIES: TimeZoneCity[] = [
  {
    label: "Kutna Hora",
    timeZone: "Europe/Prague",
    latitude: 49.9484,
    longitude: 15.2682,
  },
  {
    label: "Almaty",
    timeZone: "Asia/Almaty",
    latitude: 43.2389,
    longitude: 76.8897,
  },
  {
    label: "Anchorage",
    timeZone: "America/Anchorage",
    latitude: 61.2176,
    longitude: -149.8997,
  },
  {
    label: "Auckland",
    timeZone: "Pacific/Auckland",
    latitude: -36.8509,
    longitude: 174.7645,
  },
  {
    label: "Bangkok",
    timeZone: "Asia/Bangkok",
    latitude: 13.7563,
    longitude: 100.5018,
  },
  {
    label: "Berlin",
    timeZone: "Europe/Berlin",
    latitude: 52.52,
    longitude: 13.405,
  },
  {
    label: "Buenos Aires",
    timeZone: "America/Argentina/Buenos_Aires",
    latitude: -34.6037,
    longitude: -58.3816,
  },
  {
    label: "Cairo",
    timeZone: "Africa/Cairo",
    latitude: 30.0444,
    longitude: 31.2357,
  },
  {
    label: "Casablanca",
    timeZone: "Africa/Casablanca",
    latitude: 33.5731,
    longitude: -7.5898,
  },
  {
    label: "Chatham Islands",
    timeZone: "Pacific/Chatham",
    latitude: -43.9535,
    longitude: -176.5597,
  },
  {
    label: "Chicago",
    timeZone: "America/Chicago",
    latitude: 41.8781,
    longitude: -87.6298,
  },
  {
    label: "Denver",
    timeZone: "America/Denver",
    latitude: 39.7392,
    longitude: -104.9903,
  },
  {
    label: "Dubai",
    timeZone: "Asia/Dubai",
    latitude: 25.2048,
    longitude: 55.2708,
  },
  {
    label: "Hong Kong",
    timeZone: "Asia/Hong_Kong",
    latitude: 22.3193,
    longitude: 114.1694,
  },
  {
    label: "Honolulu",
    timeZone: "Pacific/Honolulu",
    latitude: 21.3099,
    longitude: -157.8581,
  },
  {
    label: "Istanbul",
    timeZone: "Europe/Istanbul",
    latitude: 41.0082,
    longitude: 28.9784,
  },
  {
    label: "Jakarta",
    timeZone: "Asia/Jakarta",
    latitude: -6.2088,
    longitude: 106.8456,
  },
  {
    label: "Johannesburg",
    timeZone: "Africa/Johannesburg",
    latitude: -26.2041,
    longitude: 28.0473,
  },
  {
    label: "Kiritimati",
    timeZone: "Pacific/Kiritimati",
    latitude: 1.8721,
    longitude: -157.4278,
  },
  {
    label: "Kolkata",
    timeZone: "Asia/Kolkata",
    latitude: 22.5726,
    longitude: 88.3639,
  },
  {
    label: "Lagos",
    timeZone: "Africa/Lagos",
    latitude: 6.5244,
    longitude: 3.3792,
  },
  {
    label: "Lima",
    timeZone: "America/Lima",
    latitude: -12.0464,
    longitude: -77.0428,
  },
  {
    label: "London",
    timeZone: "Europe/London",
    latitude: 51.5072,
    longitude: -0.1276,
  },
  {
    label: "Los Angeles",
    timeZone: "America/Los_Angeles",
    latitude: 34.0522,
    longitude: -118.2437,
  },
  {
    label: "Mexico City",
    timeZone: "America/Mexico_City",
    latitude: 19.4326,
    longitude: -99.1332,
  },
  {
    label: "Moscow",
    timeZone: "Europe/Moscow",
    latitude: 55.7558,
    longitude: 37.6173,
  },
  {
    label: "Nairobi",
    timeZone: "Africa/Nairobi",
    latitude: -1.2921,
    longitude: 36.8219,
  },
  {
    label: "New York",
    timeZone: "America/New_York",
    latitude: 40.7128,
    longitude: -74.006,
  },
  {
    label: "Pago Pago",
    timeZone: "Pacific/Pago_Pago",
    latitude: -14.2756,
    longitude: -170.702,
  },
  {
    label: "Paris",
    timeZone: "Europe/Paris",
    latitude: 48.8566,
    longitude: 2.3522,
  },
  {
    label: "Reykjavik",
    timeZone: "Atlantic/Reykjavik",
    latitude: 64.1466,
    longitude: -21.9426,
  },
  {
    label: "Santiago",
    timeZone: "America/Santiago",
    latitude: -33.4489,
    longitude: -70.6693,
  },
  {
    label: "Sao Paulo",
    timeZone: "America/Sao_Paulo",
    latitude: -23.5558,
    longitude: -46.6396,
  },
  {
    label: "Seoul",
    timeZone: "Asia/Seoul",
    latitude: 37.5665,
    longitude: 126.978,
  },
  {
    label: "Shanghai",
    timeZone: "Asia/Shanghai",
    latitude: 31.2304,
    longitude: 121.4737,
  },
  {
    label: "Singapore",
    timeZone: "Asia/Singapore",
    latitude: 1.3521,
    longitude: 103.8198,
  },
  {
    label: "Sydney",
    timeZone: "Australia/Sydney",
    latitude: -33.8688,
    longitude: 151.2093,
  },
  {
    label: "Tokyo",
    timeZone: "Asia/Tokyo",
    latitude: 35.6762,
    longitude: 139.6503,
  },
  {
    label: "UTC",
    timeZone: "UTC",
    latitude: 51.4769,
    longitude: 0,
  },
  {
    label: "Vancouver",
    timeZone: "America/Vancouver",
    latitude: 49.2827,
    longitude: -123.1207,
  },
  {
    label: "Yakutsk",
    timeZone: "Asia/Yakutsk",
    latitude: 62.0355,
    longitude: 129.6755,
  },
];

const TIME_ZONE_CITIES: Record<string, TimeZoneCity> = Object.fromEntries(
  KNOWN_TIME_ZONE_CITIES.map((city) => [city.timeZone, city]),
);

export function getResolvedTimeZone() {
  return (
    Intl.DateTimeFormat().resolvedOptions().timeZone || FALLBACK_CITY.timeZone
  );
}

export function getTimeZoneCity(timeZone = getResolvedTimeZone()) {
  const currentTimeZone = getResolvedTimeZone();

  if (timeZone === currentTimeZone) {
    return getCurrentTimeZoneCity(currentTimeZone);
  }

  return TIME_ZONE_CITIES[timeZone] ?? getCurrentTimeZoneCity(currentTimeZone);
}

export function getTimeZoneCities() {
  const currentCity = getCurrentTimeZoneCity();

  return [
    currentCity,
    ...KNOWN_TIME_ZONE_CITIES.filter(
      (city) => city.timeZone !== currentCity.timeZone,
    ),
  ];
}

export function getCitySlug(city: TimeZoneCity) {
  return city.label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** The city a shared link names, by slug ("kutna-hora") or IANA timezone. */
export function findCityByLinkValue(value: string) {
  const wanted = value.trim().toLowerCase();

  return getTimeZoneCities().find(
    (city) =>
      getCitySlug(city) === wanted || city.timeZone.toLowerCase() === wanted,
  );
}

export function isKnownTimeZoneCity(timeZone: string) {
  return timeZone === getResolvedTimeZone() || timeZone in TIME_ZONE_CITIES;
}

function getCurrentTimeZoneCity(
  timeZone = getResolvedTimeZone(),
): TimeZoneCity {
  const city = TIME_ZONE_CITIES[timeZone] ?? FALLBACK_CITY;

  return {
    ...city,
    label:
      city.timeZone === timeZone
        ? city.label
        : getCityLabelFromTimeZone(timeZone),
    timeZone,
  };
}

function getCityLabelFromTimeZone(timeZone: string) {
  const citySegment = timeZone.split("/").at(-1);

  if (!citySegment) {
    return FALLBACK_CITY.label;
  }

  return citySegment.replaceAll("_", " ");
}
