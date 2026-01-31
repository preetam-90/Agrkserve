#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const net = require('net');
const fs = require('fs');
const path = require('path');

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

// Function to find an available port
async function findAvailablePort(startPort = 3001, maxAttempts = 100) {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    const inUse = await isPortInUse(port);

    if (!inUse) {
      return port;
    }
  }

  throw new Error('Could not find an available port');
}

// Function to clean Next.js cache and lock files
function cleanNextCache() {
  const nextDir = path.join(process.cwd(), '.next');
  const lockFile = path.join(nextDir, 'dev', 'lock');
  const traceDir = path.join(nextDir, 'trace');
  const serverDir = path.join(nextDir, 'server');

  try {
    if (fs.existsSync(lockFile)) {
      fs.unlinkSync(lockFile);
      console.log('🧹 Removed Next.js lock file');
    }
  } catch (err) {
    // Ignore errors
  }

  try {
    if (fs.existsSync(traceDir)) {
      fs.rmSync(traceDir, { recursive: true, force: true });
    }
  } catch (err) {
    // Ignore errors
  }

  try {
    if (fs.existsSync(serverDir)) {
      fs.rmSync(serverDir, { recursive: true, force: true });
    }
  } catch (err) {
    // Ignore errors
  }
}

// Function to kill processes on a specific port (Unix systems)
function killProcessOnPort(port) {
  try {
    const command =
      process.platform === 'win32' ? `netstat -ano | findstr :${port}` : `lsof -ti :${port}`;

    const output = execSync(command, { encoding: 'utf8' }).trim();

    if (output) {
      // Split by newlines to handle multiple PIDs
      const pids = output.split('\n').filter((pid) => pid.trim());

      pids.forEach((pid) => {
        try {
          console.log(`🛑 Found process ${pid} on port ${port}, terminating...`);
          const killCommand =
            process.platform === 'win32' ? `taskkill /PID ${pid} /F` : `kill -9 ${pid}`;

          execSync(killCommand);
          console.log(`✅ Process ${pid} terminated`);
        } catch (killErr) {
          // Ignore individual kill errors
        }
      });

      // Wait a moment for the port to be released
      return new Promise((resolve) => setTimeout(resolve, 2000));
    }
  } catch (err) {
    // No process found or unable to kill, continue
  }
}

// Main function
async function main() {
  const preferredPort = 3001;

  try {
    console.log('🔍 Checking for available port...');

    // Clean Next.js cache and locks first
    cleanNextCache();

    let portInUse = await isPortInUse(preferredPort);
    let port;

    if (portInUse) {
      console.log(`⚠️  Port ${preferredPort} is already in use.`);

      // Try to kill the process on the preferred port
      await killProcessOnPort(preferredPort);

      // Check again if port is now available
      portInUse = await isPortInUse(preferredPort);

      if (portInUse) {
        console.log('🔍 Finding an available port...');
        port = await findAvailablePort(preferredPort);
        console.log(`✅ Found available port: ${port}`);
      } else {
        port = preferredPort;
        console.log(`✅ Freed up preferred port: ${port}`);
      }
    } else {
      port = preferredPort;
      console.log(`✅ Using preferred port: ${port}`);
    }

    console.log('🚀 Starting development server...\n');

    // Start Next.js dev server
    const nextDev = spawn('bun', ['next', 'dev', '-p', port.toString()], {
      stdio: 'inherit',
    });

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping development server...');
      nextDev.kill('SIGINT');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Stopping development server...');
      nextDev.kill('SIGTERM');
      process.exit(0);
    });

    nextDev.on('exit', (code) => {
      process.exit(code || 0);
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
