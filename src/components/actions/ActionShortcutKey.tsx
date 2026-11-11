export interface ActionShortcutKeyProps {
  children: string;
}

/** A keycap, drawn as a small block of pale stone. */
export function ActionShortcutKey({ children }: ActionShortcutKeyProps) {
  return (
    <kbd
      className="grid h-7 min-w-7 place-items-center rounded-[3px] border border-[#3d2a10] bg-[linear-gradient(180deg,#f6ebc9_0%,#d9c38c_100%)] px-1.5 font-dial text-sm font-bold leading-none text-ink shadow-[0_2px_0_#7a5a2a,0_3px_6px_rgb(0_0_0/0.6)] [text-shadow:none] transition group-hover:bg-[linear-gradient(180deg,#fff7dc_0%,#ecd9a4_100%)] md:h-8 md:min-w-8 md:text-base"
      aria-hidden="true"
    >
      {children}
    </kbd>
  );
}
