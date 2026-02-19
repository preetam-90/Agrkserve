# Package Manager & Development Server Configuration

## 📦 Allowed Package Managers

This project **ONLY** supports:

- ✅ **pnpm** (recommended)
- ✅ **bun** (alternative)

**NOT supported:**

- ❌ npm
- ❌ yarn

---

## 🚀 Getting Started

### Install Dependencies (use pnpm)

```bash
pnpm install
```

Or with bun:

```bash
bun install
```

### Start Development Server (Always Port 3001)

```bash
pnpm dev
```

This will:

- ✅ Always run on **port 3001**
- ✅ Automatically kill any process using port 3001
- ✅ Clean Next.js cache
- ✅ Start fresh dev server

---

## 🔧 Port 3001 Policy

### Why Port 3001?

The project is configured to **always use port 3001** for development.

### What Happens If Port 3001 Is In Use?

```bash
pnpm dev
```

The dev script will automatically:

1. Detect port 3001 is in use
2. Show a warning ⚠️
3. Kill the process using that port
4. Start a fresh server on port 3001

**You don't need to manually manage ports!**

---

## 🛡️ Enforcement Mechanisms

### 1. **package.json Configuration**

```json
{
  "packageManager": "pnpm@8.0.0",
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0",
    "npm": "PLEASE_USE_PNPM",
    "yarn": "PLEASE_USE_PNPM"
  }
}
```

### 2. **.npmrc Configuration**

```
engine-strict=true
```

This enforces the `engines` field in package.json.

### 3. **Pre-install Hook (.husky/pre-install)**

Blocks npm/yarn installation attempts with clear error message:

```
❌ ERROR: npm is not allowed in this project.
📦 Please use pnpm instead:
   pnpm install
```

### 4. **Next.js Configuration**

```typescript
experimental: {
  serverPort: 3001,
}
```

Forces port 3001 in Next.js config.

### 5. **Development Script (scripts/dev.sh)**

Custom bash script that:

- Detects port conflicts
- Kills existing processes
- Cleans cache
- Starts fresh server

---

## 📋 Common Tasks

### Install Dependencies

```bash
# ✅ Correct
pnpm install

# ❌ Wrong
npm install      # Will fail
yarn install      # Will fail
```

### Start Development

```bash
# ✅ Correct - Always runs on port 3001
pnpm dev

# ✅ Manual start if needed
./scripts/dev.sh
```

### Build for Production

```bash
pnpm build
```

### Run Linting

```bash
pnpm lint
pnpm lint:fix
```

### Format Code

```bash
pnpm format
```

---

## 🚨 What Happens If You Try npm/yarn?

### Scenario 1: Try `npm install`

```bash
$ npm install

ERR! ERR! ERR!
Unsupported engine: the package.json file specifies unsupported engines.
The current npm version is X.X.X, but the package.json specifies npm version "PLEASE_USE_PNPM"

Use pnpm install instead.
```

### Scenario 2: Try `yarn install`

```bash
$ yarn install

error Your packageManager must be pnpm ("pnpm@8.0.0", not "yarn").
```

---

## ✅ Verification

To verify your setup:

```bash
# Check pnpm is installed
pnpm --version

# Check Node version
node --version  # Should be >=18.0.0

# Start dev server
pnpm dev
# Should show:
# 🚀 Starting development server on port 3001...
# ✓ Ready in XXXms
```

---

## 🔄 For Team Members

**Please share this with your team:**

1. **Only use pnpm** for dependency management
2. **Port 3001 is hardcoded** - don't change it
3. **Dev script auto-manages port conflicts** - just run `pnpm dev`
4. **Never run `npm install` or `yarn install`** - use `pnpm install`

---

## 🐛 Troubleshooting

### Issue: "Port 3001 is still in use after running pnpm dev"

Try manually killing the process:

```bash
# Find process on port 3001
lsof -i :3001

# Kill it
kill -9 <PID>

# Then start dev server
pnpm dev
```

### Issue: "pnpm: command not found"

Install pnpm globally:

```bash
npm install -g pnpm
```

### Issue: "engine-strict" error

Make sure you're using pnpm >=8.0.0:

```bash
pnpm --version  # Should show 8.x.x or higher
```

---

## 📚 References

- [pnpm Documentation](https://pnpm.io/)
- [Next.js Development](https://nextjs.org/docs/getting-started/installation)
- [Node.js Engines](https://docs.npmjs.com/files/package.json#engines)

---

**Last Updated:** January 21, 2026

**Enforced:** pnpm/bun only, Port 3001 always
