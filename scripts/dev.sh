#!/bin/bash

# Port 3001 - Enforce only this port
PORT=3001

# Check if port 3001 is in use
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
  echo "⚠️  Port $PORT is already in use."
  echo "🔍 Finding and stopping the process..."
  
  # Get the PID of the process using the port
  PID=$(lsof -Ti :$PORT)
  
  if [ ! -z "$PID" ]; then
    echo "🛑 Killing process $PID..."
    kill -9 $PID 2>/dev/null
    sleep 2
    echo "✅ Process killed successfully"
  fi
fi

# Clear Next.js cache to ensure clean start
echo "🧹 Cleaning Next.js cache..."
rm -rf .next/dev/lock .next/trace .next/server 2>/dev/null

echo "🚀 Starting development server on port $PORT..."
echo ""

# Start Next.js on port 3001
exec next dev -p $PORT
