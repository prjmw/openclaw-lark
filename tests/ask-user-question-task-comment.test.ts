import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/core/lark-logger', () => ({
  larkLogger: () => ({ debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));

const mockCreateCardEntity = vi.fn();
const mockSendCardByCardId = vi.fn();
const mockUpdateCardKitCard = vi.fn();
vi.mock('../src/card/cardkit', () => ({
  createCardEntity: (...args: unknown[]) => mockCreateCardEntity(...args),
  sendCardByCardId: (...args: unknown[]) => mockSendCardByCardId(...args),
  updateCardKitCard: (...args: unknown[]) => mockUpdateCardKitCard(...args),
}));

const mockEnqueueFeishuChatTask = vi.fn();
vi.mock('../src/channel/chat-queue', () => ({
  buildQueueKey: (accountId: string, chatId: string) => `${accountId}:${chatId}`,
  enqueueFeishuChatTask: (...args: unknown[]) => mockEnqueueFeishuChatTask(...args),
}));

vi.mock('../src/messaging/inbound/handler', () => ({
  handleFeishuMessage: vi.fn().mockResolvedValue(undefined),
}));

const mockDispatchSyntheticTextMessage = vi.fn();
vi.mock('../src/messaging/inbound/synthetic-message', () => ({
  dispatchSyntheticTextMessage: (...args: unknown[]) => mockDispatchSyntheticTextMessage(...args),
}));

const mockGetTicket = vi.fn();
const mockWithTicket = vi.fn();
vi.mock('../src/core/lark-ticket', () => ({
  getTicket: (...args: unknown[]) => mockGetTicket(...args),
  withTicket: (...args: unknown[]) => mockWithTicket(...args),
}));

const mockTaskCommentCreate = vi.fn();
const mockTaskCommentGet = vi.fn();
vi.mock('../src/core/lark-client', () => ({
  LarkClient: {
    fromCfg: (..._args: unknown[]) => ({
      sdk: {
        task: {
          v2: {
            comment: {
              create: (...args: unknown[]) => mockTaskCommentCreate(...args),
              get: (...args: unknown[]) => mockTaskCommentGet(...args),
            },
          },
        },
      },
    }),
  },
}));

vi.mock('../src/core/api-error', () => ({
  assertLarkOk: (res: { code?: number; msg?: string }) => {
    if (res.code && res.code !== 0) {
      throw new Error(res.msg ?? `error:${res.code}`);
    }
  },
  formatLarkError: (err: unknown) => (err instanceof Error ? err.message : String(err)),
}));

vi.mock('../src/tools/helpers', () => ({
  checkToolRegistration: () => true,
  formatToolResult: (obj: unknown) => ({ content: [{ type: 'text', text: JSON.stringify(obj) }] }),
  formatToolError: (msg: string) => ({ content: [{ type: 'text', text: msg }], isError: true }),
}));

import { handleAskUserTaskCommentEvent, registerAskUserQuestionTool } from '../src/tools/ask-user-question';

const TEST_ACCOUNT_ID = 'test-account';
const TEST_CHAT_ID = 'oc_test123';
const TEST_SENDER = 'ou_sender1';
const TEST_MSG_ID = 'msg_test1';
const TEST_TASK_GUID = 'task-guid-1';
const TEST_ROOT_COMMENT_ID = 'comment-root-1';

function createMockCfg() {
  return {} as any;
}

async function seedTaskCommentQuestion(targetUserOpenId?: string): Promise<{ questionId: string; promptCommentId: string }> {
  const cfg = createMockCfg();
  const promptCommentId = `comment-question-${Math.random().toString(36).slice(2, 8)}`;
  mockGetTicket.mockReturnValue({
    chatId: TEST_CHAT_ID,
    accountId: TEST_ACCOUNT_ID,
    senderOpenId: TEST_SENDER,
    messageId: TEST_MSG_ID,
    chatType: 'p2p',
  });
  mockTaskCommentCreate.mockResolvedValue({
    code: 0,
    data: {
      comment: {
        id: promptCommentId,
      },
    },
  });

  const registeredTools: Record<string, any> = {};
  const mockApi = {
    config: cfg,
    registerTool: (def: any) => {
      registeredTools[def.name] = def;
    },
    logger: { debug: vi.fn() },
  };
  registerAskUserQuestionTool(mockApi as any);

  const tool = registeredTools.feishu_ask_user_question;
  const result = await tool.execute('call-1', {
    questions: [
      {
        question: '计划什么时候完成？',
        header: '完成时间',
        options: [],
        multiSelect: false,
      },
    ],
    channel: {
      type: 'task_comment',
      taskGuid: TEST_TASK_GUID,
      rootCommentId: TEST_ROOT_COMMENT_ID,
      ...(targetUserOpenId ? { targetUserOpenId } : {}),
    },
  });

  return {
    questionId: JSON.parse(result.content[0].text).questionId,
    promptCommentId,
  };
}

async function seedTopLevelTaskCommentQuestion(
  taskGuid = TEST_TASK_GUID,
): Promise<{ questionId: string; promptCommentId: string }> {
  const cfg = createMockCfg();
  const promptCommentId = `comment-question-${Math.random().toString(36).slice(2, 8)}`;
  mockGetTicket.mockReturnValue({
    chatId: TEST_CHAT_ID,
    accountId: TEST_ACCOUNT_ID,
    senderOpenId: TEST_SENDER,
    messageId: TEST_MSG_ID,
    chatType: 'p2p',
  });
  mockTaskCommentCreate.mockResolvedValue({
    code: 0,
    data: {
      comment: {
        id: promptCommentId,
      },
    },
  });

  const registeredTools: Record<string, any> = {};
  const mockApi = {
    config: cfg,
    registerTool: (def: any) => {
      registeredTools[def.name] = def;
    },
    logger: { debug: vi.fn() },
  };
  registerAskUserQuestionTool(mockApi as any);

  const tool = registeredTools.feishu_ask_user_question;
  const result = await tool.execute('call-top-level', {
    questions: [
      {
        question: '是否需要补充负责人？',
        header: '负责人',
        options: [],
        multiSelect: false,
      },
    ],
    channel: {
      type: 'task_comment',
      taskGuid,
    },
  });

  return {
    questionId: JSON.parse(result.content[0].text).questionId,
    promptCommentId,
  };
}

describe('AskUserQuestion task comment channel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends question as task comment and returns pending', async () => {
    const { questionId } = await seedTaskCommentQuestion();

    expect(questionId).toBeTruthy();
    expect(mockTaskCommentCreate).toHaveBeenCalledTimes(1);
    expect(mockTaskCommentCreate.mock.calls[0][0]).toMatchObject({
      data: {
        resource_type: 'task',
        resource_id: TEST_TASK_GUID,
        reply_to_comment_id: TEST_ROOT_COMMENT_ID,
      },
    });
    expect(mockCreateCardEntity).not.toHaveBeenCalled();
  });

  it('allows task comment question without rootCommentId and creates top-level comment', async () => {
    const { questionId } = await seedTopLevelTaskCommentQuestion();

    expect(questionId).toBeTruthy();
    expect(mockTaskCommentCreate).toHaveBeenCalledTimes(1);
    expect(mockTaskCommentCreate.mock.calls[0][0]).toMatchObject({
      data: {
        resource_type: 'task',
        resource_id: TEST_TASK_GUID,
      },
    });
    expect(mockTaskCommentCreate.mock.calls[0][0].data).not.toHaveProperty('reply_to_comment_id');
  });

  it('recovers execution from matching task comment reply', async () => {
    const { questionId, promptCommentId } = await seedTaskCommentQuestion();
    mockDispatchSyntheticTextMessage.mockResolvedValue('immediate');
    mockTaskCommentGet.mockResolvedValue({
      code: 0,
      data: {
        comment: {
          id: 'comment-reply-1',
          user_id: TEST_SENDER,
          content: '明天下午四点前完成',
        },
      },
    });

    const recovered = await handleAskUserTaskCommentEvent(
      {
        task_id: TEST_TASK_GUID,
        comment_id: 'comment-reply-1',
        parent_id: promptCommentId,
        obj_type: 2,
      },
      createMockCfg(),
      TEST_ACCOUNT_ID,
    );

    expect(recovered).toBe(true);
    expect(mockDispatchSyntheticTextMessage).toHaveBeenCalledTimes(1);
    expect(mockDispatchSyntheticTextMessage.mock.calls[0][0]).toMatchObject({
      accountId: TEST_ACCOUNT_ID,
      chatId: TEST_CHAT_ID,
      senderOpenId: TEST_SENDER,
      replyToMessageId: TEST_MSG_ID,
    });
    expect(mockDispatchSyntheticTextMessage.mock.calls[0][0].syntheticMessageId).toContain(questionId);
    expect(mockDispatchSyntheticTextMessage.mock.calls[0][0].text).toContain('用户在任务评论中回复了你的问题');
    expect(mockDispatchSyntheticTextMessage.mock.calls[0][0].text).toContain('明天下午四点前完成');
  });

  it('ignores reply from non-target user', async () => {
    const { promptCommentId } = await seedTaskCommentQuestion();
    mockTaskCommentGet.mockResolvedValue({
      code: 0,
      data: {
        comment: {
          id: 'comment-reply-2',
          user_id: 'ou_other',
          content: '我来回复',
        },
      },
    });

    const recovered = await handleAskUserTaskCommentEvent(
      {
        task_id: TEST_TASK_GUID,
        comment_id: 'comment-reply-2',
        parent_id: promptCommentId,
        obj_type: 2,
      },
      createMockCfg(),
      TEST_ACCOUNT_ID,
    );

    expect(recovered).toBe(false);
    expect(mockDispatchSyntheticTextMessage).not.toHaveBeenCalled();
  });

  it('ignores replies outside the tracked comment thread', async () => {
    await seedTaskCommentQuestion();

    const recovered = await handleAskUserTaskCommentEvent(
      {
        task_id: TEST_TASK_GUID,
        comment_id: 'comment-reply-3',
        parent_id: 'comment-other-thread',
        obj_type: 2,
      },
      createMockCfg(),
      TEST_ACCOUNT_ID,
    );

    expect(recovered).toBe(false);
    expect(mockTaskCommentGet).not.toHaveBeenCalled();
    expect(mockDispatchSyntheticTextMessage).not.toHaveBeenCalled();
  });

  it('uses targetUserOpenId for reply matching', async () => {
    const { promptCommentId } = await seedTaskCommentQuestion('ou_delegate');
    mockDispatchSyntheticTextMessage.mockResolvedValue('immediate');
    mockTaskCommentGet.mockResolvedValue({
      code: 0,
      data: {
        comment: {
          id: 'comment-reply-4',
          user_id: 'ou_delegate',
          content: '由我来确认',
        },
      },
    });

    const recovered = await handleAskUserTaskCommentEvent(
      {
        task_id: TEST_TASK_GUID,
        comment_id: 'comment-reply-4',
        parent_id: promptCommentId,
        obj_type: 2,
      },
      createMockCfg(),
      TEST_ACCOUNT_ID,
    );

    expect(recovered).toBe(true);
    expect(mockDispatchSyntheticTextMessage.mock.calls[0][0]).toMatchObject({
      senderOpenId: 'ou_delegate',
    });
  });

  it('falls back to single pending task question when parent is 0', async () => {
    const isolatedTaskGuid = 'task-guid-fallback-single';
    await seedTopLevelTaskCommentQuestion(isolatedTaskGuid);
    mockDispatchSyntheticTextMessage.mockResolvedValue('immediate');
    mockTaskCommentGet.mockResolvedValue({
      code: 0,
      data: {
        comment: {
          id: 'comment-reply-no-parent-1',
          user_id: TEST_SENDER,
          content: '我直接发了顶层评论回复',
        },
      },
    });

    const recovered = await handleAskUserTaskCommentEvent(
      {
        task_id: isolatedTaskGuid,
        comment_id: 'comment-reply-no-parent-1',
        parent_id: '0',
        obj_type: 1,
      },
      createMockCfg(),
      TEST_ACCOUNT_ID,
    );

    expect(recovered).toBe(true);
    expect(mockDispatchSyntheticTextMessage).toHaveBeenCalledTimes(1);
    expect(mockDispatchSyntheticTextMessage.mock.calls[0][0].text).toContain('我直接发了顶层评论回复');
  });

  it('does not fallback when multiple pending task questions exist for the same task', async () => {
    const isolatedTaskGuid = 'task-guid-fallback-ambiguous';
    await seedTopLevelTaskCommentQuestion(isolatedTaskGuid);
    await seedTopLevelTaskCommentQuestion(isolatedTaskGuid);
    mockTaskCommentGet.mockResolvedValue({
      code: 0,
      data: {
        comment: {
          id: 'comment-reply-no-parent-2',
          user_id: TEST_SENDER,
          content: '这个回复不该被猜测命中',
        },
      },
    });

    const recovered = await handleAskUserTaskCommentEvent(
      {
        task_id: isolatedTaskGuid,
        comment_id: 'comment-reply-no-parent-2',
        parent_id: '0',
        obj_type: 1,
      },
      createMockCfg(),
      TEST_ACCOUNT_ID,
    );

    expect(recovered).toBe(false);
    expect(mockTaskCommentGet).not.toHaveBeenCalled();
    expect(mockDispatchSyntheticTextMessage).not.toHaveBeenCalled();
  });

  it('consumes pending state after successful recovery', async () => {
    const { promptCommentId } = await seedTaskCommentQuestion();
    mockDispatchSyntheticTextMessage.mockResolvedValue('immediate');
    mockTaskCommentGet.mockResolvedValue({
      code: 0,
      data: {
        comment: {
          id: 'comment-reply-5',
          user_id: TEST_SENDER,
          content: '第一次回复',
        },
      },
    });

    const recovered = await handleAskUserTaskCommentEvent(
      {
        task_id: TEST_TASK_GUID,
        comment_id: 'comment-reply-5',
        parent_id: promptCommentId,
        obj_type: 2,
      },
      createMockCfg(),
      TEST_ACCOUNT_ID,
    );

    const recoveredAgain = await handleAskUserTaskCommentEvent(
      {
        task_id: TEST_TASK_GUID,
        comment_id: 'comment-reply-5',
        parent_id: promptCommentId,
        obj_type: 2,
      },
      createMockCfg(),
      TEST_ACCOUNT_ID,
    );

    expect(recovered).toBe(true);
    expect(recoveredAgain).toBe(false);
    expect(mockDispatchSyntheticTextMessage).toHaveBeenCalledTimes(1);
  });
});
