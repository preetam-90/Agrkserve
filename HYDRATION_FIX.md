# Hydration Mismatch Fix

## Problem

The landing page was showing a hydration mismatch error:

```
A tree hydrated but some attributes of the server rendered HTML didn't match the client properties.
```

This occurred in the `FinalCTASection` component's email input field.

## Root Cause

The `Input` component uses `React.useId()` to generate unique IDs:

```typescript
const generatedId = React.useId();
const inputId = id || generatedId;
```

The problem is that `React.useId()` generates **different IDs on the server vs client**, causing a mismatch during hydration:

- **Server renders:** `id="_R_5mmueatplb_"`
- **Client renders:** `id="_R_mqrppbn5lb_"`

This mismatch breaks React's hydration process.

## Solution

Pass a **stable, consistent ID** to the Input component instead of relying on `React.useId()`:

```typescript
// Use a stable ID for the email input
const emailInputId = useMemo(() => 'landing-email-input', []);

// Pass it to the Input component
<Input
  id={emailInputId}  // ← Stable ID
  type="email"
  placeholder="Enter your email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="flex-1 bg-transparent border-none text-white placeholder:text-gray-500 focus:ring-0"
/>
```

Since we provide an explicit `id` prop, the Input component uses it instead of generating a new one with `React.useId()`.

## Why This Works

1. **Consistency:** The same ID is used on both server and client
2. **Predictability:** No random generation involved
3. **Hydration Safe:** React can match server and client DOM exactly

## Files Modified

- `src/components/landing/FinalCTASection.tsx`

## Best Practices

When using components that generate IDs:

### ❌ Don't Do This
```typescript
<Input type="email" />  // Relies on React.useId() - causes mismatch
```

### ✅ Do This
```typescript
const emailInputId = useMemo(() => 'landing-email-input', []);
<Input id={emailInputId} type="email" />  // Stable ID - no mismatch
```

### Alternative: Use useId Correctly
If you need dynamic IDs, ensure they're generated consistently:

```typescript
// This works because useId is called at the same place every render
const id = useId();
<Input id={id} />
```

## Related Issues

This type of hydration mismatch can also be caused by:
- `Math.random()` in initial render
- `Date.now()` in initial render
- Conditional rendering based on `typeof window`
- Browser extensions modifying HTML

## Verification

To verify the fix works:

1. Open browser DevTools → Console
2. Refresh the landing page
3. Look for hydration mismatch warnings
4. Should see no errors now ✅

## Summary

**Problem:** Input component generated different IDs on server vs client  
**Solution:** Provide stable ID via props instead of relying on `React.useId()`  
**Result:** No more hydration mismatch errors ✅
