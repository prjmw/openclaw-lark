# Fix Task Attachment Multipart Upload Spec

## Why
当前 `src/tools/oapi/task/attachment.ts` 的 `upload` action 采用 `multipart/form-data` 构造请求体，但存在参数透传方式不可靠的问题：
- 获取 tenant token 时使用了 `client.sdk.appId/appSecret`（SDK 客户端通常不暴露这些字段），导致拿不到 token 或拿错 token。
- `raw-request.ts` 会通过 `append()` + `entries()` 判断是否为 FormData；而 `attachment.ts` 的 FormData 类型/构造方式可能导致该判断不稳定，进而把表单误当作 JSON body 发送。

本次修复目标是让 `upload` action 的表单字段与鉴权头部稳定、正确地传递到飞书 API。

## What Changes
- 修正 `attachment.ts` 中 tenant token 的获取方式：使用工具侧可用的 account credentials（而非 `client.sdk.*`）
- 修正 `attachment.ts` 的表单 body 传递方式：确保 raw-request 能识别为 FormData 并按 multipart 发送
- 保持 `upload` action 的 schema/入参字段名不变（`resource_type/resource_id/file`）
- 其他实现细节（env header 常量、invokeByPath 使用方式、错误处理风格）参考 `src/tools/oapi/task/task.ts`

## Impact
- Affected specs: task attachment upload multipart param passing
- Affected code: `src/tools/oapi/task/attachment.ts`, `src/core/raw-request.ts`（仅当需要补齐 FormData 判定边界时）

## ADDED Requirements
### Requirement: Upload 表单体稳定透传
系统 SHALL 在执行 `feishu_task_attachment.upload` 时使用 `multipart/form-data` 发送请求体，并确保 `resource_type/resource_id/file` 三个字段稳定写入表单。

#### Scenario: 表单字段透传
- **WHEN** 调用 `upload` 并传入 `resource_type/resource_id/file`
- **THEN** HTTP 请求体为 multipart 表单
- **THEN** 表单字段名与入参字段名一致

### Requirement: Tenant Token 获取正确
系统 SHALL 使用可用的 app credential 获取 tenant_access_token，并以 `Authorization: Bearer <token>` 形式加入上传请求头。

#### Scenario: 获取并使用 TAT
- **WHEN** 执行 `upload`
- **THEN** 使用 tool client 的 account credential 获取 tenant_access_token
- **THEN** 上传请求包含 `Authorization: Bearer <tenant_access_token>`

## MODIFIED Requirements
### Requirement: Attachment Upload 执行逻辑
系统 SHALL 在不改变 action 名称与入参结构的前提下，修正 `attachment.ts` 的表单与鉴权参数传递方式，使其可稳定工作。

#### Scenario: 修复后查看代码
- **WHEN** 开发者查看 `attachment.ts` 的 `upload` 执行逻辑
- **THEN** 不再依赖 `client.sdk.appId/appSecret` 获取 token
- **THEN** 表单 body 会被 raw-request 识别为 FormData 并正确发送

## REMOVED Requirements
