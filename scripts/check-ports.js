#!/usr/bin/env node

const { execSync } = require('child_process');
const net = require('net');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

// Function to check if a port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    server.once('listening', () => {
      server.close();
      resolve(false);
    });

    server.listen(port);
  });
}

// Function to get process info on a port
function getProcessOnPort(port) {
  try {
    if (process.platform === 'win32') {
      const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
      return output.trim();
    } else {
      const pids = execSync(`lsof -ti :${port}`, { encoding: 'utf8' }).trim();
      if (!pids) return null;

      const pidList = pids.split('\n');
      const processInfo = pidList.map((pid) => {
        try {
          const cmd = execSync(`ps -p ${pid} -o command=`, { encoding: 'utf8' }).trim();
          return `PID ${pid}: ${cmd}`;
        } catch {
          return `PID ${pid}: <unknown>`;
        }
      });

      return processInfo.join('\n');
    }
  } catch (err) {
    return null;
  }
}

// Main function
async function main() {
  const portsToCheck = process.argv.slice(2).map(Number);
  const defaultPorts = portsToCheck.length > 0 ? portsToCheck : [3000, 3001, 3002, 3003, 3004, 3005];

  console.log(`${colors.bold}${colors.cyan}🔍 Port Status Checker${colors.reset}\n`);
  console.log(`Checking ports: ${defaultPorts.join(', ')}\n`);
  console.log('─'.repeat(60));

  for (const port of defaultPorts) {
    const inUse = await isPortInUse(port);

    if (inUse) {
      console.log(`\n${colors.red}✗ Port ${port}${colors.reset} - ${colors.red}${colors.bold}IN USE${colors.reset}`);
      const processInfo = getProcessOnPort(port);
      if (processInfo) {
        console.log(`  ${colors.yellow}Process:${colors.reset}`);
        processInfo.split('\n').forEach((line) => {
          console.log(`  ${colors.yellow}→${colors.reset} ${line}`);
        });
      }
    } else {
      console.log(`\n${colors.green}✓ Port ${port}${colors.reset} - ${colors.green}${colors.bold}AVAILABLE${colors.reset}`);
    }
  }

  console.log('\n' + '─'.repeat(60));

  // Find next available port starting from 3001
  console.log(`\n${colors.blue}${colors.bold}Next available port from 3001:${colors.reset}`);
  let found = false;
  for (let port = 3001; port < 3101; port++) {
    const inUse = await isPortInUse(port);
    if (!inUse) {
      console.log(`${colors.green}→ Port ${port} is available${colors.reset}`);
      found = true;
      break;
    }
  }

  if (!found) {
    console.log(`${colors.red}→ No available ports found in range 3001-3100${colors.reset}`);
  }

  console.log('');
}

main().catch((err) => {
  console.error(`${colors.red}Error:${colors.reset}`, err.message);
  process.exit(1);
});
