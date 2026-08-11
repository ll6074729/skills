# 框架内置组件清单模板

本模板用于记录项目所采用框架的内置组件清单，作为规范生成时「框架内置组件优先使用」规则的数据来源。

## 一、前端框架内置组件清单

### 1.1 框架基本信息

| 项目 | 内容 |
|------|------|
| 框架名称 | {{FRAMEWORK_NAME}}（如 vben、ant-design-pro） |
| 框架版本 | {{FRAMEWORK_VERSION}} |
| 官方文档 URL | {{FRAMEWORK_DOC_URL}} |
| 参考项目 | {{REFERENCE_PROJECT}}（如 ruoyi-plus-vben5） |
| 参考项目 URL | {{REFERENCE_PROJECT_URL}} |
| 组件清单来源 | {{COMPONENT_SOURCE}}（官方文档/参考项目/WebSearch 检索） |
| 检索日期 | {{SEARCH_DATE}} |

### 1.2 组件使用清单

| 功能场景 | 必须使用的内置组件 | 配置方式 | 禁止替代方案 | 来源 |
|----------|-------------------|----------|--------------|------|
| 表格页面 | {{TABLE_COMPONENT}}（如`useVbenVxeGrid`）+{{PAGE_COMPONENT}}（如`Page`） | {{TABLE_CONFIG}} | 禁止自行封装表格组件 | {{SOURCE}} |
| 表格操作列 | {{ACTION_COMPONENT}}（如`ghost-button`）+{{CONFIRM_COMPONENT}}（如`Popconfirm`） | {{ACTION_CONFIG}} | 禁止使用原生按钮 | {{SOURCE}} |
| 下拉菜单 | {{DROPDOWN_COMPONENT}}（如`Dropdown`+`Menu`+`MenuItem`） | {{DROPDOWN_CONFIG}} | 禁止使用原生 select | {{SOURCE}} |
| 表单 | {{FORM_COMPONENT}}（如`useVbenForm`） | {{FORM_CONFIG}} | 禁止自行封装表单组件 | {{SOURCE}} |
| 弹窗 | {{MODAL_COMPONENT}}（如`useVbenModal`） | {{MODAL_CONFIG}} | 禁止使用原生 dialog | {{SOURCE}} |
| 抽屉 | {{DRAWER_COMPONENT}}（如`useVbenDrawer`） | {{DRAWER_CONFIG}} | 禁止自行封装抽屉组件 | {{SOURCE}} |
| 单选项 | {{RADIO_COMPONENT}}（如`RadioGroup`） | `optionType: 'button'`+`buttonStyle: 'solid'` | 禁止使用原生 radio | {{SOURCE}} |
| 文件上传 | {{UPLOAD_COMPONENT}}（如`Upload.Dragger`） | {{UPLOAD_CONFIG}} | 禁止使用原生 input file | {{SOURCE}} |
| 文件下载 | {{DOWNLOAD_METHOD}}（如`requestClient.download`） | {{DOWNLOAD_CONFIG}} | 禁止使用原生 a 标签下载 | {{SOURCE}} |
| 图标 | {{ICON_COMPONENT}}（如`IconifyIcon`） | 图标名格式：{{ICON_FORMAT}}（如`ant-design:xxx-outlined`） | 禁止使用 SVG 直引或字体图标 | {{SOURCE}} |

### 1.3 目录结构约定

| 目录 | 用途 | 示例 |
|------|------|------|
| 全局组件注册 | 全局组件注册位置 | `src/components/global/`（如`GhostButton`） |
| 适配器层 | 适配器层目录 | `src/adapter/`（含`component`、`form`、`vxe-table`） |
| 视图目录 | 页面视图文件 | `src/views/` |
| API 目录 | API 调用文件 | `src/api/` |
| 路由模块 | 路由配置 | `src/router/routes/modules/` |

### 1.4 样式与交互约定

| 约定项 | 要求 | 参考项目 |
|--------|------|----------|
| 视觉风格 | 参考{{REFERENCE_PROJECT}}保持一致 | {{REFERENCE_PROJECT}} |
| 布局间距 | 参考现有项目实现 | {{REFERENCE_PROJECT}} |
| 字体颜色 | 参考现有项目实现 | {{REFERENCE_PROJECT}} |
| 交互模式 | 弹窗、抽屉、表单、表格、搜索栏与参考项目一致 | {{REFERENCE_PROJECT}} |

## 二、后端框架内置能力清单

### 2.1 框架基本信息

| 项目 | 内容 |
|------|------|
| 后端框架名称 | {{BACKEND_FRAMEWORK_NAME}}（如 NestJS、GoFrame、Spring Boot） |
| 框架版本 | {{BACKEND_FRAMEWORK_VERSION}} |
| 官方文档 URL | {{BACKEND_DOC_URL}} |
| 能力清单来源 | {{CAPABILITY_SOURCE}} |
| 检索日期 | {{SEARCH_DATE}} |

### 2.2 内置能力使用清单

| 能力场景 | 必须使用的内置能力 | 使用方式 | 禁止替代方案 | 来源 |
|----------|-------------------|----------|--------------|------|
| 依赖注入 | {{DI_DECORATOR}}（如`@Injectable`、`@Module`） | {{DI_USAGE}} | 禁止全局服务定位 | {{SOURCE}} |
| 守卫/鉴权 | {{GUARD_COMPONENT}}（如`Guard`） | {{GUARD_USAGE}} | 禁止中间件硬编码鉴权 | {{SOURCE}} |
| 拦截器 | {{INTERCEPTOR_COMPONENT}}（如`Interceptor`） | {{INTERCEPTOR_USAGE}} | 禁止自行封装拦截逻辑 | {{SOURCE}} |
| 管道/校验 | {{PIPE_COMPONENT}}（如`Pipe`、`class-validator`） | {{PIPE_USAGE}} | 禁止手动校验 | {{SOURCE}} |
| 异常处理 | {{EXCEPTION_BASE}}（如`HttpException`） | {{EXCEPTION_USAGE}} | 禁止硬编码状态码 | {{SOURCE}} |
| 日志 | {{LOG_COMPONENT}}（如`Logger`、`glog`） | {{LOG_USAGE}} | 禁止 console.log | {{SOURCE}} |
| 配置管理 | {{CONFIG_COMPONENT}}（如`@Inject(config.KEY)`） | {{CONFIG_USAGE}} | 禁止硬编码配置 | {{SOURCE}} |
| 数据访问 | {{DATA_ACCESS}}（如`Repository`、`g.DB()`） | {{DATA_USAGE}} | 禁止直接 SQL 拼接 | {{SOURCE}} |

## 三、ORM 内置功能清单

### 3.1 ORM 基本信息

| 项目 | 内容 |
|------|------|
| ORM 名称 | {{ORM_NAME}}（如 TypeORM、Prisma、GoFrame ORM） |
| ORM 版本 | {{ORM_VERSION}} |
| 官方文档 URL | {{ORM_DOC_URL}} |
| 功能清单来源 | {{ORM_SOURCE}} |
| 检索日期 | {{SEARCH_DATE}} |

### 3.2 ORM 功能使用清单

| 功能场景 | 必须使用的 ORM 功能 | 使用方式 | 禁止替代方案 | 来源 |
|----------|---------------------|----------|--------------|------|
| 实体定义 | {{ENTITY_DECORATOR}}（如`@Entity`+`@Column`） | {{ENTITY_USAGE}} | 禁止裸 SQL 建表 | {{SOURCE}} |
| 查询构建 | {{QUERY_BUILDER}}（如`QueryBuilder`） | {{QUERY_USAGE}} | 禁止拼接 SQL 字符串 | {{SOURCE}} |
| 迁移管理 | {{MIGRATION_TOOL}}（如`typeorm migration`） | {{MIGRATION_USAGE}} | 禁止手动改表 | {{SOURCE}} |
| 软删除 | {{SOFT_DELETE}}（如`@DeleteDateColumn`） | {{SOFT_DELETE_USAGE}} | 禁止手动`update deleted_at` | {{SOURCE}} |
| 自动时间维护 | {{AUTO_TIME}}（如`@CreateDateColumn`） | {{AUTO_TIME_USAGE}} | 禁止手动设置时间 | {{SOURCE}} |
| 事务处理 | {{TRANSACTION}}（如`EntityManager.transaction()`） | {{TRANSACTION_USAGE}} | 禁止裸连接事务 | {{SOURCE}} |
| 关系映射 | {{RELATION}}（如`@OneToMany`） | {{RELATION_USAGE}} | 禁止手动 JOIN 装配 | {{SOURCE}} |

## 四、测试框架内置工具清单

### 4.1 测试框架基本信息

| 项目 | 内容 |
|------|------|
| 单元测试框架 | {{UNIT_TEST_FRAMEWORK}}（如 Jest、Vitest） |
| E2E 测试框架 | {{E2E_TEST_FRAMEWORK}}（如 Playwright） |
| 框架版本 | {{TEST_VERSION}} |
| 官方文档 URL | {{TEST_DOC_URL}} |

### 4.2 测试工具使用清单

| 工具场景 | 必须使用的测试工具 | 使用方式 | 禁止替代方案 | 来源 |
|----------|-------------------|----------|--------------|------|
| Mock | {{MOCK_TOOL}}（如`jest.fn()`） | {{MOCK_USAGE}} | 禁止自行封装 mock | {{SOURCE}} |
| 断言 | {{ASSERT_TOOL}}（如`expect().toBe()`） | {{ASSERT_USAGE}} | 禁止 console 断言 | {{SOURCE}} |
| 覆盖率 | {{COVERAGE_TOOL}}（如`--coverage`） | {{COVERAGE_USAGE}} | 禁止手动统计覆盖率 | {{SOURCE}} |
| Fixture | {{FIXTURE_TOOL}}（如`test.use()`） | {{FIXTURE_USAGE}} | 禁止全局状态依赖 | {{SOURCE}} |

## 五、构建工具内置能力清单

### 5.1 构建工具基本信息

| 项目 | 内容 |
|------|------|
| 构建工具 | {{BUILD_TOOL}}（如 Vite、Webpack） |
| 版本 | {{BUILD_VERSION}} |
| 官方文档 URL | {{BUILD_DOC_URL}} |

### 5.2 构建能力使用清单

| 能力场景 | 必须使用的构建能力 | 使用方式 | 禁止替代方案 | 来源 |
|----------|-------------------|----------|--------------|------|
| 构建配置 | {{BUILD_CONFIG}}（如`vite.config.ts`） | {{BUILD_CONFIG_USAGE}} | 禁止命令行参数构建 | {{SOURCE}} |
| 插件系统 | {{PLUGIN_SYSTEM}}（如`@vitejs/plugin-vue`） | {{PLUGIN_USAGE}} | 禁止自行实现构建逻辑 | {{SOURCE}} |
| 环境变量 | {{ENV_VAR}}（如`import.meta.env`） | {{ENV_USAGE}} | 禁止硬编码环境值 | {{SOURCE}} |
| 开发代理 | {{PROXY}}（如`server.proxy`） | {{PROXY_USAGE}} | 禁止手动配置代理 | {{SOURCE}} |
| 代码分割 | {{CODE_SPLIT}}（如`build.rollupOptions`） | {{CODE_SPLIT_USAGE}} | 禁止全量打包 | {{SOURCE}} |

## 六、清单填写说明

### 6.1 填写规则

1. 所有占位符`{{XXX}}`必须替换为实际内容
2. 来源字段必须标注：官方文档、参考项目、WebSearch 检索结果
3. 禁止替代方案列禁止留空，必须明确禁止的方式
4. 若某项无法获取，填写`待补充`并在交付时汇总

### 6.2 更新策略

- 框架升级时，必须重新验证组件清单的准确性
- 新增框架组件时，必须同步更新本清单
- 定期通过 WebSearch 检索框架最新文档，验证清单时效性
