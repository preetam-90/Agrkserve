#!/usr/bin/env node

// 🚫 NPM BLOCKER - This project ONLY supports pnpm
const packageManager = process.env.npm_config_user_agent;

if (packageManager && packageManager.startsWith('npm')) {
  console.error('\n\x1b[31m╔═══════════════════════════════════════════════════════════════════════════════╗\x1b[0m');
  console.error('\x1b[31m║\x1b[0m                                                                               \x1b[31m║\x1b[0m');
  console.error('\x1b[31m║\x1b[0m   \x1b[38;5;196m🚫 NPM IS BLOCKED ON THIS PROJECT 🚫\x1b[0m                                    \x1b[31m║\x1b[0m');
  console.error('\x1b[31m║\x1b[0m                                                                               \x1b[31m║\x1b[0m');
  console.error('\x1b[31m║\x1b[0m   \x1b[38;5;226mThis project uses \x1b[1mpnpm\x1b[0m\x1b[38;5;226m as the package manager.\x1b[0m                          \x1b[31m║\x1b[0m');
  console.error('\x1b[31m║\x1b[0m   \x1b[38;5;226mPlease install pnpm and use it instead of npm.\x1b[0m                         \x1b[31m║\x1b[0m');
  console.error('\x1b[31m║\x1b[0m                                                                               \x1b[31m║\x1b[0m');
  console.error('\x1b[31m║\x1b[0m   \x1b[38;5;51m📦 Install pnpm:\x1b[0m                                                         \x1b[31m║\x1b[0m');
  console.error('\x1b[31m║\x1b[0m      \x1b[38;5;46m$ npm install -g pnpm\x1b[0m                                                 \x1b[31m║\x1b[0m');
  console.error('\x1b[31m║\x1b[0m      \x1b[38;5;46m$ corepack enable\x1b[0m                                                     \x1b[31m║\x1b[0m');
  console.error('\x1b[31m║\x1b[0m                                                                               \x1b[31m║\x1b[0m');
  console.error('\x1b[31m║\x1b[0m   \x1b[38;5;51m🚀 Then run:\x1b[0m                                                              \x1b[31m║\x1b[0m');
  console.error('\x1b[31m║\x1b[0m      \x1b[38;5;46m$ pnpm install\x1b[0m                                                        \x1b[31m║\x1b[0m');
  console.error('\x1b[31m║\x1b[0m      \x1b[38;5;46m$ pnpm dev\x1b[0m                                                            \x1b[31m║\x1b[0m');
  console.error('\x1b[31m║\x1b[0m                                                                               \x1b[31m║\x1b[0m');
  console.error('\x1b[31m╚═══════════════════════════════════════════════════════════════════════════════╝\x1b[0m\n');
  process.exit(1);
}

if (packageManager && packageManager.startsWith('yarn')) {
  console.error('\n\x1b[31m╔═══════════════════════════════════════════════════════════════════════════════╗\x1b[0m');
  console.error('\x1b[31m║\x1b[0m                                                                               \x1b[31m║\x1b[0m');
  console.error('\x1b[31m║\x1b[0m   \x1b[38;5;196m🚫 YARN IS BLOCKED ON THIS PROJECT 🚫\x1b[0m                                   \x1b[31m║\x1b[0m');
  console.error('\x1b[31m║\x1b[0m                                                                               \x1b[31m║\x1b[0m');
  console.error('\x1b[31m║\x1b[0m   \x1b[38;5;226mThis project uses \x1b[1mpnpm\x1b[0m\x1b[38;5;226m only. Please use pnpm instead.\x1b[0m                   \x1b[31m║\x1b[0m');
  console.error('\x1b[31m║\x1b[0m                                                                               \x1b[31m║\x1b[0m');
  console.error('\x1b[31m║\x1b[0m   \x1b[38;5;51m📦 Install pnpm and run:\x1b[0m                                                  \x1b[31m║\x1b[0m');
  console.error('\x1b[31m║\x1b[0m      \x1b[38;5;46m$ pnpm install\x1b[0m                                                        \x1b[31m║\x1b[0m');
  console.error('\x1b[31m║\x1b[0m                                                                               \x1b[31m║\x1b[0m');
  console.error('\x1b[31m╚═══════════════════════════════════════════════════════════════════════════════╝\x1b[0m\n');
  process.exit(1);
}
