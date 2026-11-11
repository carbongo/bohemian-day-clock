import { useEffect } from "react";
import type { ReactNode } from "react";

import { ActionShortcutKey } from "./ActionShortcutKey";

interface BaseActionProps {
  label: ReactNode;
  /** A `KeyboardEvent.key` value: "s", "Enter", "ArrowUp". */
  shortcutKey: string;
}

interface ActionLinkProps extends BaseActionProps {
  href: string;
}

interface ActionButtonProps extends BaseActionProps {
  /** For a prompt that opens a panel: whether it is open, and its id. */
  controls?: string;
  isOpen?: boolean;
  onPress: () => void;
}

export type ActionProps = ActionLinkProps | ActionButtonProps;

const ACTION_CLASS_NAME =
  "group flex cursor-pointer items-center justify-end gap-3 rounded-sm px-2 py-1 font-dial text-base text-vellum transition [text-shadow:0_1px_3px_rgb(0_0_0/0.9)] hover:text-white focus-visible:outline-2 focus-visible:outline-gilt md:text-xl";
const KEY_LABELS: Record<string, string> = {
  arrowdown: "↓",
  arrowleft: "←",
  arrowright: "→",
  arrowup: "↑",
  enter: "↵",
  escape: "Esc",
};

/** A key prompt: what a key does, with its keycap. Also a button to tap. */
export function Action(props: ActionProps) {
  const href = "href" in props ? props.href : undefined;
  const onPress = "onPress" in props ? props.onPress : undefined;
  const shortcutKey = props.shortcutKey.toLowerCase();
  const shortcutLabel = KEY_LABELS[shortcutKey] ?? shortcutKey.toUpperCase();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.key.toLowerCase() !== shortcutKey ||
        (shortcutKey !== "escape" && isEditableElement(event.target))
      ) {
        return;
      }

      event.preventDefault();

      if (href) {
        window.open(href, "_blank", "noopener,noreferrer");
        return;
      }

      onPress?.();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [href, onPress, shortcutKey]);

  const content = (
    <>
      {props.label}
      <ActionShortcutKey>{shortcutLabel}</ActionShortcutKey>
    </>
  );

  if ("href" in props) {
    return (
      <a
        className={ACTION_CLASS_NAME}
        href={props.href}
        rel="noreferrer"
        target="_blank"
        aria-keyshortcuts={props.shortcutKey}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={ACTION_CLASS_NAME}
      aria-controls={props.controls}
      aria-expanded={props.isOpen}
      aria-keyshortcuts={props.shortcutKey}
      onClick={props.onPress}
    >
      {content}
    </button>
  );
}

function isEditableElement(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target.matches("input, select, textarea, [role='textbox']")
  );
}
