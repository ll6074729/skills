# spec-generator（项目规范体系生成器）

面向 AI Agent 的技能：为任意技术栈的全栈项目生成 `AGENTS.md` 与 `.agents/rules/` 规范体系。

基于《通用项目规范体系设计指南》五大支柱（AI 原生、SSOT 驱动、门禁强制、性能先行、防御设计），**不预设固定技术选项**，通过「项目预检 → 实时检索 → 用户确认」动态确定技术栈。

## 设计要点

- **渐进披露**：`SKILL.md` 只保留流程、铁律与工具契约；阶段细则放在 `references/`，按任务意图加载，避免每次执行都吞下全部上下文。
- **Context7 取文档**：版本化官方文档替代整页 `WebFetch`，按主题窄查询并即时压缩。
- **CodeGraph 取结构**：本地代码图回答「某能力如何实现、调用链如何走」，替代 clone 参考项目后通读源码。
- **可校验**：内置功能等价性校验脚本，改动后可复测原有约束是否仍然成立。

## 核心特性

- 七阶段流程：意图与工具开关确认 → 技术栈确认 → 深度检索 → 范围确认 → 生成 → 自检交付 → Skills 推荐
- 工具可选：Context7、CodeGraph、子代理并行由用户勾选，关闭后按原流程（WebSearch + Glob/Read）执行
- AI 开发工作流（可选）：探测本机已装开发工具、提示依赖与安装 token 成本、支持新老项目；规范以该工作流为基础生成或回改，产出 `.ai-workflow/` 门禁、总控 Skill 与项目使用教程
- 项目类型自适应：全栈 / 仅前端 / 仅后端，自动裁剪预检文件、规则域与检索维度
- 开源项目推荐：至少 5 个同栈项目，覆盖 GitHub 与 Gitee，可选本地克隆并由 CodeGraph 分析
- 框架内置组件优先：前端组件、后端能力、ORM 功能、测试工具四类规则
- 安全与部署运维：`security.md`、`devops.md` 覆盖认证授权、数据安全、API 安全、审计、发布回滚与可观测性
- 公共模块抽离：同构流程 ≥2 处且差异仅为配置值时必须抽离，调用点只传配置
- 本地技能集成：解析本地 `SKILL.md` 作为参考素材注入，保留来源标注
- Skills 推荐：从 [skills.sh](https://www.skills.sh/) 并行检索并更新 README
- 中文输出：术语与代码标识符保留原语言

## 触发场景

- 生成项目规范、规范体系、规范文档
- 创建 `AGENTS.md` 或 `.agents/rules/` 规则文件
- 为新项目或现有项目搭建、优化标准化规范
- 基于《通用项目规范体系设计指南》生成规范
- 为特定技术栈定制规范文档

## 安装

```bash
npx skills add ll6074729/skills
```

## 使用方式

安装后直接向 Agent 描述需求即可触发，例如：

```
为新项目生成规范体系
为我们的 NestJS + Vue3 + TypeORM 项目搭建标准化规范
优化现有规范，补齐数据库与测试规则
启用 AI 开发工作流，先探测本机装了哪些开发工具
```

## 输出文件结构

```
project-root/
├── AGENTS.md
├── README.md                     # 追加「推荐 Skills」章节
├── README.zh-CN.md               # 存在则同步
└── .agents/
    └── rules/
        ├── architecture.md
        ├── api-contract.md
        ├── backend.md
        ├── database.md
        ├── frontend-ui.md
        ├── data-permission.md
        ├── cache-consistency.md
        ├── dev-tooling.md
        ├── testing.md
        ├── devops.md
        ├── security.md
        ├── workflow.md
        └── documentation.md

# 启用 AI 开发工作流时追加：
docs/ai-workflow-guide.md
.ai-workflow/
├── required-checks.md
├── workflow-state.md
└── skills/ai-dev-workflow/SKILL.md
```

## 校验

```bash
cd spec-generator
node scripts/verify-parity.mjs        # 功能等价性检查
node scripts/verify-parity.mjs --json # 机器可读输出
```

## 技能依赖

- `Glob` / `LS` / `Read` / `Write` / `Edit`：预检、读取指南、生成与更新文件
- `AskUserQuestion`：意图、技术栈、规范范围确认
- `WebSearch` / `WebFetch`：Context7 未覆盖时的检索与单页补充
- `Task`：阶段六并行检索 skills.sh
- MCP `context7`：版本化官方文档（配置见 `integrations/mcp.json`）
- MCP / CLI `codegraph`：本地代码图分析（`@colbymchenry/codegraph`）

## 项目结构

```
skills/
├── README.md
└── spec-generator/
    ├── SKILL.md                         # 主入口：流程、铁律、工具契约
    ├── WORKFLOW-GUIDE.md                # 可选「AI 开发工作流」使用教程
    ├── references/
    │   ├── 01-intake.md                 # 阶段零：意图与工具开关
    │   ├── 02-stack.md                  # 阶段一：预检与技术栈确认
    │   ├── 03-research.md               # 阶段二：Context7 / CodeGraph 检索
    │   ├── 04-generate-deliver.md       # 阶段三至六：范围、生成、交付、Skills
    │   └── 05-workflow-mode.md          # 阶段 3.5：AI 开发工作流（可选）
    ├── templates/
    │   ├── AGENTS.template.md
    │   ├── rule-file.template.md
    │   ├── rule-domain-mapping.md
    │   ├── framework-components.template.md
    │   └── checklist.md
    ├── integrations/
    │   └── mcp.json                     # Context7 + CodeGraph MCP 配置
    ├── scripts/
    │   ├── codegraph.mjs                # CodeGraph CLI 封装与降级
    │   ├── detect-agents.mjs            # 探测本机已装开发工具与当前会话
    │   └── verify-parity.mjs            # 功能等价性验证
```

## 版本

- 当前版本：v2.1（新增可选 AI 开发工作流与开发工具探测）
- v2.0：渐进披露 + Context7 / CodeGraph 接入
- 更新策略：指南更新时同步生成逻辑；技术信息一律实时检索，不使用固定速查表

## 许可证

MIT
