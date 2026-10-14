import type { NotificationEvent } from '../../server/notifications';

export function createNotificationEventId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function sendEmployeeNotification(event: NotificationEvent): Promise<{ ok: boolean }> {
  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(12_000),
    });
    return { ok: response.ok };
  } catch {
    return { ok: false };
  }
}