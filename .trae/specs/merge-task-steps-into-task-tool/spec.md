# Merge Task Steps Into Task Tool Spec

## Why
当前任务域下同时存在 `feishu_task_task` 和独立的 `feishu_task_steps`，任务步骤追加能力分散在两个 tool 中，增加了维护成本和调用入口复杂度。
本次需要将 `task_steps.ts` 中的 `append` 能力合入 `task.ts`，改为 `feishu_task_task` 的一个 action，并删除独立的 `feishu_task_steps` tool。

## What Changes
- 在 `src/tools/oapi/task/task.ts` 中新增一个用于追加任务执行记录的 action
- 将当前 `task_steps.ts` 中 `append` 的入参定义、路径、授权方式和请求透传逻辑迁移到 `task.ts`
- 更新 `FeishuTaskTaskSchema`、`FeishuTaskTaskParams` 和 `execute` 分支逻辑以支持新 action
- 删除 `src/tools/oapi/task/task_steps.ts`
- 从 `src/tools/oapi/task/index.ts` 中移除 `task_steps` 的导出
- **BREAKING** 删除独立 tool `feishu_task_steps`

## Impact
- Affected specs: task tool action surface, task steps append capability, task tool exports
- Affected code: `src/tools/oapi/task/task.ts`, `src/tools/oapi/task/index.ts`, `src/tools/oapi/task/task_steps.ts`

## ADDED Requirements
### Requirement: Task Tool 支持追加任务步骤
系统 SHALL 在 `feishu_task_task` 中提供一个 action 来追加任务执行记录，并承接原 `feishu_task_steps.append` 的能力。

#### Scenario: 通过 task tool 追加任务步骤
- **WHEN** 调用 `feishu_task_task` 的新 action，并传入 `task_guid`、`idempotent_key` 和 `task_steps`
- **THEN** 系统接受这些字段
- **THEN** 系统使用与原 `task_steps.append` 相同的接口路径和授权方式发起请求
- **THEN** `task_steps` 的内部对象结构保持为 `quote:string`、`content:string`、`timestamp:int`

### Requirement: 新 action 继承原 append 的约束
系统 SHALL 让新 action 继承原 `append` 的核心约束，包括 `task_steps` 非空和请求体字段结构不变。

#### Scenario: 传入空步骤数组
- **WHEN** 调用新 action 且 `task_steps` 为空数组
- **THEN** schema 或执行逻辑会拒绝该请求

## MODIFIED Requirements
### Requirement: Task Tool 入参定义
系统 SHALL 扩展 `feishu_task_task` 的 schema 和参数类型，使其包含新增 action 及对应字段定义。

#### Scenario: 查看 task tool 定义
- **WHEN** 开发者查看 `task.ts` 的 schema、参数类型与执行逻辑
- **THEN** 新 action 的字段命名、类型和请求透传三处保持一致

### Requirement: Task 工具聚合出口
系统 SHALL 继续通过 `src/tools/oapi/task/index.ts` 聚合导出任务域工具，但不再导出独立的 `task_steps`。

#### Scenario: 从任务工具入口加载导出
- **WHEN** 其他模块从 `src/tools/oapi/task/index.ts` 加载任务域工具
- **THEN** `feishu_task_task` 仍可被正常导出
- **THEN** 不再存在 `task_steps` 的导出项

## REMOVED Requirements
### Requirement: 独立 Task Steps Tool
**Reason**: 任务步骤追加能力并入 `feishu_task_task`，减少独立 tool 入口。
**Migration**: 调用方改为使用 `feishu_task_task` 的新 action 完成任务步骤追加。
