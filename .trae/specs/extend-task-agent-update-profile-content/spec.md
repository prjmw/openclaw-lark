# Extend Task Agent Update Profile Content Spec

## Why
当前 `src/tools/oapi/task/task_agent.ts` 的 `update_profile` action 还不支持传入主页内容，无法通过现有智能体主页更新工具设置智能体主页文案。
本次需要在保持 `register`、`unregister`、`list_registered` 等既有行为不变的前提下，为 `update_profile` 增加 `profile_content` 入参并透传到请求。

## What Changes
- 为 `feishu_task_agent` 的 `update_profile` action 新增 1 个必填入参：`profile_content`
- 更新 `FeishuTaskAgentSchema` 中 `update_profile` 对应的 TypeBox 定义
- 更新 `FeishuTaskAgentParams` 中 `update_profile` 分支的 TypeScript 类型定义
- 更新 `update_profile` 执行逻辑，将 `profile_content` 写入调用请求
- 保持 `register`、`unregister`、`list_registered` / `list_register` 等其他 action 不变

## Impact
- Affected specs: task agent update_profile input schema, task agent update_profile request payload
- Affected code: `src/tools/oapi/task/task_agent.ts`

## ADDED Requirements
### Requirement: Update Profile 支持 profile_content
系统 SHALL 允许 `feishu_task_agent` 的 `update_profile` action 接收 `profile_content` 作为主页内容字段。

#### Scenario: 传入主页内容更新智能体主页
- **WHEN** 调用 `update_profile` action 时传入 `profile_content`
- **THEN** 系统接受该字段，类型为字符串
- **THEN** 系统将其写入更新主页请求

### Requirement: 仅 update_profile 扩展新字段
系统 SHALL 仅在 `update_profile` action 中增加 `profile_content`，不影响其他 action 的入参结构。

#### Scenario: 调用其他 action
- **WHEN** 调用 `register`、`unregister`、`list_registered` 或 `list_register`
- **THEN** 原有 schema、身份选择和调用逻辑保持不变

## MODIFIED Requirements
### Requirement: Task Agent Update Profile 入参定义
系统 SHALL 扩展 `update_profile` action 的 schema 与参数类型，使 `profile_content` 在 schema、参数类型和请求透传三处保持一致。

#### Scenario: 查看 update_profile 定义
- **WHEN** 开发者查看 `update_profile` 的 schema、参数类型与执行逻辑
- **THEN** 三处定义中的字段命名与类型一致
- **THEN** 新增字段可以被稳定透传到接口调用

## REMOVED Requirements
