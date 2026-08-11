# 规则域内容映射表

本文件指导规范生成器在生成各规则文件时，如何将《通用项目规范体系设计指南》的原则框架与用户技术栈的最佳实践进行整合。

## 一、规则域与指南章节映射

每个规则文件的内容来源自指南的对应章节，生成时必须读取该章节内容并结合技术栈最佳实践填充。

| 规则文件 | 指南章节 | 核心内容 |
|----------|----------|----------|
| `architecture.md` | 第四节 | 架构复杂度治理、模块解耦、接口契约、接口性能设计 |
| `api-contract.md` | 第五节 | RESTful 设计标准、API 性能契约、响应时间字段、批量 ID 类型、接口文档标签 |
| `backend.md` | 第六节 | 框架组件使用、显式依赖注入、初始化错误处理、缓存敏感服务、编译门禁、统一异常处理、日志、导出面、Service 层、软删除、接口性能、Controller 层、定时任务、单元测试 |
| `database.md` | 第七节 | 数据表设计、SQL 文件命名、数据分类、幂等性、数据写入、查询性能与索引 |
| `frontend-ui.md` | 第八节 | 目录路径、页面实现、组件使用、前端复杂度治理、弹窗和工作流 |
| `data-permission.md` | 第九节 | 总体要求、读取类接口、写操作和执行动作、例外要求 |
| `cache-consistency.md` | 第十节 | 设计要求、单机和集群模式、关键运行时数据、事务和失效耦合 |
| `dev-tooling.md` | 第十一节 | 跨平台执行、工具链优先、命令文件命名、子组件组织 |
| `testing.md` | 第十二节 | 单元测试、E2E 测试、文件组织、质量审查、bugfix 反馈测试、任务完成门禁 |
| `workflow.md` | 第十三节 | SDD 驱动流程、审查触发、并行协作、文档语言、Git 操作 |
| `documentation.md` | 第十四节 | 基础要求、Markdown 格式要求 |

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
| 幂等 SQL | 幂等语法 | `ON CONFLICT DO NOTHING` | `ON CONFLICT DO NOTHING` | `ON CONFLICT DO NOTHING` | `ON CONFLICT DO NOTHING` |

### 2.5 frontend-ui.md 技术栈适配点

| 适配项 | 通用表述 | Vue3+Vben | React+Next.js | Vue3+Element Plus |
|--------|----------|------------|---------------|-------------------|
| 组件风格 | 组件库 | Vben UI 组件 | shadcn/ui | Element Plus |
| 路由 | 路由模块 | Vue Router | Next.js App Router | Vue Router |
| 状态管理 | 状态库 | Pinia | Zustand/Context | Pinia |
| API 调用 | 适配器层 | `src/api/`+`src/adapter/` | `lib/api/` | `src/api/` |
| 表单组件 | 表单封装 | Vben useForm | react-hook-form | ElForm |
| 表格组件 | 表格封装 | Vben useVxeGrid | tanstack-table | ElTable |
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

1. **读取指南章节**：读取《通用项目规范体系设计指南》中对应章节的核心内容
2. **提取通用规则**：提取该章节的强制规则、禁止性规则、共性原则
3. **检索技术最佳实践**：基于用户技术栈检索该领域的最新最佳实践
4. **交叉验证**：将通用规则与技术最佳实践交叉验证，冲突时以通用规则为框架，技术细节以最佳实践为准
5. **填充模板**：基于`rule-file.template.md`模板填充内容
6. **技术栈适配**：将通用表述替换为技术栈特定的实现细节
7. **写入文件**：将生成的规则文件写入`.agents/rules/{rule-name}.md`

## 四、规则文件章节填充指南

每个规则文件的标准章节填充指南：

### 4.1 适用范围

填写该规则约束的具体范围，参考指南对应章节的开头说明。

### 4.2 核心要求章节

从指南对应章节提取所有「强制规则」和「细则」，按主题组织为多个章节。每个规则条目必须完整保留，不得删减。

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

填写审查必须确认的事项和审查必须拒绝的情形，参考指南对应章节的审查要求。

## 五、框架内置组件适配点

当用户采用包含内置组件库的框架（如 vben、ant-design-pro 等）时，各规则文件必须生成「框架内置组件优先使用」章节。本章节详细说明各规则域的适配点。

### 5.1 frontend-ui.md 框架内置组件适配

**必须生成的章节**：「组件使用要求」（参考 [frontend-ui.md](file:///../../../../.agents/rules/frontend-ui.md) 模式）

**适配内容清单**：

| 适配项 | 说明 | vben 框架示例 |
|--------|------|---------------|
| 表格组件 | 列出框架内置表格组件和配套组件 | `useVbenVxeGrid`+`Page` |
| 表单组件 | 列出框架内置表单组件 | `useVbenForm` |
| 弹窗组件 | 列出框架内置弹窗组件 | `useVbenModal` |
| 抽屉组件 | 列出框架内置抽屉组件 | `useVbenDrawer` |
| 操作列组件 | 列出操作列的标准组件组合 | `ghost-button`+`Popconfirm` |
| 下拉菜单 | 列出操作列下拉菜单组件 | `Dropdown`+`Menu`+`MenuItem` |
| 上传组件 | 列出文件上传组件 | `Upload.Dragger` |
| 下载方法 | 列出文件下载方法 | `requestClient.download` |
| 图标组件 | 列出图标组件和命名格式 | `IconifyIcon`+`ant-design:xxx-outlined` |
| 单选项配置 | 列出 RadioGroup 标准配置 | `optionType: 'button'`+`buttonStyle: 'solid'` |
| 全局组件位置 | 指定全局组件注册目录 | `src/components/global/` |
| 适配器层目录 | 指定适配器层目录结构 | `src/adapter/`（含`component`、`form`、`vxe-table`） |
| 参考项目 | 指定参考项目以保持一致性 | `ruoyi-plus-vben5` |

**生成模板**：

```markdown
## 组件使用要求

- 表格页面使用`{表格组件}`和`{配套组件}`。
- 表格操作列使用`{操作列组件}`和`{确认组件}`。
- 前端样式和交互参考`{参考项目}`项目保持一致。
- 弹窗、抽屉、表单、表格、搜索栏等交互模式必须与参考项目保持一致。
- 布局、间距、字体、颜色等视觉元素必须参考现有项目实现。

- 表单使用`{表单组件}`。
- 弹窗使用`{弹窗组件}`。
- 抽屉使用`{抽屉组件}`。
- `RadioGroup`单选项使用`optionType: 'button'`和`buttonStyle: 'solid'`。
- 文件上传使用`{上传组件}`。
- 文件下载使用`{下载方法}`方法。
- 操作列的"更多"下拉菜单使用`{下拉菜单组件}`。
- 图标使用`{图标组件}`组件，图标名使用`{图标格式}`格式。

- 禁止使用框架未推荐的第三方组件库替代内置组件。
- 禁止自行封装与内置组件功能等价的组件。
```

### 5.2 backend.md 框架内置能力适配

**必须生成的章节**：「框架内置能力优先使用」

**适配内容清单**：

| 适配项 | 说明 | NestJS 示例 | GoFrame 示例 |
|--------|------|-------------|--------------|
| 依赖注入装饰器 | 列出框架 DI 装饰器 | `@Injectable`、`@Module` | 结构体字段+`fx`/`Wire` |
| 守卫/拦截器 | 列出框架守卫和拦截器 | `Guard`、`Interceptor`、`Pipe`、`Filter` | 中间件 |
| 数据访问方式 | 列出框架推荐的数据访问方式 | TypeORM `Repository` | `g.DB()` |
| 异常基类 | 列出框架异常处理基类 | `HttpException` | `gerror` |
| 日志组件 | 列出框架日志组件 | NestJS `Logger` | `glog` |
| 配置管理 | 列出框架配置管理方式 | `@Inject(config.KEY)` | `g.Cfg()` |
| 验证装饰器 | 列出框架输入校验方式 | `class-validator` | GoFrame `v` tag |
| 文档装饰器 | 列出框架接口文档装饰器 | `@ApiOperation`、`@ApiTags` | `g.Meta` |

### 5.3 database.md ORM 内置功能适配

**必须生成的章节**：「ORM 内置功能优先使用」

**适配内容清单**：

| 适配项 | 说明 | TypeORM 示例 | Prisma 示例 |
|--------|------|-------------|-------------|
| 实体定义方式 | 列出 ORM 实体定义方式 | `@Entity`+`@Column` | `schema.prisma` |
| 查询方式 | 列出 ORM 推荐查询方式 | `QueryBuilder`、`Repository.find()` | `PrismaClient`方法 |
| 迁移工具 | 列出 ORM 迁移工具 | `typeorm migration` | `prisma migrate` |
| 软删除方式 | 列出 ORM 软删除实现 | `@DeleteDateColumn` | `deleted_at`字段+中间件 |
| 自动时间维护 | 列出 ORM 时间维护装饰器 | `@CreateDateColumn`+`@UpdateDateColumn` | `@default(now())` |
| 事务处理 | 列出 ORM 事务处理方式 | `EntityManager.transaction()` | `prisma.$transaction()` |
| 关系映射 | 列出 ORM 关系映射方式 | `@OneToMany`、`@ManyToOne` | `relation`字段 |

### 5.4 testing.md 测试框架内置工具适配

**必须生成的章节**：「测试框架内置工具优先使用」

**适配内容清单**：

| 适配项 | 说明 | Jest 示例 | Vitest 示例 |
|--------|------|-----------|------------|
| Mock 工具 | 列出测试框架 Mock 工具 | `jest.fn()`、`jest.spyOn()` | `vi.fn()`、`vi.spyOn()` |
| 断言库 | 列出测试框架断言方式 | `expect().toBe()` | `expect().toBe()` |
| 覆盖率工具 | 列出测试框架覆盖率工具 | `--coverage` | `--coverage` |
| 异步测试 | 列出测试框架异步测试方式 | `async/await` | `async/await` |
| Fixture 工具 | 列出测试框架 Fixture 工具 | `beforeEach`/`afterEach` | `beforeEach`/`afterEach` |
| 快照测试 | 列出测试框架快照测试方式 | `toMatchSnapshot()` | `toMatchSnapshot()` |

### 5.5 dev-tooling.md 构建工具内置能力适配

**必须生成的章节**：「构建工具内置能力优先使用」

**适配内容清单**：

| 适配项 | 说明 | Vite 示例 | Webpack 示例 |
|--------|------|-----------|--------------|
| 构建配置 | 列出构建工具配置方式 | `vite.config.ts` | `webpack.config.js` |
| 插件系统 | 列出构建工具插件使用方式 | `@vitejs/plugin-vue` | `vue-loader` |
| 环境变量 | 列出构建工具环境变量处理 | `import.meta.env` | `process.env` |
| 代理配置 | 列出构建工具开发代理配置 | `server.proxy` | `devServer.proxy` |
| 代码分割 | 列出构建工具代码分割方式 | `build.rollupOptions` | `optimization.splitChunks` |

## 六、技术栈适配动态检索参考

**设计理念**：本章节不再是固定技术栈的速查表，而是提供适配检索思路的参考。实际生成规范时，必须通过`WebSearch`实时检索用户采用技术栈的最新最佳实践，禁止直接套用以下参考内容。

### 6.1 适配检索策略

针对用户在阶段一动态确认的技术栈，规范生成时必须按以下策略检索适配内容：

| 适配维度 | 检索关键词模板 | 检索目标 |
|----------|---------------|----------|
| 后端框架 | `{后端框架名} best practices {当前年份}` | 文件后缀、依赖注入、ORM、异常处理、测试框架 |
| 前端框架 | `{前端框架名} best practices {当前年份}` | 文件后缀、组件风格、状态管理、UI 库、测试框架 |
| 数据库 | `{数据库名} best practices {当前年份}` | 迁移工具、命名规范、索引优化 |
| ORM | `{ORM名} best practices {当前年份}` | 实体定义、查询方式、软删除、时间维护 |
| 测试框架 | `{测试框架名} best practices {当前年份}` | Mock 工具、断言库、覆盖率工具 |
| 构建工具 | `{构建工具名} best practices {当前年份}` | 构建配置、插件系统、环境变量 |

### 6.2 适配思路示例

以下示例仅展示适配思路，实际生成时必须以`WebSearch`检索结果为准：

**示例一：若用户确认采用某 TypeScript 后端框架**

适配检索要点：
- 文件后缀：检索该框架推荐的文件后缀（通常为`.ts`）
- 依赖注入：检索该框架推荐的依赖注入方式（装饰器、构造函数等）
- ORM：检索该框架推荐或集成的 ORM
- 异常处理：检索该框架推荐的异常处理基类和全局处理器
- 测试框架：检索该技术栈对应的测试框架
- 构建：检索该框架的构建命令
- 静态检查：检索该技术栈对应的代码检查工具

**示例二：若用户确认采用某 Go 后端框架**

适配检索要点：
- 文件后缀：检索该框架推荐的文件后缀（通常为`.go`）
- 依赖注入：检索该框架推荐的依赖注入方式
- ORM：检索该框架推荐或集成的 ORM
- 异常处理：检索该框架推荐的错误处理方式
- 测试框架：检索 Go 语言的测试工具（通常为`go test`）
- 构建：检索该框架的构建命令
- 静态检查：检索 Go 语言的代码检查工具

**示例三：若用户确认采用某 Java 后端框架**

适配检索要点：
- 文件后缀：检索该框架推荐的文件后缀（通常为`.java`）
- 依赖注入：检索该框架推荐的依赖注入方式
- ORM：检索该框架推荐或集成的 ORM
- 异常处理：检索该框架推荐的异常处理基类和全局处理器
- 测试框架：检索 Java 语言的测试工具
- 构建：检索该框架的构建工具
- 静态检查：检索 Java 语言的代码检查工具

### 6.3 禁止事项

- 禁止直接套用本章节的示例内容生成规范
- 禁止跳过`WebSearch`检索直接使用固定适配信息
- 禁止使用过时的适配信息，所有适配内容必须基于当前年份的检索结果
- 禁止在未检索到某项适配内容时凭空生成
