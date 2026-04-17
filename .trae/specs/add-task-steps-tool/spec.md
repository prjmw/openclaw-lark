# Task Steps Tool Spec

## Why
当前 `src/tools/oapi/task` 目录下还没有 `task_steps` 工具，无法承接后续任务步骤相关能力的接入。
本次先新增一个可注册、可调用的基础 tool，实现方式优先对齐现有 `task_agent.ts`，为后续补充参数和动作预留稳定入口。

## What Changes
- 新增 `task_steps` tool 规格，放置于 `src/tools/oapi/task/task_steps.ts`
- 初始版本优先参考 `task_agent.ts` 的实现结构，包括 schema、参数类型、路径解析、tool 注册与统一错误处理
- 在 `src/tools/oapi/task/index.ts` 中导出 `task_steps` 的注册函数
- 初始版本仅要求具备最小可运行骨架，后续由用户补充具体参数与业务动作

## Impact
- Affected specs: task oapi tools, tool registration, task capability extension
- Affected code: `src/tools/oapi/task/task_steps.ts`, `src/tools/oapi/task/index.ts`

## ADDED Requirements
### Requirement: 提供 Task Steps 工具骨架
系统 SHALL 在 `src/tools/oapi/task` 下新增 `task_steps` tool 文件，并以独立注册函数暴露该工具。

#### Scenario: 注册 task_steps 工具
- **WHEN** 任务工具模块初始化并加载 `task_steps`
- **THEN** 系统可以通过独立注册函数完成该 tool 的注册
- **THEN** tool 名称、标签、描述、参数 schema 与执行入口都已定义

### Requirement: 初始实现对齐 Task Agent 模板
系统 SHALL 让 `task_steps` 的初始代码结构优先对齐 `task_agent.ts`，便于后续增量补充动作和参数。

#### Scenario: 以最小骨架实现
- **WHEN** 开发者查看 `task_steps` 的初始实现
- **THEN** 能看到与 `task_agent.ts` 对齐的 schema 定义、参数类型、路径解析、`createToolContext`、`registerTool` 与 `handleInvokeErrorWithAutoAuth`
- **THEN** 初始实现不强制覆盖完整业务参数，只保留后续扩展所需的最小入口

### Requirement: Task 模块导出新工具
系统 SHALL 在任务工具聚合出口中导出 `task_steps` 的注册函数。

#### Scenario: 从任务工具入口访问新工具
- **WHEN** 其他模块从 `src/tools/oapi/task/index.ts` 引入任务工具注册函数
- **THEN** 可以访问并注册 `task_steps` 对应的导出项

## MODIFIED Requirements
### Requirement: 任务工具聚合出口
系统 SHALL 继续通过 `src/tools/oapi/task/index.ts` 统一导出任务域下的所有工具注册函数，并包含新增的 `task_steps`。

#### Scenario: 维护统一导出列表
- **WHEN** 开发者维护任务域工具入口
- **THEN** 现有导出保持不变
- **THEN** 新增 `task_steps` 导出不会破坏已有工具的注册方式

## REMOVED Requirements
