# Tasks
- [x] Task 1: 新增 `task_steps` 工具骨架
  - [x] 参考 `src/tools/oapi/task/task_agent.ts` 新建 `src/tools/oapi/task/task_steps.ts`
  - [x] 定义最小 schema、参数类型、路径解析和 `execute` 执行入口
  - [x] 接入 `createToolContext`、`registerTool`、`handleInvokeErrorWithAutoAuth` 与统一 JSON 返回

- [x] Task 2: 接入任务工具统一导出
  - [x] 在 `src/tools/oapi/task/index.ts` 中导出 `task_steps` 注册函数
  - [x] 确认新增导出不会影响现有 task 工具注册

- [x] Task 3: 做最小验证
  - [x] 检查 `task_steps.ts` 与 `task_agent.ts` 的结构一致性是否满足预期
  - [x] 运行类型检查或相关诊断，确认未引入明显语法或导出错误

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1]
- [Task 3] depends on [Task 2]
