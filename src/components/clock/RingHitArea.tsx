import type { MouseEvent } from "react";

import { MINUTES_PER_DAY, MINUTES_PER_HOUR } from "../../domain/time";
import {
  CLOCK_CENTER,
  CLOCK_VIEW_BOX,
  PLASTER_RING_CLIP_PATH,
} from "./lib/clockGeometry";

interface RingHitAreaProps {
  /** Minutes of the day under the pointer at the top of the dial. */
  nowMinutes: number;
  /** Called with the wait, in minutes, up to the hour that was clicked. */
  onPick: (minutes: number) => void;
}

/** Makes the hours of the ring clickable: a click waits until that hour. */
export function RingHitArea({ nowMinutes, onPick }: RingHitAreaProps) {
  function handleClick(event: MouseEvent<SVGPathElement>) {
    const svg = event.currentTarget.ownerSVGElement;
    const matrix = svg?.getScreenCTM();

    if (!svg || !matrix) {
      return;
    }

    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      matrix.inverse(),
    );
    const turn =
      (Math.atan2(point.x - CLOCK_CENTER, CLOCK_CENTER - point.y) /
        (2 * Math.PI) +
        1) %
      1;
    const clickedHour =
      Math.round((nowMinutes + turn * MINUTES_PER_DAY) / MINUTES_PER_HOUR) *
      MINUTES_PER_HOUR;
    const wait = (clickedHour - nowMinutes) % MINUTES_PER_DAY;

    onPick(wait > 0 ? wait : wait + MINUTES_PER_DAY);
  }

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-30 h-full w-full"
      viewBox={CLOCK_VIEW_BOX}
    >
      <path
        className="pointer-events-auto cursor-pointer"
        d={PLASTER_RING_CLIP_PATH}
        fill="transparent"
        fillRule="evenodd"
        onClick={handleClick}
      >
        <title>Wait until this hour</title>
      </path>
    </svg>
  );
}
