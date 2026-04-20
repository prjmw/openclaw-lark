# Fix Task Invoke Env Header Spec

## Why
当前 `src/tools/oapi/task` 目录下部分工具在使用 `client.invoke(...)` 调用 SDK 方法时，把 `x-tt-env` 写进了 SDK 请求 payload 的 `headers` 字段。
这种写法不适用于 `invoke()` 路径，导致该 header 不能按预期透传；而 `invokeByPath()` 的现有 `headers` 用法仍然是正确的，不应改动。

## What Changes
- 修正 `src/tools/oapi/task` 范围内所有 `client.invoke(...)` 场景下的 `x-tt-env` 透传方式
- 保持 `client.invokeByPath(...)` 场景下的 `headers: { 'x-tt-env': 'boe_task_agentqa' }` 不变
- 仅修改真正使用 `invoke()` 且错误注入 `headers` 的 task 工具实现
- 不改变业务 action、请求路径、鉴权身份和入参结构

## Impact
- Affected specs: task tool SDK invoke request options
- Affected code: `src/tools/oapi/task/task.ts`, `src/tools/oapi/task/tasklist.ts`

## ADDED Requirements
### Requirement: Invoke 场景正确透传 x-tt-env
系统 SHALL 在 `client.invoke(...)` 场景下使用 SDK 支持的方式传递 `x-tt-env`，而不是把该 header 放进 SDK payload 对象中。

#### Scenario: 通过 invoke 调用 SDK 方法
- **WHEN** task 工具通过 `client.invoke(...)` 包装 SDK 调用
- **THEN** `x-tt-env` 会通过正确的 request options 透传
- **THEN** SDK payload 中不再保留无效的 `headers` 字段

### Requirement: InvokeByPath 场景保持不变
系统 SHALL 保持 `client.invokeByPath(...)` 场景下现有 `headers` 透传方式不变。

#### Scenario: 通过 invokeByPath 调用原始路径
- **WHEN** task 工具通过 `client.invokeByPath(...)` 调用原始 API 路径
- **THEN** 继续使用现有 `headers: { 'x-tt-env': 'boe_task_agentqa' }`
- **THEN** 不引入与本次修复无关的行为变化

## MODIFIED Requirements
### Requirement: Task 目录下 env header 注入方式
系统 SHALL 统一修正 `src/tools/oapi/task` 目录中所有错误的 `invoke()` header 注入点，并保持业务逻辑不变。

#### Scenario: 修正后查看 task 代码
- **WHEN** 开发者查看 `task.ts`、`tasklist.ts` 中原先错误的 `invoke()` header 注入点
- **THEN** 会看到 `x-tt-env` 通过正确方式注入 request options
- **THEN** 原有参数、日志、返回值和错误处理逻辑保持不变

## REMOVED Requirements
