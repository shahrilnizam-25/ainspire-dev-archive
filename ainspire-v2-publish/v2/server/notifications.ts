type Language = 'EN' | 'BM';

type BaseEvent = {
  eventId: string;
  lang: Language;
  employeeName?: string;
};

export type NotificationEvent = BaseEvent & (
  | {
      eventType: 'assessment.results_ready';
      persona: string;
      contributionRole?: string;
      overallReadiness?: number;
      dimensionScores?: Record<string, number>;
      narrative?: string;
      strengths?: string[];
      developmentGaps?: string[];
      learningResources?: Array<{ title: string; url?: string }>;
    }
  | {
      eventType: 'project.interest';
      projectName: string;
      contributionRole: string;
      department?: string;
    }
  | {
      eventType: 'learning.milestone';
      topic: string;
      status: 'started' | 'completed';
    }
);

type EmailMessage = {
  to: string;
  cc: string;
  subject: string;
  htmlBody: string;
};

export type PowerAutomatePayload = EmailMessage & {
  eventId: string;
  eventType: NotificationEvent['eventType'];
  reminder: (EmailMessage & { dueAt: string }) | null;
};

const DEFAULT_EMPLOYEE = 'shahril.abdullah@tm.com.my';
const DEFAULT_SUPERVISOR = 'ctsoo@tm.com.my';
const DEFAULT_HR = 'noorain.ismail@tm.com.my';
const DEFAULT_PORTAL_URL = 'https://ainspire.sooct2003.chatgpt.site';
const DIMENSIONS: Record<string, { EN: string; BM: string }> = {
  aiExposure: { EN: 'AI Exposure', BM: 'Pendedahan AI' },
  aiApplication: { EN: 'AI Application', BM: 'Aplikasi AI' },
  criticalJudgement: { EN: 'Critical Judgement', BM: 'Pertimbangan Kritis' },
  aiProblemSolving: { EN: 'AI Problem Solving', BM: 'Penyelesaian Masalah AI' },
  growthAspiration: { EN: 'Growth Aspiration', BM: 'Aspirasi Pembangunan' },
};

function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]!);
}

function text(value: string | undefined, max = 500): string {
  return escapeHtml((value ?? '').trim().slice(0, max));
}

function portalUrl(): string {
  const value = process.env.AINSPIRE_PORTAL_URL?.trim() || DEFAULT_PORTAL_URL;
  const url = new URL(value);
  if (url.protocol !== 'https:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
    throw new Error('AINSPIRE_PORTAL_URL must use HTTPS.');
  }
  return url.toString();
}

function recipients(eventType: NotificationEvent['eventType']): { to: string; cc: string } {
  const employee = process.env.AINSPIRE_NOTIFICATION_EMPLOYEE ?? DEFAULT_EMPLOYEE;
  const supervisor = process.env.AINSPIRE_NOTIFICATION_SUPERVISOR ?? DEFAULT_SUPERVISOR;
  const hr = process.env.AINSPIRE_NOTIFICATION_HR ?? DEFAULT_HR;
  if (![employee, supervisor, hr].every(address => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address))) {
    throw new Error('Notification recipient configuration contains an invalid email address.');
  }
  return {
    to: employee,
    cc: eventType === 'assessment.results_ready' || eventType === 'project.interest'
      ? `${supervisor};${hr}`
      : supervisor,
  };
}

function frame(title: string, content: string, lang: Language): string {
  const button = lang === 'BM' ? 'Buka portal AiNspire' : 'Open the AiNspire portal';
  const footer = lang === 'BM'
    ? 'Mesej automatik daripada perjalanan pekerja AiNspire.'
    : 'Automated message from the AiNspire employee journey.';
  const url = escapeHtml(portalUrl());
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#030712;color:#e5eefb;font-family:Aptos,Segoe UI,Arial,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;margin:0 auto;background:#0b1325;border:1px solid #18304a;border-radius:16px;overflow:hidden"><tr><td style="padding:24px 30px;background:#071b26;border-bottom:1px solid #164e63"><div style="font-size:12px;font-weight:700;letter-spacing:2px;color:#67e8f9">AiNspire</div><div style="margin-top:6px;font-size:13px;color:#a8b8ce">TM AI Workforce Intelligence &amp; Capability Development</div></td></tr><tr><td style="padding:30px"><h1 style="margin:0 0 20px;font-size:25px;line-height:1.25;color:#f8fafc">${title}</h1>${content}<p style="margin:28px 0 0"><a href="${url}" style="display:inline-block;padding:12px 18px;border-radius:8px;background:#00d4ff;color:#03111d;text-decoration:none;font-size:14px;font-weight:700">${button}</a></p></td></tr><tr><td style="padding:16px 30px;border-top:1px solid #1e293b;color:#94a3b8;font-size:12px;line-height:1.6">${footer}</td></tr></table></body></html>`;
}

function list(items: string[] | undefined, empty: string): string {
  const rows = (items ?? []).slice(0, 5).map(item => `<li style="margin:0 0 7px">${text(item, 300)}</li>`);
  return rows.length ? `<ul style="padding-left:20px;color:#dbeafe;line-height:1.6">${rows.join('')}</ul>` : `<p style="color:#94a3b8">${empty}</p>`;
}

function resultsEmail(event: Extract<NotificationEvent, { eventType: 'assessment.results_ready' }>): EmailMessage {
  const bm = event.lang === 'BM';
  const dimensions = Object.entries(event.dimensionScores ?? {}).filter(([key, value]) => DIMENSIONS[key] && Number.isFinite(value)).slice(0, 5);
  const dimensionRows = dimensions.map(([key, value]) => `<tr><td style="padding:8px 10px;border-bottom:1px solid #1e293b">${DIMENSIONS[key][event.lang]}</td><td style="padding:8px 10px;border-bottom:1px solid #1e293b;text-align:right;color:#67e8f9;font-weight:700">${Math.round(value)}%</td></tr>`).join('');
  const resources = (event.learningResources ?? []).slice(0, 3).map(resource => {
    const title = text(resource.title, 160);
    let link = title;
    if (resource.url) {
      try {
        const parsed = new URL(resource.url, portalUrl());
        if (parsed.protocol === 'https:' || parsed.origin === new URL(portalUrl()).origin) link = `<a href="${escapeHtml(parsed.toString())}" style="color:#67e8f9">${title}</a>`;
      } catch { /* Keep the title without an untrusted link. */ }
    }
    return `<li style="margin:0 0 7px">${link}</li>`;
  }).join('');
  const title = bm ? 'Keputusan penilaian AiNspire anda' : 'Your AiNspire assessment results';
  const content = `<p style="color:#cbd5e1">${bm ? `Hai ${text(event.employeeName || 'rakan sekerja', 100)}, penilaian anda telah selesai.` : `Hello ${text(event.employeeName || 'colleague', 100)}, your assessment is complete.`}</p><div style="margin:20px 0;padding:18px;border:1px solid #164e63;border-radius:10px;background:#071b26"><div style="font-size:12px;color:#94a3b8">${bm ? 'Persona AI anda' : 'Your AI persona'}</div><div style="margin-top:5px;font-size:23px;font-weight:700;color:#67e8f9">${text(event.persona, 80)}</div>${event.contributionRole ? `<div style="margin-top:10px;color:#cbd5e1">${bm ? 'Peranan sumbangan disyorkan' : 'Recommended contribution role'}: <strong>${text(event.contributionRole, 120)}</strong></div>` : ''}${Number.isFinite(event.overallReadiness) ? `<div style="margin-top:8px;color:#cbd5e1">${bm ? 'Kesediaan keseluruhan' : 'Overall readiness'}: <strong>${Math.round(event.overallReadiness!)}%</strong></div>` : ''}</div>${dimensionRows ? `<h2 style="font-size:16px;color:#f8fafc">${bm ? 'Dimensi kesediaan' : 'Readiness dimensions'}</h2><table role="presentation" width="100%" cellspacing="0" style="border-collapse:collapse;color:#dbeafe">${dimensionRows}</table>` : ''}${event.narrative ? `<h2 style="margin-top:22px;font-size:16px;color:#f8fafc">${bm ? 'Ringkasan profil' : 'Profile summary'}</h2><p style="color:#cbd5e1;line-height:1.7">${text(event.narrative, 1200)}</p>` : ''}<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:22px"><div><h2 style="font-size:15px;color:#86efac">${bm ? 'Kekuatan' : 'Strengths'}</h2>${list(event.strengths, bm ? 'Teruskan membina kemahiran melalui latihan praktikal.' : 'Build on your strengths through practical learning.')}</div><div><h2 style="font-size:15px;color:#fcd34d">${bm ? 'Fokus pembangunan' : 'Development focus'}</h2>${list(event.developmentGaps, bm ? 'Ikuti laluan pembelajaran yang disyorkan.' : 'Follow your recommended learning pathway.')}</div></div>${resources ? `<h2 style="margin-top:22px;font-size:16px;color:#f8fafc">${bm ? 'Sumber pembelajaran' : 'Learning resources'}</h2><ul style="padding-left:20px;line-height:1.6">${resources}</ul>` : ''}`;
  return {
    ...recipients(event.eventType),
    subject: bm ? 'AiNspire: keputusan penilaian anda' : 'AiNspire: your assessment results',
    htmlBody: frame(title, content, event.lang),
  };
}

function projectEmail(event: Extract<NotificationEvent, { eventType: 'project.interest' }>): EmailMessage {
  const bm = event.lang === 'BM';
  const title = bm ? 'Minat projek anda telah direkodkan' : 'Your project interest has been recorded';
  const content = `<p style="color:#cbd5e1">${bm ? `Hai ${text(event.employeeName || 'rakan sekerja', 100)},` : `Hello ${text(event.employeeName || 'colleague', 100)},`}</p><div style="margin:18px 0;padding:18px;border:1px solid #6d28d9;border-radius:10px;background:#181226"><div style="font-size:12px;color:#c4b5fd">${bm ? 'Projek / inisiatif' : 'Project / initiative'}</div><div style="margin-top:5px;font-size:20px;font-weight:700;color:#e9d5ff">${text(event.projectName, 160)}</div><p style="margin-bottom:0;color:#e2e8f0">${bm ? 'Peranan dicadangkan' : 'Suggested contribution role'}: <strong>${text(event.contributionRole, 120)}</strong></p>${event.department ? `<p style="margin-bottom:0;color:#cbd5e1">${bm ? 'Bahagian' : 'Division'}: ${text(event.department, 120)}</p>` : ''}</div><p style="color:#cbd5e1;line-height:1.7">${bm ? 'Ini ialah pengesahan minat, bukan penugasan. Skop dan kelulusan perlu dibincangkan dengan penyelia.' : 'This confirms your interest, not an assignment. Discuss scope and approval with your supervisor.'}</p>`;
  return { ...recipients(event.eventType), subject: bm ? `AiNspire: minat untuk ${text(event.projectName, 100)}` : `AiNspire: interest in ${text(event.projectName, 100)}`, htmlBody: frame(title, content, event.lang) };
}

function learningEmail(event: Extract<NotificationEvent, { eventType: 'learning.milestone' }>): EmailMessage {
  const bm = event.lang === 'BM';
  const started = event.status === 'started';
  const title = bm ? (started ? 'Kemajuan pembelajaran direkodkan' : 'Pencapaian pembelajaran direkodkan') : (started ? 'Learning progress recorded' : 'Learning milestone recorded');
  const status = bm ? (started ? 'Dimulakan' : 'Selesai') : (started ? 'Started' : 'Completed');
  const content = `<p style="color:#cbd5e1">${bm ? `Hai ${text(event.employeeName || 'rakan sekerja', 100)}, kemajuan pembelajaran anda telah dikemas kini.` : `Hello ${text(event.employeeName || 'colleague', 100)}, your learning progress has been updated.`}</p><div style="margin:18px 0;padding:18px;border:1px solid #164e63;border-radius:10px;background:#071b26"><div style="font-size:12px;color:#94a3b8">${bm ? 'Topik / kursus' : 'Topic / course'}</div><div style="margin-top:5px;font-size:19px;font-weight:700;color:#67e8f9">${text(event.topic, 200)}</div><p style="margin-bottom:0;color:#cbd5e1">${bm ? 'Status' : 'Status'}: <strong>${status}</strong></p></div><p style="color:#cbd5e1;line-height:1.7">${bm ? 'Teruskan laluan pembelajaran anda di portal AiNspire.' : 'Continue your learning pathway in the AiNspire portal.'}</p>`;
  return { ...recipients(event.eventType), subject: bm ? `AiNspire: ${title}` : `AiNspire: ${title}`, htmlBody: frame(title, content, event.lang) };
}

export function buildPowerAutomatePayload(event: NotificationEvent, now = new Date()): PowerAutomatePayload {
  const email = event.eventType === 'assessment.results_ready'
    ? resultsEmail(event)
    : event.eventType === 'project.interest'
      ? projectEmail(event)
      : learningEmail(event);
  let reminder: PowerAutomatePayload['reminder'] = null;
  if (event.eventType === 'assessment.results_ready') {
    const bm = event.lang === 'BM';
    const title = bm ? 'Masa untuk menyambung pembelajaran AI anda' : 'Time to continue your AI learning';
    const content = `<p style="color:#cbd5e1">${bm ? 'Sudah seminggu sejak penilaian anda. Teruskan satu langkah kecil dalam laluan pembelajaran yang disyorkan.' : 'It has been a week since your assessment. Take one small next step in your recommended learning pathway.'}</p><p style="color:#cbd5e1">${bm ? 'Buka portal untuk menyemak profil, sumber dan kemajuan pembelajaran anda.' : 'Return to the portal to review your profile, resources and learning progress.'}</p>`;
    reminder = {
      ...recipients('learning.milestone'),
      dueAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      subject: bm ? 'AiNspire: peringatan pembelajaran anda' : 'AiNspire: your learning reminder',
      htmlBody: frame(title, content, event.lang),
    };
  }
  return { eventId: event.eventId, eventType: event.eventType, ...email, reminder };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function boundedString(value: unknown, field: string, max: number, optional = false): string | undefined {
  if (optional && value === undefined) return undefined;
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new Error(`${field} is required (maximum ${max} characters).`);
  return value.trim();
}

export function parseNotificationEvent(value: unknown): NotificationEvent {
  if (!isObject(value)) throw new Error('Invalid notification request.');
  const eventId = boundedString(value.eventId, 'eventId', 100)!;
  if (!/^[A-Za-z0-9._:-]+$/.test(eventId)) throw new Error('Invalid eventId.');
  const lang = value.lang === 'EN' ? 'EN' : value.lang === 'BM' ? 'BM' : null;
  if (!lang) throw new Error('lang must be EN or BM.');
  const employeeName = boundedString(value.employeeName, 'employeeName', 100, true);
  const base: BaseEvent = { eventId, lang, ...(employeeName ? { employeeName } : {}) };
  if (value.eventType === 'assessment.results_ready') {
    const persona = boundedString(value.persona, 'persona', 80)!;
    const contributionRole = boundedString(value.contributionRole, 'contributionRole', 120, true);
    const narrative = boundedString(value.narrative, 'narrative', 1200, true);
    const score = value.overallReadiness;
    if (score !== undefined && (typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > 100)) throw new Error('overallReadiness must be between 0 and 100.');
    const dimensionScores = value.dimensionScores;
    if (dimensionScores !== undefined && (!isObject(dimensionScores) || Object.entries(dimensionScores).some(([key, entry]) => !DIMENSIONS[key] || typeof entry !== 'number' || !Number.isFinite(entry) || entry < 0 || entry > 100))) throw new Error('Invalid dimensionScores.');
    const strings = (input: unknown, field: string): string[] | undefined => {
      if (input === undefined) return undefined;
      if (!Array.isArray(input) || input.length > 8 || input.some(item => typeof item !== 'string' || !item.trim() || item.length > 300)) throw new Error(`${field} must contain up to 8 short strings.`);
      return input.map(item => item.trim());
    };
    let learningResources: Array<{ title: string; url?: string }> | undefined;
    if (value.learningResources !== undefined) {
      if (!Array.isArray(value.learningResources) || value.learningResources.length > 8 || value.learningResources.some(item => !isObject(item) || typeof item.title !== 'string' || item.title.length > 160 || (item.url !== undefined && (typeof item.url !== 'string' || item.url.length > 500)))) throw new Error('Invalid learningResources.');
      learningResources = value.learningResources.map(item => ({ title: (item as Record<string, string>).title, ...((item as Record<string, string>).url ? { url: (item as Record<string, string>).url } : {}) }));
    }
    return { ...base, eventType: value.eventType, persona, ...(contributionRole ? { contributionRole } : {}), ...(score !== undefined ? { overallReadiness: score as number } : {}), ...(dimensionScores ? { dimensionScores: dimensionScores as Record<string, number> } : {}), ...(narrative ? { narrative } : {}), ...(strings(value.strengths, 'strengths') ? { strengths: strings(value.strengths, 'strengths') } : {}), ...(strings(value.developmentGaps, 'developmentGaps') ? { developmentGaps: strings(value.developmentGaps, 'developmentGaps') } : {}), ...(learningResources ? { learningResources } : {}) };
  }
  if (value.eventType === 'project.interest') {
    const projectName = boundedString(value.projectName, 'projectName', 160)!;
    const contributionRole = boundedString(value.contributionRole, 'contributionRole', 120)!;
    const department = boundedString(value.department, 'department', 150, true);
    return { ...base, eventType: value.eventType, projectName, contributionRole, ...(department ? { department } : {}) };
  }
  if (value.eventType === 'learning.milestone') {
    const topic = boundedString(value.topic, 'topic', 200)!;
    if (value.status !== 'started' && value.status !== 'completed') throw new Error('Invalid learning status.');
    return { ...base, eventType: value.eventType, topic, status: value.status };
  }
  throw new Error('Unsupported notification event.');
}

export async function dispatchPowerAutomate(payload: PowerAutomatePayload): Promise<void> {
  const endpoint = process.env.POWER_AUTOMATE_TRIGGER_URL?.trim();
  if (!endpoint) throw Object.assign(new Error('Power Automate is not configured.'), { status: 503 });
  const url = new URL(endpoint);
  if (url.protocol !== 'https:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') throw new Error('Power Automate trigger URL must use HTTPS.');
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': payload.eventId },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw Object.assign(new Error(`Power Automate returned HTTP ${response.status}.`), { status: 502 });
}