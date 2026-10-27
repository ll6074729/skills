# AI 开发工作流模式使用教程

本教程面向使用 `spec-generator` 的人和 Agent。工作流模式是**可选**的：不启用时，`spec-generator` 仍然是「预检 → 检索 → 生成规范 → 自检 → Skills 推荐」的原流程，不新增任何依赖。

启用后，项目规范以用户提供的《AI 工程化开发工作流手册》为骨架。完整模式固化「Git / AOCI 认知 → OpenSpec 规格审批 → `implement-change` → Superpowers 计划与逐任务 TDD → `project-quality-gate` → Ponytail review → 风险触发 gstack review / QA → 项目最终验证 → OpenSpec verify → AOCI 对齐 → 按需 sync → archive」；轻量模式不包含完整规格闭环，并明确标记能力缩减。两种模式都会产出项目自己的 `docs/ai-workflow-guide.md`。

---

## 1. 什么时候值得启用

| 情况 | 建议 |
|---|---|
| 新项目，准备长期开发 | 完整模式 |
| 老项目已有 `AGENTS.md` / `.agents/rules/`，想补流程 | 增量模式（老项目路径） |
| 只想先要质量门禁和统一入口 | 轻量模式 |
| 只想要一份规范文档 | 不启用 |

---

## 2. 启用前会装什么，费不费 token

Agent 在启用前必须先把这张表完整展示给你，并取得你明确同意；未同意不得执行任何安装命令。

| 依赖 | 作用 | 是否必装 | 安装时是否耗 token |
|---|---|---|---|
| `spec-generator` | 生成规范、门禁与教程 | 必装 | 你在终端执行 `npx skills add`：0 token；让 Agent 代跑并复述：约 0.3k–0.8k |
| AOCI-CODE | 每个任务开始时加载项目认知，结束时核对对齐 | 完整模式必装 | 依官方当前说明安装；调用成本按实际读取估算 |
| OpenSpec CLI | 需求规格与变更闭环 | 完整模式必装 | 终端自行安装：0 token；Agent 代跑约 0.3k–1k；`init`/`update` 后核对文件约 0.8k–3k |
| Superpowers 关键 Skills | 计划、执行、TDD、完成前验证 | 完整模式必装 | 克隆与复制：0 token；每个 Skill 被调用时约 1k–3k |
| Context7 MCP | 版本化官方文档 | 可选 | 配置 0 token；每次查询约 1k–3k |
| CodeGraph | 符号、调用链、影响面 | 可选 | 安装建索引 0 token；每次查询（裁剪 80 行）约 1k–2k |
| Ponytail | 实现简化与 TDD 后风险审查 | 完整模式必装 | 按官方当前说明安装；调用成本按实际读取估算 |
| gstack | 风险触发的独立 review / QA | 适用变更必需；没有可用适配时须用户批准等价替代 | Codex 适配标记 experimental；按目标宿主官方说明核对 |
| `implement-change` | 获批规格到实施的交接入口 | 完整模式必需；自定义模式选择规格交接时需要；轻量模式不使用 | 项目内生成，无外部安装费用 |
| `project-quality-gate` | 按用户选择与项目类型运行项目级检查 | 完整 / 轻量模式必需；自定义模式选择门禁时需要 | 项目内生成，无外部安装费用 |
| `ai-dev-workflow` | 项目统一工作流路由入口 | 所有启用的模式必需；按项目生成并安装 | 项目内生成，无外部安装费用 |
| `project-review` / `project-qa` | 额外项目级审查与 QA | 可选 | 首次生成约 2k–5k；每次调用约 1k–3k |
| `/ship` | 发布 / PR 流程 | 仅用户明确授权后执行 | 以任务范围和实际操作为准 |

启用工作流前要逐项检查上述依赖的「已安装 / 未安装 / 无法确认」状态，并取得缺失必需项的安装确认。Ponytail 官方仓库：<https://github.com/DietrichGebert/ponytail>；gstack 官方仓库：<https://github.com/garrytan/gstack>。gstack 的 Codex 适配目前标为 experimental；若在目标宿主不可用，适用变更须采用用户批准的等价审查 / QA，否则阻断。安装方式按目标 Agent 官方说明核实，不把某宿主的命令照搬到其他宿主。

口径：以上按「进入模型上下文的文本量」估算，不是账单。**在终端里自己执行安装一律 0 token**；让 Agent 代跑会额外产生命令输出、读取和复述的成本。

---

## 3. 第一步：探测本机开发工具

不要凭印象列工具，先取证：

```bash
# 在技能目录内执行，--project 指向你的项目根目录
node scripts/detect-agents.mjs --project /path/to/your-project
```

输出包含三件事：

1. **当前会话**：本次是在哪个工具里运行的；
2. **已安装工具**：每个工具的 CLI、应用、配置目录、项目目录证据；
3. **技能落点**：每个工具应该把 Skill 放在哪里。

需要机器可读结果时加 `--json`。

内置支持清单（数据驱动，新增工具只需在脚本的 `AGENTS` 数组追加一条）：Claude Code、Qoder、TRAE CN、ZCode、Cursor、Codex CLI、Gemini CLI、Windsurf。

探测结果只是候选。**目标工具由你选择**：当前会话、全部已探测工具、手工指定，或暂不启用。落点一律取探测输出，不要在文档里写死某个 IDE 的目录。

此探测只识别 Agent / IDE，不代表工作流组件已安装。对用户选定的每个目标宿主，另外核对 AOCI-CODE、OpenSpec、Superpowers、Ponytail、gstack，以及 `ai-dev-workflow` / `implement-change` / `project-quality-gate` 的安装与加载状态。使用该宿主官方插件清单、版本命令和技能目录检查；无法访问时标「无法确认」。只在用户同意具体依赖和安装操作后安装。

---

## 4. 第二步：确认三件事

Agent 会用一次提问收集：

| 问题 | 选项 |
|---|---|
| 在哪些工具中生效 | 当前会话（推荐）/ 全部已探测工具 / 手工指定 / 暂不启用 |
| 工作流范围 | 完整模式（推荐）/ 轻量模式 / 自定义 |
| 项目阶段 | 新项目（空仓库或只有基线提交）/ 老项目（已有规范或代码） |

完整模式缺少 AOCI-CODE、OpenSpec、Superpowers、Ponytail 或项目自定义两个必需 Skills 时，先列清安装步骤并取得同意；用户拒绝则暂停完整模式，改选轻量 / 自定义。gstack 对手册风险矩阵命中的任务必需；宿主不支持或用户不安装时，只有经用户批准的等价 review / QA 才能替代。`/ship` 始终需要另行授权。

轻量模式 = 生成项目规则、`.ai-workflow/` 门禁与总控 Skill，不装 OpenSpec、Superpowers；流程按「读规则 → 任务计划 → 按需测试 → 项目门禁 → 完成报告」执行，不包含规格审批及 verify/sync/archive。

---

## 5. 新项目路径

顺序不可跳过。

### 5.1 先有基线

仓库要有初始提交、`README.md`、`.gitignore`、`.env.example`。这一步的意义是：后面所有工具写入的配置和生成的规范都能被 diff、被回退。

### 5.2 配置项目开发环境

根据已确认的技术栈，用官方文档核对运行时、包管理器、数据库 / 缓存 / 外部服务和必要环境变量。生成或检查 `.env.example`；真实密钥只放在本机忽略文件或密钥管理器。先列出待安装依赖与命令，取得同意后再安装。运行项目已有的依赖安装、构建、测试或启动检查并记录真实结果；还没有可运行代码时标记「环境待首次实现后验证」。

### 5.3 装规范生成器

```bash
npx skills add ll6074729/skills
```

选 `spec-generator`，优先项目级安装，目标工具取第 3 步的结果。

### 5.4 完整模式：装 OpenSpec 并移除 apply

```bash
# 按 OpenSpec 官方安装脚本安装 CLI，然后校验
openspec version

# 工具 id 取自探测脚本输出的 id 字段
openspec init --tools <选中的工具 id，逗号分隔>

# 自定义 profile
openspec config profile
openspec update
```

profile 中选择：

- 保留：`explore`、`propose`、`update`、`sync`、`archive`
- 启用：`verify`
- **不选 `apply`**
- Delivery 选 `both`

然后检查残留：

```bash
find <选中的工具目录> -type f | grep -Ei 'apply' || true
```

还会命中就先确认 profile 已保存，再 `openspec update` 并重启 IDE。不能只凭模型说「不会调用 apply」。

### 5.5 完整模式：装 Superpowers 关键 Skills

克隆到项目外的个人工具目录，再复制到各工具落点：

```bash
git clone --depth 1 https://github.com/obra/superpowers.git ~/Developer/agent-tools/superpowers
```

至少复制这些：`using-superpowers`、`writing-plans`、`executing-plans`、`test-driven-development`、`verification-before-completion`、`requesting-code-review`、`finishing-a-development-branch`。

目标目录取探测输出的「技能落点」。同名目录已存在时先比对差异，不要盲覆盖。

复制前记录仓库 URL 与当前 commit SHA，检查计划复制的 Skills 文件和许可证；后续升级要重新记录 SHA 并审阅差异，保证多个工具使用同一版本。

### 5.6 建立项目级工作流 Skills

启用工作流时生成并安装 `ai-dev-workflow`。完整模式还必须生成并安装 `implement-change` 与 `project-quality-gate`；轻量模式生成 `project-quality-gate`，但不生成 `implement-change`；自定义模式只生成用户选中的组件。`.ai-workflow/skills/` 是来源副本，单独放在那里不保证宿主会加载。

- 完整模式（或用户自定义启用规格交接时）的 `implement-change`：只接收人工批准的 OpenSpec change；读取 AOCI；按阶段零开关用 CodeGraph 或 Glob / 定向 Read 复查影响面，用 Context7 或 WebSearch / WebFetch 核对第三方版本文档；调用所选实施计划和 TDD 流程；发现规格缺口时暂停并返回规格阶段。轻量模式不生成此 Skill。
- `project-quality-gate`：完整模式在逐任务 TDD 与相关回归测试通过后、Ponytail 前执行，核对批准标准、项目规则和测试证据；轻量模式在实际实施和所选检查后、完成报告前执行。仅前端检查 UI 和实际存在的 API，不检查后端或数据库迁移；仅后端检查 API、安全 / 数据权限及实际存在的数据库变更，不检查前端 UI；全栈覆盖两侧。完整模式在 Ponytail / 风险适用的 gstack 审查之后，还要按项目类型和用户选择运行最终完整测试、类型检查、lint、构建；轻量 / 自定义只运行启用的检查。CI/CD 按用户决定裁剪；输出逐项 PASS / FAIL / BLOCKED 证据矩阵。缺失或不可调用时，按所选模式要求阻断。

完整模式中实施权唯一归 Superpowers，OpenSpec 只管规格；gstack 用于风险评审、QA 和获准后的发布流程，不另起第二个实施计划。轻量模式不调用这些工具。

### 5.7 生成规范 + 工作流资产

回到 `spec-generator` 主流程，以所选模式为规范骨架。完整模式必须写入 OpenSpec / Superpowers 的实际流程与「禁止 OpenSpec apply」；轻量模式只写已配置的本地流程与门禁，不得写入未安装工具或声称具有完整规格闭环；自定义模式只写已选阶段。以下文件树是完整模式，其他模式须移除未启用的工具和资产：

```
project-root/
├── AGENTS.md                        # 追加 ai-dev-workflow 受管区块
├── docs/ai-workflow-guide.md        # 属于你项目的教程
├── .ai-workflow/
│   ├── required-checks.md
│   ├── workflow-state.md
│   └── skills/
│       ├── ai-dev-workflow/SKILL.md
│       ├── implement-change/SKILL.md
│       └── project-quality-gate/SKILL.md
└── openspec/                        # 仅完整模式
```

完整模式的三个 Skill、轻量模式的 `ai-dev-workflow` 与 `project-quality-gate`、以及自定义模式实际启用的 Skill 源文件，须安装 / 链接到探测结果提供的宿主项目级技能目录，并在每个目标工具中验证可见可调用。

### 5.8 用垂直切片验收

不要拿「完整业务系统」做第一次联调。完整模式选一个符合项目类型的小任务，验证 AOCI → propose → 批准 → `implement-change` → 计划 → TDD → 适用检查与门禁 → Ponytail → 风险适用的 gstack → verify → AOCI 对齐 → 按需 sync/archive。轻量模式验证本地规则 → 计划 → 项目实施 → 已选检查 → `project-quality-gate`；不得调用未启用的完整模式工具。自定义模式只验证用户选择的阶段。

---

## 6. 老项目路径

1. **先盘点规范和工具**：检查已有 `AGENTS.md`、`.agents/rules/`、`openspec/`、`.ai-workflow/`、工具目录。有 CodeGraph 时先建索引。
2. **盘点已有功能**：按模块将功能标为已完成、部分完成、缺失或未知；每项附代码路径、测试或运行证据。证据不足标为未知并请用户确认，不能据此认定功能缺失。
3. **保存盘点结果**：将有代码项目的盘点写入 `docs/project-feature-inventory.md`。生成规范时以盘点和实际代码为背景：已完成项写维护/扩展约束，部分完成项写清剩余缺口，未知项先确认，确认缺失后才列为待建设项。
4. **只增量不覆盖**：完整模式按下方受管区块追加；轻量模式须删去 OpenSpec 专属步骤，只保留本地计划、实际检查与完成报告。重复执行只替换区块内部：

```markdown
<!-- ai-dev-workflow:start -->
## 强制 AI 开发工作流

...规则正文...
<!-- ai-dev-workflow:end -->
```

区块外的内容一律不动；如果 `AGENTS.md` 里已有其他工具的受管区块（如 AOCI-CODE），保持其完整。

5. **依赖补齐**：已安装的跳过安装，只校验版本与配置；完整模式下 OpenSpec 已存在时必须复查 `apply` 是否残留。
6. **规范走增量意图**：阶段零选「优化已有项目规范」，只生成差异文件。
7. **迁移说明**：教程中单列「已有项目迁移」，写清新增了什么、原来哪些未动、哪些冲突及处理方式，并记录功能盘点清单的位置。
8. **验证**：先在只读任务上确认规则与工具能加载，再进入首个变更任务。

---

## 7. 规范要跟着工作流走

工作流不是外挂在规范旁边的一层壳。启用后，规则文件要**以所选模式实际包含的流程为基础**生成或改写。以下完整模式映射再按全栈 / 仅前端 / 仅后端规则域矩阵裁剪；轻量 / 自定义模式不得残留未启用阶段：

| 规则文件 | 要写进去的东西 |
|---|---|
| `AGENTS.md` | 受管区块 + 路由到 `workflow.md` + 禁止 apply |
| `workflow.md` | Git / AOCI 认知、OpenSpec 审批、`implement-change`、Superpowers 计划和逐任务 TDD、`project-quality-gate`、Ponytail、风险触发 gstack、项目最终验证、OpenSpec / AOCI 核验、按需 sync 与 archive |
| `testing.md` | 每个行为任务 RED → GREEN → REFACTOR → REVIEW、测试证据与回归范围，且符合用户确认的测试需求 |
| `dev-tooling.md` | AOCI、OpenSpec、Superpowers、Ponytail、gstack 及按需 Context7 / CodeGraph 的真实状态、命令与版本，脚本入口和索引维护时机 |
| `documentation.md` | `openspec/`、实施计划 `docs/superpowers/plans/`、`docs/ai-workflow-guide.md`、质量门禁证据记录落点 |
| `architecture.md` | 实施前 AOCI / CodeGraph 影响面分析；实施计划与 OpenSpec tasks 的职责边界 |
| `security.md` / `devops.md` | 只把项目实际存在的权限、数据变更、发布回滚纳入门禁；CI/CD 依用户逐项目选择；`/ship` 与部署必须显式授权 |

轻量模式只写实际配置的本地流程、测试要求、工具命令和门禁；不写未安装的 OpenSpec / Superpowers，也不声称具有规格审批、verify、sync 或 archive 能力。

约束：

- 流程细节只写在 `workflow.md`，其他文件不复述全文；
- 规则正文必须自包含，`.ai-workflow/required-checks.md` 只能作为检查入口；
- 命令必须来自项目真实 `scripts`；
- **未启用工作流时**，规则里不得出现 OpenSpec、Superpowers、`.ai-workflow/` 内容。

如果规范先生成、后开工作流，不是加个受管区块就完事：要逐项回改上表受影响的规则，保留原有有效条目，并把改动记进教程的「已有项目迁移」；不同意回改时，标记「工作流未接入规范层」，只保留门禁文件。

## 8. 日常怎么用

**所有模式、所有项目类型**：读取该项目 `AGENTS.md` 与适用规则 → 按需查影响面 / 官方文档 → 仅执行本项目真实且已选的验证命令 → 运行该模式启用的质量门禁 → 完成报告。

**完整模式**：需求澄清 → OpenSpec 审批（禁 apply）→ `implement-change` → Superpowers 计划与逐任务 TDD → `project-quality-gate` → Ponytail → 风险适用的 gstack review / QA → 按项目类型执行最终完整验证 → OpenSpec verify → AOCI 对齐 → 按需 sync → archive。

**轻量模式**：按本地规则澄清并制定计划 → 按项目已有能力实施 → 执行用户选定的测试 / 构建 / 其他检查 → `project-quality-gate` → 完成条件核对和报告；不调用 OpenSpec、Superpowers、Ponytail 或 gstack。

**自定义模式**：只按用户确认的阶段顺序执行；省略的阶段在报告中说明，不能称作完整闭环。多项目工作分别按各项目配置执行并记录证据；共享检查须注明适用范围。Git commit、push、PR、部署或 gstack `/ship` 只有在用户明确授权后执行。

### 禁止 apply

完整模式中，OpenSpec 只负责探索、提案、规格校验、同步与归档；实施交给 Superpowers。以下入口一律不得调用：

- `openspec apply`
- `/opsx:apply`、`/opsx-apply`
- `openspec-apply-change`

命令形态随工具不同而变化，以实际生成的 Skill/Command 列表为准；能在列表里看到 apply，就说明 profile 没生效。

---

## 9. 跨工具验收清单

每个选中的工具分别验证一次，不能因为一个正常就假设其他都正常。OpenSpec 与 Superpowers 项仅对完整模式适用：

- [ ] 新建会话后 `AGENTS.md` 进入上下文
- [ ] `spec-generator` 可见并能按其意图流程运行
- [ ] 已启用的 `ai-dev-workflow` 在所选工具真实项目技能目录可见可调用
- [ ] （完整模式）OpenSpec 在当前工具生成正确入口，且 `apply` 不在可用 Skill / Command 列表中
- [ ] （完整模式）总控 Skill 能从已批准 propose 转入计划与 TDD；只有批准的规格进入 `implement-change`
- [ ] （按模式）需要的 `project-quality-gate` 可调用，输出逐项 PASS / FAIL / BLOCKED 证据矩阵
- [ ] （完整 / 自定义且启用 TDD）每项行为任务按要求先产生有效 RED 证据
- [ ] 每项适用的必需检查均留下真实证据；未选的 CI/CD 或不适用项目层没有虚构命令
- [ ] （完整模式）门禁通过后有 Ponytail review 结果；风险适用的 gstack review / QA 已执行或有用户批准的替代方式
- [ ] （完整模式）OpenSpec verify 和 AOCI 对齐检查有真实结果；sync / archive 仅在门禁通过后执行
- [ ] 故意让一项检查失败时，完整模式停止在审查阶段且不执行 sync/archive；轻量模式标记未完成并报告失败门禁
- [ ] 未把机器绝对路径、密钥写进仓库

---

## 10. 常见问题

| 现象 | 排查 |
|---|---|
| 当前会话显示「未识别」 | 换用「全部已探测工具」或手工指定；也可在脚本里补充该工具的环境变量 |
| 工具没被探测到 | 提供 CLI、应用、配置目录、项目目录或环境变量任一证据；都没有时手工填落点 |
| Skill 装好后看不见 | 重启或新建会话；确认目录名与 IDE 要求的层级一致 |
| OpenSpec 命令不可见 | 重新 `openspec init --tools`，按提示重启 |
| `apply` 还在 | profile 未保存为自定义，或没执行 `openspec update` |
| AOCI 未加载或 verify/check 未对齐 | 按当前 AOCI Guide / MCP 流程处理并复核；未对齐时阻断归档 |
| 自定义实施或质量门禁 Skill 不可见 | 检查真实项目级技能落点并重启会话；未加载前标 BLOCKED |
| MCP 连不上 | 检查服务地址、认证方式与用户级配置；密钥不要进仓库 |
| 检查全部通过但 Agent 说没证据 | 让 Agent 贴真实终端输出；无输出即视为未执行 |

---

## 11. 与 spec-generator 的关系

| 负责 | 不负责 |
|---|---|
| 探测工具、提示依赖与 token 成本 | 替你决定用哪个 IDE |
| 生成 `AGENTS.md` 与规则文件 | 代替 OpenSpec 做需求管理 |
| 让规范以工作流为基础生成或回改 | 替你把已有规则全部重写（只做受影响条目） |
| 生成 `.ai-workflow/` 门禁与总控 Skill | 代替 Superpowers 执行 TDD |
| 生成项目自己的使用教程 | 写业务代码 |
| 校验 apply 是否清除 | 保证所有 IDE 全自动隐式路由 |

规则文本能引导模型，但无法单独充当安全沙箱。在多个工具都验证过之前，最稳妥的方式是每个新任务显式触发总控 Skill。
