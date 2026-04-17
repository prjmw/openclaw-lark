# Extend Task Patch Agent Fields Spec

## Why
当前 `src/tools/oapi/task/task.ts` 的 `patch` action 还不支持传入 agent 任务相关的扩展字段，导致无法通过现有更新任务工具同步代理任务进度、状态和文本投递信息。
本次需要在保持现有 `patch` 行为不变的前提下，补充 3 个新增入参并写入更新请求体。

## What Changes
- 为 `feishu_task_task` 的 `patch` action 新增 3 个可选入参：`agent_task_progress`、`agent_task_status`、`text_deliveries`
- 更新 `FeishuTaskTaskSchema` 中 `patch` 对应的 TypeBox 定义
- 更新 `FeishuTaskTaskParams` 中 `patch` 分支的 TypeScript 类型定义
- 更新 `patch` 执行逻辑，将新增字段写入 `updateData`，并自动纳入 `update_fields`
- 保持 `create`、`get`、`list`、`add_members` 等其他 action 不变

## Impact
- Affected specs: task patch input schema, task patch request payload
- Affected code: `src/tools/oapi/task/task.ts`

## ADDED Requirements
### Requirement: Patch 支持 agent 扩展字段
系统 SHALL 允许 `feishu_task_task` 的 `patch` action 接收与代理任务相关的 3 个新增可选字段。

#### Scenario: 传入新增字段更新任务
- **WHEN** 调用 `patch` action 时传入 `agent_task_progress`
- **THEN** 系统接受该字段，类型为整数
- **THEN** 系统将其写入更新请求体

#### Scenario: 传入任务状态更新任务
- **WHEN** 调用 `patch` action 时传入 `agent_task_status`
- **THEN** 系统接受该字段，类型为字符串
- **THEN** 系统将其写入更新请求体

#### Scenario: 传入文本投递列表更新任务
- **WHEN** 调用 `patch` action 时传入 `text_deliveries`
- **THEN** 系统接受该字段，类型为字符串数组
- **THEN** 系统将其写入更新请求体

### Requirement: 新增字段参与 update_fields 计算
系统 SHALL 在 `patch` action 中将新增字段与现有可更新字段一起参与 `update_fields` 计算。

#### Scenario: 仅更新新增字段
- **WHEN** 调用 `patch` action 且只传入新增的 agent 字段
- **THEN** `update_fields` 包含对应字段名
- **THEN** 系统仍可构造有效的 patch 请求

## MODIFIED Requirements
### Requirement: 任务 Patch 入参定义
系统 SHALL 扩展 `patch` action 的 schema 与参数类型，使其同时覆盖原有字段和新增 agent 字段。

#### Scenario: 保持既有 patch 能力兼容
- **WHEN** 现有调用方继续只传原有字段
- **THEN** 原有更新逻辑保持不变
- **THEN** 新增字段均为可选，不引入破坏性变更

## REMOVED Requirements
