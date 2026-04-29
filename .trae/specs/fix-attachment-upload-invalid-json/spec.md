# Fix Attachment Upload Invalid JSON Response Spec

## Why
当前 `src/tools/oapi/task/attachment.ts` 的 `upload` action 在运行时抛出错误：
`Unexpected token 'E', "Error when"... is not valid JSON`

从日志可以看到：
- `_invokeInternal` 打印 options 时 `body` 被序列化为 `{}`（FormData 在 `JSON.stringify` 下本就是 `{}`，属正常，不一定是 body 丢失）
- `headers` 中硬编码了 `Content-Type: multipart/form-data; boundary=---7MA4YWxkTrZu0gW`，而实际 body 是 `new FormData()`，其真实 boundary 由 runtime 生成（与硬编码的 boundary 不一致）
- 服务端因为 boundary 不匹配无法解析 multipart，返回的是以 "Error when..." 开头的纯文本而非 JSON，故 `rawLarkRequest` 的 `resp.json()` 抛出 JSON 解析错误

换言之，本次问题的根因是 **错误的手写 `Content-Type` boundary 覆盖了 fetch 自动生成的 multipart boundary**。

## What Changes
- 在 `src/tools/oapi/task/attachment.ts` 的 `upload` 调用里移除手写的 `Content-Type: multipart/form-data; boundary=...` header，交由 fetch 在接收 FormData body 时自动生成正确的 boundary
- 保留 `x-tt-env` 与 `Authorization: Bearer <tenant_access_token>` header
- 不改变 schema / 入参字段 / 表单字段名（`resource_type/resource_id/file`）
- 在 `src/core/raw-request.ts` 若存在 FormData body 时，防御性地确保不会意外注入 `Content-Type: application/json`（当前 `buildRequestBody` 对 FormData 不会返回 json header，保持不变；仅作验证）

## Impact
- Affected specs: task attachment upload multipart boundary handling
- Affected code: `src/tools/oapi/task/attachment.ts`

## ADDED Requirements
### Requirement: Multipart Boundary 由 Runtime 生成
系统 SHALL 在发送 `feishu_task_attachment.upload` 请求时，**不** 手动指定 multipart `Content-Type` header，确保 fetch/undici 能基于 FormData 自动生成正确 boundary 并写入 Content-Type。

#### Scenario: 不手写 multipart Content-Type
- **WHEN** 调用 `upload` 并使用 FormData 构造 body
- **THEN** 请求的 `Content-Type` 由底层 runtime 自动计算
- **THEN** 服务端能成功解析 multipart，返回合法 JSON

### Requirement: 返回体解析错误的可诊断性
系统 SHALL 在服务端返回非 JSON 时，通过现有错误路径（`rawLarkRequest` / `handleInvokeErrorWithAutoAuth`）暴露可读错误，而不是遮蔽为通用 "not valid JSON"。

#### Scenario: 非 JSON 响应的处理
- **WHEN** 服务端返回非 JSON
- **THEN** 错误应尽量保留原始错误信息以便排查

## MODIFIED Requirements
### Requirement: Attachment Upload Header 组装
系统 SHALL 保留 `x-tt-env` 与 `Authorization` header，去掉手动写入的 multipart `Content-Type` header。

#### Scenario: 修复后的 header
- **WHEN** 开发者查看 `attachment.ts` 中的 `invokeByPath` 调用
- **THEN** headers 仅包含 `x-tt-env` 与 `Authorization`
- **THEN** 不再出现 `Content-Type: multipart/form-data; boundary=...`

## REMOVED Requirements
（无）
