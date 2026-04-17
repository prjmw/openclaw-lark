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

import type {OpenClawPluginApi} from 'openclaw/plugin-sdk';
import {Type} from '@sinclair/typebox';

import {createToolContext, handleInvokeErrorWithAutoAuth, json, registerTool} from '../helpers';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const FeishuTaskStepsSchema = Type.Union([
    Type.Object({
        action: Type.Union([Type.Literal('append')]),
    }),
]);

type FeishuTaskStepsParams = { action: 'append' };

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function resolvePathForAction(action: FeishuTaskStepsParams['action']): { path: string; env: string[] } {
    // Skeleton only: keep a stable place for future API path resolution.
    if (action === 'append') {
        return { path: '/open-apis/task/v2/agent_task_step_info/append_task_steps_oapi_v_2', env: [] };
    }
    return {path: '/open-apis/task/v2/agent_task_step_info/append_task_steps_oapi_v_2', env: []};
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export function registerFeishuTaskStepsTool(api: OpenClawPluginApi): void {
    if (!api.config) return;
    const cfg = api.config;

    const {toolClient, log} = createToolContext(api, 'feishu_task_steps');

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
                    const normalizedAction = p.action;

                    const resolved = resolvePathForAction(p.action);
                    const client = toolClient();

                    // Minimal runnable entry:
                    // - ping/noop returns a structured payload
                    // - keeps client/toolContext in place for future API calls

                    const as = 'tenant';
                    log.info(`${p.action}: path=${resolved.path}, as=${as}`);

                    const res = await client.invokeByPath('feishu_task_steps.append', resolved.path, {
                        method: 'POST',
                        as,
                        headers: {
                            'x-tt-env': 'boe_task_agentqa'
                        },
                    });
                    return json(res);

                } catch (err) {
                    return await handleInvokeErrorWithAutoAuth(err, cfg);
                }
            },
        },
        {name: 'feishu_task_steps'},
    );
}

