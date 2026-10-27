# 阶段一：动态技术栈确认

## 1.0 项目范围与类型（强制）

新生成、优化已有、集成本地技能这三类意图，先确认目标目录并做**只读目录结构扫描**，再确认项目范围与类型。结构扫描只看目录名和配置文件名，不读配置内容、不做技术栈推断，因此不代替后续预检。

### 1.0-A 一个目录含多个项目

扫描根目录及其浅层子目录（最多 3 层；跳过 `.git`、依赖目录、构建产物和缓存目录），查找项目边界线索：独立 `package.json`、`go.mod`、`Cargo.toml`、`pyproject.toml`、`pom.xml` 等清单，子目录中的 `AGENTS.md` / `.agents/`，以及工作区定义（如 `pnpm-workspace.yaml`、workspaces、`nx.json`、`turbo.json`、`go.work`、Cargo workspace、Maven modules）。只记录路径与文件名。

发现多个候选项目时，先向用户展示候选路径，并用 `AskUserQuestion` 确认处理范围：

1. 逐个为目录中的项目生成 / 更新独立规范（推荐）
2. 只处理我选定的项目
3. 将它们作为一个共享工作区处理（仅当它们确属同一 Monorepo / Workspace）

这里的「逐个 / 全部」是**项目范围**；后续的「全栈 / 仅前端 / 仅后端」是**单个项目类型**。选全部项目不代表每个项目都是全栈，也不代表共享一套规范或工作流。

不可将多个项目的依赖合并成单一技术栈摘要。确认范围后，为每个选定项目建立独立记录：项目路径、项目边界、类型（全栈 / 仅前端 / 仅后端）、已识别技术栈、待确认项。每个项目分别预检、确认技术栈、生成和自检；相同技术维度可复用一次检索结论，但仍须分别核对项目证据与版本。

**边界判定：** 有工作区配置只说明可能共享仓库，不足以证明其下所有目录是一个项目；结合构建入口、依赖清单、部署边界及用户确认判定。多个并列独立项目分别在各自根目录生成 `AGENTS.md` 与 `.agents/rules/`。真实 Monorepo 可在用户确认后于仓库根生成共享规范，并在子项目内生成技术栈专属规范；根工作区的组合形态不意味着每个子项目都是全栈，逐应用记录其全栈 / 仅前端 / 仅后端类型。不得把互不兼容的命令或框架规则写成全局约束。若测试或 CI/CD 由根工作区共享，记录一次共享配置及覆盖项目，再逐项目核实其是否实际覆盖；不得重复生成相同 pipeline 或把一个项目命令套到其他项目。除非用户明确要求，不在父级容器目录写规范文件。

启用工作流时，先确认工作流覆盖哪些项目；每个目标项目分别映射规范、检查命令和工作流资产。依赖安装可复用已安装项，但不得因此混合不同项目的规范或跳过逐项目验证。

多项目目录中用户选「逐个处理」或「全部」时，需为每个项目单独记录项目类型、测试 / CI-CD 决策和工作流模式。再确认所有项目是否共用同一种工作流；若不同，逐项目选择完整 / 轻量 / 自定义 / 不启用。共享工具只可复用安装结果，项目级规则、门禁命令、工作流状态、规格目录、实施计划和验证证据仍按项目隔离。用户选择「作为一个共享工作区」时，另区分根级共用门禁与各应用专属规则，不把某个项目的命令当成全仓库命令。

若目录只包含一个候选项目，继续常规流程。若候选边界无法判断，先请用户确认项目清单 / 工作区关系，再读取技术配置。

新生成、优化已有、集成本地技能这三类意图，在任何**技术栈**预检与检索之前确认项目类型：全栈项目（推荐）/ 仅前端 / 仅后端。多项目场景按项目分别确认；若证据足以判定则复述确认，只询问模糊项。「仅推荐 Skills」意图改走 §1.0-B 轻量预检，不要求完整项目类型问卷，但仍按项目分别识别技术栈。

完整技术栈确认按已确认的单项目类型应用以下维度矩阵。此矩阵不适用于「仅推荐 Skills」意图；该意图使用 §1.0-B 的轻量预检，只识别已有技术栈，不运行完整维度问卷。

| 维度 | 全栈 | 仅前端 | 仅后端 |
|---|---|---|---|
| 后端语言与框架 | 必问 | 跳过 | 必问 |
| 前端框架 | 必问 | 必问 | 跳过 |
| 数据库 | 必问 | 跳过 | 必问 |
| ORM/数据访问 | 必问 | 跳过 | 必问 |
| 工程化栈 | 必问 | 必问（前端） | 必问（后端） |
| 基础设施与部署 | 必问 | 必问 | 必问 |
| 框架内置组件/能力 | 必问 | 必问 | 必问 |
| 缓存方案 | 必问 | 跳过 | 必问 |

项目类型同时决定：预检文件范围、阶段三规则域预选、阶段四生成文件、阶段六检索维度。

### 1.0-B 仅推荐 Skills 的轻量预检

仅当阶段零意图为「仅推荐 Skills」时使用本节，不运行完整技术栈确认与最佳实践检索：先按 §1.0-A 确认目标项目范围，再分别读取各目标项目 `README` 和依赖清单（如 `package.json`、`pyproject.toml`、`go.mod`）；据证据归纳语言、框架、项目类型与主要工具。已有证据足够时直接复述已识别技术栈，不再要求用户回答完整项目类型问卷；证据不足时只询问缺失的栈信息。推荐 Skills 按每个项目的技术栈分别生成，未确认部分不做猜测或对应推荐。

## 1.1 项目技术栈预检（强制前置）

对每个已确认的项目根目录，按项目类型只检查适用文件；命中才用 `Read` 读取，只保留关键配置项。扫描结果需保留配置文件所属的项目路径，禁止把兄弟项目的清单当成当前项目依赖。

| 文件 | 提取内容 |
|---|---|
| `package.json` | dependencies/devDependencies 中的框架、ORM、测试、构建、包管理器 |
| `pnpm-lock.yaml` / `yarn.lock` / `package-lock.json` | 包管理器 |
| `go.mod` / `go.sum` | Go 版本、框架（Gin/GoFrame/Echo 等） |
| `pom.xml` / `build.gradle` | Java/Spring Boot 版本、ORM、测试 |
| `requirements.txt` / `pyproject.toml` | Python 版本、框架、ORM、测试 |
| `Cargo.toml` / `composer.json` | Rust / PHP 框架与 ORM |
| `vite.config.*` / `vue.config.*` / `next.config.*` / `nuxt.config.*` | 前端框架与构建工具 |
| `prisma/schema.prisma` / `ormconfig.*` | ORM 与数据库类型 |
| `Dockerfile` / `docker-compose.yml` | 部署方式与数据库服务 |
| `.github/workflows/*.yml` / `.gitlab-ci.yml` | CI/CD |
| `Makefile` / `make.cmd` | 构建命令 |

执行顺序：`Glob` 扫描各项目根目录 → 逐项目读取命中配置 → `LS` 看目录特征（`src/views` 偏前端、`internal/` 偏 Go）→ 输出逐项目「技术栈摘要」。若根目录存在工作区清单，另外记录工作区级工具；不得据此把子项目技术栈合并。

**目录级推断用 CodeGraph（仅当阶段零开关为开）**：项目规模大或配置缺失时，执行 `node scripts/codegraph.mjs explore --project <path> --query "project structure entrypoints"` 取 1 次结构化摘要，替代逐文件读取；开关为关时只用 `Glob` + `LS` + 定向 `Read`。

### 预检结果处理

| 情况 | 动作 |
|---|---|
| 已识别技术栈 | 复述确认；已识别维度不再询问；只对未识别维度走动态询问；选项优先兼容已有栈；版本号需 Context7/WebSearch 校验是否最新 |
| 项目为空 | 告知用户，按完整动态流程逐维度询问，禁止假设 |
| 部分识别 | 复述已识别部分；未识别部分补充询问，选项优先兼容 |

复述示例：

```
项目类型：全栈项目
技术栈预检结果：
- 后端框架：NestJS v10.x（package.json）
- 前端框架：Vue 3.x + Ant Design Vue（package.json + vite.config.ts）
- 数据库：MySQL（docker-compose.yml）
- ORM：TypeORM（package.json）
- 测试：Jest（devDependencies）
- 包管理器：pnpm（pnpm-lock.yaml）
- 部署：Docker（Dockerfile）
未识别维度：CI/CD、缓存方案 → 进入动态询问。
```

## 1.1-A 测试与 CI/CD 需求确认（每个项目都必须问）

技术栈摘要复述后，针对每个选定项目分别询问是否要把测试与 CI/CD 纳入本次规范和工作流设计。此问题与「仓库里是否已经有测试 / pipeline」分开：即使已有配置，也要确认是沿用、补齐还是本次不纳入；即使没有配置，也不能替用户决定要不要建立。

| 维度 | 必须提供的选择 | 后续处理 |
|---|---|---|
| 测试 | 沿用并规范已有测试 / 本次补充测试策略或框架 / 暂不新增自动化测试（记录原因与缺口） | 前两项才进入测试框架与覆盖范围确认；暂不新增时仍需在 `testing.md` 标出当前能力和风险，不伪造工具或命令。若同时启用完整 TDD 工作流，必须说明冲突并请用户选择补齐测试能力或改为轻量 / 自定义工作流 |
| CI/CD | 沿用并规范现有 pipeline / 本次选择并设计 CI/CD / 暂不纳入（记录原因与缺口） | 前两项才识别或动态比较平台、门禁和部署范围；暂不纳入时不得生成虚构 workflow 文件或命令 |

每个项目的记录须分别包含：用户决定、已存在配置证据、需要采用的工具 / 平台、待确认项。对已选「本次补充」但尚未选定技术的维度，按 §1.2 动态检索并询问；不得因配置缺失而跳过需求确认。纯「仅推荐 Skills」意图不询问是否生成测试或 CI/CD 规范。

## 1.2 动态询问流程

```
确认项目类型 → 预检 → 复述已有栈 → 仅对未识别维度：
Context7 查版本化能力 → WebSearch 查当前主流与横向对比
→ 动态生成 ≥3 选项 → AskUserQuestion → 记录 → 下一维度
```

每次询问前必须完成检索；首轮信息不足时加深检索；仍不足则如实告知知识盲区并请用户引导。

## 1.3 确认维度与检索方式

| 维度 | Context7 查询主题 | 补充 WebSearch 关键词 |
|---|---|---|
| 后端语言与框架 | `overview`、`project structure`、`dependency injection` | `most popular backend frameworks {year}` |
| 前端框架 | `overview`、`component model`、`state management` | `best frontend frameworks {year}` |
| 数据库 | `setup`、`indexing`、`transactions` | `most popular databases {year}` |
| ORM | `entity definition`、`query builder`、`migration` | `best ORM for {backend language} {year}` |
| 工程化栈 | `build`、`testing setup`、`lint` | `best {tool} for {stack} {year}` |
| 基础设施与部署 | `deployment`、`caching`、`ci cd` | `best {deploy/cache/cicd} {year}` |
| 框架内置组件/能力 | `components`、`built-in features`、`admin` | `{framework} built-in components` |

## 1.4 开源项目推荐（强制）

技术栈确认后立即检索并至少推荐 5 个同技术组合的高质量项目：

1. `{stack} open source project github`
2. `best {project type} open source {year} github`
3. `{stack} admin template github stars`
4. `{stack} 开源项目 gitee`

每个项目标注：名称、GitHub、Gitee（若有）、Star、技术栈、特点。优先 Star 高、近期活跃、文档完善、与用户栈匹配者；同时覆盖 GitHub 与 Gitee。

用 `AskUserQuestion` 展示并询问是否采用为参考项目。采用后展示仓库地址，再询问分析方式：

| 方式 | 说明 |
|---|---|
| 拉取到本地（推荐） | 询问位置（默认 `/tmp/spec-generator-reference/`）与平台后 `git clone`，进入阶段二用 CodeGraph 分析 |
| 仅在线分析 | `WebFetch` 取 README / AGENTS.md / `.agents/rules/`，不克隆 |
| 不分析 | 跳过参考项目分析 |

克隆失败自动降级为在线分析；两者都失败则跳过并告知。

## 1.5 框架内置组件清单收集

优先级从高到低：

1. 用户直接提供文档 URL 或清单
2. Context7 查询 `components` / `built-in features`
3. WebSearch（`{framework} component list`）
4. 参考项目提取（CodeGraph `explore` + 读组件目录）
5. WebFetch 官方文档单章节

只覆盖目标项目实际存在的技术层：仅前端检索前端组件；仅后端检索后端框架能力与项目实际使用的数据访问 / ORM；全栈按前后端分别检索。测试框架和构建工具只在项目存在或用户确认采用时检索。不得为项目类型跳过的层查询或生成组件清单。结构参考 `templates/framework-components.template.md`，只填适用章节。

## 1.6 交互格式

每个问题：≥3 选项、带说明与推荐理由、推荐项置首并标注「（推荐）」、支持 Other、允许时用 `multiSelect`、语言与用户一致。

## 1.7 确认与记录

技术栈确认后复述：技术栈清单、框架内置组件清单（若适用）、参考项目（若选）。用户表示「不确定/后续再定」的维度标 `待定`；采用内置组件框架但清单不全时，阶段二必须补检。
