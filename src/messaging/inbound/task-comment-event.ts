import type { FeishuTaskCommentUpdatedEvent } from '../types';

export type FeishuTaskCommentChangeType = 'comment_create' | 'comment_reply' | 'comment_update' | 'comment_delete' | 'unknown';

const TASK_COMMENT_CHANGE_TYPE_LABELS: Record<number, FeishuTaskCommentChangeType> = {
  1: 'comment_create',
  2: 'comment_reply',
  3: 'comment_update',
  4: 'comment_delete',
};

export function resolveFeishuTaskCommentChangeType(objType?: number): FeishuTaskCommentChangeType {
  if (typeof objType !== 'number' || !Number.isFinite(objType)) return 'unknown';
  return TASK_COMMENT_CHANGE_TYPE_LABELS[objType] ?? 'unknown';
}

export function parseFeishuTaskCommentUpdatedEventPayload(data: unknown): FeishuTaskCommentUpdatedEvent | null {
  if (!data || typeof data !== 'object') return null;

  const raw = data as Record<string, unknown>;
  const event = (raw.event ?? raw) as Record<string, unknown>;
  const header = (raw.header ?? event.header) as Record<string, unknown> | undefined;

  const taskId = (event.task_id ?? raw.task_id) as string | undefined;
  const commentId = (event.comment_id ?? raw.comment_id) as string | undefined;
  const parentId = (event.parent_id ?? raw.parent_id) as string | undefined;

  const rawObjType = event.obj_type ?? raw.obj_type;
  const objType =
    typeof rawObjType === 'number'
      ? rawObjType
      : typeof rawObjType === 'string' && rawObjType.trim()
        ? Number(rawObjType)
        : undefined;

  if (!taskId || !commentId || !Number.isInteger(objType)) {
    return null;
  }

  const appId = (header?.app_id ?? raw.app_id ?? event.app_id) as string | undefined;
  const eventId = (header?.event_id ?? raw.event_id ?? event.event_id) as string | undefined;
  const eventType = (header?.event_type ?? raw.event_type ?? event.event_type) as string | undefined;
  const createTime = (header?.create_time ?? raw.create_time ?? event.create_time) as string | undefined;

  return {
    app_id: appId,
    event_id: eventId,
    event_type: eventType,
    create_time: createTime,
    header: header
      ? {
          app_id: appId,
          event_id: eventId,
          event_type: eventType,
          create_time: createTime,
          tenant_key: (header.tenant_key ?? raw.tenant_key ?? event.tenant_key) as string | undefined,
          token: (header.token ?? raw.token ?? event.token) as string | undefined,
        }
      : undefined,
    task_id: taskId,
    comment_id: commentId,
    parent_id: parentId,
    obj_type: objType,
  };
}
