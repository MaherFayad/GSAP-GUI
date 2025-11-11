# Properties Panel Inheritance Fix

## Issues Fixed

### 1. ✅ Panel Doesn't Inherit Current Element Styles
**Problem:** When selecting an element, the properties panel would show default values (x:0, y:0, scale:1, etc.) instead of reading the element's actual current styles, causing immediate unwanted changes.

**Solution:**
- Added `GET_ELEMENT_STYLES` message handler in sandbox
- Panel now requests current styles when element is selected
- Parses computed styles including transform matrix
- Updates all panel controls to match element's actual values

### 2. ✅ Old Values Applied to Newly Selected Elements  
**Problem:** When switching between elements, the previous element's values would be immediately applied to the new element without user interaction.

**Solution:**
- Added `isInitializingRef` flag to track loading state
- Prevents auto-recording during style initialization
- Resets `previousPropertiesRef` when element changes
- 100ms delay after loading to ensure clean state

## How It Works Now

### Element Selection Flow:
```
1. User clicks element in canvas
2. Panel receives element selector
3. Panel sends GET_ELEMENT_STYLES message
4. Sandbox reads computed styles
5. Sandbox parses transform matrix
6. Sandbox sends ELEMENT_STYLES back
7. Panel updates all controls
8. isInitializingRef set to false after 100ms
9. Panel ready for user edits
```

### Style Extraction:
The sandbox now extracts:
- **Transform**: x, y, scaleX, scaleY, rotation (from matrix)
- **Layout**: width, height
- **Style**: opacity, backgroundColor, color, borders
- **Text**: fontSize, fontWeight, lineHeight, textAlign
- **Other**: transformOrigin, zIndex

### Transform Matrix Parsing:
```javascript
// CSS: transform: matrix(a, b, c, d, tx, ty)
x = tx              // Translation X
y = ty              // Translation Y
scaleX = √(a² + b²) // Scale X from matrix
scaleY = √(c² + d²) // Scale Y from matrix
rotation = atan2(b, a) * 180/π  // Rotation in degrees
```

## Files Modified

### 1. `src/components/PropertiesPanel/PropertiesPanelComprehensive.tsx`

**Added:**
- `isInitializingRef` - Tracks if panel is loading element styles
- `useEffect` for requesting styles on element change
- `useEffect` for listening to ELEMENT_STYLES messages
- Initialization guard in the auto-record effect

**Changes:**
```typescript
// Request styles when element changes
useEffect(() => {
  if (!selectedElement) return;
  
  isInitializingRef.current = true;
  previousPropertiesRef.current = null;
  
  sendMessage('GET_ELEMENT_STYLES', { selector: selectedElement });
}, [selectedElement, sendMessage]);

// Listen for styles from sandbox
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'ELEMENT_STYLES') {
      // Update all state values...
      setTimeout(() => {
        isInitializingRef.current = false;
      }, 100);
    }
  };
  // ...
}, [selectedElement]);

// Don't apply during initialization
useEffect(() => {
  if (!selectedElement) return;
  if (isInitializingRef.current) return; // ← NEW
  // ... rest of auto-record logic
}, [/* dependencies */]);
```

### 2. `public/sandbox-client.js` & `dist/sandbox-client.js`

**Added:**
- `handleGetElementStyles()` function
- GET_ELEMENT_STYLES case in message switch
- Transform matrix parsing logic
- ELEMENT_STYLES response message

**Key Function:**
```javascript
function handleGetElementStyles(message) {
  const element = document.querySelector(selector);
  const computedStyle = window.getComputedStyle(element);
  
  // Parse transform matrix
  const transform = computedStyle.transform;
  // Extract x, y, scale, rotation from matrix
  
  // Gather all properties
  const styles = {
    x, y, scaleX, scaleY, rotation,
    width, height, opacity,
    backgroundColor, color,
    fontSize, fontWeight,
    // ... etc
  };
  
  // Send back to editor
  window.parent.postMessage({
    type: 'ELEMENT_STYLES',
    payload: { selector, styles }
  }, '*');
}
```

## User Experience Improvements

### Before (Broken):
1. ❌ Click element → Panel shows x:0, y:0 → Element jumps to origin
2. ❌ Edit element A (x:100) → Click element B → Element B jumps to x:100
3. ❌ No way to see element's current values

### After (Fixed):
1. ✅ Click element → Panel reads actual styles → Shows x:50, y:100 (example)
2. ✅ Edit element A → Click element B → Panel reads B's styles → No unwanted changes
3. ✅ Panel always shows accurate current values
4. ✅ Only creates keyframes when YOU change values

## Testing Checklist

- [x] Select element - panel shows its actual styles
- [x] Select element with transform - x, y, rotation display correctly
- [x] Select element with colors - backgroundColor, color display correctly
- [x] Select element with text - fontSize, fontWeight display correctly
- [x] Switch between elements - each shows its own styles
- [x] No keyframes created during initialization
- [x] Keyframes only created when user adjusts values
- [x] Moving playhead doesn't create keyframes
- [x] No unwanted style applications

## Technical Notes

### Transform Matrix Extraction:
The CSS `transform` property returns a matrix format:
```
matrix(a, b, c, d, tx, ty)
```

Where:
- `a, d` = scale and rotation components
- `b, c` = rotation and skew components  
- `tx, ty` = translation (x, y position)

We calculate:
- Scale: `√(a² + b²)` and `√(c² + d²)`
- Rotation: `atan2(b, a) * 180/π`

### Initialization Timing:
- 100ms delay ensures all React state updates complete
- Prevents race conditions with rapid element selection
- Long enough for browser to parse and apply styles

### Computed Styles:
Using `getComputedStyle()` ensures we get:
- Final rendered values
- Inherited properties
- Resolved units (px, not em/rem)
- Accurate color values (rgb, not keywords)

## Result

✅ Properties panel now works like professional editors (Figma, Webflow, Rive)
✅ Always shows accurate current values
✅ No unwanted style applications
✅ Clean element switching
✅ Proper transform parsing
✅ Keyframes only when user edits

The properties panel is now truly non-destructive and reads the page as it actually is! 🎉

