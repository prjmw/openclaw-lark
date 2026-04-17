/**
 * Copyright (c) 2026 ByteDance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 *
 * feishu_task_agent tool -- Manage Feishu Task Agent registration.
 *
 * Actions:
 * - register:        Register task agent (tenant identity)
 * - unregister:      Unregister task agent (tenant identity)
 * - list_registered: List registered task agents (user identity)
 * - update_profile:  Update task agent profile (tenant identity)
 *

 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import type {OpenClawPluginApi} from 'openclaw/plugin-sdk';
import {Type} from '@sinclair/typebox';

import {createToolContext, handleInvokeErrorWithAutoAuth, json, registerTool} from '../helpers';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const FeishuTaskAgentSchema = Type.Union([
    Type.Object({
        action: Type.Literal('register'),
    }),
    Type.Object({
        action: Type.Literal('unregister'),
    }),
    Type.Object({
        action: Type.Literal('update_profile'),
        profile_content: Type.String(),
    }),
    Type.Object({
        action: Type.Union([Type.Literal('list_registered'), Type.Literal('list_register')]),
    }),
]);

type FeishuTaskAgentParams =
    | { action: 'register' }
    | { action: 'unregister' }
    | { action: 'update_profile'; profile_content: string }
    | { action: 'list_registered' | 'list_register' };

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function resolvePathForAction(action: FeishuTaskAgentParams['action']): { path: string; env: string[] } {
    if (action === 'register') {
        return {path: '/open-apis/task/v2/agent/register_agent_oapi_v_2', env: []};
    }
    if (action === 'unregister') {
        return {path: '/open-apis/task/v2/agent/unregister_agent_oapi_v_2', env: []};
    }
    if (action === 'update_profile') {
        return {path: '/open-apis/task/v2/agent/update_agent_profile_oapi_v_2', env: []};
    }

    // list_registered / list_register
    return {path: '/open-apis/task/v2/agent/list_registered_agent_oapi_v_2', env: []};
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export function registerFeishuTaskAgentTool(api: OpenClawPluginApi): void {
    if (!api.config) return;
    const cfg = api.config;

    const {toolClient, log} = createToolContext(api, 'feishu_task_agent');

    registerTool(
        api,
        {
            name: 'feishu_task_agent',
            label: 'Feishu Task Agent Registration',
            description:
                '飞书任务 Agent 注册管理工具。用于注册/取消注册 Task Agent，以及查询已注册列表。',
            parameters: FeishuTaskAgentSchema,
            async execute(_toolCallId: string, params: unknown) {
                const p = params as FeishuTaskAgentParams;
                try {
                    const normalizedAction = p.action === 'list_register' ? 'list_registered' : p.action;

                    const resolved = resolvePathForAction(p.action);

                    const client = toolClient();

                    // Match openclaw-lark-task semantics:
                    // - register/unregister/update_profile use tenant identity (TAT)
                    // - list_registered uses user identity (UAT)
                    const as =
                        normalizedAction === 'register' || normalizedAction === 'unregister' || normalizedAction === 'update_profile'
                            ? 'tenant'
                            : 'user';

                    log.info(`${normalizedAction}: path=${resolved.path}, as=${as}`);

                    if (normalizedAction === 'list_registered') {
                        const res = await client.invokeByPath('feishu_task_agent.list_registered', resolved.path, {
                            method: 'POST',
                            as,
                            headers: {
                                'x-tt-env': 'boe_task_agentqa'
                            },
                        });
                        return json(res);
                    }

                    if (normalizedAction === 'update_profile') {
                        const res = await client.invokeByPath('feishu_task_agent.update_profile', resolved.path, {
                            method: 'POST',
                            as,
                            data: {
                                profile_content: p.profile_content,
                            },
                            headers: {
                                'x-tt-env': 'boe_task_agentqa'
                            },
                        });
                        return json(res);
                    }

                    // register / unregister
                    const toolAction = normalizedAction === 'register' ? 'feishu_task_agent.register' : 'feishu_task_agent.unregister';
                    const res = await client.invokeByPath(toolAction, resolved.path, {
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
        {name: 'feishu_task_agent'},
    );
}
