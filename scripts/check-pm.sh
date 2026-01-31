#!/bin/bash
echo "DEBUG: check-pm.sh started with $1"

# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  🚫 PACKAGE MANAGER POLICE - AGRI-SERVE SECURITY CHECKPOINT 🚫              ║
# ║  This script blocks npm/yarn from running ANY scripts                        ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

# Color definitions
RED=$'\033[38;5;196m'
ORANGE=$'\033[38;5;202m'
PURPLE=$'\033[38;5;129m'
BLUE=$'\033[38;5;39m'
CYAN=$'\033[38;5;51m'
YELLOW=$'\033[38;5;226m'
GREEN=$'\033[38;5;48m'
MAGENTA=$'\033[38;5;201m'
WHITE=$'\033[38;5;255m'
GRAY=$'\033[38;5;245m'
RESET=$'\033[0m'
BOLD=$'\033[1m'
BLINK=$'\033[5m'

# Get which script is being run
SCRIPT_NAME="${1:-dev}"

# Check if this is an install command
if [[ "$1" == "install" ]]; then
  # Check if running via npm
  if [[ "$npm_config_user_agent" =~ ^npm/ ]]; then
    echo ""
    echo "${ORANGE}╔══════════════════════════════════════════════════════════════════════════════╗${RESET}"
    echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}  ${RED}███╗   ██╗██████╗ ███╗   ███╗    ${WHITE}██████╗  ██████╗ ██╗     ██╗ ██████╗███████╗${RESET}${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}  ${RED}████╗  ██║██╔══██╗████╗ ████║    ${WHITE}██╔══██╗██╔═══██╗██║     ██║██╔════╝██╔════╝${RESET}${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}  ${RED}██╔██╗ ██║██████╔╝██╔████╔██║    ${WHITE}██████╔╝██║   ██║██║     ██║██║     █████╗${RESET}  ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}  ${RED}██║╚██╗██║██╔═══╝ ██║╚██╔╝██║    ${WHITE}██╔═══╝ ██║   ██║██║     ██║██║     ██╔══╝${RESET}  ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}  ${RED}██║ ╚████║██║     ██║ ╚═╝ ██║    ${WHITE}██║     ╚██████╔╝███████╗██║╚██████╗███████╗${RESET}${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}  ${RED}╚═╝  ╚═══╝╚═╝     ╚═╝     ╚═╝    ${WHITE}╚═╝      ╚═════╝ ╚══════╝╚═╝ ╚═════╝╚══════╝${RESET}${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
    echo "${ORANGE}╠══════════════════════════════════════════════════════════════════════════════╣${RESET}"
    echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}   ${YELLOW}🚨 RUKO ZARA! SABAR KARO! npm se install karne ki koshish? 🚨${RESET}         ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}   ${CYAN}Arre bhai, npm se install kar raha hai tu?${RESET}                            ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}   ${CYAN}Kitni baar bolunga - NPM BANNED HAI IDHAR!${RESET}                             ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}   ${MAGENTA}Tera npm dekh ke mujhe gussa aa raha hai... 😤${RESET}                        ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}   ${MAGENTA}README padha nahi? Ya padh ke bhi samjha nahi?${RESET}                        ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
    echo "${ORANGE}╠══════════════════════════════════════════════════════════════════════════════╣${RESET}"
    echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}   ${GREEN}┌──────────────────────────────────────────────────────────────┐${RESET}       ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}   ${GREEN}│${RESET}  ${YELLOW}🎯 SAHI TARIKA (The Right Way):${RESET}                              ${GREEN}│${RESET}       ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}   ${GREEN}│${RESET}                                                              ${GREEN}│${RESET}       ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}   ${GREEN}│${RESET}     ${CYAN}$ bun install${RESET}         ${GRAY}← Super fast, use this!${RESET}          ${GREEN}│${RESET}       ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}   ${GREEN}│${RESET}                                                              ${GREEN}│${RESET}       ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}   ${GREEN}└──────────────────────────────────────────────────────────────┘${RESET}       ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}            ${PURPLE}« BUN IS THE FUTURE - BLAZING FAST! »${RESET}                       ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
    echo "${ORANGE}╚══════════════════════════════════════════════════════════════════════════════╝${RESET}"
    echo ""
    exit 1
  fi

  # Check if running via yarn
  if [[ "$npm_config_user_agent" =~ ^yarn/ ]]; then
    echo ""
    echo "${RED}╔══════════════════════════════════════════════════════════════════════════════╗${RESET}"
    echo "${RED}║${RESET}                                                                              ${RED}║${RESET}"
    echo "${RED}║${RESET}  ${CYAN}██╗   ██╗ █████╗ ██████╗ ███╗   ██╗    ${WHITE}🧶 TANGLED MESS 🧶${RESET}               ${RED}║${RESET}"
    echo "${RED}║${RESET}  ${CYAN}╚██╗ ██╔╝██╔══██╗██╔══██╗████╗  ██║${RESET}                                    ${RED}║${RESET}"
    echo "${RED}║${RESET}  ${CYAN} ╚████╔╝ ███████║██████╔╝██╔██╗ ██║    ${GRAY}Yarn se install?${RESET}                 ${RED}║${RESET}"
    echo "${RED}║${RESET}  ${CYAN}  ╚██╔╝  ██╔══██║██╔══██╗██║╚██╗██║    ${GRAY}Bhai, 2024 aa gaya!${RESET}               ${RED}║${RESET}"
    echo "${RED}║${RESET}  ${CYAN}   ██║   ██║  ██║██║  ██║██║ ╚████║${RESET}                                    ${RED}║${RESET}"
    echo "${RED}║${RESET}  ${CYAN}   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝${RESET}                                    ${RED}║${RESET}"
    echo "${RED}║${RESET}                                                                              ${RED}║${RESET}"
    echo "${RED}╠══════════════════════════════════════════════════════════════════════════════╣${RESET}"
    echo "${RED}║${RESET}                                                                              ${RED}║${RESET}"
    echo "${RED}║${RESET}   ${YELLOW}🐑 BHED CHAAL CHAL RAHA HAI TU! Sab yarn use karte hain isliye? 🐑${RESET}    ${RED}║${RESET}"
    echo "${RED}║${RESET}                                                                              ${RED}║${RESET}"
    echo "${RED}║${RESET}   ${CYAN}Yarn ball se sweater bana, code nahi!${RESET}                                 ${RED}║${RESET}"
    echo "${RED}║${RESET}   ${CYAN}Is repo mein yarn allowed nahi hai, samjhe?${RESET}                           ${RED}║${RESET}"
    echo "${RED}║${RESET}                                                                              ${RED}║${RESET}"
    echo "${RED}║${RESET}   ${MAGENTA}Teri mummy ko bulaaun? Woh bhi bun use karti hai! 👩${RESET}                 ${RED}║${RESET}"
    echo "${RED}║${RESET}                                                                              ${RED}║${RESET}"
    echo "${RED}╠══════════════════════════════════════════════════════════════════════════════╣${RESET}"
    echo "${RED}║${RESET}                                                                              ${RED}║${RESET}"
    echo "${RED}║${RESET}   ${GREEN}┌──────────────────────────────────────────────────────────────┐${RESET}       ${RED}║${RESET}"
    echo "${RED}║${RESET}   ${GREEN}│${RESET}  ${YELLOW}✨ SUDHAR JA BETA (Reform Yourself):${RESET}                         ${GREEN}│${RESET}       ${RED}║${RESET}"
    echo "${RED}║${RESET}   ${GREEN}│${RESET}                                                              ${GREEN}│${RESET}       ${RED}║${RESET}"
    echo "${RED}║${RESET}   ${GREEN}│${RESET}     ${CYAN}$ bun install${RESET}         ${GRAY}← Blazing fast, use bun!${RESET}          ${GREEN}│${RESET}       ${RED}║${RESET}"
    echo "${RED}║${RESET}   ${GREEN}│${RESET}                                                              ${GREEN}│${RESET}       ${RED}║${RESET}"
    echo "${RED}║${RESET}   ${GREEN}└──────────────────────────────────────────────────────────────┘${RESET}       ${RED}║${RESET}"
    echo "${RED}║${RESET}                                                                              ${RED}║${RESET}"
    echo "${RED}║${RESET}              ${PURPLE}« YARN CHHOD, BUN PAKAD - LIFE SET! »${RESET}                       ${RED}║${RESET}"
    echo "${RED}║${RESET}                                                                              ${RED}║${RESET}"
    echo "${RED}╚══════════════════════════════════════════════════════════════════════════════╝${RESET}"
    echo ""
    exit 1
  fi

  # Check if running via pnpm (not allowed anymore)
  if [[ "$npm_config_user_agent" =~ ^pnpm/ ]]; then
    echo ""
    echo "${ORANGE}╔══════════════════════════════════════════════════════════════════════════════╗${RESET}"
    echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}  ${CYAN}██████╗ ██████╗ ███╗   ██╗███╗   ███╗${RESET}                                  ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}  ${CYAN}██╔══██╗██╔══██╗████╗  ██║████╗ ████║${RESET}                                  ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}  ${CYAN}██████╔╝██████╔╝██╔██╗ ██║██╔████╔██║${RESET}                                  ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}  ${CYAN}██╔═══╝ ██╔══██╗██║╚██╗██║██║╚██╔╝██║${RESET}                                  ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}  ${CYAN}██║     ██║  ██║██║ ╚████║██║ ╚═╝ ██║${RESET}                                  ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}  ${CYAN}╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝     ╚═╝${RESET}                                  ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
    echo "${ORANGE}╠══════════════════════════════════════════════════════════════════════════════╣${RESET}"
    echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}   ${YELLOW}🚨 We have migrated to BUN! Pnpm is no longer supported. 🚨${RESET}             ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}   ${CYAN}Arre bhai, abhi bhi pnpm use kar raha hai?${RESET}                            ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}   ${CYAN}Project bun pe migrate ho gaya hai!${RESET}                                    ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}   ${MAGENTA}Bun is 10x faster than pnpm... samajh mein aaya? 🚀${RESET}                    ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
    echo "${ORANGE}╠══════════════════════════════════════════════════════════════════════════════╣${RESET}"
    echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}   ${GREEN}┌──────────────────────────────────────────────────────────────┐${RESET}       ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}   ${GREEN}│${RESET}  ${YELLOW}🎯 SAHI TARIKA (The Right Way):${RESET}                              ${GREEN}│${RESET}       ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}   ${GREEN}│${RESET}                                                              ${GREEN}│${RESET}       ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}   ${GREEN}│${RESET}     ${CYAN}$ bun install${RESET}         ${GRAY}← Super fast, use this!${RESET}          ${GREEN}│${RESET}       ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}   ${GREEN}│${RESET}                                                              ${GREEN}│${RESET}       ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}   ${GREEN}└──────────────────────────────────────────────────────────────┘${RESET}       ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}            ${PURPLE}« MIGRATE TO BUN - EXPERIENCE THE SPEED! »${RESET}                   ${ORANGE}║${RESET}"
    echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
    echo "${ORANGE}╚══════════════════════════════════════════════════════════════════════════════╝${RESET}"
    echo ""
    exit 1
  fi

  # All good for install - bun, deno, etc. are allowed
  exit 0
fi

# Check if running via npm (for run commands)
if [[ "$npm_config_user_agent" =~ ^npm/ ]]; then
  echo ""
  echo "${ORANGE}╔══════════════════════════════════════════════════════════════════════════════╗${RESET}"
  echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}  ${RED}███╗   ██╗██████╗ ███╗   ███╗    ${WHITE}██████╗  ██████╗ ██╗     ██╗ ██████╗███████╗${RESET}${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}  ${RED}████╗  ██║██╔══██╗████╗ ████║    ${WHITE}██╔══██╗██╔═══██╗██║     ██║██╔════╝██╔════╝${RESET}${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}  ${RED}██╔██╗ ██║██████╔╝██╔████╔██║    ${WHITE}██████╔╝██║   ██║██║     ██║██║     █████╗${RESET}  ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}  ${RED}██║╚██╗██║██╔═══╝ ██║╚██╔╝██║    ${WHITE}██╔═══╝ ██║   ██║██║     ██║██║     ██╔══╝${RESET}  ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}  ${RED}██║ ╚████║██║     ██║ ╚═╝ ██║    ${WHITE}██║     ╚██████╔╝███████╗██║╚██████╗███████╗${RESET}${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}  ${RED}╚═╝  ╚═══╝╚═╝     ╚═╝     ╚═╝    ${WHITE}╚═╝      ╚═════╝ ╚══════╝╚═╝ ╚═════╝╚══════╝${RESET}${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
  echo "${ORANGE}╠══════════════════════════════════════════════════════════════════════════════╣${RESET}"
  echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}   ${YELLOW}🚨 RUKO ZARA! SABAR KARO! npm se \"${SCRIPT_NAME}\" chalane ki koshish? 🚨${RESET}        ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}   ${CYAN}Arre bhai, npm se script run kar raha hai tu?${RESET}                          ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}   ${CYAN}Kitni baar bolunga - NPM BANNED HAI IDHAR!${RESET}                             ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}   ${MAGENTA}Tera npm dekh ke mujhe gussa aa raha hai... 😤${RESET}                        ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}   ${MAGENTA}README padha nahi? Ya padh ke bhi samjha nahi?${RESET}                        ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
  echo "${ORANGE}╠══════════════════════════════════════════════════════════════════════════════╣${RESET}"
  echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}   ${GREEN}┌──────────────────────────────────────────────────────────────┐${RESET}       ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}   ${GREEN}│${RESET}  ${YELLOW}🎯 SAHI TARIKA (The Right Way):${RESET}                              ${GREEN}│${RESET}       ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}   ${GREEN}│${RESET}                                                              ${GREEN}│${RESET}       ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}   ${GREEN}│${RESET}     ${CYAN}$ bun run ${SCRIPT_NAME}${RESET}      ${GRAY}← Super fast, use this!${RESET}          ${GREEN}│${RESET}       ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}   ${GREEN}│${RESET}                                                              ${GREEN}│${RESET}       ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}   ${GREEN}└──────────────────────────────────────────────────────────────┘${RESET}       ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}            ${PURPLE}« BUN IS THE FUTURE - BLAZING FAST! »${RESET}                       ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
  echo "${ORANGE}╚══════════════════════════════════════════════════════════════════════════════╝${RESET}"
  echo ""
  exit 1
fi

# Check if running via yarn
if [[ "$npm_config_user_agent" =~ ^yarn/ ]]; then
  echo ""
  echo "${RED}╔══════════════════════════════════════════════════════════════════════════════╗${RESET}"
  echo "${RED}║${RESET}                                                                              ${RED}║${RESET}"
  echo "${RED}║${RESET}  ${CYAN}██╗   ██╗ █████╗ ██████╗ ███╗   ██╗    ${WHITE}🧶 TANGLED MESS 🧶${RESET}               ${RED}║${RESET}"
  echo "${RED}║${RESET}  ${CYAN}╚██╗ ██╔╝██╔══██╗██╔══██╗████╗  ██║${RESET}                                    ${RED}║${RESET}"
  echo "${RED}║${RESET}  ${CYAN} ╚████╔╝ ███████║██████╔╝██╔██╗ ██║    ${GRAY}Yarn se \"${SCRIPT_NAME}\" run?${RESET}            ${RED}║${RESET}"
  echo "${RED}║${RESET}  ${CYAN}  ╚██╔╝  ██╔══██║██╔══██╗██║╚██╗██║    ${GRAY}Bhai, 2024 aa gaya!${RESET}               ${RED}║${RESET}"
  echo "${RED}║${RESET}  ${CYAN}   ██║   ██║  ██║██║  ██║██║ ╚████║${RESET}                                    ${RED}║${RESET}"
  echo "${RED}║${RESET}  ${CYAN}   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝${RESET}                                    ${RED}║${RESET}"
  echo "${RED}║${RESET}                                                                              ${RED}║${RESET}"
  echo "${RED}╠══════════════════════════════════════════════════════════════════════════════╣${RESET}"
  echo "${RED}║${RESET}                                                                              ${RED}║${RESET}"
  echo "${RED}║${RESET}   ${YELLOW}🐑 BHED CHAAL CHAL RAHA HAI TU! Sab yarn use karte hain isliye? 🐑${RESET}    ${RED}║${RESET}"
  echo "${RED}║${RESET}                                                                              ${RED}║${RESET}"
  echo "${RED}║${RESET}   ${CYAN}Yarn ball se sweater bana, code nahi!${RESET}                                 ${RED}║${RESET}"
  echo "${RED}║${RESET}   ${CYAN}Is repo mein yarn allowed nahi hai, samjhe?${RESET}                           ${RED}║${RESET}"
  echo "${RED}║${RESET}                                                                              ${RED}║${RESET}"
  echo "${RED}║${RESET}   ${MAGENTA}Teri mummy ko bulaaun? Woh bhi bun use karti hai! 👩${RESET}                 ${RED}║${RESET}"
  echo "${RED}║${RESET}                                                                              ${RED}║${RESET}"
  echo "${RED}╠══════════════════════════════════════════════════════════════════════════════╣${RESET}"
  echo "${RED}║${RESET}                                                                              ${RED}║${RESET}"
  echo "${RED}║${RESET}   ${GREEN}┌──────────────────────────────────────────────────────────────┐${RESET}       ${RED}║${RESET}"
  echo "${RED}║${RESET}   ${GREEN}│${RESET}  ${YELLOW}✨ SUDHAR JA BETA (Reform Yourself):${RESET}                         ${GREEN}│${RESET}       ${RED}║${RESET}"
  echo "${RED}║${RESET}   ${GREEN}│${RESET}                                                              ${GREEN}│${RESET}       ${RED}║${RESET}"
  echo "${RED}║${RESET}   ${GREEN}│${RESET}     ${CYAN}$ bun run ${SCRIPT_NAME}${RESET}      ${GRAY}← Blazing fast, use bun!${RESET}          ${GREEN}│${RESET}       ${RED}║${RESET}"
  echo "${RED}║${RESET}   ${GREEN}│${RESET}                                                              ${GREEN}│${RESET}       ${RED}║${RESET}"
  echo "${RED}║${RESET}   ${GREEN}└──────────────────────────────────────────────────────────────┘${RESET}       ${RED}║${RESET}"
  echo "${RED}║${RESET}                                                                              ${RED}║${RESET}"
  echo "${RED}║${RESET}              ${PURPLE}« YARN CHHOD, BUN PAKAD - LIFE SET! »${RESET}                       ${RED}║${RESET}"
  echo "${RED}║${RESET}                                                                              ${RED}║${RESET}"
  echo "${RED}╚══════════════════════════════════════════════════════════════════════════════╝${RESET}"
  echo ""
  exit 1
fi

# Check if running via pnpm (not allowed anymore)
if [[ "$npm_config_user_agent" =~ ^pnpm/ ]]; then
  echo ""
  echo "${ORANGE}╔══════════════════════════════════════════════════════════════════════════════╗${RESET}"
  echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}  ${CYAN}██████╗ ██████╗ ███╗   ██╗███╗   ███╗${RESET}                                  ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}  ${CYAN}██╔══██╗██╔══██╗████╗  ██║████╗ ████║${RESET}                                  ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}  ${CYAN}██████╔╝██████╔╝██╔██╗ ██║██╔████╔██║${RESET}                                  ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}  ${CYAN}██╔═══╝ ██╔══██╗██║╚██╗██║██║╚██╔╝██║${RESET}                                  ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}  ${CYAN}██║     ██║  ██║██║ ╚████║██║ ╚═╝ ██║${RESET}                                  ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}  ${CYAN}╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝     ╚═╝${RESET}                                  ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
  echo "${ORANGE}╠══════════════════════════════════════════════════════════════════════════════╣${RESET}"
  echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}   ${YELLOW}🚨 We have migrated to BUN! Pnpm is no longer supported. 🚨${RESET}             ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}   ${CYAN}Arre bhai, abhi bhi pnpm use kar raha hai?${RESET}                            ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}   ${CYAN}Project bun pe migrate ho gaya hai!${RESET}                                    ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}   ${MAGENTA}Bun is 10x faster than pnpm... samajh mein aaya? 🚀${RESET}                    ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
  echo "${ORANGE}╠══════════════════════════════════════════════════════════════════════════════╣${RESET}"
  echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}   ${GREEN}┌──────────────────────────────────────────────────────────────┐${RESET}       ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}   ${GREEN}│${RESET}  ${YELLOW}🎯 SAHI TARIKA (The Right Way):${RESET}                              ${GREEN}│${RESET}       ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}   ${GREEN}│${RESET}                                                              ${GREEN}│${RESET}       ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}   ${GREEN}│${RESET}     ${CYAN}$ bun run ${SCRIPT_NAME}${RESET}      ${GRAY}← Super fast, use this!${RESET}          ${GREEN}│${RESET}       ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}   ${GREEN}│${RESET}                                                              ${GREEN}│${RESET}       ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}   ${GREEN}└──────────────────────────────────────────────────────────────┘${RESET}       ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}            ${PURPLE}« MIGRATE TO BUN - EXPERIENCE THE SPEED! »${RESET}                   ${ORANGE}║${RESET}"
  echo "${ORANGE}║${RESET}                                                                              ${ORANGE}║${RESET}"
  echo "${ORANGE}╚══════════════════════════════════════════════════════════════════════════════╝${RESET}"
  echo ""
  exit 1
fi

# All good - bun, deno, etc. are allowed
exit 0
