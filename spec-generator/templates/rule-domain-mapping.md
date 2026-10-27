# 规则域内容映射表

本文件是规范生成器的内置规则域索引与适配参考，不依赖外部固定指南。五大支柱和共性原则由技能内置；项目专属规则根据用户确认、项目证据与当前官方资料动态生成。本文件中的技术栈名称、命令和示例仅用于说明适配方式，不能直接当成目标项目事实或最新建议。

## 一、规则域与内置关注点映射

每个规则文件按对应关注点检查覆盖情况，再结合目标项目证据、用户确认和动态检索的技术资料填充。此表是覆盖清单，不是固定内容模板。

| 规则文件 | 关注点 | 核心内容 |
|----------|----------|----------|
| `architecture.md` | 架构与模块边界 | 架构复杂度治理、模块解耦、接口契约、接口性能设计、公共模块抽离判定 |
| `api-contract.md` | API 契约 | API 设计、性能契约、响应字段、批量 ID 类型、接口文档标签 |
| `backend.md` | 后端实现 | 框架组件使用、依赖注入、初始化错误处理、缓存敏感服务、编译门禁、异常处理、日志、导出面、Service 层、软删除、接口性能、Controller 层、定时任务、单元测试 |
| `database.md` | 数据库 | 数据表设计、SQL 文件命名、数据分类、幂等性、数据写入、查询性能与索引 |
| `frontend-ui.md` | 前端与 UI | 目录路径、页面实现、组件使用、前端复杂度治理、弹窗和工作流 |
| `data-permission.md` | 数据权限 | 总体要求、读取接口、写操作和执行动作、字段权限（列级）、例外要求 |
| `cache-consistency.md` | 缓存与一致性 | 单机和集群模式、关键运行时数据、事务和失效耦合 |
| `dev-tooling.md` | 开发工具 | 跨平台执行、工具链优先、命令文件命名、子组件组织 |
| `testing.md` | 测试与质量 | 单元测试、E2E 测试、文件组织、质量审查、bugfix 反馈测试、任务完成门禁 |
| `workflow.md` | 开发流程 | 用户指定或本技能定制的工作流、审查触发、并行协作、文档语言、Git 操作 |
| `documentation.md` | 文档 | 项目文档要求、Markdown 格式要求 |
| `security.md` | 扩展域（防御设计支柱） | 认证授权、数据安全、API 安全、客户端安全、安全审计 |
| `devops.md` | 扩展域（门禁强制支柱） | 环境与配置、构建产物、部署、发布回滚、可观测性 |

## 二、技术栈适配点详解

### 2.1 architecture.md 技术栈适配点

| 适配项 | 通用表述 | NestJS | Go+GoFrame | Spring Boot | FastAPI |
|--------|----------|--------|------------|-------------|---------|
| 模块组织 | 模块边界 | NestModule | GoFrame 模块目录 | Spring Module | FastAPI Router |
| 依赖注入 | DI 容器 | `@Module` providers | Wire/fx | `@Component`/`@Bean` | Depends 函数 |
| 接口契约 | 公开接口 | TypeScript interface | Go interface | Java interface | Pydantic Protocol |
| 模块禁用 | 按需启用 | 动态 Module 注册 | 条件加载 | `@ConditionalOnProperty` | 条件 Router |

### 2.2 api-contract.md 技术栈适配点

| 适配项 | 通用表述 | NestJS | Go+GoFrame | Spring Boot | FastAPI |
|--------|----------|--------|------------|-------------|---------|
| 接口文档装饰器 | 框架文档装饰器 | `@ApiOperation`/`@ApiTags` | `g.Meta` | Springdoc `@Operation` | `@openapi` |
| 权限标签 | 自定义装饰器 | `@Permissions`/Guard | `g.Meta` | `@PreAuthorize` | `Depends` |
| DTO 校验 | 输入校验 | class-validator | GoFrame `v` tag | `@Valid`+JSR303 | Pydantic |
| 响应序列化 | DTO 投影 | class-transformer | struct 投影 | Jackson | Pydantic |

### 2.3 backend.md 技术栈适配点

| 适配项 | 通用表述 | NestJS | Go+GoFrame | Spring Boot | FastAPI |
|--------|----------|--------|------------|-------------|---------|
| 依赖注入 | 构造函数注入 | `constructor(private svc: X)` | 结构体字段 | `@Autowired` | `Depends(get_service)` |
| 异常类 | 自定义异常 | `HttpException` 子类 | `error`+`gerror` | `RuntimeException` 子类 | `HTTPException` 子类 |
| 全局异常处理 | 全局处理器 | `@Catch` ExceptionFilter | 中间件 | `@ControllerAdvice` | `@app.exception_handler` |
| 日志组件 | 统一日志 | NestJS Logger | GoFrame `glog` | SLF4J/Logback | Python `logging` |
| 查询构建器 | 框架推荐查询 | TypeORM QueryBuilder/Repository | GoFrame `g.DB()` | JPA Criteria/MyBatis | SQLAlchemy Query |
| 事务处理 | 框架事务 | `@Transactional`/EntityManager | `g.DB().TX()` | `@Transactional` | `async with session.begin()` |
| 编译门禁 | 编译测试 | `npm run build`+`jest` | `go build`+`go test` | `mvn compile`+`mvn test` | `mypy`+`pytest` |
| 代码检查 | 静态检查 | ESLint+Prettier | golangci-lint | Checkstyle/SpotBugs | Ruff+Black |

### 2.4 database.md 技术栈适配点

| 适配项 | 通用表述 | TypeORM | Prisma | GoFrame | MyBatis |
|--------|----------|---------|--------|---------|---------|
| 实体定义 | 数据模型 | `@Entity` class | `schema.prisma` | GoFrame DAO/DO | XML Mapper |
| 迁移工具 | 迁移命令 | `typeorm migration` | `prisma migrate` | SQL 文件 | Flyway/Liquibase |
| 软删除 | deleted_at 字段 | `@DeleteDateColumn` | `deleted_at` 字段+拦截器 | GoFrame ORM 软删除 | 逻辑删除插件 |
| 自动时间 | 时间维护 | `@CreateDateColumn`/`@UpdateDateColumn` | `@default(now())` | GoFrame ORM 自动时间 | `@TableField(fill=...)` |
| 幂等写入 | 由实际数据库与 ORM 支持的唯一约束 + 幂等写入 / upsert | 按已确认的驱动生成；PostgreSQL 原生 SQL 可用 `ON CONFLICT` | 按已确认的驱动生成；MySQL 原生 SQL 常用 `ON DUPLICATE KEY UPDATE` | 按项目实际数据库与 GoFrame 版本确认，禁止套用 PostgreSQL 语法 | 按项目实际数据库与 MyBatis 配置确认，禁止套用 PostgreSQL 语法 |

### 2.5 frontend-ui.md 技术栈适配点

| 适配项 | 通用表述 | Vue3+{框架名} | React+Next.js | Vue3+Element Plus |
|--------|----------|------------|---------------|-------------------|
| 组件风格 | 组件库 | {框架名} UI 组件 | shadcn/ui | Element Plus |
| 路由 | 路由模块 | Vue Router | Next.js App Router | Vue Router |
| 状态管理 | 状态库 | Pinia | Zustand/Context | Pinia |
| API 调用 | 适配器层 | `src/api/`+`src/adapter/` | `lib/api/` | `src/api/` |
| 表单组件 | 表单封装 | {框架名} 表单 Hook | react-hook-form | ElForm |
| 表格组件 | 表格封装 | {框架名} 表格 Hook | tanstack-table | ElTable |
| 权限控制 | 权限指令 | `v-access`/`AccessControl` | `usePermission` hook | `v-permission` 指令 |

### 2.6 dev-tooling.md 技术栈适配点

| 适配项 | 通用表述 | Node.js 项目 | Go 项目 | Python 项目 | Java 项目 |
|--------|----------|--------------|---------|------------|-----------|
| 构建工具 | 构建脚本 | `package.json` scripts | `Makefile`+Go | `pyproject.toml`+Make | `pom.xml`+Maven |
| 包管理 | 依赖管理 | pnpm/npm | go modules | pip/poetry | Maven/Gradle |
| 跨平台脚本 | 跨平台入口 | Node.js 脚本 | Go 二进制 | Python 脚本 | Java/JAR |
| 代码生成 | 脚手架 | `nest g`/自定义 | `make ctrl` | Cookiecutter | Archetype |

### 2.7 testing.md 技术栈适配点

| 适配项 | 通用表述 | Jest/Vitest | go test | JUnit | pytest |
|--------|----------|-------------|---------|-------|--------|
| 单元测试后缀 | `.spec.{ext}` | `.spec.ts` | `_test.go` | `Test.java` | `_test.py` |
| Mock 工具 | Mock 库 | `jest.fn()`/`vi.fn()` | gomock | Mockito | `unittest.mock` |
| 断言库 | 断言风格 | `expect` | `require`/`assert` | AssertJ | `assert` |
| 覆盖率 | 覆盖率工具 | `--coverage` | `go test -cover` | JaCoCo | `coverage.py` |
| E2E 框架 | E2E 工具 | Playwright | Playwright | Playwright | Playwright |

## 三、生成规则文件的标准步骤

生成每个规则文件时，必须按以下步骤执行：

1. **收集项目证据**：定向读取相关目录、配置、代码与现有规范；区分已验证事实、用户确认和未知项
2. **检索技术资料**：基于确认的技术栈检索该规则域的当前官方资料
3. **交叉核对**：识别项目现状、用户意图和官方建议之间的冲突，说明取舍并在必要时请用户确认
4. **填充模板**：基于`rule-file.template.md`与本技能内置原则组织内容
5. **技术栈适配**：只写项目实际使用或用户确认采用的实现细节
6. **写入文件**：将生成的规则文件写入`.agents/rules/{rule-name}.md`

## 四、规则文件章节填充指南

每个规则文件的标准章节填充指南：

### 4.1 适用范围

填写该规则约束的具体范围，依据目标项目证据、用户确认和本文件对应关注点。

### 4.2 核心要求章节

按本技能内置原则、用户确认内容和已验证项目证据组织规则；不适用项应省略或标记待确认，不得为了填满模板而添加规则。

### 4.3 技术栈特定要求

基于 WebSearch 检索到的最佳实践，补充技术栈特定的实现要求。必须包含：

- 官方推荐的实现方式
- 框架特有的约定
- 常见陷阱与规避方式

### 4.4 验证要求

填写验证方式和门禁要求，必须包含技术栈特定的验证命令：

- 编译命令
- 静态检查命令
- 测试命令
- 构建命令

### 4.5 审查要求

填写审查必须确认的事项和审查必须拒绝的情形，依据项目风险、用户确认和技能内置原则。

### 4.6 公共模块抽离要求（命中时）

`architecture.md` 必须包含「公共模块抽离」章节；`frontend-ui.md` 与 `backend.md` 补充本层落点。填充模板：

```markdown
## 公共模块抽离

### 判定门槛
- 同构流程 ≥2 处且单处 ≥30 行，或 ≥3 处且单处 ≥10 行。
- 差异点 ≤5 个，且可全部转为配置、插槽或适配器参数。

### 必须抽离
- {上传 / 导入 / 导出 / 请求封装 / 权限校验等本项目的具体能力}

### 禁止抽离
- 单处使用、业务语义不同、需 >5 个参数或 ≥2 个布尔开关、差异改变控制流、假设性复用。

### 落点与命名
- 前端 `{公共组件目录}` / `{composables 目录}`；后端 `{shared 目录}`。
- 单一入口导出，禁止反向依赖业务模块。

### 验收
- 调用点只传配置；核心流程只有一份实现；每个变体有测试；修改流程只改一处。
```

填充时用阶段二检索到的目录结构与组件名替换 `{}`；不得保留未替换占位符。

### 4.7 安全要求（security.md）

统一模板，`{}` 全部用阶段二检索到的本栈实现替换：

```markdown
## 安全要求

### 认证与授权
- {本栈认证机制与令牌续期方式}；会话失效、登出、越权访问必须显式处理。

### 数据安全
- {本栈敏感字段加密、脱敏与传输加密方式}；禁止明文存储密钥与口令。

### API 安全
- {本栈的限流、幂等、参数校验与防重放手段}；禁止把内部错误堆栈透出给调用方。

### 客户端安全
- {本栈的令牌存储位置与 XSS/CSRF 防护}；禁止在客户端保存长期凭据。

### 安全审计
- {本栈审计日志字段与留存策略}；登录、权限变更、数据导出必须留痕。
```

### 4.8 部署运维要求（devops.md）

这是按项目类型和当前部署方式裁剪的参考章节，不要求静态前端项目虚构服务端健康探针，也不等于替用户选择 CI/CD。没有部署目标时记录现状和未配置状态；CI/CD 按 `02-stack.md` 的逐项目决定处理。

```markdown
## 部署运维要求

### 环境与配置
- 配置按环境分离，密钥走 {本栈密钥管理方式}，禁止提交到仓库。

### 构建与产物
- 构建命令 {本栈构建命令}；产物可重复构建，版本号与提交号可追溯。

### 部署
- {实际部署目标的发布方式}；长运行服务在平台支持时配置健康检查 / 就绪探针。静态站点、库或未部署项目按实际情况记录，不要求不存在的服务探针。

### 发布与回滚
- 发布前执行 {本栈检查命令}；回滚步骤文档化，且可在一个版本内完成。

### 可观测性
- 按项目是否提供运行时服务选择日志、指标、告警、前端错误监控或构建产物追踪；只有实际提供接口的服务才定义接口耗时与错误率指标。
```

## 五、框架内置组件适配点

当用户采用提供相应内置能力的框架（由阶段二检索确认）时，只在项目实际存在的技术层生成对应规则章节。以下是可选适配映射，不要求一个项目生成表中所有章节；取值一律来自检索结果，禁止沿用示例技术名：

| 规则文件 | 必须生成的章节 | 适配项 |
|---|---|---|
| `frontend-ui.md` | 组件使用要求 | 表格与配套组件、表单、弹窗、抽屉、操作列、上传、下载、图标与命名、全局注册目录、适配器层 |
| `backend.md` | 框架内置能力优先使用 | DI、守卫/拦截器/管道、数据访问、异常基类、日志、配置、校验、文档装饰器 |
| `database.md` | ORM 内置功能优先使用 | 实体定义、查询、迁移、软删除、时间字段、事务、关系映射 |
| `testing.md` | 测试框架内置工具优先使用 | Mock、断言、覆盖率、异步、Fixture、快照 |
| `dev-tooling.md` | 构建工具内置能力优先使用 | 构建配置、插件、环境变量、代理、代码分割 |

适用性：仅前端项目只检查 `frontend-ui.md`、`testing.md`、`dev-tooling.md` 中确实使用的框架 / 工具；仅后端项目只检查 `backend.md`、存在 ORM 时的 `database.md`、`testing.md`、`dev-tooling.md`；全栈项目逐层检查。用户选择不新增自动化测试或项目没有测试框架时，不得伪造测试组件清单，记录现状 / 用户决定与缺口即可。

每章统一结构：清单表格（场景 / 必须使用 / 使用方式 / 禁止替代方案 / 来源）→ 分场景细则 → 「禁止替代方案」（不得留空）。模板见 `templates/framework-components.template.md`。

## 六、技术栈适配动态检索参考

**检索口径**：本章不再提供固定适配速查表。实际生成时按 `references/02-stack.md` 的维度表与 `references/03-research.md` 的 Context7 查询模板实时检索；WebSearch 仅作兜底。禁止跳过检索或套用固定示例。

### 6.1 适配检索策略

针对用户在阶段一动态确认的技术栈，规范生成时必须按以下策略检索适配内容：

**检索维度**：后端框架、前端框架、数据库、ORM、测试框架、构建工具；每项只记录文件后缀、依赖注入、数据访问、异常处理、测试、构建与静态检查等适配结论，并标注来源与日期。

### 6.2 适配思路

示例从略：按上述维度逐项检索，不保留固定技术栈示例。

### 6.3 禁止事项

- 禁止套用固定适配信息、跳过检索或凭空生成。
