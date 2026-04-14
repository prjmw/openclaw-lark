import { describe, expect, it } from 'vitest';
import {
  parseFeishuTaskCommentUpdatedEventPayload,
  resolveFeishuTaskCommentChangeType,
} from '../src/messaging/inbound/task-comment-event';

describe('parseFeishuTaskCommentUpdatedEventPayload', () => {
  it('parses webhook style payloads with nested header and event', () => {
    expect(
      parseFeishuTaskCommentUpdatedEventPayload({
        schema: '2.0',
        header: {
          event_id: 'evt_1',
          event_type: 'task.task.comment.updated_v1',
          create_time: '1608725989000',
          app_id: 'cli_xxx',
          tenant_key: 'tenant_xxx',
        },
        event: {
          task_id: 'task_1',
          comment_id: 'comment_1',
          parent_id: 'comment_root',
          obj_type: 2,
        },
      }),
    ).toEqual({
      app_id: 'cli_xxx',
      event_id: 'evt_1',
      event_type: 'task.task.comment.updated_v1',
      create_time: '1608725989000',
      header: {
        app_id: 'cli_xxx',
        event_id: 'evt_1',
        event_type: 'task.task.comment.updated_v1',
        create_time: '1608725989000',
        tenant_key: 'tenant_xxx',
        token: undefined,
      },
      task_id: 'task_1',
      comment_id: 'comment_1',
      parent_id: 'comment_root',
      obj_type: 2,
    });
  });

  it('parses flattened payloads from sdk handlers', () => {
    expect(
      parseFeishuTaskCommentUpdatedEventPayload({
        app_id: 'cli_xxx',
        event_id: 'evt_2',
        event_type: 'task.task.comment.updated_v1',
        create_time: '1608725989001',
        task_id: 'task_2',
        comment_id: 'comment_2',
        obj_type: '1',
      }),
    ).toMatchObject({
      app_id: 'cli_xxx',
      event_id: 'evt_2',
      create_time: '1608725989001',
      task_id: 'task_2',
      comment_id: 'comment_2',
      obj_type: 1,
    });
  });

  it('rejects payloads missing required identifiers', () => {
    expect(
      parseFeishuTaskCommentUpdatedEventPayload({
        header: {
          app_id: 'cli_xxx',
        },
        event: {
          task_id: 'task_3',
        },
      }),
    ).toBeNull();
  });
});

describe('resolveFeishuTaskCommentChangeType', () => {
  it('maps known obj_type values', () => {
    expect(resolveFeishuTaskCommentChangeType(1)).toBe('comment_create');
    expect(resolveFeishuTaskCommentChangeType(2)).toBe('comment_reply');
    expect(resolveFeishuTaskCommentChangeType(3)).toBe('comment_update');
    expect(resolveFeishuTaskCommentChangeType(4)).toBe('comment_delete');
  });

  it('returns unknown for unsupported values', () => {
    expect(resolveFeishuTaskCommentChangeType(0)).toBe('unknown');
    expect(resolveFeishuTaskCommentChangeType(9)).toBe('unknown');
    expect(resolveFeishuTaskCommentChangeType(undefined)).toBe('unknown');
  });
});
