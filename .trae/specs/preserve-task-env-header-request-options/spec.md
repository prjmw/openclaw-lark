# Preserve Task Env Header Request Options Spec

## Why
`src/tools/oapi/task/task.ts` 里的 `withTaskEnvHeader()` 通过对象展开重建 SDK request options，再补充 `x-tt-env`。
如果 `client.invoke(...)` 传入的 `opts` 不是可安全展开的普通对象，这种写法可能丢失 SDK 内部依赖的鉴权信息或请求元数据，导致 `x-tt-env` 看似已注入但实际请求行为异常。

## What Changes
- 修正 `task.ts` 中 `withTaskEnvHeader()` 对 SDK request options 的处理方式
- 保留原始 `opts` 对象，只补充/合并 `headers['x-tt-env']`
- 同步修正 `tasklist.ts` 中相同模式的 helper，避免同类问题重复出现
- 保持所有 action 的请求路径、鉴权身份、参数结构和返回结构不变
- 保持 `invokeByPath(...)` 场景下直接传 `headers` 的写法不变

## Impact
- Affected specs: task/tasklist 工具的 SDK request options header 注入行为
- Affected code: `src/tools/oapi/task/task.ts`, `src/tools/oapi/task/tasklist.ts`

## ADDED Requirements
### Requirement: 保留原始 SDK Request Options
系统 SHALL 在 `client.invoke(...)` 场景下注入 `x-tt-env` 时保留 SDK 传入的原始 request options 对象，而不是通过对象展开重建一个新对象。

#### Scenario: invoke 场景下注入 env header
- **WHEN** `task.ts` 或 `tasklist.ts` 调用 `withTaskEnvHeader(opts)`
- **THEN** 返回值会继续承载 SDK 原始 request options 上的鉴权与请求元数据
- **THEN** `headers['x-tt-env']` 会被正确补充或覆盖为目标环境值

### Requirement: Tenant 场景支持独立注入 Header
系统 SHALL 在 `opts` 为空时仍能构造仅包含 `x-tt-env` 的 request options，供 tenant 身份 SDK 调用使用。

#### Scenario: invoke 回调未提供 opts
- **WHEN** `client.invoke(...)` 以 tenant 身份执行且回调参数 `opts` 为 `undefined`
- **THEN** helper 会返回一个新的 request options 对象
- **THEN** 该对象至少包含 `headers: { 'x-tt-env': 'boe_task_agentqa' }`

## MODIFIED Requirements
### Requirement: Task 工具 env header 注入方式
系统 SHALL 以“不破坏 SDK request options 内部结构”为前提，为 task 相关 SDK 调用统一注入 `x-tt-env`。

#### Scenario: 修复后查看 helper 实现
- **WHEN** 开发者查看 `task.ts` 与 `tasklist.ts` 中的 env header helper
- **THEN** 不再看到对 `opts` 的对象展开重建
- **THEN** 会看到仅对 `headers` 做增量合并的实现

## REMOVED Requirements
