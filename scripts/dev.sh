#!/bin/bash

# Function to check if a port is in use
is_port_in_use() {
  lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1
}

# Function to find an available port
find_available_port() {
  local start_port=$1
  local max_attempts=100

  for ((i=0; i<max_attempts; i++)); do
    local port=$((start_port + i))
    if ! is_port_in_use $port; then
      echo $port
      return 0
    fi
  done

  echo "Error: Could not find an available port" >&2
  return 1
}

# Preferred port
PREFERRED_PORT=3001

# Check if preferred port is available
if is_port_in_use $PREFERRED_PORT; then
  echo "⚠️  Port $PREFERRED_PORT is already in use."
  echo "🔍 Finding an available port..."

  PORT=$(find_available_port 3001)

  if [ $? -ne 0 ]; then
    echo "❌ Failed to find an available port. Please free up some ports and try again."
    exit 1
  fi

  echo "✅ Found available port: $PORT"
else
  PORT=$PREFERRED_PORT
  echo "✅ Using preferred port: $PORT"
fi

# Clear Next.js cache to ensure clean start
echo "🧹 Cleaning Next.js cache..."
rm -rf .next/dev/lock .next/trace .next/server 2>/dev/null

echo "🚀 Starting development server on port $PORT..."
echo ""

# Start Next.js on the selected port
exec next dev -p $PORT
