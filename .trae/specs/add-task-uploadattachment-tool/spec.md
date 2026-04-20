# Add Task Upload Attachment Tool Spec

## Why
当前 `src/tools/oapi/task` 目录下没有用于 “upload attachment” 的 tool，无法通过 OpenClaw-Lark 直接接入任务附件上传能力。
本次先按 `task_agent.ts` 的实现结构新增一个初版骨架 tool，后续由你补充具体入参与接口细节。

## What Changes
- 新增 `feishu_task_uploadattachment` tool：`src/tools/oapi/task/uploadattachment.ts`
- 初版骨架参考 `src/tools/oapi/task/task_agent.ts` 的结构：
  - TypeBox schema + TS params union
  - `resolvePathForAction()` 作为路径解析入口
  - `createToolContext`、`registerTool`、`handleInvokeErrorWithAutoAuth`、统一 `json()` 返回
- 在 `src/tools/oapi/task/index.ts` 导出 `registerFeishuTaskUploadattachmentTool`
- 在 `src/tools/oapi/index.ts` 中注册该 tool

## Impact
- Affected specs: task oapi tool surface, tool registration
- Affected code: `src/tools/oapi/task/uploadattachment.ts`, `src/tools/oapi/task/index.ts`, `src/tools/oapi/index.ts`

## ADDED Requirements
### Requirement: 新增 Upload Attachment Tool
系统 SHALL 新增一个名为 `feishu_task_uploadattachment` 的工具，并提供独立的注册函数 `registerFeishuTaskUploadattachmentTool(api)`。

#### Scenario: 工具注册成功
- **WHEN** OAPI tools 初始化
- **THEN** `feishu_task_uploadattachment` 被注册并可被调用

### Requirement: 初版骨架与可扩展性
系统 SHALL 提供最小可运行骨架，允许后续增量补充上传所需参数与真实调用逻辑。

#### Scenario: 后续扩参
- **WHEN** 开发者需要补充上传入参（如文件、token、metadata 等）
- **THEN** 可在 schema/TS params/execute 三处一致地扩展，不影响工具注册结构

## MODIFIED Requirements
### Requirement: Task 工具聚合导出与注册
系统 SHALL 在任务域聚合入口与 OAPI 注册入口中接入新增 tool 的导出与注册，不破坏现有工具注册。

#### Scenario: 不影响既有任务工具
- **WHEN** 加载 `src/tools/oapi/task/index.ts` 与 `src/tools/oapi/index.ts`
- **THEN** 既有 task tools 仍能正常导出与注册
- **THEN** 新增 tool 也会被注册

## REMOVED Requirements
