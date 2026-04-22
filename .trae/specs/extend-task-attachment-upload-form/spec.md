# Extend Task Attachment Upload Form Spec

## Why
当前 `src/tools/oapi/task/attachment.ts` 仅提供 `upload` action 的最小骨架，还不能承载真实的附件上传入参。
本次需要将该工具扩展为可传表单参数的上传入口，以支持任务附件上传与归属资源绑定。

## What Changes
- 为 `feishu_task_attachment` 的 `upload` action 增加 3 个入参：`resource_type`、`resource_id`、`file`
- 明确 `upload` 请求采用 `multipart/form-data` 方式提交
- `resource_type` 为字符串枚举，支持 `task` 与 `task_delivery`，默认值为 `task`
- `resource_id` 表示附件归属资源 ID
- `file` 表示待上传文件
- 更新 `attachment.ts` 中的 schema、TS params 和执行逻辑，使三处定义保持一致

## Impact
- Affected specs: task attachment upload input schema, task attachment upload request body
- Affected code: `src/tools/oapi/task/attachment.ts`

## ADDED Requirements
### Requirement: Upload 支持表单上传参数
系统 SHALL 允许 `feishu_task_attachment` 的 `upload` action 接收真实上传所需的 3 个参数。

#### Scenario: 传入资源类型
- **WHEN** 调用 `upload` action 时传入 `resource_type`
- **THEN** 系统接受该字段，类型为字符串
- **THEN** 允许值为 `task` 或 `task_delivery`
- **THEN** 当调用方未显式指定时，默认值为 `task`

#### Scenario: 传入归属资源 ID
- **WHEN** 调用 `upload` action 时传入 `resource_id`
- **THEN** 系统接受该字段，表示附件归属资源的 ID
- **THEN** 该字段被写入上传请求

#### Scenario: 传入文件
- **WHEN** 调用 `upload` action 时传入 `file`
- **THEN** 系统接受该字段，表示待上传文件
- **THEN** 该字段被放入表单请求体

### Requirement: Upload 使用表单请求体
系统 SHALL 使用 `multipart/form-data` 提交 `upload` action 的请求体，并包含 `resource_type`、`resource_id` 与 `file`。

#### Scenario: 发起上传请求
- **WHEN** `upload` action 被执行
- **THEN** 请求体以表单方式构造
- **THEN** 表单字段名与入参字段名保持一致

## MODIFIED Requirements
### Requirement: Task Attachment Upload 入参定义
系统 SHALL 扩展 `attachment.ts` 中 `upload` action 的 schema、参数类型和执行逻辑，使新增上传参数在三处定义中保持一致。

#### Scenario: 查看 upload 定义
- **WHEN** 开发者查看 `upload` 的 schema、TS 参数类型与执行逻辑
- **THEN** `resource_type`、`resource_id`、`file` 三个字段的命名和语义一致
- **THEN** `resource_type` 默认值规则被明确实现

## REMOVED Requirements
