/**
 * Copyright (c) 2026 ByteDance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 *
 * feishu_task_steps tool -- Task step capability (skeleton).
 *
 * This is an initial minimal tool entry aligned with `task_agent.ts` so that
 * future step-related actions/params can be added incrementally.
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
    action: Type.Union([Type.Literal('ping'), Type.Literal('noop')]),
  }),
]);

type FeishuTaskStepsParams = { action: 'ping' | 'noop' };

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function resolvePathForAction(_action: FeishuTaskStepsParams['action']): { path: string; env: string[] } {
  // Skeleton only: keep a stable place for future API path resolution.
  return { path: '', env: [] };
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
      description: '飞书任务步骤（Task Steps）工具骨架。当前仅提供最小可运行入口，后续可扩展具体 steps 相关 actions 与参数。',
      parameters: FeishuTaskStepsSchema,
      async execute(_toolCallId: string, params: unknown) {
        const p = params as FeishuTaskStepsParams;
        try {
          const resolved = resolvePathForAction(p.action);
          const client = toolClient();

          // Minimal runnable entry:
          // - ping/noop returns a structured payload
          // - keeps client/toolContext in place for future API calls
          log.info(`${p.action}: path=${resolved.path || '<empty>'}`);

          void client; // keep for incremental implementation without lint churn

          return json({
            ok: true,
            action: p.action,
          });
        } catch (err) {
          return await handleInvokeErrorWithAutoAuth(err, cfg);
        }
      },
    },
    { name: 'feishu_task_steps' },
  );
}

