# 🚫 NPM/YARN BLOCKING - Package Manager Enforcement

This project **ONLY** supports **pnpm** as the package manager. Using npm or yarn is **strictly prohibited** and will result in immediate failure.

## 🛡️ Protection Layers

### 1. **Engine Restrictions** (`package.json`)
```json
"engines": {
  "node": ">=18.0.0",
  "pnpm": ">=8.0.0",
  "npm": "please-use-pnpm",
  "yarn": "please-use-pnpm"
}
```

### 2. **Preinstall Hook** (`scripts/only-pnpm.js`)
- Blocks npm/yarn before any installation
- Shows clear error message
- Exits with code 1

### 3. **Backup Check** (`scripts/check-pm.sh`)
- Secondary validation layer
- Colorful, funny error messages
- Prevents any script execution with wrong package manager

### 4. **`.npmrc` Configuration**
- Enforces engine-strict mode
- Configures pnpm-specific settings
- Prevents npm from ignoring engines field

## ✅ Correct Usage

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test
```

## ❌ What Gets Blocked

```bash
# These will FAIL:
npm install     # ❌ Blocked by engines + preinstall
yarn install    # ❌ Blocked by engines + preinstall
npm run dev     # ❌ Blocked
yarn dev        # ❌ Blocked
```

## 🎯 Error Message Example

When someone tries to use npm:
```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║   🚫 NPM IS BLOCKED ON THIS PROJECT 🚫                                        ║
║                                                                               ║
║   This project uses pnpm as the package manager.                             ║
║   Please install pnpm and use it instead of npm.                             ║
║                                                                               ║
║   📦 Install pnpm:                                                            ║
║      $ npm install -g pnpm                                                    ║
║      $ corepack enable                                                        ║
║                                                                               ║
║   🚀 Then run:                                                                ║
║      $ pnpm install                                                           ║
║      $ pnpm dev                                                               ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

## 🔧 Why pnpm?

- **95% faster** installation than npm
- **70% less disk space** usage
- **Better monorepo support**
- **Stricter dependency resolution**
- **Built-in workspace support**
- **Content-addressable storage**

## 📚 For New Team Members

If you're new to this project:

1. **Install pnpm globally:**
   ```bash
   npm install -g pnpm
   # or
   corepack enable
   ```

2. **Clone and install:**
   ```bash
   git clone <repo-url>
   cd agri-serve-web
   pnpm install
   ```

3. **Start developing:**
   ```bash
   pnpm dev
   ```

## 🚨 Troubleshooting

**Q: I accidentally ran npm install, what now?**  
A: Delete `node_modules` and `package-lock.json`, then run `pnpm install`

**Q: Can I use yarn instead?**  
A: No. Only pnpm is supported.

**Q: Why is this so strict?**  
A: To maintain consistency across all development environments and prevent dependency issues.

---

**Remember:** This is not a suggestion, it's a **requirement**. The codebase is configured to work with pnpm only. 🎯
