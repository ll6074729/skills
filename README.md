# spec-generator（项目规范体系生成器）

一个面向 AI Agent 的技能（Skill），为任意技术栈的全栈项目生成一套完整、专业且针对性强的规范文档体系。

## 简介

`spec-generator` 基于《通用项目规范体系设计指南》的五大支柱思想框架（AI 原生、SSOT 驱动、门禁强制、性能先行、防御设计），为你的项目自动生成 `AGENTS.md` 顶层入口和 `.agents/rules/` 下的领域规则文件。

**核心设计理念**：本技能不采用固定方法的直接植入，而是通过对核心思想的理解与应用，通过动态学习与用户沟通构建解决方案框架。特别针对后端等可能存在知识盲区的领域，建立动态学习和信息检索机制，确保规范生成的适应性和时效性。

## 核心特性

- **动态技术栈确认**：通过「项目预检 → 实时网络检索 → 动态生成选项 → 用户确认」的循环与用户共同确定适用技术，不预设固定选项
- **实时检索最佳实践**：所有技术推荐基于当前年份的网络检索结果，禁止使用过时信息
- **开源项目推荐**：技术栈确定后检索并推荐相关高质量开源项目作为参考
- **框架内置组件适配**：支持根据 vben、ant-design-pro 等包含内置组件库的框架生成「框架内置组件优先使用」规则
- **Skills 生态推荐**：规范生成完成后，从 [skills.sh](https://www.skills.sh/) 检索适合项目技术栈的 AI Agent Skills 并更新到 README
- **六阶段执行流程**：动态技术栈确认 → 深度检索最佳实践 → 确认规范范围 → 生成规范文档 → 自检与交付 → 推荐 Skills 并更新 README
- **中文输出**：所有生成的回复内容及文件使用中文表述，技术术语和代码标识符保留原语言

## 触发场景

以下任一场景可触发本技能：

- 用户要求生成项目规范、规范体系、规范文档
- 用户要求创建 `AGENTS.md` 或 `.agents/rules/` 规则文件
- 用户要求为新项目或现有项目搭建标准化规范
- 用户要求基于《通用项目规范体系设计指南》生成规范
- 用户要求为特定技术栈定制规范文档
- 用户要求整合技术最佳实践与项目规范

## 安装

```bash
npx skills add ll6074729/skills
```

## 使用方式

安装后，在你的项目中直接对 AI Agent 描述需求即可触发本技能，例如：

```
为新项目生成规范体系
为我们的 NestJS + Vue3 + TypeORM 项目搭建标准化规范
基于《通用项目规范体系设计指南》生成 AGENTS.md 和规则文件
```

技能将按六阶段流程执行：动态确认技术栈 → 检索最佳实践 → 确认输出范围 → 生成规范文档 → 自检交付 → 推荐 Skills。

## 输出文件结构

执行完成后，将生成以下文件结构（根据用户选择的规则域调整）：

```
project-root/
├── AGENTS.md                          # 顶层规范入口
├── README.md                          # 项目说明（含推荐 Skills 章节）
└── .agents/
    └── rules/
        ├── architecture.md            # 架构设计规则
        ├── api-contract.md            # 接口契约规则
        ├── backend.md                 # 后端实现规则
        ├── database.md                # 数据库规则
        ├── frontend-ui.md             # 前端 UI 规则
        ├── data-permission.md         # 数据权限规则（可选）
        ├── cache-consistency.md       # 缓存一致性规则（可选）
        ├── dev-tooling.md             # 开发工具规则
        ├── testing.md                 # 测试验证规则
        ├── workflow.md                # 开发流程规则
        └── documentation.md          # 文档规范规则
```

## 技能依赖

本技能执行依赖以下工具：

- `Glob` / `LS` / `Read`：项目技术栈预检
- `AskUserQuestion`：动态询问用户技术栈与规范范围
- `WebSearch`：检索各技术最新最佳实践
- `WebFetch`：获取框架官方文档内容
- `Write` / `Edit`：生成规范文档与更新 README
- `Task`：启动子智能体并行检索 skills.sh

## 项目结构

```
skills/
├── README.md                                    # 本文件
└── spec-generator/
    ├── SKILL.md                                 # 技能入口与执行流程定义
    └── templates/                               # 规范生成模板
        ├── AGENTS.template.md                   # AGENTS.md 顶层模板
        ├── rule-file.template.md                # 规则文件通用模板
        ├── framework-components.template.md     # 框架内置组件清单模板
        ├── rule-domain-mapping.md               # 规则域映射
        └── checklist.md                         # 自检清单
```

## 版本

- 当前版本：v1.6
- 更新策略：当《通用项目规范体系设计指南》更新时同步更新生成逻辑；技术栈适配通过实时检索，不使用固定速查表

## 许可证

MIT
