import type { ZonedDate } from "./time";

interface Feast {
  name: string;
  /** False for days that are not called "Feast of …", such as Christmas. */
  saint?: boolean;
}

const MS_PER_DAY = 86_400_000;
const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** Fixed feasts of the old calendar, as [month, day, name, saint?]. */
const FIXED_FEASTS: [number, number, string, boolean?][] = [
  [1, 1, "the Circumcision"],
  [1, 6, "Epiphany", false],
  [1, 13, "St Hilary"],
  [1, 17, "St Anthony"],
  [1, 20, "St Sebastian"],
  [1, 21, "St Agnes"],
  [1, 22, "St Vincent"],
  [1, 25, "the Conversion of St Paul"],
  [2, 2, "Candlemas", false],
  [2, 3, "St Blaise"],
  [2, 5, "St Agatha"],
  [2, 14, "St Valentine"],
  [2, 22, "St Peter's Chair"],
  [2, 24, "St Matthias"],
  [3, 12, "St Gregory"],
  [3, 17, "St Gertrude"],
  [3, 19, "St Joseph"],
  [3, 21, "St Benedict"],
  [3, 25, "the Annunciation"],
  [4, 23, "St George"],
  [4, 25, "St Mark"],
  [5, 1, "SS Philip and James"],
  [5, 3, "the Finding of the Cross"],
  [5, 25, "St Urban"],
  [6, 11, "St Barnabas"],
  [6, 15, "St Vitus"],
  [6, 24, "St John the Baptist"],
  [6, 29, "SS Peter and Paul"],
  [7, 2, "the Visitation"],
  [7, 4, "St Procopius"],
  [7, 20, "St Margaret"],
  [7, 22, "St Mary Magdalene"],
  [7, 25, "St James"],
  [7, 26, "St Anne"],
  [8, 1, "St Peter in Chains"],
  [8, 6, "the Transfiguration"],
  [8, 10, "St Lawrence"],
  [8, 15, "the Assumption"],
  [8, 24, "St Bartholomew"],
  [8, 28, "St Augustine"],
  [8, 29, "the Beheading of St John"],
  [9, 1, "St Giles"],
  [9, 8, "the Nativity of Mary"],
  [9, 14, "the Exaltation of the Cross"],
  [9, 21, "St Matthew"],
  [9, 28, "St Wenceslas"],
  [9, 29, "Michaelmas", false],
  [9, 30, "St Jerome"],
  [10, 4, "St Francis"],
  [10, 9, "St Denis"],
  [10, 16, "St Gall"],
  [10, 18, "St Luke"],
  [10, 21, "St Ursula"],
  [10, 28, "SS Simon and Jude"],
  [11, 1, "All Saints", false],
  [11, 2, "All Souls", false],
  [11, 11, "St Martin"],
  [11, 19, "St Elizabeth"],
  [11, 22, "St Cecilia"],
  [11, 23, "St Clement"],
  [11, 25, "St Catherine"],
  [11, 30, "St Andrew"],
  [12, 4, "St Barbara"],
  [12, 6, "St Nicholas"],
  [12, 8, "the Conception of Mary"],
  [12, 13, "St Lucy"],
  [12, 21, "St Thomas"],
  [12, 25, "Christmas", false],
  [12, 26, "St Stephen"],
  [12, 27, "St John the Evangelist"],
  [12, 28, "the Holy Innocents"],
  [12, 31, "St Sylvester"],
];

/** Feasts that move with Easter, as [days from Easter Sunday, name]. */
const MOVABLE_FEASTS: [number, string][] = [
  [-46, "Ash Wednesday"],
  [-7, "Palm Sunday"],
  [-3, "Maundy Thursday"],
  [-2, "Good Friday"],
  [-1, "Holy Saturday"],
  [0, "Easter Sunday"],
  [1, "Easter Monday"],
  [39, "the Ascension"],
  [49, "Pentecost"],
  [56, "Trinity Sunday"],
  [60, "Corpus Christi"],
];

/**
 * The day named the way a medieval charter dates it: by the feast it falls
 * on, the eve of one, or the weekday before or after the nearest one.
 */
export function getFeastDayLabel({ year, month, day, weekday }: ZonedDate) {
  const today = Date.UTC(year, month - 1, day);
  const weekdayName = WEEKDAYS[weekday] ?? "";
  const feasts = [year - 1, year, year + 1].flatMap(getFeastsOfYear);
  let before: { time: number; feast: Feast } | undefined;
  let after: { time: number; feast: Feast } | undefined;

  for (const entry of feasts) {
    if (entry.time === today) {
      const title = getFeastTitle(entry.feast);

      // "Easter Sunday" already names its weekday.
      return title.includes(weekdayName) ? title : `${weekdayName}, ${title}`;
    }

    if (entry.time < today && (!before || entry.time > before.time)) {
      before = entry;
    }

    if (entry.time > today && (!after || entry.time < after.time)) {
      after = entry;
    }
  }

  if (!before || !after) {
    return weekdayName;
  }

  if (after.time - today === MS_PER_DAY) {
    return `${weekdayName}, Eve of ${after.feast.name}`;
  }

  return today - before.time <= after.time - today
    ? `${weekdayName} after ${before.feast.name}`
    : `${weekdayName} before ${after.feast.name}`;
}

function getFeastTitle({ name, saint }: Feast) {
  return saint === false ? name : `Feast of ${name}`;
}

function getFeastsOfYear(year: number) {
  const easter = getEasterSunday(year);
  const fixed = FIXED_FEASTS.map(([month, day, name, saint]) => ({
    time: Date.UTC(year, month - 1, day),
    feast: { name, saint },
  }));
  const movable = MOVABLE_FEASTS.map(([offset, name]) => ({
    time: easter + offset * MS_PER_DAY,
    feast: { name, saint: false },
  }));

  // A movable feast outranks a fixed one that lands on the same day.
  return [...movable, ...fixed];
}

/** Gregorian Easter Sunday (Meeus/Jones/Butcher), as UTC midnight. */
function getEasterSunday(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return Date.UTC(year, month - 1, day);
}
