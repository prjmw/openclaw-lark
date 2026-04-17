/**
 * Copyright (c) 2026 ByteDance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 *
 * feishu_task_steps tool -- Task step capability.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { OpenClawPluginApi } from 'openclaw/plugin-sdk';
import { Type } from '@sinclair/typebox';

import { createToolContext, handleInvokeErrorWithAutoAuth, json, registerTool } from '../helpers';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const FeishuTaskStepsSchema = Type.Union([
  Type.Object({
    action: Type.Literal('append'),
    task_guid: Type.String({
      description: '任务 GUID',
    }),
    idempotent_key: Type.String({
      description: '幂等键',
    }),
    task_steps: Type.Array(
      Type.Object({
        quote: Type.String({
          description: '步骤引用信息',
        }),
        content: Type.String({
          description: '步骤内容',
        }),
        timestamp: Type.Integer({
          description: '步骤时间戳',
        }),
      }),
      {
        description: '要追加的任务步骤列表',
        minItems: 1,
      },
    ),
  }),
]);

type FeishuTaskStepsParams = {
  action: 'append';
  task_guid: string;
  idempotent_key: string;
  task_steps: Array<{
    quote: string;
    content: string;
    timestamp: number;
  }>;
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function resolvePathForAction(action: FeishuTaskStepsParams['action']): { path: string; env: string[] } {
  if (action === 'append') {
    return { path: '/open-apis/task/v2/agent_task_step_info/append_task_steps_oapi_v_2', env: [] };
  }
  return { path: '/open-apis/task/v2/agent_task_step_info/append_task_steps_oapi_v_2', env: [] };
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export function registerFeishuTaskStepsTool(api: OpenClawPluginApi): void {
  if (!api.config) return;
  const cfg = api.config;

  const { toolClient, log } = createToolContext(api, 'feishu_task_steps');

  registerTool(
    api,
    {
      name: 'feishu_task_steps',
      label: 'Feishu Task Steps',
      description: '飞书任务步骤（Task Steps）工具。用于记录任务步骤。',
      parameters: FeishuTaskStepsSchema,
      async execute(_toolCallId: string, params: unknown) {
        const p = params as FeishuTaskStepsParams;
        try {
          if (!p.task_steps.length) {
            return json({
              error: 'task_steps is required and cannot be empty',
            });
          }

          const resolved = resolvePathForAction(p.action);
          const client = toolClient();

          const as = 'tenant';
          log.info(`${p.action}: task_guid=${p.task_guid}, steps_count=${p.task_steps.length}, as=${as}`);

          const res = await client.invokeByPath('feishu_task_steps.append', resolved.path, {
            method: 'POST',
            as,
            body: {
              task_guid: p.task_guid,
              idempotent_key: p.idempotent_key,
              task_steps: p.task_steps,
            },
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
    { name: 'feishu_task_steps' },
  );
}
