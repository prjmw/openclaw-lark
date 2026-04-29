# Extend Task List And Patch Agent Types Spec

## Why
当前 `src/tools/oapi/task/task.ts` 的 `list` action 还不支持按 agent 任务状态筛选，无法通过现有列举任务工具传入该过滤条件。
同时，`patch` action 中先前补充的 `agent_task_progress`、`agent_task_status` 类型填写有误，需要按最新要求纠正，避免 schema、参数类型和请求体透传与实际接口约定不一致。

## What Changes
- 为 `feishu_task_task` 的 `list` action 新增 1 个可选入参：`agent_task_status`
- 更新 `FeishuTaskTaskSchema` 中 `list` 对应的 TypeBox 定义
- 更新 `FeishuTaskTaskParams` 中 `list` 分支的 TypeScript 类型定义
- 更新 `list` 执行逻辑，将 `agent_task_status` 透传到查询参数
- 修正 `patch` action 中 `agent_task_progress` 的类型为 `string`
- 修正 `patch` action 中 `agent_task_status` 的类型为 `int`
- 同步修正 `patch` 的 schema、参数类型与请求体构造逻辑的类型一致性
- 保持 `create`、`get`、`add_members` 等其他 action 不变

## Impact
- Affected specs: task list input schema, task list query params, task patch input schema
- Affected code: `src/tools/oapi/task/task.ts`

## ADDED Requirements
### Requirement: List 支持 agent_task_status 过滤
系统 SHALL 允许 `feishu_task_task` 的 `list` action 接收 `agent_task_status` 作为可选过滤字段。

#### Scenario: 传入 agent_task_status 查询任务
- **WHEN** 调用 `list` action 时传入 `agent_task_status`
- **THEN** 系统接受该字段，类型为整数
- **THEN** 系统将其写入列表查询参数

### Requirement: 兼容既有 list 调用
系统 SHALL 在扩展 `agent_task_status` 之后保持原有 `list` 行为兼容。

#### Scenario: 不传新增字段时继续查询
- **WHEN** 现有调用方继续只传原有 `list` 字段
- **THEN** 原有查询逻辑保持不变
- **THEN** `agent_task_status` 为可选字段，不引入破坏性变更

### Requirement: Patch 修正 agent 字段类型
系统 SHALL 将 `feishu_task_task` 的 `patch` action 中两个 agent 字段的定义修正为最新约定类型。

#### Scenario: 传入 agent_task_progress 更新任务
- **WHEN** 调用 `patch` action 时传入 `agent_task_progress`
- **THEN** 系统接受该字段，类型为字符串
- **THEN** schema、参数类型和请求体透传保持一致

#### Scenario: 传入 agent_task_status 更新任务
- **WHEN** 调用 `patch` action 时传入 `agent_task_status`
- **THEN** 系统接受该字段，类型为整数
- **THEN** schema、参数类型和请求体透传保持一致

## MODIFIED Requirements
### Requirement: 任务 List 入参定义
系统 SHALL 扩展 `list` action 的 schema 与参数类型，使其同时覆盖原有字段和新增的 `agent_task_status`。

#### Scenario: schema 与运行逻辑保持一致
- **WHEN** 开发者查看 `list` 的 schema、参数类型与查询参数构造逻辑
- **THEN** 三处定义中的字段命名与类型一致
- **THEN** 新增字段可以被稳定透传到 SDK 调用

### Requirement: 任务 Patch 入参定义
系统 SHALL 修正 `patch` action 的 schema 与参数类型，使 `agent_task_progress` 为 `string`、`agent_task_status` 为 `int`，并与请求体构造逻辑保持一致。

#### Scenario: 修正既有错误类型
- **WHEN** 开发者查看 `patch` 的 schema、参数类型与 `updateData` 构造逻辑
- **THEN** `agent_task_progress` 在三处均为字符串
- **THEN** `agent_task_status` 在三处均为整数
- **THEN** 既有 `text_deliveries` 与其他 patch 字段行为保持不变

## REMOVED Requirements
