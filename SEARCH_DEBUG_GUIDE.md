# 🔍 Search Debugging Guide

## Issue: Search Not Working

I've added detailed console logging to help diagnose the issue.

## How to Debug

### Step 1: Open Browser Console
1. Open your app in browser
2. Press `F12` or `Right-click → Inspect`
3. Go to **Console** tab

### Step 2: Test Search
1. Click the ✨ Sparkles button to open Media Drawer
2. Type in the search box (e.g., "tractor")
3. Watch the console for logs

### What You Should See in Console

When you type "tractor", you should see:
```
[KLIPY] Filtering gif with query: "tractor"
[KLIPY] Total items before filter: 8
[KLIPY] Items after filter: 2
[KLIPY] Filtered items: ['Tractor Driving', 'Tractor Meme']
```

## If You See the Logs

✅ Search function is being called correctly  
✅ Filtering logic works  
❓ Problem might be with UI update

**Solution**: Check if items state is updating in MediaDrawer component

## If You DON'T See the Logs

❌ Search function not being called  
❌ Problem is in MediaDrawer event handling

**Solution**: The input's onChange handler might not be connected

## Quick Test in Console

Paste this in browser console to test the service directly:
```javascript
// Test the search function
const testSearch = async () => {
  const { klipyService } = await import('./src/lib/services/klipy-service');
  const results = klipyService.filterMockData('tractor', 'gif', 20);
  console.log('Search results:', results);
};
testSearch();
```

## Manual Testing Checklist

1. [ ] Open Media Drawer
2. [ ] Type "tractor" in search box
3. [ ] Check console for `[KLIPY]` logs
4. [ ] Verify items update in UI
5. [ ] Try different searches: "success", "thumbs", "heart"
6. [ ] Clear search → should show all items again

## Expected Behavior

| Search Term | Expected Results |
|-------------|-----------------|
| `tractor` | Tractor Driving (GIF), Tractor Meme (Meme) |
| `success` | Success (GIF), Success Kid (Meme), Success Sound (Clip) |
| `thumbs` | Thumbs Up (GIF), Thumbs Up (Sticker) |
| `heart` | Heart (Sticker) |
| `deal` | Deal (GIF) |
| `star` | Star (Sticker) |
| (empty) | All items shown |

## Recent Fixes Applied

1. ✅ Removed `loading` from useCallback dependencies (was causing stale closure)
2. ✅ Added `setPage(1)` when searching (resets pagination)
3. ✅ Added console.log statements for debugging
4. ✅ Improved filter logic with detailed matching

## Next Steps

1. Test with console open
2. Share the console output with me
3. I can then pinpoint the exact issue

## Common Issues & Solutions

### Issue: Console shows logs but UI doesn't update
**Cause**: React state not updating  
**Fix**: Check if setItems() is being called after search

### Issue: No console logs at all
**Cause**: Search handler not connected to input  
**Fix**: Verify onChange={handleSearch} is on the input element

### Issue: Empty results for valid search
**Cause**: Case sensitivity or matching logic  
**Fix**: Already handled with toLowerCase() and includes()

---

**After testing, let me know what you see in the console!** 🔍
