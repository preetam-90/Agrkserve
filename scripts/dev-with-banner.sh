#!/bin/bash

# Colors
RESET='\033[0m'
BOLD='\033[1m'
DIM='\033[2m'
GREEN='\033[38;5;42m'
BLUE='\033[38;5;39m'
PURPLE='\033[38;5;141m'
CYAN='\033[38;5;51m'
YELLOW='\033[38;5;226m'
ORANGE='\033[38;5;214m'

# Clear screen for clean output
clear

# Beautiful banner
echo -e "${BOLD}${GREEN}"
echo "  ╔═══════════════════════════════════════════════════════════════╗"
echo "  ║                                                               ║"
echo "  ║   ${CYAN}🌾  AgriServe${GREEN} - Agricultural Equipment Management       ║"
echo "  ║                                                               ║"
echo "  ╚═══════════════════════════════════════════════════════════════╝"
echo -e "${RESET}"

echo -e "${DIM}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n"

# Project info
echo -e "\n${BOLD}${PURPLE}⚡ Starting Development Server...${RESET}\n"
echo -e "${BLUE}📦 Package Manager:${RESET} ${BOLD}pnpm${RESET}"
echo -e "${BLUE}🏗️  Framework:${RESET} ${BOLD}Next.js 16.1.3 (Turbopack)${RESET}"
echo -e "${BLUE}⚛️  React:${RESET} ${BOLD}19.2.3${RESET}"
echo -e "${BLUE}🎨 Styling:${RESET} ${BOLD}Tailwind CSS v4${RESET}"

echo -e "\n${DIM}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n"

# Check if port 3001 is already in use
echo -e "${BOLD}${YELLOW}🔍 Checking port 3001...${RESET}"
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠️  Port 3001 is already in use. Stopping existing process...${RESET}"
    # Kill the process using port 3001
    pkill -f "next dev" 2>/dev/null || true
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    sleep 1
    echo -e "${GREEN}✓ Port 3001 is now available${RESET}\n"
else
    echo -e "${GREEN}✓ Port 3001 is available${RESET}\n"
fi

echo -e "${DIM}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n"

# Run the actual dev command (suppress Next.js default output)
pnpm next dev -p 3001 2>&1 | while IFS= read -r line; do
    # Filter out Next.js default startup messages but keep errors
    if [[ ! "$line" =~ ^[[:space:]]*▲ ]] && \
       [[ ! "$line" =~ "Local:" ]] && \
       [[ ! "$line" =~ "Network:" ]] && \
       [[ ! "$line" =~ "Environments:" ]] && \
       [[ ! "$line" =~ "Starting..." ]] && \
       [[ ! "$line" =~ "Ready in" ]] && \
       [[ ! "$line" =~ "Turbopack" ]]; then
        echo -e "${DIM}${line}${RESET}"
    fi
    
    # Detect when server is ready
    if [[ "$line" =~ "Ready in" ]]; then
        echo -e "\n${DIM}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n"
        echo -e "${BOLD}${GREEN}✨ Server Successfully Started!${RESET}\n"
        echo -e "${BOLD}${CYAN}🌐 Local Access:${RESET}"
        echo -e "   ${ORANGE}➜${RESET} ${BOLD}http://localhost:3001${RESET}"
        echo -e "\n${BOLD}${CYAN}📱 Network Access:${RESET}"
        NETWORK_IP=$(hostname -I | awk '{print $1}')
        echo -e "   ${ORANGE}➜${RESET} ${BOLD}http://${NETWORK_IP}:3001${RESET}"
        echo -e "\n${BOLD}${YELLOW}💡 Quick Commands:${RESET}"
        echo -e "   ${GREEN}•${RESET} Press ${BOLD}Ctrl+C${RESET} to stop the server"
        echo -e "   ${GREEN}•${RESET} Run ${BOLD}pnpm build${RESET} to create production build"
        echo -e "   ${GREEN}•${RESET} Run ${BOLD}pnpm lint${RESET} to check code quality"
        echo -e "\n${DIM}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n"
        echo -e "${BOLD}${PURPLE}🚀 Happy Coding!${RESET}\n"
    fi
done
