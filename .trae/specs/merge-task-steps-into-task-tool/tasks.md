# Tasks
- [x] Task 1: 将 task steps append 能力迁移到 `task.ts`
  - [x] 在 `src/tools/oapi/task/task.ts` 的 TypeBox schema 中新增 task steps append action
  - [x] 在 `FeishuTaskTaskParams` 中新增对应参数类型
  - [x] 在 `execute` 中新增分支，复用原 `task_steps.append` 的路径、授权方式和请求体结构
  - [x] 保留 `task_steps` 非空约束与内部对象结构定义

- [x] Task 2: 移除独立 `task_steps` tool
  - [x] 删除 `src/tools/oapi/task/task_steps.ts`
  - [x] 从 `src/tools/oapi/task/index.ts` 中移除 `registerFeishuTaskStepsTool` 导出
  - [x] 确认任务域其他 tool 导出不受影响

- [x] Task 3: 做最小验证
  - [x] 检查 `task.ts` 中新 action 的 schema、参数类型、执行逻辑三处定义保持一致
  - [x] 检查 `task/index.ts` 不再导出 `task_steps`
  - [x] 检查独立 `task_steps.ts` 已被移除
  - [x] 运行诊断或类型检查，确认未引入明显语法错误

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1]
- [Task 3] depends on [Task 2]
