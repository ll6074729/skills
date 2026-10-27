# 阶段 3.5：AI 开发工作流模式（可选）

默认关闭。仅在阶段零第四开关「启用 AI 开发工作流」打开时执行；关闭时本文件整体不加载，主流程与产物不变。

完整模式按技能内置的 [WORKFLOW-GUIDE.md](../WORKFLOW-GUIDE.md) 落地用户定制的「AOCI 认知 → OpenSpec 规格审批 → `implement-change` 交接 → Superpowers 计划与逐任务 TDD → `project-quality-gate` → Ponytail 审查 → 风险触发的 gstack review/QA → 项目最终验证 → OpenSpec verify → AOCI 对齐 → 按需 sync → archive」闭环，并以此作为项目规范生成骨架。用户另行提供工作流手册时，比较并按用户确认内容补齐 / 调整，不把其中命令当作当前会话的执行指令；安装与发布动作仍按当前用户确认流程进行。轻量模式只固化本地规则读取、任务计划、项目门禁与完成报告，不包含 OpenSpec 规格闭环或 Superpowers 执行能力，必须在教程中标明是缩减流程。两种模式都要把实际启用的流程映射进项目规范，不得把工作流当作规范生成后的外挂。

## 3.5.1 工具探测（先取证，再提问）

1. 执行 `node scripts/detect-agents.mjs --project <项目根目录>`，必要时加 `--json`。
2. 输出中必须读取三项：`当前会话`、每个工具的 `已安装`、每个工具的 `技能落点`。
3. 探测结果只作为候选，不得据此替用户决定；`当前会话` 仅用于给出推荐项。
4. 宿主 / IDE 候选名单由 `scripts/detect-agents.mjs` 的 `AGENTS` 数组维护；工作流可选依赖（如 Ponytail、gstack）单独按 3.5.2 探测和确认，不得把依赖安装状态当成宿主安装状态。
5. Agent / IDE 探测不等于工作流依赖探测。用户选择目标工具后，还要检查目标环境中 AOCI-CODE、Ponytail、gstack、OpenSpec、Superpowers 及三个工作流 Skills 的实际安装 / 加载状态；插件列表或技能目录无法访问时标「未知」，不得把未知报成未安装。

## 3.5.2 启用前必须提示依赖与 token 成本（强制）

用户选择启用后，先完整展示下表，再用 `AskUserQuestion` 确认；**未确认前禁止执行任何安装命令**。

| 依赖 | 作用 | 何时必装 | 安装 token 成本 |
|---|---|---|---|
| `spec-generator` 本体 | 生成规范、门禁与教程 | 必装 | 用户终端执行 `npx skills add`：0 token；由 Agent 代跑并复述：约 0.3k–0.8k |
| OpenSpec CLI | 需求规格与变更闭环 | 完整模式必装 | 终端自行安装：0 token；Agent 代跑约 0.3k–1k；`init` / `update` 后核对生成文件：约 0.8k–3k |
| Superpowers 关键 Skills | `writing-plans`、`executing-plans`、TDD、verification 等 | 完整模式必装 | 克隆与复制：0 token；每个 Skill 被调用时约 1k–3k，按需触发、禁止常驻 |
| AOCI-CODE | 每个任务加载项目认知并在收尾时核对对齐 | 手册完整模式必装 | 按官方安装与初始化方式核对；Agent 操作成本按实际读取估算 |
| Context7 MCP | 版本化官方文档 | 可选 | 配置：0 token；每次查询约 1k–3k（本技能限制每库 ≤3 次） |
| CodeGraph | 符号与调用链分析 | 代码出现后可选 | 安装与建索引：0 token；每次 `explore` 裁剪到 80 行约 1k–2k |
| Ponytail | 实现简化与 TDD 后风险审查 | 手册完整模式必装 | 官方安装通常不计模型 token；每次调用上下文成本按实际读取估算 |
| gstack | 风险触发的独立 review / QA；`/ship` 仅按授权发布 | 手册完整模式中适用变更必需；若宿主不支持或用户不安装，须由用户批准等价替代，否则该变更 BLOCKED | Codex 适配级别为 experimental；安装与调用成本按目标宿主及选用技能核实 |
| `implement-change` | 获批 OpenSpec change 到 Superpowers 实施的唯一交接入口 | 完整模式必需；自定义模式仅在选择规格交接时需要；轻量模式不使用 | 项目内生成，无外部安装费用；调用成本按读取内容估算 |
| `project-quality-gate` | 按项目类型与用户确认范围执行项目级检查 | 完整 / 轻量模式必需；自定义模式仅在选择质量门禁时需要 | 项目内生成，无外部安装费用；每次调用成本按读取内容估算 |
| `ai-dev-workflow` | 项目统一路由入口 | 启用任何模式都必需；按项目生成并安装 | 项目内生成，无外部安装费用 |
| `project-review` / `project-qa` | 项目级审查与 QA | 可选 | 首次生成约 2k–5k；每次调用约 1k–3k |

口径说明：token 成本按「该动作进入模型上下文的文本量」估算，非计费账单；终端里由用户亲手执行的安装一律 0 token；Agent 代跑会额外产生命令输出、读取与复述成本。

提问必须包含以下三层信息：装什么、是否必装、装的时候费不费 token。手册完整模式的 AOCI-CODE、OpenSpec、Superpowers、Ponytail、`ai-dev-workflow`、`implement-change` 和 `project-quality-gate` 均为必需；gstack 对符合风险条件的变更必需。用户拒绝必需项时暂停完整模式，并请用户选择轻量 / 自定义模式。推荐措辞：

```
手册完整模式需要：AOCI-CODE、OpenSpec CLI、Superpowers 关键 Skills、Ponytail，以及项目内 `ai-dev-workflow`、`implement-change` 与 `project-quality-gate`。gstack 用于适用变更的独立 review / QA；`/ship` 仍须单独授权。Context7、CodeGraph 按任务需要启用。轻量模式不安装完整闭环依赖。缺失项逐一标为「未安装 / 未建立 / 无法确认」；获得用户同意前不执行安装，未安装时不写入会调用该依赖的规则。
用户在终端自行安装不消耗 token；由 Agent 代跑的成本按实际选择的依赖分别估算。
是否继续？可选：完整模式 / 轻量模式 / 暂不启用。
```

Ponytail / gstack 的安装说明必须从官方仓库按用户选定 Agent 平台核对，不得直接照搬其他宿主的命令：[Ponytail 官方仓库](https://github.com/DietrichGebert/ponytail)、[gstack 官方仓库](https://github.com/garrytan/gstack)。Codex 官方适配示例：Ponytail 使用插件市场添加及安装流程（安装后由用户在 `/hooks` 信任生命周期钩子并重开会话）；gstack 的 Codex 适配目前标为 experimental，使用官方 `./setup --host codex`，并先核对 Bun 版本要求。安装任一项前都须获得用户确认。gstack 覆盖规格澄清、计划评审、QA 和发布等多个环节；选用它时，逐项标明与现有定制工作流 / Superpowers 的重叠，用户确认采用哪一方后才写入项目规范和总控 Skill。适用任务缺少 gstack 时必须 BLOCKED，除非用户批准等价替代审查。Ponytail 是手册完整模式必需的实现简化与审查步骤，不得以其为由削弱 TDD、测试、安全或验收门禁。

## 3.5.3 三个确认问题

用一次 `AskUserQuestion` 询问，选项 ≥3：

| 问题 | 选项 |
|---|---|
| 在哪些工具中生效 | 当前会话（推荐）/ 全部已探测工具 / 手工指定（Other 填名称）/ 暂不启用 |
| 工作流范围 | 完整模式（推荐）/ 轻量模式（本地规则 + 门禁 + 总控 Skill，不含规格闭环）/ 自定义 |
| 项目阶段 | 新项目（空仓库或仅有基线提交）/ 老项目（已有规范或已有代码） |

工具落点一律取探测结果中的 `技能落点`；探测未命中的工具，先让用户手工填写目录，再写入教程，禁止猜测。

目标项目范围与类型沿用阶段一已确认的项目清单，不得在本阶段把多个项目当成一个项目。多项目时，先确认是否所有目标项目共用同一模式；否则逐项目选择完整 / 轻量 / 自定义 / 不启用，并分别保存工作流配置。共享安装结果不代表共享项目规则、门禁命令、状态、规格目录、实施计划或验证证据。

选择「自定义」时，询问用户要启用或排除的流程阶段与依赖（规格审批、TDD、质量门禁、独立审查、归档闭环），逐项说明省略后的影响；只有用户确认后才生成映射。自定义模式不得声称提供被排除阶段的能力，所需规则文件与教程按实际组合生成。

## 3.5.4 新项目路径

顺序不可跳过：

以下完整闭环依赖步骤只适用于完整模式；轻量模式跳过 OpenSpec 与 Superpowers 等完整闭环安装步骤，直接生成轻量规范和门禁资产。

1. **基线确认**：仓库已有初始提交、`README.md`、`.gitignore`、`.env.example`。缺失则提示用户先完成基线提交，本模式不代写业务代码。
2. **配置项目开发环境**：依据已确认技术栈与官方文档核对运行时、包管理器、数据库 / 缓存 / 外部服务和必要环境变量；生成或检查 `.env.example`，真实密钥只存本机忽略文件或密钥管理器。先报告待安装依赖与命令并取得同意，再执行安装；运行项目已有的依赖安装、构建、测试或启动检查，记录实际结果。没有可运行代码时标记「环境待首次实现后验证」，不得伪造通过结果。
3. **装 spec-generator**：按所选宿主支持的方式安装，取实际技能落点，不把 `npx skills add` 写成所有宿主的唯一方式。
4. **配置 AOCI-CODE**（完整模式）：按官方当前文档安装 / 初始化；建立并读取项目认知，按当前 Guide 完成 verify / check 等初始化核验；核对是否覆盖整个 Monorepo。
5. **配置 OpenSpec**（完整模式）：按官方文档安装 CLI；选择目标工具初始化项目并校验版本。
6. **移除 apply**（完整模式）：按当前 OpenSpec profile 文档移除 `apply`、启用需要的 `verify` 并更新配置。Profile 可能影响其他项目；先告知用户。只清理确认由 OpenSpec 生成的旧入口，不得删除名称中含 `apply` 的无关文件。
7. **检查 apply 残留**：检查目标宿主实际加载的 OpenSpec workflows / Skills。残留时定位其来源并按官方方式修复；不能只凭全目录关键词搜索就删除文件。
8. **装 Superpowers**（完整模式）：从官方仓库获取，记录 URL 和 commit SHA；只复制将使用的技能，先核查许可与现有差异，不盲覆盖。
9. **装 Ponytail**（完整模式）：从官方仓库按目标宿主安装；确认实际命令可用，保留 TDD、安全和验收门禁。
10. **按风险配置 gstack**（完整模式）：核对目标宿主支持级别与运行时要求；针对适用变更安装 review / QA 能力。Codex 标 experimental；不适用时采用用户批准的替代方案。
11. **建立实施交接与项目门禁 Skills**：生成 `implement-change` 与 `project-quality-gate`，安装到所选工具真实项目级技能目录；`.ai-workflow/skills/` 可留作来源副本，但不能假定宿主会自动加载。
12. **生成规范与工作流资产**：按 3.5.6-C 生成并将所有路由映射进项目规则。
13. **垂直切片**：完整走一遍规格、TDD、项目门禁、Ponytail、适用的 gstack、审查后项目最终完整验证、OpenSpec / AOCI 核验；通过后才算接入完成。

## 3.5.5 老项目路径

1. **保护现状并盘点在先**：记录当前分支和 `git status --short`，保留所有未提交用户改动；用 Glob/LS 读取已有 `AGENTS.md`、`.agents/rules/`、`openspec/`、`.ai-workflow/`、工具目录；读取 AOCI 的现有受管规则，不覆盖其区块；按需用 CodeGraph 查结构。
2. **盘点现有功能**：对已有代码的项目，按模块列出现有功能，并标记「已完成 / 部分完成 / 缺失 / 未知」。每项结论附代码路径、测试或运行证据；只有配置或目录痕迹不能证明功能已完成。证据不足标「未知」并请用户确认，不得当作缺失功能重新规划或实现。
3. **形成可追溯清单**：将盘点结果写入 `docs/project-feature-inventory.md`，记录项目、日期、状态、证据、待确认问题；纯配置仓库或无可识别功能时说明不适用。后续生成规范时以此清单和实际代码为背景，已完成能力写成维护/扩展约束，部分完成能力注明缺口，缺失能力才作为待建设项。
4. **只增量不覆盖**：已有章节与规则文件一律保留；工作流规则以受管区块追加。下面区块是完整模式内容；轻量 / 自定义模式须删除被排除的工具和阶段，并改为实际可执行的本地流程：

```markdown
<!-- ai-dev-workflow:start -->
## 强制 AI 开发工作流

任何新功能、跨文件修改、业务 Bug 修复、架构或数据库变更，先读本任务命中的 `.agents/rules/*.md`，再进入实施。

1. 任务开始：核对分支和未提交更改；读取 AOCI Whole-Index、Rules 和当前 Guide。阶段零 CodeGraph 开关开启时按涉及范围查定义、引用、调用链、下游影响与相关测试；关闭时用 Glob / 定向 Read。涉及第三方 API 且 Context7 开关开启时查询项目锁定版本；关闭时按 `03-research.md` 使用 WebSearch / WebFetch 降级。
2. 需求规格：较大功能先 explore（需求模糊时）再 propose；用户确认 Proposal/Spec/Design/Tasks 后才实施。
3. 禁止实施入口：不得调用 OpenSpec 的任何 apply 入口；OpenSpec 只负责探索、提案、规格校验、同步与归档，实施交给 TDD 流程。
4. 实施交接：规格批准后只通过 `implement-change` 进入实施；用 Superpowers `writing-plans` 生成 `docs/superpowers/plans/YYYY-MM-DD-<name>.md`。OpenSpec tasks 保持业务验收边界，Superpowers plan 细化工程实施、测试命令、有效 RED/GREEN 证据、依赖和回归范围；发现规格缺口时回到 OpenSpec 更新并重新批准。
5. 逐任务 TDD：使用 Superpowers `test-driven-development`；每个行为任务按 RED → GREEN → REFACTOR → REVIEW，记录真实命令与输出。按风险选择 `executing-plans` 或 `subagent-driven-development`，同一计划不得重复交由两种流程执行。
6. 项目专项规则：按变更内容重新读取相关规则与 `.ai-workflow/required-checks.md`，不得以摘要或历史上下文代替本次读取。
7. 强制项目门禁：逐任务 TDD 完成后运行 `project-quality-gate`，核对批准标准、项目规则和已有测试证据；缺失、未加载、失败或无证据时标 BLOCKED，停止后续归档。
8. 审查与 QA：门禁后运行 Ponytail review。按变更风险执行 gstack `/review` 或 `/qa`；适用而未安装时标 BLOCKED，除非用户事先批准等价替代。`/ship`、push、PR、部署只在用户明确授权后执行。
9. 最终项目验证：审查与修复完成后运行项目规定的完整测试、类型检查、lint、构建；只执行该项目类型、技术栈和用户决定适用的命令，不得虚构。审查引发修改时，必须先修复再验证。
10. 规格与认知闭环：通过 OpenSpec verify；按 AOCI 当前 Guide 更新受影响认知并运行 verify/check；仅在需要同步主规格时 sync；全部强制门禁通过后 archive。
11. 完成报告：逐项报告真实命令和结果、门禁矩阵、Ponytail / gstack 发现与处置、OpenSpec 和 AOCI 状态、未执行项与剩余风险。
<!-- ai-dev-workflow:end -->
```

再次执行时只替换该区块内部内容，区块外文本不得改动。若 `AGENTS.md` 已被其他工具写入受管区块（如 AOCI-CODE），保持其区块完整。

5. **依赖补齐**：已装则跳过安装，只校验版本与配置；完整模式下 OpenSpec 已存在时必须复查 `apply` 是否残留，已装 Superpowers 只补缺失 Skill；轻量 / 自定义模式按所选依赖盘点，不得强制补装未选依赖。
6. **规范走增量意图**：阶段零意图选「优化已有项目规范」，阶段一只问未对齐维度，阶段四只生成差异文件。
7. **迁移说明**：教程中单列「已有项目迁移」章节，写清本次新增了什么、原有内容哪些未动、哪些规则与新流程冲突及处理方式，并链接功能盘点清单。
8. **验证方式**：先在只读任务（如「解释某模块调用链」）上验证规则与工具加载，再进入首个变更任务。

## 3.5.6 按模式落地文件与门禁

以下文件树适用于完整模式；前端 / 后端规则域仍必须按阶段一确认的项目类型裁剪。

```
project-root/
├── AGENTS.md                        # 追加受管区块，不覆盖原有内容
├── docs/
│   ├── ai-workflow-guide.md         # 使用教程（本模式必产，见 3.5.7）
│   └── project-feature-inventory.md # 老项目有既有代码时的功能盘点；无可识别功能时说明不适用
├── .ai-workflow/
│   ├── required-checks.md           # 必需检查与自定义 Skills 清单
│   ├── workflow-state.md            # 当前阶段、change 名、门禁结果、阻塞原因
│   └── skills/
│       ├── ai-dev-workflow/SKILL.md # 总控入口（编排，不重复写规范）
│       ├── implement-change/SKILL.md # 批准规格到实施计划的唯一交接入口
│       └── project-quality-gate/SKILL.md # TDD 后的项目强制门禁
└── openspec/                        # 完整模式由 openspec init 生成
```

`.ai-workflow/skills/` 是可审阅、可版本控制的技能源文件目录，不保证宿主自动加载。把当前模式实际生成的 Skill 安装 / 链接到用户所选工具报告的项目级技能目录，并逐工具验证实际可见和可调用；完整模式为三个，轻量模式为两个，自定义模式按启用阶段决定。`required-checks.md` 的每一行必须替换为项目真实 Skill 或命令：检查锁定依赖和工作区脚本配置，没有的一律标注「尚未建立」，禁止保留占位符。

轻量模式只生成共同资产：项目根 `AGENTS.md` 路由、`docs/ai-workflow-guide.md`、`.ai-workflow/workflow-state.md`、`.ai-workflow/required-checks.md`、`ai-dev-workflow` 与 `project-quality-gate`。不生成 `openspec/`、`implement-change`，不调用 OpenSpec、Superpowers、Ponytail 或 gstack；门禁仅包含该项目真实存在且用户选定的检查。自定义模式按用户确认的阶段生成资产：仅在启用规格闭环时生成 OpenSpec 相关资产，仅在启用实施交接时生成 `implement-change`，门禁 Skill 仅在选择质量门禁时生成。被排除的阶段不得在文件树、路由或检查清单中残留。

完整模式的共同门禁至少包含：已批准 OpenSpec change；`implement-change`；逐任务 TDD；`project-quality-gate`；Ponytail review；风险适用的 gstack review/QA；审查后的项目最终测试、类型检查、lint、构建；OpenSpec verify；AOCI 更新与 verify/check；按需 sync；archive。门禁按项目类型裁剪：仅前端检查 UI 行为及实际存在的 API 契约，不运行数据库迁移 / 后端检查；仅后端检查 API、安全 / 数据权限及实际存在的数据库变更，不运行前端 UI 检查；全栈覆盖两侧。测试选择与完整 TDD 冲突时不能声称完整模式已启用；CI/CD 只按用户对该项目的选择生成，不能由本地质量门禁推导为必需。任何强制 Skill、适用命令未运行或无真实结果均为 BLOCKED。

完整模式总控路由：Git / AOCI 项目认知 → 任务分级 → OpenSpec explore/propose 与人工批准（禁 apply）→ `implement-change` → Superpowers `writing-plans` + 逐任务 TDD → `project-quality-gate` → Ponytail review → 风险触发的 gstack review/QA → 项目最终完整测试 / 类型检查 / lint / 构建 → OpenSpec verify → AOCI verify/check → 按需 sync → archive → 完成报告。项目门禁先核对 TDD 和已有证据；最终验证在审查修复后执行。各项目只执行其类型和用户选择适用的检查。`/ship`、push、PR 和部署均需单独授权。轻量 / 自定义模式按用户选定的阶段改写此路由，不得保留未安装工具或未选阶段的调用。

### 3.5.6-A 门禁文件模板

完整模式的 `.ai-workflow/required-checks.md` 骨架（每行必须换成真实 Skill 或命令；轻量模式须删去 OpenSpec 规格验证项，并且只保留实际配置的检查）：

```markdown
# 项目必需检查与自定义 Skills

实施结束后逐项执行并记录证据。先按项目类型和用户的测试 / CI-CD 决策剔除不适用项。未安装但适用的项目标注「尚未建立」，不得留空或伪造。质量门禁复用已有验证证据，只补跑尚未执行的检查；若之后代码有变化，再重跑受影响项。

- [ ] TDD：所有行为变化遵循 RED / GREEN / REFACTOR。
- [ ] 完成前验证：依据真实终端输出报告结果。
- [ ] 前置条件：逐任务 TDD 与相关回归测试已通过后，才运行 `project-quality-gate`。
- [ ] API 契约检查：仅项目存在 API 时使用 {真实命令}。
- [ ] 权限与数据隔离检查：仅项目具有后端身份、组织或数据权限边界时适用；前端只审查实际存在的权限显隐，不声称提供服务端授权。
- [ ] 数据库迁移审查：仅项目存在数据库 / ORM 时，且涉及实体、DDL、Migration、Seed 时必需。
- [ ] 复杂度审查：检查不必要的抽象与重复实现。
- [ ] 项目自定义门禁：`project-quality-gate` 必须运行并给出逐项 PASS / FAIL / BLOCKED 证据矩阵。
- [ ] Ponytail review：必跑；报告真实风险与逐项处置。
- [ ] gstack review / QA：按风险矩阵触发；适用但未安装时 BLOCKED，除非已有用户批准的等价替代。
- [ ] 最终项目验证：审查与修复后按用户选择、项目类型和实际工具运行 test / lint / typecheck / build；不得填入不存在的后端、数据库或前端命令。
- [ ] 规格验证：实现符合已批准规格。
- [ ] AOCI：按当前 Guide 更新受影响认知，verify / check 均有真实结果。
- [ ] OpenSpec：门禁通过后 verify；需要同步主规格时才 sync；最后 archive。
```

gstack 风险矩阵（完整模式）：

| 变更类型 | gstack 要求 |
|---|---|
| 纯文字 / 极小修复 | 通常不触发；仍执行适用的 TDD、project-quality-gate 与 Ponytail |
| 跨模块 / 新架构 / 数据模型 | 实施前可做 `/plan-eng-review`；完成后 `/review` |
| API、CLI、worker、webhook、任务调度 | 完成后 `/review` + `/qa` |
| 前端关键用户流程 | 完成后 `/review` + `/qa`，覆盖正常、空、加载、失败、权限与边界状态 |
| 准备发布 | 所有门禁通过后，只有用户明确授权才运行 `/ship`、push、PR 或部署 |

`.ai-workflow/workflow-state.md` 骨架：

```markdown
# 工作流状态

- 当前阶段：{规格 / 实施 / 门禁 / 审查 / 归档}
- 关联变更：{OpenSpec change 名或「无」}
- 门禁结果：{通过项数} / {总数}，失败：{列表或「无」}
- 阻塞原因：{无则写「无」}
- 最后更新：{YYYY-MM-DD HH:mm}
```

### 3.5.6-B 总控 Skill 骨架

完整模式的 `.ai-workflow/skills/ai-dev-workflow/SKILL.md` 只写路由与门禁，不复制规范正文。轻量模式必须使用不含 OpenSpec / Superpowers 调用的对应流程：

```markdown
---
name: ai-dev-workflow
description: 项目统一开发入口。新功能、Bug 修复、跨文件重构、数据库或权限变更均调用本 Skill，按规格、TDD、项目门禁与审查流程执行；禁止 OpenSpec apply。
---

# AI Dev Workflow

## 开始前
1. 运行并记录 `git status --short` 与当前分支；保留已有用户改动。
2. 读取 AOCI Whole-Index、Rules 与当前 Guide；读 `AGENTS.md`、`docs/development-workflow.md`（若存在）、`.ai-workflow/required-checks.md`。
3. 读本任务命中的 `.agents/rules/` 规则；缺失或冲突时先报告阻断。
4. 用 CodeGraph 查相关符号 / 调用关系；涉及外部 API 时用 Context7 查锁定版本文档。
5. 判断任务类型与风险；小型纯文档修改可按项目规则降级。

## 规格阶段
1. 需求模糊先 explore，再 propose；明确需求可直接 propose。
2. 汇总行为边界、验收标准、影响模块与未决问题，等待用户批准。
3. 未获批准不得修改产品代码；禁止任何 apply 入口。

## 实施阶段
1. 仅由 `implement-change` 接收已批准的 change；发现规格缺口先回 OpenSpec 更新并重新批准。
2. 调用 Superpowers `writing-plans`，保存到 `docs/superpowers/plans/`；该实施计划比 OpenSpec tasks 更细。
3. 按风险选择 `executing-plans` 或 `subagent-driven-development`，同一计划只走一种执行方式。
4. 每个行为变化调用 Superpowers TDD，按 RED → GREEN → REFACTOR → REVIEW，记录真实命令与输出。
5. 不得为通过测试删减需求、权限检查或错误处理。

## 检查与审查
1. 逐项执行 `.ai-workflow/required-checks.md` 中真实存在的检查。
2. 先运行 `project-quality-gate`；每项必须有 PASS / FAIL / BLOCKED 及证据。
3. 运行 Ponytail review；按任务风险执行 gstack `/review` / `/qa`，适用而未执行时 BLOCKED，除非用户批准等价替代。
4. 运行项目测试、类型检查、lint、构建与相关安全/权限检查。
5. 任一必需门禁失败、未执行或无真实结果时标记 BLOCKED，停止 verify/sync/archive。

## 闭环与交付
1. 门禁通过后执行 OpenSpec verify。
2. 按 AOCI 当前 Guide 更新受影响认知，并运行 verify / check。
3. 仅在需要同步主规格时 sync，最后 archive。
4. `/ship`、push、PR、部署仅在获得用户明确授权后执行。
5. 报告改动、命令与真实结果、门禁矩阵、审查发现、未执行项、已知风险、OpenSpec 与 AOCI 状态。
```

### 3.5.6-C 规范以工作流为基础（强制）

启用工作流后，规范不是「先按通用模板生成、再外挂一套流程」，而是**以所选模式实际包含的流程为骨架生成**。下表适用于完整模式；阶段四按所选输出形式逐项落地：

| 规则文件 | 必须写入的工作流内容 |
|---|---|
| `AGENTS.md` | 总控工作流路由、AOCI 读取、禁止 apply、批准前不得实施 |
| `workflow.md` | Git 状态 → AOCI → OpenSpec 审批 → `implement-change` → Superpowers 计划 / TDD → `project-quality-gate` → Ponytail → 风险触发 gstack → 项目最终完整验证 → OpenSpec / AOCI 核验 → 按需 sync → archive；禁止 apply |
| `testing.md` | 逐任务 RED → GREEN → REFACTOR → REVIEW；测试范围、实际命令、证据；与用户测试 / CI-CD 选择一致 |
| `dev-tooling.md` | OpenSpec、Superpowers、AOCI、Ponytail、gstack、Context7、CodeGraph 的实际安装状态、命令与版本；脚本入口；索引维护时机 |
| `documentation.md` | `openspec/`、实施计划 `docs/superpowers/plans/`、`docs/ai-workflow-guide.md`、质量门禁证据记录落点 |
| `architecture.md` | 实施前 AOCI / CodeGraph 影响面分析；实施计划与 OpenSpec tasks 的职责边界 |
| `security.md` / `devops.md` | 只把该项目实际存在的安全、数据变更、发布回滚纳入门禁；CI/CD 依用户逐项目选择；`/ship` 与部署必须显式授权 |

轻量模式只写实际可执行的本地任务流程、测试要求、已配置命令与门禁；不得写入 OpenSpec、Superpowers、`apply`、`verify/sync/archive` 等未安装能力，也不得声称具备完整规格闭环。完整模式下，用户若拒绝安装必需依赖，应标记「完整工作流未启用」并停止完整模式产物；可由用户选择改为轻量模式后再按轻量规范生成。

落地约束：

1. **单一事实来源**：流程细节写在 `workflow.md`；`AGENTS.md` 只保留受管区块与路由，不复述全文；其他规则文件只写与本域相关的门禁点。
2. **自包含**：规则正文必须能独立读懂。允许 `AGENTS.md` 路由至 `.agents/rules/workflow.md`，并允许在「检查入口」处引用 `.ai-workflow/required-checks.md`；这两类引用不得替代各文件的规则正文。其他项目文本文件引用仍需用户同意。
3. **命令真实**：`dev-tooling.md` 与 `testing.md` 中的命令必须来自项目实际 `scripts` 与已装工具，禁止写通用示例。
4. **禁用即不出现**：工作流开关关闭时，任何规则文件都不得出现 OpenSpec、Superpowers、`.ai-workflow/` 相关内容。

**已生成规范的项目后补开启**：必须回改受影响文件，不允许只新增 `.ai-workflow/` 与受管区块。顺序为：列出受影响规则 → 逐项更新并保留原有有效条目 → 在 `docs/ai-workflow-guide.md` 的「已有项目迁移」中记录改了哪些文件、为什么改 → 重跑 checklist 第十四节。若用户不同意回改，则标记「工作流未接入规范层」，只保留门禁文件，并在教程中写明。

**半成品项目的功能盘点模板**：`docs/project-feature-inventory.md` 至少包含以下字段；每项功能都要有可复核证据，不能只按文件名推断状态。

```markdown
# 项目功能盘点

- 盘点日期：YYYY-MM-DD
- 范围：{已检查的模块、入口或业务域}

| 模块 / 功能 | 状态（已完成 / 部分完成 / 缺失 / 未知） | 证据（代码、测试、运行结果） | 缺口 / 待确认 |
|---|---|---|---|
```

生成新规范或变更计划时，必须将此清单与实际代码交叉核对：已完成项不重复规划为新功能；部分完成项只描述剩余缺口；未知项先向用户确认；只有确认缺失后才列为待建设内容。清单与代码冲突时，以可复核的实际实现为依据并记录差异。

## 3.5.7 使用教程（交付物第 7 项）

生成 `docs/ai-workflow-guide.md`，内容必须覆盖：

1. 本次实际启用的依赖清单，逐项标注「必装 / 可选」「安装时是否耗 token」。
2. 仅在完整模式写 AOCI-CODE 流程和 `implement-change`；按实际模式说明 `project-quality-gate` 的职责及已启用 Skills 的宿主落点。
3. 本机探测结果：当前会话工具、已安装工具、每个工具的规则入口与技能落点，以及本模式需要的依赖状态；完整模式才把 AOCI / Ponytail / gstack 列为必需或风险依赖。
4. 新项目初始化路径或老项目迁移路径（只写命中的那一条）。
5. 日常开发流程：完整模式写明 Git / AOCI → OpenSpec 审批 → 实施交接 → 计划与逐任务 TDD → 自定义质量门禁 → Ponytail → 风险触发 gstack → 项目最终完整验证 → OpenSpec verify → AOCI 对齐 → 按需 sync → archive；轻量模式明确未覆盖的规格闭环。
6. 完整模式说明 OpenSpec tasks 与 Superpowers 实施计划的区别及真实落点；其他模式标记不适用。
7. 跨工具验收清单：每个选中工具分别验证已启用规则与 Skills 可见；只有完整模式检查 `apply` 不可见，且所选模式的强制门禁失败时正确阻断。
8. 故障排查：工具未识别、Skill 未加载、MCP 未连接、索引失效、门禁误报。
9. 完整模式写明「禁止 OpenSpec apply」、`/ship` / push / PR / deploy 需授权，以及检查命令；轻量模式标记 OpenSpec 检查不适用。

教程中出现的命令、目录、Skill 名称必须来自本次实际配置与探测结果，禁止写通用示例后不做替换。

## 3.5.8 验收与异常

| 项 | 通过条件 |
|---|---|
| 依赖确认 | 有用户明确同意的记录，且清单与实际安装一致 |
| 工具覆盖 | 每个选中工具都有落点与验证记录，未选中的不写入 |
| 实施与门禁 Skills | `implement-change`、`project-quality-gate` 在每个选定宿主可见可调用，门禁能输出逐项 PASS / FAIL / BLOCKED 证据矩阵 |
| AOCI | 仅完整模式要求任务前读取、任务后更新并核实 verify / check；其他模式标记不适用 |
| Ponytail / gstack | 仅完整模式执行 Ponytail；gstack 仅风险触发时执行或有用户批准的等价替代；轻量模式均不调用 |
| 交接与计划 | 完整模式或自定义启用规格交接时，只有批准的 OpenSpec change 进入 `implement-change`，并保存实施计划；其他模式标记不适用 |
| apply 清除 | 仅完整模式检查选中工具中没有 apply 入口；轻量 / 自定义不启用 OpenSpec 时标记不适用 |
| 门禁可用 | 当前模式启用 `project-quality-gate` 时，`required-checks.md` 中所有适用命令均真实可执行，无占位符 |
| 教程完整 | 九项内容齐全，命令与目录与实际配置一致 |
| 半成品项目盘点 | 老项目已有代码时，功能清单区分已完成 / 部分完成 / 缺失 / 未知，每项有证据，生成规范未把已完成能力重复规划为新功能 |
| 阻断能力 | 故意让一项已启用门禁失败时，该模式不得报告完成；仅完整模式还必须停止 sync/archive |

| 异常 | 处理 |
|---|---|
| 探测不到任何工具 | 让用户手工指定工具与落点，禁止假定 |
| 探测到但当前会话未识别 | 推荐项改为「全部已探测工具」，并请用户确认 |
| OpenSpec 安装失败 | 汇报失败输出；完整模式停止并请用户选择改轻量模式或关闭工作流，不能阻塞不含工作流的普通规范生成 |
| profile 仍含 apply | 要求重设 profile 并 `openspec update`，未清除则标记工作流未完成 |
| 用户拒绝安装可选依赖 | 从清单移除并在教程中标注「未启用」，其余流程照常 |
| 用户拒绝 AOCI / Ponytail / OpenSpec / Superpowers 等手册完整模式必需项 | 停止标记完整模式已接入；由用户选择轻量 / 自定义模式 |
| gstack 对当前宿主不可用或用户不安装 | 只有用户批准等价审查 / QA 替代后，才可按自定义映射继续；否则适用任务 BLOCKED |
| 自定义门禁 Skill 缺失或未加载 | 生成并安装前阻止 TDD 后闭环；无法配置时 BLOCKED，不得以普通 checklist 冒充已运行 |
| AOCI 认知漂移 / verify 或 check 失败 | 按当前 AOCI Guide 处理并复核；未对齐时 BLOCKED，不得 archive |
| 用户拒绝完整模式必需依赖 | 停止完整模式；由用户明确选择切换到轻量模式或关闭工作流，不得将残缺的完整模式标记为已接入 |
| 老项目已有同名 Skill | 先比对差异，由用户决定覆盖或改名，禁止默认覆盖 |
