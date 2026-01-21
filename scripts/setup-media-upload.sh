#!/bin/bash

# Media Upload System Setup Script
# This script helps set up the media upload system dependencies

set -e

echo "=========================================="
echo "Media Upload System Setup"
echo "=========================================="
echo ""

# Check if running in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check Node.js version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | sed 's/v//')
echo "   Node.js: $NODE_VERSION"

# Check pnpm
echo "📦 Checking pnpm..."
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm -v)
    echo "   pnpm: $PNPM_VERSION"
else
    echo "❌ pnpm not found. Please install pnpm: npm install -g pnpm"
    exit 1
fi

# Check FFmpeg
echo "🎥 Checking FFmpeg..."
if command -v ffmpeg &> /dev/null; then
    FFMPEG_VERSION=$(ffmpeg -version | head -n1 | awk '{print $3}')
    echo "   FFmpeg: $FFMPEG_VERSION"
else
    echo "⚠️  FFmpeg not found. Installing..."
    
    # Detect OS and install FFmpeg
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Check if it's Ubuntu/Debian
        if command -v apt &> /dev/null; then
            echo "   Installing FFmpeg on Ubuntu/Debian..."
            sudo apt update
            sudo apt install -y ffmpeg
        # Check if it's Fedora
        elif command -v dnf &> /dev/null; then
            echo "   Installing FFmpeg on Fedora..."
            sudo dnf install -y ffmpeg
        # Check if it's CentOS/RHEL
        elif command -v yum &> /dev/null; then
            echo "   Installing FFmpeg on CentOS/RHEL..."
            sudo yum install -y ffmpeg
        else
            echo "   ⚠️  Cannot auto-install FFmpeg on this Linux distribution."
            echo "   Please install FFmpeg manually."
            echo "   Ubuntu/Debian: sudo apt install ffmpeg"
            echo "   Fedora: sudo dnf install ffmpeg"
            echo "   CentOS/RHEL: sudo yum install ffmpeg"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            echo "   Installing FFmpeg on macOS..."
            brew install ffmpeg
        else
            echo "   ⚠️  Homebrew not found. Please install Homebrew first:"
            echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            echo "   Then run: brew install ffmpeg"
        fi
    else
        echo "   ⚠️  Cannot auto-install FFmpeg on this OS."
        echo "   Please download FFmpeg from https://ffmpeg.org/download.html"
    fi
    
    # Verify installation
    if command -v ffmpeg &> /dev/null; then
        echo "   ✅ FFmpeg installed successfully"
    else
        echo "   ❌ FFmpeg installation failed or not in PATH"
        echo "   Please install FFmpeg manually and ensure it's in your PATH"
    fi
fi

echo ""
echo "=========================================="
echo "Installing Node.js Dependencies"
echo "=========================================="
echo ""

# Install dependencies
echo "📦 Installing sharp, fluent-ffmpeg, multer..."
pnpm add -w sharp fluent-ffmpeg multer

echo ""
echo "📦 Installing TypeScript types..."
pnpm add -w -D @types/fluent-ffmpeg @types/multer

echo ""
echo "📦 Installing Radix UI slider..."
pnpm add -w @radix-ui/react-slider

echo ""
echo "=========================================="
echo "Verifying Installation"
echo "=========================================="
echo ""

# Verify sharp installation
echo "🔍 Verifying sharp..."
if node -e "require('sharp')" 2>/dev/null; then
    echo "   ✅ Sharp is installed and working"
else
    echo "   ⚠️  Sharp may have installation issues"
    echo "   Try running: pnpm rebuild sharp"
fi

# Verify fluent-ffmpeg installation
echo "🔍 Verifying fluent-ffmpeg..."
if node -e "require('fluent-ffmpeg')" 2>/dev/null; then
    echo "   ✅ fluent-ffmpeg is installed and working"
else
    echo "   ⚠️  fluent-ffmpeg may have installation issues"
fi

echo ""
echo "=========================================="
echo "Database Migration"
echo "=========================================="
echo ""
echo "📝 To set up video storage bucket, run:"
echo "   pnpm supabase migration up"
echo ""
echo "   Or manually apply: supabase/migrations/009_setup_video_storage.sql"
echo ""

echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Run the development server: pnpm dev"
echo "2. Visit http://localhost:3001/test-upload"
echo "3. Test the upload system"
echo ""
echo "For more information, see: docs/MEDIA_UPLOAD_SYSTEM.md"
echo ""
