---
name: "spec-generator"
description: "为任意技术栈项目生成 AGENTS.md 与 .agents/rules/ 规范体系。按阶段渐进加载 references，优先用 Context7 获取版本化官方文档、CodeGraph 做代码图分析，替代整页抓取与源码通读。Invoke when user wants to generate, optimize, or align project specifications, AGENTS.md, .agents/rules/, or standardize a new/existing project."
---

# 项目规范体系生成器（spec-generator）

根据项目事实、用户确认的需求、动态检索到的官方资料生成规范体系，并遵循技能内置的五大设计支柱：AI 原生、SSOT 驱动、门禁强制、性能先行、防御设计。**不依赖外部固定指南；技术细节一律实时检索并由用户确认。**

## 0. 渐进披露（强制）

只加载本文件 + 下表命中的参考文件，禁止一次性读取全部 `references/`。

| 任务意图（阶段零确认） | 加载顺序 |
|---|---|
| 新生成项目规范 | `01-intake` → `02-stack` → `03-research` → `04-generate-deliver` |
| 优化已有项目规范 | `01-intake` → `02-stack`（仅未对齐维度）→ `03-research`（仅针对变更或未验证维度；无新增技术事实时可跳过）→ `04-generate-deliver` |
| 集成本地技能并生成规范 | `01-intake`（含本地技能解析）→ `02-stack` → `03-research` → `04-generate-deliver` |
| 仅推荐 Skills | `01-intake` → `02-stack` §1.0-A（确认多项目范围）→ §1.0-B（逐项目轻量技术栈预检）→ `04-generate-deliver` §6 |
| 启用 AI 开发工作流（仅适用于新生成 / 优化已有 / 集成本地技能，阶段三之后、阶段四之前） | `05-workflow-mode` + `WORKFLOW-GUIDE.md` → 按选定模式生成资产，再回主流程阶段四（规范以已确认的工作流为基础） |

模板按需读取，禁止预加载：`templates/AGENTS.template.md`、`rule-file.template.md`、`framework-components.template.md`、`rule-domain-mapping.md`、`checklist.md`。

## 1. 铁律

1. 阶段零必须最先执行，用 `AskUserQuestion` 显式确认意图，禁止按宿主环境假设意图。
2. 七阶段顺序不可跳过；每阶段出口条件见 §2，未达成不得进入下一阶段。
3. 禁止凭训练知识定技术栈或最佳实践：Context7 → WebSearch → WebFetch，逐级降级。
4. 禁止硬编码固定技术选项；选择题先检索后提供 ≥3 个选项、附推荐理由并支持 Other。只需确认或批准的事项可用明确的「是 / 否 / 修改」确认，不强行拼凑无关选项。
5. 技术栈适配只允许改实现细节（文件后缀、ORM 语法、框架 API），不得跳过技能内置原则与已确认的工作流约束。
6. 生成内容与回复一律中文；术语、代码标识符、命令、配置保留原语言。
7. 组件名、版本、API 必须有检索来源；无来源标注「待补充」，禁止臆造。
8. 只写规范类文件，不改业务代码，不生成示例业务代码。
9. 单一事实来源：同一约定只在引用文件中定义一次，其余位置引用而非复制。
10. 外部检索结果先压缩为精炼摘要再进入正文，禁止整段粘贴。
11. 启用工作流模式时，规范必须以该工作流为基础生成或回改；关闭时任何规则文件不得出现 OpenSpec、Superpowers、`.ai-workflow/` 内容。

## 2. 七阶段主流程

| 阶段 | 目标 | 关键产物 | 出口条件 | 细则 |
|---|---|---|---|---|
| 0 意图与开关 | 确认任务意图与工具开关；可选解析本地 SKILL.md | 意图记录、工具开关、本地技能清单 | 用户确认意图与开关 | [01-intake](references/01-intake.md) |
| 1 技术栈确认 | 项目范围 / 多项目边界 → 逐项目类型与预检 → 测试和 CI/CD 需求确认 → 逐维度检索确认 → 开源项目推荐 | 项目清单、逐项目技术栈与测试 / CI/CD 决策、参考项目 | 范围确认；各项目维度已确认或标「待定」 | [02-stack](references/02-stack.md) |
| 2 深度检索 | 用 Context7 / CodeGraph 取最佳实践、组件清单、参考项目结构 | 技术最佳实践摘要、组件清单 | 每个技术维度均有来源标注 | [03-research](references/03-research.md) |
| 3 范围确认 | 输出位置、形式、规则域、语言 | 输出范围记录 | 用户确认范围 | [04-generate-deliver](references/04-generate-deliver.md) §3 |
| 3.5 工作流模式（可选） | 探测本机开发工具及其依赖；确认模式、依赖与 token 成本；确定规范所依据的工作流 | 工具状态、安装记录、规则映射，以及所选模式实际需要的工作流资产与项目级 Skills | 用户确认模式和安装操作；完整模式依赖可用；阶段四受影响规则已列出 | [05-workflow-mode](references/05-workflow-mode.md) + [WORKFLOW-GUIDE](WORKFLOW-GUIDE.md) |
| 4 生成规范 | 综合项目证据、用户确认、动态检索与技能内置规则，按顺序生成 AGENTS.md 与规则文件 | 规范文件 | 清单内文件全部落盘 | 同上 §4 |
| 5 自检交付 | 按 checklist 自检并交付 | 自检报告、文件清单 | checklist 无未解释的失败项 | 同上 §5 |
| 6 Skills 推荐 | 按用户选择检索 skills.sh；仅获准后更新 README | 推荐 Skills 章节 | 推荐已交付；若用户同意写 README，则更新成功或输出降级文件 | 同上 §6 |

## 3. 工具调用契约（接入位置与调用逻辑）

**先读阶段零的开关记录**：Context7、CodeGraph、子代理并行三项均由用户在阶段零勾选，可任意组合。未启用时直接走「降级路径」，禁止擅自调用、禁止提示「MCP 不可用」，其余流程与产物结构保持不变。

| 能力 | 工具 | 接入阶段 | 调用序列 | 调用约束 | 降级路径 |
|---|---|---|---|---|---|
| 版本化官方文档 | Context7 MCP | 阶段一维度确认、阶段二最佳实践、阶段四组件清单 | `resolve-library-id(libraryName, query)` → `query-docs(libraryId, topic)` | 每库 ≤3 次查询，同主题命中即停 | WebSearch（关键词含年份）→ WebFetch 单页单章节 |
| 代码结构分析 | CodeGraph MCP / CLI | 阶段一预检补充、阶段二参考项目分析、优化已有规范 | `codegraph_status` → `codegraph_explore(query)` → `codegraph_node(symbol)` | 只保留约定、路径与代表符号 | `codegraph` CLI；再降级 Glob + 定向 Read |
| 时效性与社区趋势 | WebSearch | Context7 未覆盖、需横向对比时 | 单维度 ≤4 次查询 | 只保留结论与来源 | 标注「未经最新实践验证」 |
| 单页补充 | WebFetch | 官方文档无 Context7 索引时 | 一次一页，按章节取 | 只取目标章节 | 跳过并告知用户 |
| 项目预检 | Glob / LS / Read | 阶段一 | 扫描配置文件 → 只读命中的配置 | 只保留关键配置项 | CodeGraph `files` / `query` |
| 本地技能解析 | Glob / LS / Read | 阶段零 | 校验路径 → 读 frontmatter → 摘要 | 只留摘要与片段 | 跳过本地技能集成 |
| 用户决策 | AskUserQuestion | 阶段 0 / 1 / 3 / 3.5 | 选择题 ≥3 个选项并标推荐；确认 / 批准可用「是 / 否 / 修改」 | — | 禁止默认代替用户决策 |
| 并行检索 | Task | 仅当阶段零开启子代理并行时，在阶段一确认后启动并于阶段六汇总 | 按技术维度并行子代理 | 每子代理 ≤5 条 | 主流程串行检索 |

**Context7 调用要点**：先按技术名解析 library（如 `nestjs`、`vue`、`typeorm`），再用窄主题查询（`dependency injection`、`middleware`、`transactions`）。同一 library 同一主题只查一次，命中即停；禁止用它查与本项目技术栈无关的库。

**CodeGraph 调用要点**：仅对**本地代码库**使用。索引缺失时先执行 `node scripts/codegraph.mjs ensure --project <path>`；用 `explore` 回答「某能力在项目中的实现与调用路径」，用 `node` 取单个符号的源码与上下游。禁止用它替代用户决策或作为规范内容的唯一来源。

## 4. 质量门禁

- 生成前后各执行一次 `templates/checklist.md`，按项目类型只取适用项。
- 自检报告用表格输出「通过 / 待补充 / 不适用」，不得留空。
- 每项技术最佳实践必须可追溯到来源（Context7 库 ID、URL、本地技能路径或 CodeGraph 查询），并标注检索日期。

## 5. 异常与降级

| 情况 | 处理 |
|---|---|
| Context7 无该库 | 转 WebSearch（含当前年份），仍无结果则标注「未验证」 |
| CodeGraph 未索引 / 索引失败 | CLI `codegraph init <path>`；失败则 Glob + 定向 Read，并告知用户 |
| WebFetch 失败 | 保留已有检索结论，标注缺失项，不阻塞后续阶段 |
| 用户维度「待定」 | 写入 `{待定：需补充{维度}}`，交付时汇总 |
| 项目证据、用户意图与技术实践冲突 | 说明冲突；尊重用户确认的目标与可验证项目事实，技术细节注明官方资料依据 |
| 子代理检索失败 | 若并行开关开启，主流程 WebFetch 兜底；若并行关闭则本就由主流程检索。只有用户同意写 README 且写入失败时才输出 `RECOMMENDED-SKILLS.md` |
| 本地技能格式不合法 | 跳过该文件、告知原因、提供「跳过集成」路径 |
| 完整工作流必需依赖安装失败 | 停止完整工作流并请用户选择改为轻量模式或关闭工作流；若用户选择关闭，可继续普通规范生成，但不得标记工作流已接入 |
| 探测不到 AI 开发工具 | 让用户手工指定工具与落点，禁止假定 |

## 6. 输出清单

```
each-target-project-root/
├── AGENTS.md
└── .agents/
    ├── rules/
    │   ├── architecture.md
    │   ├── api-contract.md
    │   ├── backend.md            # 仅前端跳过
    │   ├── database.md           # 仅前端或无数据库时跳过
    │   ├── frontend-ui.md        # 仅后端跳过
    │   ├── data-permission.md    # 可选
    │   ├── cache-consistency.md  # 可选
    │   ├── dev-tooling.md
    │   ├── testing.md
    │   ├── devops.md
    │   ├── security.md
    │   ├── workflow.md
    │   └── documentation.md
    └── instructions/
        └── markdown-format.instructions.md   # 可选

# 启用工作流模式（阶段 3.5）时，按 `05-workflow-mode.md` 选择的模式生成：
docs/ai-workflow-guide.md                 # 使用教程
# 老项目已有代码时追加：
docs/project-feature-inventory.md         # 已完成 / 部分完成 / 缺失 / 未知功能及证据
README.md                                 # 仅用户同意更新推荐时修改
README.zh-CN.md                           # 用户同意且此文件存在时同步
RECOMMENDED-SKILLS.md                     # 获准更新 README 但写入失败时降级生成
# 完整模式：生成完整闭环资产（包括三个项目级 Skills 与 openspec/）
# 轻量模式：仅生成共同资产、ai-dev-workflow 与 project-quality-gate；不生成 openspec/、implement-change
# 自定义模式：只生成用户确认启用的阶段、依赖与对应资产，不保留被排除阶段的文件或路由
```

实际生成的 Skill 源文件还须安装 / 链接到所选宿主的真实项目级技能目录，并验证可见、可调用；只保存在 `.ai-workflow/skills/` 不代表已安装。各模式的精确资产清单以 `references/05-workflow-mode.md` 为准。

## 7. 技能依赖

`Glob` `LS` `Read` `Write` `Edit` `AskUserQuestion` `WebSearch` `WebFetch` `Task`，以及 MCP：`context7`、`codegraph`。`integrations/mcp.json` 仅为参考结构；宿主配置格式、认证变量和保存位置须按所选工具的官方文档适配，不得直接假定可跨工具复制。

本地脚本：`scripts/detect-agents.mjs`（探测本机已安装的 AI 开发工具与当前会话）、`scripts/codegraph.mjs`（代码图 CLI 兜底）。

## 8. 版本

v2.6：补齐全栈 / 仅前端 / 仅后端及完整 / 轻量 / 自定义工作流的交叉裁剪；AGENTS 模板、框架内置能力、质量门禁、依赖和教程均按项目类型及模式选择生成，明确多项目逐项目隔离。

v2.5：按用户定制工作流重构完整模式，补齐 AOCI、OpenSpec、Superpowers、项目级交接与质量门禁 Skills、Ponytail 和风险触发 gstack 的依赖及顺序；保留逐项目测试 / CI/CD 确认、多项目隔离和显式发布授权。

v2.4：增加逐项目测试 / CI/CD 需求确认、Ponytail 与 gstack 状态检测；保留工作流冲突审查。

v2.3：增加多项目目录与异构技术栈识别、逐项目规范隔离和工作流覆盖范围确认；移除外部固定指南依赖。

v2.1：新增可选「AI 开发工作流模式」（阶段 3.5），探测本机开发工具、提示依赖与 token 成本、支持新老项目、产出使用教程；新增 `scripts/detect-agents.mjs`。

v2.0：主入口改为渐进披露，流程细则迁入 `references/`；接入 Context7 与 CodeGraph，替代整页文档抓取与参考项目源码通读；新增功能等价性验证脚本。
