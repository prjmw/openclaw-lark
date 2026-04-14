import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockParseFeishuTaskCommentUpdatedEventPayload = vi.fn();
const mockResolveFeishuTaskCommentChangeType = vi.fn();
vi.mock('../src/messaging/inbound/task-comment-event', () => ({
  parseFeishuTaskCommentUpdatedEventPayload: (...args: unknown[]) => mockParseFeishuTaskCommentUpdatedEventPayload(...args),
  resolveFeishuTaskCommentChangeType: (...args: unknown[]) => mockResolveFeishuTaskCommentChangeType(...args),
}));

const mockIsMessageExpired = vi.fn();
vi.mock('../src/messaging/inbound/dedup', () => ({
  isMessageExpired: (...args: unknown[]) => mockIsMessageExpired(...args),
}));

const mockHandleAskUserTaskCommentEvent = vi.fn();
vi.mock('../src/tools/ask-user-question', () => ({
  handleAskUserAction: vi.fn(),
  handleAskUserTaskCommentEvent: (...args: unknown[]) => mockHandleAskUserTaskCommentEvent(...args),
}));

vi.mock('../src/core/lark-logger', () => ({
  larkLogger: () => ({ warn: vi.fn(), info: vi.fn(), error: vi.fn(), debug: vi.fn() }),
}));

vi.mock('../src/messaging/inbound/handler', () => ({ handleFeishuMessage: vi.fn() }));
vi.mock('../src/messaging/inbound/reaction-handler', () => ({
  handleFeishuReaction: vi.fn(),
  resolveReactionContext: vi.fn(),
}));
vi.mock('../src/messaging/inbound/comment-handler', () => ({ handleFeishuCommentEvent: vi.fn() }));
vi.mock('../src/messaging/inbound/comment-context', () => ({ parseFeishuDriveCommentNoticeEventPayload: vi.fn() }));
vi.mock('../src/core/lark-ticket', () => ({ withTicket: vi.fn() }));
vi.mock('../src/tools/auto-auth', () => ({ handleCardAction: vi.fn() }));
vi.mock('../src/channel/chat-queue', () => ({
  buildQueueKey: vi.fn(),
  enqueueFeishuChatTask: vi.fn(),
  getActiveDispatcher: vi.fn(),
  hasActiveTask: vi.fn(),
}));
vi.mock('../src/channel/abort-detect', () => ({
  extractRawTextFromEvent: vi.fn(),
  isLikelyAbortText: vi.fn(),
}));
vi.mock('../src/channel/interactive-dispatch', () => ({
  dispatchFeishuPluginInteractiveHandler: vi.fn(),
}));

import { handleTaskCommentEvent } from '../src/channel/event-handlers';

function createMonitorContext() {
  return {
    cfg: {} as any,
    lark: {
      account: {
        appId: 'cli_expected',
      },
    } as any,
    accountId: 'acc-1',
    chatHistories: new Map(),
    messageDedup: {
      tryRecord: vi.fn().mockReturnValue(true),
    },
    log: vi.fn(),
    error: vi.fn(),
  } as any;
}

describe('handleTaskCommentEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsMessageExpired.mockReturnValue(false);
    mockHandleAskUserTaskCommentEvent.mockResolvedValue(false);
  });

  it('skips events from another app', async () => {
    const ctx = createMonitorContext();

    await handleTaskCommentEvent(ctx, {
      app_id: 'cli_other',
      task_id: 'task-1',
      comment_id: 'comment-1',
      obj_type: 2,
    });

    expect(mockParseFeishuTaskCommentUpdatedEventPayload).not.toHaveBeenCalled();
    expect(ctx.messageDedup.tryRecord).not.toHaveBeenCalled();
    expect(mockHandleAskUserTaskCommentEvent).not.toHaveBeenCalled();
  });

  it('skips duplicate task comment events', async () => {
    const ctx = createMonitorContext();
    ctx.messageDedup.tryRecord.mockReturnValue(false);
    mockParseFeishuTaskCommentUpdatedEventPayload.mockReturnValue({
      app_id: 'cli_expected',
      event_id: 'evt-1',
      create_time: '1712000000000',
      task_id: 'task-1',
      comment_id: 'comment-1',
      parent_id: 'comment-root',
      obj_type: 2,
    });
    mockResolveFeishuTaskCommentChangeType.mockReturnValue('comment_reply');

    await handleTaskCommentEvent(ctx, {
      app_id: 'cli_expected',
    });

    expect(ctx.messageDedup.tryRecord).toHaveBeenCalledWith('evt-1', 'acc-1');
    expect(mockIsMessageExpired).not.toHaveBeenCalled();
    expect(mockHandleAskUserTaskCommentEvent).not.toHaveBeenCalled();
  });

  it('skips expired task comment events', async () => {
    const ctx = createMonitorContext();
    mockParseFeishuTaskCommentUpdatedEventPayload.mockReturnValue({
      app_id: 'cli_expected',
      create_time: '1712000000000',
      task_id: 'task-1',
      comment_id: 'comment-2',
      parent_id: 'comment-root',
      obj_type: 2,
    });
    mockResolveFeishuTaskCommentChangeType.mockReturnValue('comment_reply');
    mockIsMessageExpired.mockReturnValue(true);

    await handleTaskCommentEvent(ctx, {
      app_id: 'cli_expected',
    });

    expect(ctx.messageDedup.tryRecord).toHaveBeenCalledWith(
      'task-comment:task-1:comment-2:comment-root:2:1712000000000',
      'acc-1',
    );
    expect(mockHandleAskUserTaskCommentEvent).not.toHaveBeenCalled();
  });

  it('invokes recovery for reply events', async () => {
    const ctx = createMonitorContext();
    const parsedEvent = {
      app_id: 'cli_expected',
      event_id: 'evt-2',
      create_time: '1712000000001',
      task_id: 'task-2',
      comment_id: 'comment-3',
      parent_id: 'comment-question',
      obj_type: 2,
    };
    mockParseFeishuTaskCommentUpdatedEventPayload.mockReturnValue(parsedEvent);
    mockResolveFeishuTaskCommentChangeType.mockReturnValue('comment_reply');
    mockHandleAskUserTaskCommentEvent.mockResolvedValue(true);

    await handleTaskCommentEvent(ctx, {
      app_id: 'cli_expected',
    });

    expect(mockHandleAskUserTaskCommentEvent).toHaveBeenCalledWith(parsedEvent, ctx.cfg, 'acc-1');
  });

  it('does not invoke recovery for update events', async () => {
    const ctx = createMonitorContext();
    mockParseFeishuTaskCommentUpdatedEventPayload.mockReturnValue({
      app_id: 'cli_expected',
      event_id: 'evt-3',
      create_time: '1712000000002',
      task_id: 'task-3',
      comment_id: 'comment-4',
      parent_id: 'comment-question',
      obj_type: 3,
    });
    mockResolveFeishuTaskCommentChangeType.mockReturnValue('comment_update');

    await handleTaskCommentEvent(ctx, {
      app_id: 'cli_expected',
    });

    expect(mockHandleAskUserTaskCommentEvent).not.toHaveBeenCalled();
  });
});
