# Extend Task Steps Append Params Spec

## Why
当前 `src/tools/oapi/task/task_steps.ts` 的 `append` action 还是最小骨架，只支持 `action` 本身，无法传入任务执行记录所需的关键参数。
本次需要为 `append` 增加任务标识、幂等键和步骤数组入参，使该工具具备提交任务执行记录的基础请求能力。

## What Changes
- 为 `feishu_task_steps` 的 `append` action 新增 3 个入参：`task_guid`、`idempotent_key`、`task_steps`
- 为 `task_steps` 定义对象数组结构，单个对象包含 `quote`、`content`、`timestamp`
- 更新 `FeishuTaskStepsSchema` 中 `append` 对应的 TypeBox 定义
- 更新 `FeishuTaskStepsParams` 中 `append` 分支的 TypeScript 类型定义
- 更新 `append` 执行逻辑，将新增字段透传到接口调用请求

## Impact
- Affected specs: task steps append input schema, task steps append request payload
- Affected code: `src/tools/oapi/task/task_steps.ts`

## ADDED Requirements
### Requirement: Append 支持任务执行记录参数
系统 SHALL 允许 `feishu_task_steps` 的 `append` action 接收任务执行记录所需的完整参数集合。

#### Scenario: 传入基础定位参数
- **WHEN** 调用 `append` action 时传入 `task_guid` 与 `idempotent_key`
- **THEN** 系统接受这两个字段，类型均为字符串
- **THEN** 系统将其写入追加任务执行记录请求

#### Scenario: 传入步骤数组
- **WHEN** 调用 `append` action 时传入 `task_steps`
- **THEN** 系统接受该字段，类型为对象数组
- **THEN** 每个对象包含 `quote`、`content`、`timestamp`
- **THEN** `quote` 与 `content` 为字符串，`timestamp` 为整数

### Requirement: Append 请求透传新增字段
系统 SHALL 在 `append` action 的执行逻辑中透传 `task_guid`、`idempotent_key` 和 `task_steps`。

#### Scenario: 发起 append 请求
- **WHEN** `append` action 被执行
- **THEN** 接口调用包含新增字段对应的数据结构
- **THEN** tool 名称、路径、授权身份等现有行为保持不变

## MODIFIED Requirements
### Requirement: Task Steps Append 入参定义
系统 SHALL 扩展 `append` action 的 schema 与参数类型，使新增字段在 schema、参数类型和请求透传三处保持一致。

#### Scenario: 查看 append 定义
- **WHEN** 开发者查看 `append` 的 schema、参数类型与执行逻辑
- **THEN** 三处定义中的字段命名与类型一致
- **THEN** `task_steps` 的内部对象结构在三处定义中保持一致

## REMOVED Requirements
