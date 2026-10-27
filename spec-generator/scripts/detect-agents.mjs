#!/usr/bin/env node
/**
 * 探测本机已安装的 AI 开发工具（IDE 与 CLI），供阶段零让用户确认「在哪几个工具里生效」。
 *
 * 探测来源（命中任一即视为已安装）：
 * 1. PATH 中的可执行文件；
 * 2. 系统应用目录中的 .app / 安装包；
 * 3. 用户主目录下的配置目录；
 * 4. 目标项目内的工具专属目录；
 * 5. 当前进程的环境变量（命中即视为「当前正在使用」）。
 *
 * 用法：
 *   node scripts/detect-agents.mjs [--project /path/to/repo] [--json]
 *
 * 退出码：0 探测完成（含未命中任何工具）；2 参数错误。
 */

import { existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";

/**
 * 工具清单：新增工具只需在此追加一条，探测逻辑无需改动。
 * bins 为可执行文件名，dirs 为主目录配置目录，apps 为应用名，
 * projectDirs 为项目级目录，currentEnvKeys 为可用于识别当前会话的明确环境标记，skillsDir 为技能落点说明。
 */
const AGENTS = [
  {
    id: "claude-code",
    name: "Claude Code",
    bins: ["claude"],
    dirs: [".claude"],
    apps: ["Claude Code.app", "Claude.app"],
    projectDirs: [".claude"],
    currentEnvKeys: ["CLAUDECODE", "CLAUDE_CODE_ENTRYPOINT"],
    skillsDir: "~/.claude/skills 或项目 .claude/skills",
  },
  {
    id: "qoder",
    name: "Qoder",
    bins: ["qoder"],
    dirs: [".qoder", ".qoder-cn"],
    apps: ["Qoder.app", "Qoder CN.app"],
    projectDirs: [".qoder"],
    currentEnvKeys: [],
    skillsDir: "项目 .qoder/skills",
  },
  {
    id: "trae-cn",
    name: "TRAE CN",
    bins: ["trae"],
    dirs: [".trae", ".trae-cn"],
    apps: ["Trae CN.app", "Trae.app"],
    projectDirs: [".trae"],
    currentEnvKeys: ["TERM_PRODUCT=TRAE", "ICUBE_APP_ROOT"],
    skillsDir: "项目 .trae/skills",
  },
  {
    id: "zcode",
    name: "ZCode",
    bins: ["zcode"],
    dirs: [".zcode"],
    apps: ["ZCode.app"],
    projectDirs: [".zcode"],
    currentEnvKeys: [],
    skillsDir: "~/.zcode/skills",
  },
  {
    id: "cursor",
    name: "Cursor",
    bins: ["cursor"],
    dirs: [".cursor"],
    apps: ["Cursor.app"],
    projectDirs: [".cursor"],
    currentEnvKeys: ["CURSOR_TRACE_ID"],
    skillsDir: "项目 .cursor/rules 或 .cursor/skills",
  },
  {
    id: "codex",
    name: "Codex CLI",
    bins: ["codex"],
    dirs: [".codex"],
    apps: [],
    projectDirs: [".codex"],
    currentEnvKeys: [],
    skillsDir: "~/.codex/skills",
  },
  {
    id: "gemini-cli",
    name: "Gemini CLI",
    bins: ["gemini"],
    dirs: [".gemini"],
    apps: [],
    projectDirs: [".gemini"],
    currentEnvKeys: [],
    skillsDir: "~/.gemini/skills",
  },
  {
    id: "windsurf",
    name: "Windsurf",
    bins: ["windsurf"],
    dirs: [".windsurf", ".codeium"],
    apps: ["Windsurf.app"],
    projectDirs: [".windsurf"],
    currentEnvKeys: [],
    skillsDir: "项目 .windsurf/rules",
  },
];

/**
 * 在 PATH 中查找可执行文件（不依赖外部命令）。
 * @param {string} bin 可执行文件名
 * @returns {string} 命中时返回绝对路径，否则返回空串
 */
function findOnPath(bin) {
  const dirs = (process.env.PATH ?? "").split(path.delimiter).filter(Boolean);
  const exts = os.platform() === "win32" ? [".exe", ".cmd", ".bat", ""] : [""];
  for (const dir of dirs) {
    for (const ext of exts) {
      const abs = path.join(dir, `${bin}${ext}`);
      if (existsSync(abs)) return abs;
    }
  }
  return "";
}

/**
 * 检查系统应用目录中是否存在指定的应用。
 * @param {string} app 应用名（含 .app）
 * @returns {string} 命中时返回应用路径，否则返回空串
 */
function findApp(app) {
  if (os.platform() !== "darwin") return "";
  const roots = ["/Applications", path.join(os.homedir(), "Applications")];
  for (const root of roots) {
    const abs = path.join(root, app);
    if (existsSync(abs)) return abs;
  }
  return "";
}

/**
 * 扫描当前进程的环境变量，判断是否正运行在某个工具中。
 * 支持两种写法：`KEY` 表示环境变量名完全匹配；`KEY=value` 表示变量名完全匹配且值包含指定文本。
 * @param {string[]} keys 环境变量前缀/完整名称，或 `KEY=value` 强条件
 * @returns {string} 命中的变量名，否则返回空串
 */
function matchEnv(keys) {
  const names = Object.keys(process.env);
  for (const rule of keys) {
    const [key, expected] = rule.split("=");
    const hit = names.find((name) => {
      if (name !== key) return false;
      return expected === undefined ? true : String(process.env[name]).includes(expected);
    });
    if (hit) return expected === undefined ? hit : `${hit}=${process.env[hit]}`;
  }
  return "";
}

/**
 * 探测单个工具的安装信息。
 * @param {object} agent 工具定义
 * @param {string} project 目标项目路径
 * @returns {object} 探测结果
 */
function detect(agent, project) {
  const binPath = agent.bins.map(findOnPath).find(Boolean) ?? "";
  const appPath = agent.apps.map(findApp).find(Boolean) ?? "";
  const homeDir = agent.dirs
    .map((dir) => path.join(os.homedir(), dir))
    .find((abs) => existsSync(abs)) ?? "";
  const projectDir = agent.projectDirs
    .map((dir) => path.join(project, dir))
    .find((abs) => existsSync(abs)) ?? "";
  const envHit = matchEnv(agent.currentEnvKeys ?? []);
  const installed = Boolean(binPath || appPath || homeDir || projectDir);
  return {
    id: agent.id,
    name: agent.name,
    installed,
    current: Boolean(envHit),
    evidence: { binPath, appPath, homeDir, projectDir, envHit },
    skillsDir: agent.skillsDir,
  };
}

/**
 * 解析命令行参数。
 * @param {string[]} argv 不含 node 与脚本路径的参数
 * @returns {{flags: Record<string, string|boolean>}}
 */
function parseArgs(argv) {
  const flags = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      flags[key] = true;
    } else {
      flags[key] = next;
      i += 1;
    }
  }
  return { flags };
}

/**
 * 主流程：探测并输出结果。
 * @returns {number} 进程退出码
 */
function main() {
  const { flags } = parseArgs(process.argv.slice(2));
  const project = path.resolve(typeof flags.project === "string" ? flags.project : process.cwd());

  if (!existsSync(project)) {
    process.stderr.write(`项目路径不存在：${project}\n`);
    return 2;
  }

  const results = AGENTS.map((agent) => detect(agent, project));
  const installed = results.filter((item) => item.installed);
  const current = results.find((item) => item.current) ?? null;

  if (flags.json) {
    const payload = { project, detectedAt: new Date().toISOString(), current: current?.id ?? "", results };
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
    return 0;
  }

  const lines = ["# 本机 AI 开发工具探测", ""];
  lines.push(`项目：${project}`);
  lines.push(`当前会话：${current ? current.name : "未识别（请在下方手工选择）"}`);
  lines.push("");
  lines.push("| 工具 | 已安装 | 当前使用 | 证据 | 技能落点 |");
  lines.push("|---|---|---|---|---|");
  for (const item of results) {
    const evidence = [
      item.evidence.binPath && `CLI ${item.evidence.binPath}`,
      item.evidence.appPath && `应用 ${item.evidence.appPath}`,
      item.evidence.homeDir && `配置 ${item.evidence.homeDir}`,
      item.evidence.projectDir && `项目 ${item.evidence.projectDir}`,
      item.evidence.envHit && `环境变量 ${item.evidence.envHit}`,
    ].filter(Boolean).join("<br/>") || "-";
    lines.push(`| ${item.name} | ${item.installed ? "是" : "否"} | ${item.current ? "是" : "-"} | ${evidence} | ${item.skillsDir} |`);
  }
  lines.push("");
  lines.push(installed.length
    ? `共命中 ${installed.length} 个已安装工具；请让用户确认本次要在哪些工具中生效。`
    : "未命中任何工具；请让用户手工选择目标 IDE，不要假定。");
  process.stdout.write(`${lines.join("\n")}\n`);
  return 0;
}

process.exit(main());
