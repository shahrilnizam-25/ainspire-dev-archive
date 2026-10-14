import { useEffect, useState, useSyncExternalStore } from 'react';
import { accessFor, type DemoProfile, type DemoView, type SessionState, type ViewAccess } from './demoAccess';

const INITIAL: SessionState = { status: 'loading', profile: null };
let state: SessionState = INITIAL;
let started = false;
const listeners = new Set<() => void>();

function setState(next: SessionState) {
  state = next;
  listeners.forEach(listener => listener());
}

async function loadSession() {
  try {
    const response = await fetch('/api/demo/session');
    if (!response.ok) return setState({ status: 'unavailable', profile: null });
    const body = await response.json() as DemoProfile | { signed_in: false };
    setState('staff_id' in body ? { status: 'signed-in', profile: body } : { status: 'anonymous', profile: null });
  } catch {
    setState({ status: 'unavailable', profile: null });
  }
}

/** Returns an error message, or null once signed in. */
export async function signIn(staffId: string): Promise<string | null> {
  try {
    const response = await fetch('/api/demo/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ staff_id: staffId }) });
    const body = await response.json().catch(() => ({})) as Partial<DemoProfile> & { error?: string };
    if (!response.ok) return body.error ?? 'Could not check that Staff ID.';
    setState({ status: 'signed-in', profile: body as DemoProfile });
    return null;
  } catch {
    return 'The sample directory is not reachable. Start it with pnpm demo-api.';
  }
}

export async function signOut() {
  try {
    const response = await fetch('/api/demo/session', { method: 'DELETE' });
    await response.text();
  } catch { /* The local session simply ends with this tab. */ }
  setState({ status: 'anonymous', profile: null });
}

export function useDemoSession(): SessionState {
  useEffect(() => {
    if (started) return;
    started = true;
    void loadSession();
  }, []);
  return useSyncExternalStore(
    listener => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    () => state,
    () => INITIAL,
  );
}

export function useViewAccess(view: DemoView): ViewAccess {
  return accessFor(useDemoSession(), view);
}

export type SampleKind = 'employee' | 'supervisor' | 'hr' | 'hr_supervisor' | 'example';
export type SampleId = {
  group: 'role' | 'example'; kind: SampleKind; staff_id: string; display_name: string; business_role: string; division_name_en: string;
  assessment_status: 'complete' | 'pending'; persona: string | null; is_ready: boolean | null; direct_reports: number; is_hr: boolean;
};
let samples: SampleId[] | null = null;
let samplesRequest: Promise<SampleId[] | null> | null = null;

export function useSampleIds(): SampleId[] {
  const [list, setList] = useState<SampleId[]>(samples ?? []);
  useEffect(() => {
    if (samples) return;
    let active = true;
    samplesRequest ??= fetch('/api/demo/sample-ids')
      .then(response => response.ok ? response.json() as Promise<{ samples: SampleId[] }> : null)
      .then(body => { if (body) samples = body.samples; return samples; })
      .catch(() => null)
      .finally(() => { samplesRequest = null; });
    void samplesRequest.then(result => { if (active && result) setList(result); });
    return () => { active = false; };
  }, []);
  return list;
}
