#!/usr/bin/env node
/**
 * 功能等价性验证：确认瘦身后原有强制逻辑仍然存在，且新增的 Context7 / CodeGraph 接入可执行。
 *
 * 检查分三类：
 * A. 语义完整性：原技能的关键阶段、约束、产物、降级路径必须在运行期文件中可检索；
 * B. 结构完整性：SKILL.md 内部链接可达，MCP 配置合法；
 * C. 可执行性：脚本语法正确，codegraph 封装在缺少二进制时能给出明确降级提示。
 *
 * 用法：node scripts/verify-parity.mjs [--json]
 * 退出码：0 全部通过；1 存在失败项。
 */

import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");

/**
 * 读取文件，失败时返回空串。
 * @param {string} rel 相对技能根目录的路径
 * @returns {string}
 */
function read(rel) {
  const abs = path.join(ROOT, rel);
  return existsSync(abs) ? readFileSync(abs, "utf8") : "";
}

const runtimeFiles = [
  "SKILL.md",
  "references/01-intake.md",
  "references/02-stack.md",
  "references/03-research.md",
  "references/04-generate-deliver.md",
  "references/05-workflow-mode.md",
  "templates/checklist.md",
  "templates/rule-domain-mapping.md",
  "templates/framework-components.template.md",
  "templates/AGENTS.template.md",
  "templates/rule-file.template.md",
];

const files = Object.fromEntries(runtimeFiles.map((rel) => [rel, read(rel)]));
const corpus = Object.values(files).join("\n");

/**
 * 断言定义：pattern 命中任意一个即通过。
 * @type {{id:string, desc:string, scope:"corpus"|"skill", patterns:RegExp[]}[]}
 */
const assertions = [
  { id: "stage0", desc: "阶段零存在且最先执行", scope: "skill", patterns: [/0 意图与开关/, /工具开关/, /阶段零必须最先执行/] },
  { id: "stage1to6", desc: "阶段一至六流程完整", scope: "skill", patterns: [/1 技术栈确认/, /2 深度检索/, /3 范围确认/, /4 生成规范/, /5 自检交付/, /6 Skills 推荐/] },
  { id: "no-skip", desc: "禁止跳过阶段", scope: "skill", patterns: [/七阶段顺序不可跳过/, /出口条件/] },
  { id: "intent4", desc: "四类任务意图可询问", scope: "corpus", patterns: [/新生成项目规范/, /优化已有项目规范/, /集成本地技能/, /仅推荐 Skills/] },
  { id: "ask3", desc: "每次询问至少 3 个选项", scope: "corpus", patterns: [/≥3 选项/, /至少 3 个选项/, /选项 ≥3/] },
  { id: "no-fixed", desc: "禁止硬编码固定技术选项", scope: "corpus", patterns: [/禁止硬编码固定技术选项/, /禁止使用硬编码/] },
  { id: "project-type", desc: "全栈/仅前端/仅后端三类型", scope: "corpus", patterns: [/全栈/, /仅前端/, /仅后端/] },
  { id: "precheck", desc: "项目预检覆盖主要配置文件", scope: "corpus", patterns: [/package\.json/, /go\.mod/, /pom\.xml/, /prisma\/schema\.prisma/] },
  { id: "multi-project", desc: "多项目目录按边界分别识别和生成规范", scope: "corpus", patterns: [/一个目录含多个项目/, /逐个为目录中的项目/, /不可将多个项目的依赖合并/, /各独立项目根目录/] },
  { id: "opensource", desc: "开源项目推荐至少 5 个并覆盖 Gitee", scope: "corpus", patterns: [/至少推荐 5 个/, /Gitee/] },
  { id: "context7", desc: "Context7 两步协议已接入", scope: "skill", patterns: [/resolve-library-id/, /query-docs/] },
  { id: "codegraph", desc: "CodeGraph 查询序列已接入", scope: "skill", patterns: [/codegraph_status/, /codegraph_explore/, /codegraph_node/] },
  { id: "codegraph-cli", desc: "CodeGraph CLI 兜底与索引策略", scope: "corpus", patterns: [/scripts\/codegraph\.mjs ensure/, /codegraph init/, /codegraph sync/] },
  { id: "fallback", desc: "检索失败有三级降级", scope: "skill", patterns: [/Context7 → WebSearch → WebFetch/, /WebSearch → WebFetch/, /降级/] },
  { id: "dynamic-basis", desc: "生成不依赖外部固定指南", scope: "corpus", patterns: [/不依赖外部固定指南/, /项目事实/, /五大支柱/] },
  { id: "order", desc: "14 个规范文件生成顺序保留", scope: "corpus", patterns: [/architecture\.md/, /api-contract\.md/, /backend\.md/, /database\.md/, /frontend-ui\.md/, /data-permission\.md/, /cache-consistency\.md/, /dev-tooling\.md/, /testing\.md/, /security\.md/, /devops\.md/, /workflow\.md/, /documentation\.md/] },
  { id: "framework-components", desc: "框架内置组件优先规则保留", scope: "corpus", patterns: [/组件使用要求/, /框架内置能力优先使用/, /ORM 内置功能优先使用/, /测试框架内置工具优先使用/, /禁止替代方案/] },
  { id: "checklist", desc: "自检清单覆盖核心域", scope: "corpus", patterns: [/AI 行为规范检查/, /架构设计检查/, /数据库与缓存检查/, /交付完整性检查/] },
  { id: "delivery9", desc: "交付内容包含 9 项要素", scope: "corpus", patterns: [/文件清单/, /技术栈摘要/, /最佳实践来源/, /检查清单报告/, /Skills 推荐预告/] },
  { id: "skills-sh", desc: "Skills 仅来自 skills.sh", scope: "corpus", patterns: [/https:\/\/www\.skills\.sh\//, /禁止推荐非 skills\.sh/] },
  { id: "readme", desc: "README 更新与中文镜像降级路径", scope: "corpus", patterns: [/README\.md/, /README\.zh-CN\.md/, /RECOMMENDED-SKILLS\.md/] },
  { id: "chinese", desc: "中文输出与术语保留规则", scope: "corpus", patterns: [/一律中文/, /术语、代码标识符、命令、配置保留原语言/] },
  { id: "source-label", desc: "来源标注与待补充占位", scope: "corpus", patterns: [/来源标注/, /待补充/, /待定/] },
  { id: "no-over-abstraction", desc: "禁止无需求支撑的抽象", scope: "corpus", patterns: [/禁止过度抽象/, /转发型抽象/] },
  { id: "common-module", desc: "公共模块抽离规则可判定可验收", scope: "corpus", patterns: [/原则六：公共模块抽离/, /三同三异/, /≥2 处/, /禁止抽离/, /调用点只传配置/] },
  { id: "security-devops", desc: "安全与部署运维规则域按本栈填充", scope: "corpus", patterns: [/security\.md/, /devops\.md/, /认证与授权/, /环境与配置/, /字段权限/, /禁止沿用示例中的技术专名/] },
  { id: "tool-switch", desc: "工具开关由用户控制并保留原流程", scope: "corpus", patterns: [/工具开关/, /4 个独立开关/, /原流程/, /禁止擅自调用/] },
  { id: "fresh-read", desc: "工具调用不豁免本次读取", scope: "corpus", patterns: [/禁止仅凭记忆、历史上下文、摘要、此前读取记录/, /不能豁免本条/, /禁止复用上一轮的工具输出或摘要缓存/] },
  { id: "self-contained", desc: "规范自包含且引用需用户同意", scope: "corpus", patterns: [/自包含与引用审批/, /禁止用「参见\/详见某文件、某链接」替代应有正文/, /用户未同意不得写入/, /外部 URL 不受此限/] },
  { id: "workflow-mode", desc: "工作流模式可选且安装前提示依赖与 token 成本", scope: "corpus", patterns: [/AI 开发工作流/, /默认关闭/, /安装 token 成本/, /未确认前禁止执行任何安装命令/, /新项目路径/, /老项目路径/, /ai-dev-workflow/, /禁止 OpenSpec apply/] },
  { id: "agent-detect", desc: "开发工具探测不写死且由用户选择", scope: "corpus", patterns: [/detect-agents\.mjs/, /当前会话/, /技能落点/, /宿主 \/ IDE 候选名单/] },
  { id: "workflow-guide", desc: "工作流教程必产且内容完整", scope: "corpus", patterns: [/docs\/ai-workflow-guide\.md/, /故障排查/, /跨工具验收/] },
  { id: "workflow-basis", desc: "规范以工作流为基础生成并可回改", scope: "corpus", patterns: [/规范以工作流为基础/, /规范必须以该工作流为基础/, /所选模式.*为骨架生成/, /回改受影响/, /任务分级.*OpenSpec/] },
  { id: "project-type-branches", desc: "前端/后端/全栈规则域与模板按适用层裁剪", scope: "corpus", patterns: [/仅前端不生成后端、数据库、数据权限和缓存规则/, /仅后端不生成前端 UI 规则/, /AGENTS\.template\.md` 是全栈超集/, /链接目标真实存在/, /仅前端的顶层规则/] },
  { id: "workflow-mode-branches", desc: "多项目和完整/轻量/自定义工作流分别配置", scope: "corpus", patterns: [/多项目时，先确认是否所有目标项目共用同一模式/, /完整模式的共同门禁/, /轻量模式只生成共同资产/, /自定义模式按用户确认的阶段生成资产/, /不调用 OpenSpec、Superpowers、Ponytail 或 gstack/] },
  { id: "workflow-tool-switches", desc: "工作流尊重 Context7 / CodeGraph 的阶段零开关", scope: "corpus", patterns: [/阶段零 CodeGraph 开关开启时/, /关闭时用 Glob \/ 定向 Read/, /Context7 开关开启时/, /关闭时按 `03-research\.md` 使用 WebSearch \/ WebFetch 降级/] },
  { id: "project-scope-vs-type", desc: "多项目范围与单项目全栈类型分开判定", scope: "corpus", patterns: [/「逐个 \/ 全部」是\*\*项目范围\*\*/, /「全栈 \/ 仅前端 \/ 仅后端」是\*\*单个项目类型\*\*/, /不等同于单个全栈项目/] },
];

const results = [];
for (const assertion of assertions) {
  const haystack = assertion.scope === "skill" ? files["SKILL.md"] : corpus;
  const hit = assertion.patterns.every((pattern) => pattern.test(haystack));
  results.push({ id: assertion.id, desc: assertion.desc, ok: hit, detail: hit ? "" : "未检索到必需表述" });
}

// B. 内部链接检查
const skill = files["SKILL.md"];
const linkPattern = /\[[^\]]+\]\((references\/[^)]+|integrations\/[^)]+)\)/g;
let match;
const brokenLinks = [];
while ((match = linkPattern.exec(skill)) !== null) {
  if (!existsSync(path.join(ROOT, match[1]))) brokenLinks.push(match[1]);
}
results.push({
  id: "links",
  desc: "SKILL.md 内部链接可达",
  ok: brokenLinks.length === 0,
  detail: brokenLinks.length ? `失效链接：${brokenLinks.join(", ")}` : "",
});

// B. MCP 配置检查
let mcpOk = false;
let mcpDetail = "integrations/mcp.json 缺失或非法";
try {
  const config = JSON.parse(read("integrations/mcp.json"));
  const servers = config.mcpServers ?? {};
  mcpOk = Boolean(servers.context7 && servers.codegraph);
  mcpDetail = mcpOk ? "" : "缺少 context7 或 codegraph 条目";
} catch (error) {
  mcpDetail = `解析失败：${error.message}`;
}
results.push({ id: "mcp-config", desc: "MCP 配置含 context7 与 codegraph", ok: mcpOk, detail: mcpDetail });

// C. 脚本语法检查
for (const rel of ["scripts/codegraph.mjs", "scripts/detect-agents.mjs", "scripts/verify-parity.mjs"]) {
  const check = spawnSync(process.execPath, ["--check", path.join(ROOT, rel)], { encoding: "utf8" });
  results.push({
    id: `syntax:${path.basename(rel)}`,
    desc: `${rel} 语法正确`,
    ok: check.status === 0,
    detail: check.status === 0 ? "" : (check.stderr ?? "").split("\n")[0],
  });
}

// C. CodeGraph 封装的降级行为（--help 必须成功，且无 codegraph 时给出提示而非崩溃）
const help = spawnSync(process.execPath, [path.join(ROOT, "scripts/codegraph.mjs"), "help"], { encoding: "utf8" });
results.push({
  id: "codegraph-help",
  desc: "codegraph.mjs help 可执行",
  ok: help.status === 0 && /CodeGraph 封装/.test(help.stdout ?? ""),
  detail: help.status === 0 ? "" : (help.stderr ?? "").split("\n")[0],
});

const missingBinary = spawnSync(process.execPath, [path.join(ROOT, "scripts/codegraph.mjs"), "status", "--project", "/tmp"], {
  encoding: "utf8",
  env: { ...process.env, PATH: "/nonexistent" },
});
results.push({
  id: "codegraph-degrade",
  desc: "缺少 codegraph 时返回降级提示",
  ok: missingBinary.status === 3 && /Glob \+ 定向 Read|未找到 codegraph/.test(missingBinary.stdout ?? ""),
  detail: `exit=${missingBinary.status}`,
});

// C. 工具探测脚本可执行且输出合法
const detect = spawnSync(process.execPath, [path.join(ROOT, "scripts/detect-agents.mjs"), "--project", ROOT, "--json"], {
  encoding: "utf8",
});
let detectOk = false;
let detectDetail = `exit=${detect.status}`;
try {
  const payload = JSON.parse(detect.stdout ?? "");
  detectOk = detect.status === 0 && Array.isArray(payload.results) && payload.results.length >= 8;
  detectDetail = detectOk ? "" : "结果条数不足或结构非法";
} catch (error) {
  detectDetail = `JSON 解析失败：${error.message}`;
}
results.push({ id: "detect-agents", desc: "开发工具探测输出合法 JSON", ok: detectOk, detail: detectDetail });

const failed = results.filter((item) => !item.ok);
const payload = { total: results.length, failed: failed.length, results };
if (process.argv.includes("--json")) {
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
} else {
  const lines = ["# 功能等价性验证", ""];
  lines.push("| 检查项 | 结果 | 说明 |");
  lines.push("|---|---|---|");
  for (const item of results) {
    lines.push(`| ${item.id}｜${item.desc} | ${item.ok ? "通过" : "失败"} | ${item.detail || "-"} |`);
  }
  lines.push("");
  lines.push(`合计 ${results.length} 项，失败 ${failed.length} 项。`);
  process.stdout.write(`${lines.join("\n")}\n`);
}

process.exit(failed.length ? 1 : 0);
