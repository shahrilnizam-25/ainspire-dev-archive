export type DemoView = 'employee' | 'supervisor' | 'hr';

export type DemoProfile = {
  staff_id: string;
  display_name: string;
  business_role: string;
  grade_code: string;
  division_code: string;
  division_name_en: string;
  division_name_bm: string;
  assessment_status: 'complete' | 'pending';
  persona: string | null;
  readiness_score: number | null;
  is_ready: boolean | null;
  is_hr: boolean;
  supervisor_name: string | null;
  direct_reports: number;
  views: DemoView[];
  is_illustrative: boolean;
};

// "unavailable" means the sample directory is not running, so the app falls back to its ungated behaviour.
export type SessionState = { status: 'loading' | 'anonymous' | 'signed-in' | 'unavailable'; profile: DemoProfile | null };
export type ViewAccess = 'checking' | 'open' | 'signin' | 'denied';

/** Access to the supervisor and HR views; the employee view is never gated. */
export function accessFor(state: SessionState, view: DemoView): ViewAccess {
  if (state.status === 'loading') return 'checking';
  if (state.status === 'unavailable') return 'open';
  if (!state.profile) return 'signin';
  return state.profile.views.includes(view) ? 'open' : 'denied';
}

/** Views to show in the top-left tabs; null means show all because no directory is available. */
export function visibleViews(state: SessionState): DemoView[] | null {
  if (state.status === 'unavailable') return null;
  return state.profile?.views ?? [];
}
