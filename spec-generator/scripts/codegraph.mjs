#!/usr/bin/env node
/**
 * CodeGraph 调用封装：为 spec-generator 提供「MCP 优先、CLI 兜底」中 CLI 一侧的稳定入口。
 *
 * 设计目标：
 * 1. 首次使用自动建索引，已索引项目只做增量同步，避免重复全量索引；
 * 2. 输出统一按行裁剪，防止源码片段淹没上下文；
 * 3. 失败时给出明确降级提示与退出码，调用方据此回退到 Glob + 定向 Read。
 *
 * 用法：
 *   node scripts/codegraph.mjs ensure  --project /path/to/repo
 *   node scripts/codegraph.mjs status  --project /path/to/repo
 *   node scripts/codegraph.mjs explore --project /path/to/repo --query "table component usage"
 *   node scripts/codegraph.mjs node    --project /path/to/repo --symbol UserService
 *   node scripts/codegraph.mjs files   --project /path/to/repo
 *
 * 通用参数：--max-files 3 | --max-lines 80 | --timeout 300000 | --json
 */

import { spawnSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import path from "node:path";

const EXIT = {
  OK: 0,
  USAGE: 2,
  NO_BINARY: 3,
  BAD_PROJECT: 4,
  COMMAND_FAILED: 5,
  TIMEOUT: 6,
};

const USAGE = `CodeGraph 封装

命令：
  ensure   确保索引存在（缺失则 init，存在则 sync）
  status   查看索引状态
  explore  按能力查询相关符号与调用路径
  query    按名称检索符号
  node     查看单个符号的源码与上下游
  files    查看项目文件结构

参数：
  --project <path>     目标项目路径（必填）
  --query <text>       explore / query 的查询内容
  --symbol <name>      node 的符号名
  --max-files <n>      explore 最大文件数，默认 3
  --max-lines <n>      输出行数上限，默认 80
  --timeout <ms>       子进程超时，默认 300000
  --json               以 JSON 输出
`;

/**
 * 解析命令行参数为键值对象。
 * @param {string[]} argv process.argv.slice(2)
 * @returns {{command:string, flags:Record<string,string|boolean>}}
 */
function parseArgs(argv) {
  const [command = "", ...rest] = argv;
  const flags = {};
  for (let i = 0; i < rest.length; i += 1) {
    const token = rest[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = rest[i + 1];
    if (next === undefined || next.startsWith("--")) {
      flags[key] = true;
    } else {
      flags[key] = next;
      i += 1;
    }
  }
  return { command, flags };
}

/**
 * 按行裁剪输出，超出上限时保留前 N 行并标注省略行数。
 * @param {string} text 原始输出
 * @param {number} maxLines 允许的最大行数
 * @returns {{text:string,truncated:boolean,totalLines:number}}
 */
function clipByLines(text, maxLines) {
  const lines = text.split("\n");
  if (lines.length <= maxLines) {
    return { text, truncated: false, totalLines: lines.length };
  }
  const kept = lines.slice(0, maxLines).join("\n");
  return {
    text: `${kept}\n...（已省略 ${lines.length - maxLines} 行）`,
    truncated: true,
    totalLines: lines.length,
  };
}

/**
 * 输出结果并按需以 JSON 形式打印。
 * @param {object} payload 结构化结果
 * @param {boolean} asJson 是否 JSON 输出
 */
function emit(payload, asJson) {
  if (asJson) {
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
    return;
  }
  const lines = [];
  lines.push(`[codegraph] ${payload.action} ${payload.ok ? "成功" : "失败"}`);
  if (payload.project) lines.push(`项目：${payload.project}`);
  if (payload.summary) lines.push("", payload.summary);
  if (payload.hint) lines.push("", `提示：${payload.hint}`);
  process.stdout.write(`${lines.join("\n")}\n`);
}

/**
 * 检查 codegraph 可执行文件是否可用。
 * @returns {boolean}
 */
function hasBinary() {
  const result = spawnSync("codegraph", ["--version"], { encoding: "utf8", timeout: 15000 });
  return result.status === 0;
}

/**
 * 执行 codegraph 命令并返回结果；超时与缺失变量分别映射到独立退出码。
 * @param {string[]} args 子命令参数
 * @param {{cwd:string, timeout:number}} options 执行选项
 * @returns {{ok:boolean, code:number, stdout:string, stderr:string}}
 */
function run(args, options) {
  const result = spawnSync("codegraph", args, {
    cwd: options.cwd,
    encoding: "utf8",
    timeout: options.timeout,
    maxBuffer: 8 * 1024 * 1024,
  });
  if (result.error?.code === "ETIMEDOUT") {
    return { ok: false, code: EXIT.TIMEOUT, stdout: "", stderr: "执行超时" };
  }
  if (result.error) {
    return { ok: false, code: EXIT.COMMAND_FAILED, stdout: "", stderr: result.error.message };
  }
  return {
    ok: result.status === 0,
    code: result.status ?? EXIT.COMMAND_FAILED,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

/**
 * 当宿主 CLI 不支持 --path 时回退为「以项目目录为 cwd」的调用方式。
 * @param {string[]} args 首选参数
 * @param {string} project 项目路径
 * @param {number} timeout 超时毫秒
 * @returns {{ok:boolean, code:number, stdout:string, stderr:string}}
 */
function runWithFallback(args, project, timeout) {
  const first = run(args, { cwd: project, timeout });
  if (first.ok) return first;
  const message = `${first.stderr}\n${first.stdout}`;
  if (!/unknown option|unexpected argument|not allowed/i.test(message)) return first;
  const stripped = [];
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--path") {
      i += 1;
      continue;
    }
    stripped.push(args[i]);
  }
  return run(stripped, { cwd: project, timeout });
}

/**
 * 主流程：按子命令执行并统一裁剪输出。
 * @returns {number} 退出码
 */
function main() {
  const { command, flags } = parseArgs(process.argv.slice(2));
  const asJson = flags.json === true;

  if (!command || command === "help") {
    process.stdout.write(USAGE);
    return EXIT.OK;
  }
  if (!["ensure", "status", "explore", "query", "node", "files"].includes(command)) {
    process.stderr.write(`未知命令：${command}\n\n${USAGE}`);
    return EXIT.USAGE;
  }

  const project = flags.project ? path.resolve(String(flags.project)) : "";
  if (!project || !existsSync(project) || !statSync(project).isDirectory()) {
    emit({ action: command, ok: false, hint: "请用 --project 指定存在的项目目录" }, asJson);
    return EXIT.BAD_PROJECT;
  }
  if (!hasBinary()) {
    emit(
      {
        action: command,
        ok: false,
        project,
        hint: "未找到 codegraph 可执行文件。安装：npm i -g @colbymchenry/codegraph；本次请降级为 Glob + 定向 Read",
      },
      asJson,
    );
    return EXIT.NO_BINARY;
  }

  const maxLines = Number(flags["max-lines"] ?? 80);
  const maxFiles = Number(flags["max-files"] ?? 3);
  const timeout = Number(flags.timeout ?? 300000);
  const graphDir = path.join(project, ".codegraph");

  let result;
  let summary = "";
  let action = command;

  if (command === "ensure") {
    action = existsSync(graphDir) ? "sync" : "init";
    result =
      action === "sync"
        ? run(["sync", project], { cwd: project, timeout })
        : run(["init", project], { cwd: project, timeout });
    summary = result.ok
      ? `${action === "init" ? "已建立索引" : "已完成增量同步"}：${project}`
      : `索引${action}失败，请检查 .codegraph 是否可写或运行 codegraph unlock`;
  } else if (command === "status") {
    result = runWithFallback(["status", "--path", project], project, timeout);
  } else if (command === "explore") {
    const query = flags.query ? String(flags.query) : "";
    if (!query) {
      process.stderr.write("explore 需要 --query\n");
      return EXIT.USAGE;
    }
    result = run(["explore", query, "--path", project, "--max-files", String(maxFiles)], {
      cwd: project,
      timeout,
    });
  } else if (command === "query") {
    const query = flags.query ? String(flags.query) : "";
    if (!query) {
      process.stderr.write("query 需要 --query\n");
      return EXIT.USAGE;
    }
    result = runWithFallback(["query", query, "--path", project], project, timeout);
  } else if (command === "node") {
    const symbol = flags.symbol ? String(flags.symbol) : "";
    if (!symbol) {
      process.stderr.write("node 需要 --symbol\n");
      return EXIT.USAGE;
    }
    result = runWithFallback(["node", symbol, "--path", project], project, timeout);
  } else {
    result = runWithFallback(["files", "--path", project], project, timeout);
  }

  if (!result) {
    emit({ action, ok: false, project, hint: "未产生命令结果" }, asJson);
    return EXIT.COMMAND_FAILED;
  }

  const raw = result.ok ? result.stdout : `${result.stderr}\n${result.stdout}`;
  const clipped = clipByLines(raw.trim(), maxLines);
  const hint = result.ok
    ? clipped.truncated
      ? `输出已裁剪到 ${maxLines} 行；需要细节时用 node --symbol 精确取单个符号`
      : "可直接引用；禁止整段粘贴进规范文档"
    : "降级路径：Glob 定位目录 + 定向 Read 单文件（≤200 行）";

  emit(
    {
      action,
      ok: result.ok,
      project,
      lines: clipped.totalLines,
      summary: clipped.text,
      truncated: clipped.truncated,
      hint,
    },
    asJson,
  );

  if (result.ok) return EXIT.OK;
  if (result.code === EXIT.TIMEOUT) return EXIT.TIMEOUT;
  return EXIT.COMMAND_FAILED;
}

process.exit(main());
