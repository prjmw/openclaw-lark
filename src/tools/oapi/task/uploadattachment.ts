/**
 * Copyright (c) 2026 ByteDance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 *
 * feishu_task_uploadattachment tool -- Upload task attachment.
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

const FeishuTaskUploadattachmentSchema = Type.Union([
  Type.Object({
    action: Type.Literal('upload'),
  }),
]);

type FeishuTaskUploadattachmentParams = { action: 'upload' };

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function resolvePathForAction(action: FeishuTaskUploadattachmentParams['action']): { path: string; env: string[] } {
  if (action === 'upload') {
    // TODO: replace with real upload attachment API path after params are finalized
    return { path: '/open-apis/task/v2/attachment/upload', env: [] };
  }

  return { path: '/open-apis/task/v2/attachment/upload', env: [] };
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export function registerFeishuTaskUploadattachmentTool(api: OpenClawPluginApi): void {
  if (!api.config) return;
  const cfg = api.config;

  const { toolClient, log } = createToolContext(api, 'feishu_task_uploadattachment');

  registerTool(
    api,
    {
      name: 'feishu_task_uploadattachment',
      label: 'Feishu Task Upload Attachment',
      description: '飞书任务附件上传工具（初版骨架）。当前仅提供最小 upload action，后续可补充真实上传参数。',
      parameters: FeishuTaskUploadattachmentSchema,
      async execute(_toolCallId: string, params: unknown) {
        const p = params as FeishuTaskUploadattachmentParams;
        try {
          const resolved = resolvePathForAction(p.action);
          const client = toolClient();

          const as = 'tenant';
          log.info(`${p.action}: path=${resolved.path}, as=${as}`);

          const res = await client.invokeByPath('feishu_task_uploadattachment.upload', resolved.path, {
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
    { name: 'feishu_task_uploadattachment' },
  );
}
