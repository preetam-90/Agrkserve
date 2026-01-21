#!/bin/bash

# Colors and Styles
RESET='\033[0m'
BOLD='\033[1m'
DIM='\033[2m'
ITALIC='\033[3m'

# Gradient colors
GREEN1='\033[38;5;46m'
GREEN2='\033[38;5;42m'
GREEN3='\033[38;5;28m'
BLUE='\033[38;5;39m'
PURPLE='\033[38;5;141m'
CYAN='\033[38;5;51m'
YELLOW='\033[38;5;226m'
ORANGE='\033[38;5;214m'
PINK='\033[38;5;213m'
WHITE='\033[38;5;255m'

# Clear screen
clear

# ASCII Art Banner
echo -e "${BOLD}${GREEN1}"
cat << "EOF"
    ___              _ _____                     
   /   \  __ _  _ __(_) ____|  ___  _ __ __   __ ___  
  / /\ / / _` || '__| |\___ | / _ \| '__|\ \ / // _ \ 
 / /_//| (_| || |  | | ___) ||  __/| |    \ V /|  __/ 
/___,'  \__, ||_|  |_||____/  \___||_|     \_/  \___| 
        |___/                                          
EOF
echo -e "${RESET}"

echo -e "${DIM}${ITALIC}  Agricultural Equipment Management Platform${RESET}"
echo -e "${DIM}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n"

# System info with icons
echo -e "${BOLD}${PURPLE}🚀 Development Environment${RESET}"
echo -e "${DIM}┌─────────────────────────────────────────────────────────────────┐${RESET}"
echo -e "${DIM}│${RESET} ${BLUE}📦 Manager:${RESET}    ${BOLD}${WHITE}pnpm v$(pnpm --version)${RESET}"
echo -e "${DIM}│${RESET} ${BLUE}⚡ Runtime:${RESET}    ${BOLD}${WHITE}Node $(node --version)${RESET}"
echo -e "${DIM}│${RESET} ${BLUE}🏗️  Framework:${RESET}  ${BOLD}${WHITE}Next.js 16.1.3${RESET} ${DIM}(with Turbopack)${RESET}"
echo -e "${DIM}│${RESET} ${BLUE}⚛️  Library:${RESET}    ${BOLD}${WHITE}React 19.2.3${RESET}"
echo -e "${DIM}│${RESET} ${BLUE}🎨 Styling:${RESET}    ${BOLD}${WHITE}Tailwind CSS v4${RESET}"
echo -e "${DIM}│${RESET} ${BLUE}🔐 Backend:${RESET}    ${BOLD}${WHITE}Supabase${RESET}"
echo -e "${DIM}└─────────────────────────────────────────────────────────────────┘${RESET}\n"

# Check if port 3001 is already in use
echo -e "${BOLD}${YELLOW}🔍 Checking port 3001...${RESET}"
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠️  Port 3001 is already in use. Stopping existing process...${RESET}"
    # Kill the process using port 3001
    pkill -f "next dev" 2>/dev/null || true
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    sleep 1
    echo -e "${GREEN1}✓ Port 3001 is now available${RESET}\n"
else
    echo -e "${GREEN1}✓ Port 3001 is available${RESET}\n"
fi

# Loading animation
echo -e "${BOLD}${YELLOW}⏳ Initializing...${RESET}"
sleep 0.3

# Start the dev server using pnpm
pnpm next dev -p 3001 2>&1 | while IFS= read -r line; do
    # Filter and beautify output
    if [[ "$line" =~ "Ready in" ]]; then
        READY_TIME=$(echo "$line" | grep -oP '\d+ms|\d+\.?\d*s')
        
        echo -e "\n${DIM}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
        echo -e "${BOLD}${GREEN1}✨ Server is Live! ${RESET}${DIM}(${READY_TIME})${RESET}"
        echo -e "${DIM}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n"
        
        # Network information
        NETWORK_IP=$(hostname -I | awk '{print $1}')
        echo -e "${BOLD}${CYAN}🌐 Access URLs:${RESET}"
        echo -e "${DIM}┌─────────────────────────────────────────────────────────────────┐${RESET}"
        echo -e "${DIM}│${RESET} ${ORANGE}➜${RESET} Local:      ${BOLD}${WHITE}http://localhost:3001${RESET}"
        echo -e "${DIM}│${RESET} ${ORANGE}➜${RESET} Network:    ${BOLD}${WHITE}http://${NETWORK_IP}:3001${RESET}"
        echo -e "${DIM}└─────────────────────────────────────────────────────────────────┘${RESET}\n"
        
        # Quick tips
        echo -e "${BOLD}${PINK}💡 Quick Tips:${RESET}"
        echo -e "  ${GREEN2}•${RESET} ${DIM}Press${RESET} ${BOLD}Ctrl+C${RESET} ${DIM}to stop the development server${RESET}"
        echo -e "  ${GREEN2}•${RESET} ${DIM}Run${RESET} ${BOLD}pnpm build${RESET} ${DIM}for production build${RESET}"
        echo -e "  ${GREEN2}•${RESET} ${DIM}Run${RESET} ${BOLD}pnpm lint${RESET} ${DIM}to check code quality${RESET}"
        echo -e "  ${GREEN2}•${RESET} ${DIM}Run${RESET} ${BOLD}pnpm format${RESET} ${DIM}to format your code${RESET}\n"
        
        echo -e "${DIM}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
        echo -e "${BOLD}${PURPLE}🎯 Ready for development! Happy Coding! 🚀${RESET}"
        echo -e "${DIM}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n"
    elif [[ "$line" =~ "Compiling" ]]; then
        echo -e "${DIM}⚙️  $line${RESET}"
    elif [[ "$line" =~ "GET" ]] || [[ "$line" =~ "POST" ]]; then
        echo -e "${DIM}$line${RESET}"
    elif [[ "$line" =~ "error" ]] || [[ "$line" =~ "Error" ]] || [[ "$line" =~ "ERR" ]]; then
        echo -e "${BOLD}\033[38;5;196m❌ $line${RESET}"
    elif [[ "$line" =~ "warn" ]] || [[ "$line" =~ "warning" ]]; then
        if [[ ! "$line" =~ "middleware" ]]; then
            echo -e "${YELLOW}⚠️  $line${RESET}"
        fi
    elif [[ ! "$line" =~ ^[[:space:]]*▲ ]] && \
         [[ ! "$line" =~ "Local:" ]] && \
         [[ ! "$line" =~ "Network:" ]] && \
         [[ ! "$line" =~ "Environments:" ]] && \
         [[ ! "$line" =~ "Starting..." ]] && \
         [[ ! "$line" =~ "Turbopack" ]]; then
        echo -e "${DIM}$line${RESET}"
    fi
done
