# Contributing to AgriServe

Thank you for considering contributing to AgriServe! This document outlines the process and guidelines for contributing.

## 🚀 Getting Started

1. **Fork the repository** and clone it locally
2. **Install dependencies**: `pnpm install`
3. **Copy environment variables**: `cp .env.example .env.local`
4. **Setup database**: Follow instructions in `DATABASE_SETUP.md`
5. **Run development server**: `pnpm dev`

## 📋 Before You Start

- Check existing issues and pull requests to avoid duplicates
- For major changes, open an issue first to discuss your idea
- Make sure your code follows the project's style guidelines

## 💻 Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Branch naming conventions:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Code Quality Checks

Before committing, ensure:

```bash
# Format code
pnpm format

# Run linter
pnpm lint

# Fix linting issues
pnpm lint:fix

# Type check
pnpm type-check

# Build check
pnpm build
```

### 4. Commit Your Changes

Follow conventional commit format:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(auth): add phone number verification
fix(booking): resolve date picker timezone issue
docs(readme): update setup instructions
```

### 5. Push and Create Pull Request

```bash
git push origin your-branch-name
```

Then create a pull request on GitHub with:

- Clear title describing the change
- Detailed description of what and why
- Screenshots/videos for UI changes
- Link to related issues

## 📝 Code Style Guidelines

### TypeScript/JavaScript

- Use TypeScript for all new files
- Define proper types/interfaces
- Avoid `any` type - use `unknown` if necessary
- Use meaningful variable names
- Keep functions small and focused

### React Components

- Use functional components with hooks
- Define prop types with TypeScript interfaces
- Use proper component naming (PascalCase)
- Keep components small and reusable
- Extract complex logic into custom hooks

### File Organization

```
src/
├── app/              # Next.js pages and routes
├── components/       # Reusable components
│   ├── ui/          # Generic UI components
│   └── layout/      # Layout components
├── lib/
│   ├── services/    # API service layer
│   ├── types/       # TypeScript types
│   ├── utils/       # Utility functions
│   └── supabase/    # Supabase client
```

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow mobile-first approach
- Keep custom CSS minimal
- Use CSS variables for theming

## 🧪 Testing (Coming Soon)

- Write unit tests for utilities and services
- Write integration tests for critical flows
- Test responsive design on multiple devices
- Test accessibility with screen readers

## 🔍 Code Review Process

Pull requests require:

- At least one approval from maintainers
- Passing CI/CD checks
- No merge conflicts
- Up-to-date with main branch

Reviewers will check:

- Code quality and style
- Test coverage
- Documentation updates
- Performance implications
- Security considerations

## 🐛 Reporting Bugs

When reporting bugs, include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/videos if applicable
- Environment details (OS, browser, etc.)
- Error messages or console logs

## 💡 Suggesting Features

For feature requests:

- Describe the problem you're trying to solve
- Explain your proposed solution
- Consider alternative approaches
- Discuss impact on existing features
- Provide mockups if relevant

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Community Guidelines

- Be respectful and inclusive
- Help others learn and grow
- Give constructive feedback
- Keep discussions on topic
- Follow the code of conduct

## 📞 Getting Help

- Open an issue for bugs or questions
- Join our community discussions
- Review existing documentation
- Check closed issues for solutions

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to AgriServe! 🌾
