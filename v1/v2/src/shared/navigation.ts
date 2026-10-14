/** Reveal a navigation destination without affecting unrelated local controls. */
export function revealDestination(node: HTMLElement | null, kind: 'page' | 'section' = 'section'): boolean {
  if (!node || node.closest('[hidden]') || typeof window === 'undefined') return false;
  if (kind === 'page') window.scrollTo({top: 0, behavior: 'instant'});
  else node.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start'});
  node.focus({preventScroll: true});
  return true;
}
