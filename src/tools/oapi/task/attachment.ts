/**
 * Copyright (c) 2026 ByteDance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 *
 * feishu_task_attachment tool -- Manage task attachments.
 *
 * Actions:
 * - upload: Upload task attachment (tenant identity)
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { OpenClawPluginApi } from 'openclaw/plugin-sdk';
import { Type } from '@sinclair/typebox';

import { createToolContext, handleInvokeErrorWithAutoAuth, json, registerTool } from '../helpers';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const FeishuTaskAttachmentSchema = Type.Union([
  Type.Object({
    action: Type.Literal('upload'),
  }),
]);

type FeishuTaskAttachmentParams = { action: 'upload' };

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function resolvePathForAction(action: FeishuTaskAttachmentParams['action']): { path: string; env: string[] } {
  if (action === 'upload') {
    // TODO: replace with real attachment API path after params are finalized
    return { path: '/open-apis/task/v2/attachment/upload', env: [] };
  }

  return { path: '/open-apis/task/v2/attachment/upload', env: [] };
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export function registerFeishuTaskAttachmentTool(api: OpenClawPluginApi): void {
  if (!api.config) return;
  const cfg = api.config;

  const { toolClient, log } = createToolContext(api, 'feishu_task_attachment');

  registerTool(
    api,
    {
      name: 'feishu_task_attachment',
      label: 'Feishu Task Attachment',
      description: '飞书任务附件工具（初版骨架）。当前仅提供最小 upload action，后续可补充真实上传参数。',
      parameters: FeishuTaskAttachmentSchema,
      async execute(_toolCallId: string, params: unknown) {
        const p = params as FeishuTaskAttachmentParams;
        try {
          const resolved = resolvePathForAction(p.action);
          const client = toolClient();

          const as = 'tenant';
          log.info(`${p.action}: path=${resolved.path}, as=${as}`);

          const res = await client.invokeByPath('feishu_task_attachment.upload', resolved.path, {
            method: 'POST',
            as,
            headers: {
              'x-tt-env': 'boe_task_agentqa',
            },
          });
          return json(res);
        } catch (err) {
          return await handleInvokeErrorWithAutoAuth(err, cfg);
        }
      },
    },
    { name: 'feishu_task_attachment' },
  );
}
