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

import { StringEnum, createToolContext, handleInvokeErrorWithAutoAuth, json, registerTool } from '../helpers';
import { rawLarkRequest } from '../../../core/raw-request';

const TASK_ENV_HEADER = 'x-tt-env';
const TASK_ENV_VALUE = 'boe_task_agentqa';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const FeishuTaskAttachmentSchema = Type.Union([
  Type.Object({
    action: Type.Literal('upload'),
    resource_type: Type.Optional(
      StringEnum(['task', 'delivery_task'], {
        description: '资源类型，可选值：task、delivery_task。默认 task。',
        default: 'task',
      }),
    ),
    resource_id: Type.String({
      description: '资源 ID。',
    }),
    file: Type.String({
      description: '文件内容或文件 token 占位字符串。',
    }),
  }),
]);

type FeishuTaskAttachmentParams = {
  action: 'upload';
  resource_type?: 'task' | 'delivery_task';
  resource_id: string;
  file: string;
};

type MultipartFormData = {
  append(name: string, value: string): void;
  // raw-request.ts uses append()+entries() to detect FormData and avoid JSON encoding.
  entries(): IterableIterator<[string, unknown]>;
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function resolvePathForAction(action: FeishuTaskAttachmentParams['action']): { path: string; env: string[] } {
  if (action === 'upload') {
    return { path: '/open-apis/task/v2/attachments/upload', env: [] };
  }
  return { path: '/open-apis/task/v2/attachments/upload', env: [] };
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
      description: '飞书任务附件工具。当前提供 upload action，用于上传任务附件。',
      parameters: FeishuTaskAttachmentSchema,
      async execute(_toolCallId: string, params: unknown) {
        const p = params as FeishuTaskAttachmentParams;
        try {
          const resolved = resolvePathForAction(p.action);
          const client = toolClient();

          const resourceType = p.resource_type ?? 'task';
          const FormDataCtor = (globalThis as unknown as { FormData?: new () => MultipartFormData }).FormData;
          if (!FormDataCtor) {
            return json({
              error: 'FormData is not available in current runtime.',
            });
          }
          const formData = new FormDataCtor();
          if (typeof formData.append !== 'function' || typeof formData.entries !== 'function') {
            return json({
              error: 'Invalid FormData implementation: require append() + entries().',
            });
          }
          formData.append('resource_type', resourceType);
          formData.append('resource_id', p.resource_id);
          formData.append('file', p.file);

          const as = 'tenant';
          log.info(`${p.action}: path=${resolved.path}, as=${as}`);

          const tatRes = await rawLarkRequest<{
            tenant_access_token?: string;
            [k: string]: unknown;
          }>({
            brand: client.account.brand,
            path: '/open-apis/auth/v3/tenant_access_token/internal/',
            method: 'POST',
            body: {
              app_id: client.account.appId,
              app_secret: client.account.appSecret,
            },
            headers: {
              [TASK_ENV_HEADER]: TASK_ENV_VALUE,
            },
          });
          const token = tatRes?.tenant_access_token;
          if (!token) {
            return json({
              error: 'Failed to get tenant_access_token.',
              response: tatRes,
            });
          }

          const res = await client.invokeByPath('feishu_task_attachment.upload', resolved.path, {
            method: 'POST',
            as,
            body: formData,
            headers: {
              [TASK_ENV_HEADER]: TASK_ENV_VALUE,
              Authorization: `Bearer ${token}`,
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
