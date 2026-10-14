import {useEffect, useRef, type ReactNode} from 'react';
import {revealDestination} from '../shared/navigation';

/** Runs only when a new screen mounts, never on filters, saves or dropdowns. */
export default function ScreenDestination({children, preserveScroll = false}: {children: ReactNode; preserveScroll?: boolean}) {
  const destination = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (preserveScroll) return;
    const frame = requestAnimationFrame(() => revealDestination(destination.current, 'page'));
    return () => cancelAnimationFrame(frame);
  }, [preserveScroll]);
  return <div ref={destination} tabIndex={-1} className="flex w-full flex-col items-center outline-none">{children}</div>;
}
