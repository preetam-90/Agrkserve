# Design System - Premium Landing Page

## Color Tokens

### Primary Colors
```css
--emerald-400: #34d399
--emerald-500: #10b981
--emerald-600: #059669
--emerald-900: #064e3b
--emerald-950: #022c22
```

### Secondary Colors
```css
--teal-400: #2dd4bf
--teal-500: #14b8a6
--teal-600: #0d9488
```

### Accent Colors
```css
--amber-400: #fbbf24
--amber-500: #f59e0b
--amber-600: #d97706
```

### Neutral Colors
```css
--slate-900: #0f172a
--gray-300: #d1d5db
--gray-400: #9ca3af
--white: #ffffff
```

## Gradient Combinations

### Primary Gradient
```tsx
className="bg-gradient-to-r from-emerald-500 to-teal-500"
```

### Accent Gradient
```tsx
className="bg-gradient-to-r from-emerald-400 to-amber-400"
```

### Background Gradient
```tsx
className="bg-gradient-to-br from-emerald-950 via-slate-900 to-amber-950"
```

## Typography Scale

### Display (Hero Headlines)
```tsx
className="text-6xl md:text-7xl lg:text-8xl font-bold"
```

### Heading 1
```tsx
className="text-5xl md:text-6xl font-bold"
```

### Heading 2
```tsx
className="text-4xl md:text-5xl font-bold"
```

### Heading 3
```tsx
className="text-3xl font-bold"
```

### Body Large
```tsx
className="text-xl md:text-2xl"
```

### Body Regular
```tsx
className="text-base md:text-lg"
```

### Body Small
```tsx
className="text-sm"
```

## Spacing Scale

```tsx
// Padding
p-4   // 1rem (16px)
p-6   // 1.5rem (24px)
p-8   // 2rem (32px)
p-12  // 3rem (48px)

// Margin
mb-4  // 1rem
mb-6  // 1.5rem
mb-8  // 2rem
mb-12 // 3rem
mb-16 // 4rem
mb-20 // 5rem

// Gap
gap-4 // 1rem
gap-6 // 1.5rem
gap-8 // 2rem
```

## Border Radius

```tsx
rounded-xl   // 0.75rem (12px) - Small cards
rounded-2xl  // 1rem (16px) - Medium cards
rounded-3xl  // 1.5rem (24px) - Large cards
rounded-full // 9999px - Pills, avatars
```

## Shadow Tokens

### Small Shadow
```tsx
className="shadow-lg"
```

### Medium Shadow
```tsx
className="shadow-xl"
```

### Large Shadow
```tsx
className="shadow-2xl"
```

### Colored Shadow
```tsx
className="shadow-2xl shadow-emerald-500/30"
```

## Glassmorphism Patterns

### Light Glass
```tsx
className="bg-white/5 backdrop-blur-xl border border-white/10"
```

### Medium Glass
```tsx
className="bg-white/10 backdrop-blur-xl border border-white/20"
```

### Dark Glass
```tsx
className="bg-black/20 backdrop-blur-xl border border-white/10"
```

## Animation Patterns

### Fade In
```tsx
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ duration: 0.8 }}
```

### Slide Up
```tsx
initial={{ opacity: 0, y: 30 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.8 }}
```

### Scale In
```tsx
initial={{ opacity: 0, scale: 0.8 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ duration: 0.6 }}
```

### Stagger Children
```tsx
variants={{
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}}
```

### Hover Scale
```tsx
whileHover={{ scale: 1.05 }}
transition={{ type: 'spring', stiffness: 300 }}
```

## Button Variants

### Primary Button
```tsx
<Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-6 rounded-2xl shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all hover:scale-105">
  Button Text
</Button>
```

### Secondary Button
```tsx
<Button className="border-2 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-400 px-8 py-6 rounded-2xl backdrop-blur-sm transition-all hover:scale-105">
  Button Text
</Button>
```

### Ghost Button
```tsx
<Button className="bg-white/5 hover:bg-white/10 border border-white/20 hover:border-emerald-500/50 text-white px-8 py-6 rounded-2xl backdrop-blur-xl transition-all hover:scale-105">
  Button Text
</Button>
```

## Card Patterns

### Basic Card
```tsx
<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105">
  {/* Content */}
</div>
```

### Card with Glow
```tsx
<div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 group">
  {/* Content */}
  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/10 group-hover:to-teal-500/10 transition-all duration-500 pointer-events-none rounded-3xl" />
</div>
```

### Card with Icon
```tsx
<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
    <Icon className="w-8 h-8 text-white" />
  </div>
  {/* Content */}
</div>
```

## Icon Sizes

```tsx
w-4 h-4   // 16px - Small inline icons
w-5 h-5   // 20px - Regular inline icons
w-6 h-6   // 24px - Medium icons
w-8 h-8   // 32px - Large icons in cards
w-10 h-10 // 40px - Extra large icons
w-16 h-16 // 64px - Hero icons
```

## Responsive Breakpoints

```tsx
// Mobile First
sm:  // 640px
md:  // 768px
lg:  // 1024px
xl:  // 1280px
2xl: // 1536px
```

## Grid Patterns

### 3-Column Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {/* Items */}
</div>
```

### 4-Column Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
  {/* Items */}
</div>
```

### Asymmetric Grid
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <div className="lg:col-span-2">{/* Large item */}</div>
  <div>{/* Small item */}</div>
</div>
```

## Background Patterns

### Gradient Mesh
```tsx
<div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.2),transparent_50%)]" />
```

### Grid Pattern
```tsx
<div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:100px_100px]" />
```

### Masked Grid
```tsx
<div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
```

## Usage Examples

### Section Container
```tsx
<section className="relative py-32 overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-emerald-950/50 to-slate-900" />
  <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Content */}
  </div>
</section>
```

### Animated Section Header
```tsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={isInView ? { opacity: 1, y: 0 } : {}}
  transition={{ duration: 0.8 }}
  className="text-center mb-20"
>
  <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
    Section Title
  </h2>
  <p className="text-xl text-gray-400 max-w-2xl mx-auto">
    Section description
  </p>
</motion.div>
```

## Best Practices

1. **Consistency**: Use the same spacing, colors, and animations throughout
2. **Performance**: Prefer transform and opacity for animations
3. **Accessibility**: Always include ARIA labels and keyboard navigation
4. **Responsive**: Test on all breakpoints
5. **Loading States**: Provide skeleton screens for better UX
6. **Hover States**: Make interactive elements obvious
7. **Focus States**: Ensure keyboard users can navigate
8. **Color Contrast**: Maintain WCAG AA standards minimum

## Component Checklist

When creating new components:
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Hover states for interactive elements
- [ ] Loading states where applicable
- [ ] Error states where applicable
- [ ] Accessibility (ARIA, keyboard nav)
- [ ] Animations (scroll-triggered, hover)
- [ ] Glassmorphism styling
- [ ] Gradient accents
- [ ] Proper spacing and typography
- [ ] TypeScript types
