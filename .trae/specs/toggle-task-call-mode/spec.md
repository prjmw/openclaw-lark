# Toggle Task Call Mode Spec

## Why
当前 `src/tools/oapi/task/task.ts` 主要通过 `client.invoke(...)` 包装 SDK 调用飞书 Task v2 API。为了便于在运行时快速切换调用链路（例如绕开 SDK 行为差异、定位问题或应急），需要在 `task.ts` 内通过一个常量在两种调用方式间切换：
- `client.invoke(...)`（SDK 语义化调用）
- `client.invokeByPath(...)`（raw path 调用）

## What Changes
- 在 `src/tools/oapi/task/task.ts` 引入一个常量开关（例如 `TASK_CALL_MODE`），用于选择两种调用方式之一
- 当开关选择 `invoke` 时：保持现有行为（仍走 `client.invoke(...)` + SDK 方法调用）
- 当开关选择 `invokeByPath` 时：将原本走 `client.invoke(...)` 的 action 改为走 `client.invokeByPath(...)`（按相同 API 路径/方法发起 raw 请求）
- **不改变** action 名称、请求路径、鉴权身份选择逻辑（`auth_type`）、入参结构、返回结构与错误处理语义
- `append_steps` 已经是 `invokeByPath`，保持现状不变（不受开关影响或显式说明其仍走 raw path）

## Impact
- Affected specs: `feishu_task_task` 的 API 调用链路可切换能力
- Affected code: `src/tools/oapi/task/task.ts`

## ADDED Requirements
### Requirement: Task 调用模式可切换
系统 SHALL 在 `task.ts` 内提供一个常量开关，以在 `invoke` 与 `invokeByPath` 两种模式间切换执行逻辑。

#### Scenario: 使用 invoke 模式（默认）
- **WHEN** 常量选择 `invoke`
- **THEN** `create/get/list/patch/add_members` 等 action 继续使用 `client.invoke(...)` 调用 SDK 方法

#### Scenario: 使用 invokeByPath 模式
- **WHEN** 常量选择 `invokeByPath`
- **THEN** `create/get/list/patch/add_members` 等 action 改为使用 `client.invokeByPath(...)` 调用对应 `/open-apis/task/v2/...` 路径
- **THEN** query/body/path 参数映射与原 SDK 调用语义一致

### Requirement: 参数映射一致
系统 SHALL 在 `invokeByPath` 模式下保持与 SDK payload 等价的参数表达：
- SDK payload `params` → `invokeByPath` 的 `query`
- SDK payload `data` → `invokeByPath` 的 `body`
- SDK payload `path` → 拼接到 `path` URL（例如 `/tasks/:task_guid`）

#### Scenario: patch 更新任务
- **WHEN** action 为 `patch`
- **THEN** 仍构造 `update_fields`，并在 `invokeByPath` 模式下作为 body 的一部分提交
- **THEN** 继续保留“空更新保护”（没有字段更新则返回错误）

## MODIFIED Requirements
### Requirement: Task 工具 API 调用链路
系统 SHALL 在不改变业务行为的前提下，将 `task.ts` 的 API 调用入口改造为“可切换”的两条实现路径。

#### Scenario: 行为不变性
- **WHEN** 切换调用模式
- **THEN** action 的鉴权选择（`auth_type`）、参数校验、日志、返回结构保持一致
- **THEN** 仅底层调用链路发生变化

## REMOVED Requirements
