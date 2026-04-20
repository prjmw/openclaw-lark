# Tasks
- [x] Task 1: 新增 `feishu_task_uploadattachment` 工具骨架
  - [x] 新建 `src/tools/oapi/task/uploadattachment.ts`
  - [x] 参考 `task_agent.ts` 定义 schema / params / resolvePathForAction / registerTool / 错误处理
  - [x] 初版 action 保持最小（例如 `upload`），具体上传参数后续补充

- [x] Task 2: 接入任务工具聚合导出与 OAPI 注册
  - [x] 在 `src/tools/oapi/task/index.ts` 导出 `registerFeishuTaskUploadattachmentTool`
  - [x] 在 `src/tools/oapi/index.ts` 注册该工具

- [x] Task 3: 做最小验证
  - [x] 确认新 tool 被导出并在 OAPI 注册入口中被调用
  - [x] 运行诊断或类型检查，确认未引入明显语法/导出错误

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1]
- [Task 3] depends on [Task 2]
