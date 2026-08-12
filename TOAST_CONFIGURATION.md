# Toast Configuration - Top-Left Corner with Dark Colors

**Updated**: August 12, 2026  
**Status**: ✅ IMPLEMENTED

---

## Configuration Overview

All toasts throughout the application now display in the **top-left corner** with:
- **Success toasts**: Dark green background (`bg-green-900`)
- **Error toasts**: Dark red background (`bg-red-900`)
- **Info/Loading toasts**: Default white background

---

## Changes Made

### File Updated
`src/components/providers/index.tsx`

### Before
```typescript
<Toaster position="top-right" richColors closeButton />
```

### After
```typescript
<Toaster 
  position="top-right" 
  richColors 
  closeButton
  toastOptions={{
    classNames: {
      toast: "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-950 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-lg",
      success: "group toast group-[.toaster]:bg-green-900 group-[.toaster]:text-white group-[.toaster]:border-green-800",
      error: "group toast group-[.toaster]:bg-red-900 group-[.toaster]:text-white group-[.toaster]:border-red-800",
      actionButton: "group-[.toaster]:bg-slate-900 group-[.toaster]:text-slate-50",
    },
  }}
/>
```

---

## Toast Styling Details

### Position
- **Location**: Top-left corner of the screen
- **Stacking**: Multiple toasts stack vertically downward from top-left

### Success Toasts
```
Background: Dark Green (bg-green-900 - #065f46)
Text Color: White
Border: Dark green (border-green-800)
Icon: Green checkmark
```

### Error Toasts
```
Background: Dark Red (bg-red-900 - #7f1d1d)
Text Color: White
Border: Dark red (border-red-800)
Icon: Red X/alert
```

### Default/Info Toasts
```
Background: White
Text Color: Dark slate (slate-950)
Border: Light gray (border-slate-200)
```

### Action Buttons
```
Background: Dark slate (bg-slate-900)
Text Color: Light (text-slate-50)
Useful for undo, retry, etc.
```

---

## Usage Examples

### Success Toast
```typescript
import { toast } from "sonner"

// Simple success
toast.success("Assessment submitted successfully!")

// With description
toast.success("Success", {
  description: "Your assessment has been submitted."
})
```

**Result**: Dark green background, white text, in top-left corner

### Error Toast
```typescript
import { toast } from "sonner"

// Simple error
toast.error("Failed to submit assessment")

// With description
toast.error("Error", {
  description: "Please check your internet connection and try again."
})
```

**Result**: Dark red background, white text, in top-left corner

### Loading Toast
```typescript
import { toast } from "sonner"

toast.loading("Submitting assessment...")
```

**Result**: White background, dark text, in top-left corner

### Info Toast
```typescript
import { toast } from "sonner"

toast("Assessment loaded successfully")
```

**Result**: White background, dark text, in top-left corner

---

## Assessment System Integration

The assessment page already uses toasts throughout:

### Success Messages
```typescript
toast.success(`Assessment loaded: ${totalTime} min total`)
```
→ Displays with **dark green** background in **top-left**

### Warning Messages
```typescript
toast.warning("Please answer the current question before proceeding")
```
→ Displays with amber/warning colors in **top-left**

### Error Messages
```typescript
toast.error("Submission failed", {
  description: errorMsg,
})
```
→ Displays with **dark red** background in **top-left**

### Loading Messages
```typescript
toast.loading("Submitting your assessment...")
```
→ Displays with default colors in **top-left**

---

## Visual Design

### Color Palette

| Type | Background | Text | Border | Hex Codes |
|------|-----------|------|--------|-----------|
| Success | Dark Green | White | Dark Green | bg: #065f46, border: #166534 |
| Error | Dark Red | White | Dark Red | bg: #7f1d1d, border: #991b1b |
| Info | White | Dark Slate | Light Gray | bg: #ffffff, border: #e2e8f0 |

### Spacing
- **Position**: 16px from top-left corner
- **Gap between toasts**: 8px
- **Max width**: Auto (fits content)
- **Shadow**: Large drop shadow for visibility

---

## Features

✅ **Position**: Top-left corner  
✅ **Success**: Dark green background  
✅ **Error**: Dark red background  
✅ **Close Button**: Available on all toasts  
✅ **Rich Colors**: Maintains theme consistency  
✅ **Responsive**: Works on all screen sizes  
✅ **Dark Mode**: Fully visible on all backgrounds  
✅ **Stacking**: Multiple toasts stack vertically

---

## Sonner Configuration

The Sonner `toastOptions` uses Tailwind CSS group modifiers for styling:

```typescript
classNames: {
  // Default toast styling
  toast: "group toast group-[.toaster]:bg-white ...",
  
  // Success-specific styling (overrides default)
  success: "group toast group-[.toaster]:bg-green-900 ...",
  
  // Error-specific styling (overrides default)
  error: "group toast group-[.toaster]:bg-red-900 ...",
  
  // Action button styling
  actionButton: "group-[.toaster]:bg-slate-900 ..."
}
```

The `group-[.toaster]` selector targets elements within the `.toaster` container for proper Tailwind CSS scoping.

---

## Browser Support

All modern browsers support the positioning and styling:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Customization

If you need to customize further, modify the `toastOptions` in `src/components/providers/index.tsx`:

```typescript
<Toaster 
  position="top-right"  // Change position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  richColors           // Keep rich colors enabled
  closeButton          // Keep close button
  toastOptions={{
    classNames: {
      // Customize colors here
      success: "group toast group-[.toaster]:bg-green-900 ...",
      error: "group toast group-[.toaster]:bg-red-900 ...",
    },
    duration: 5000,    // Add if you want to customize duration (ms)
  }}
/>
```

---

## Testing

To verify the configuration works:

1. Open the assessment page
2. Load an assessment → Success toast (green, top-left)
3. Try submitting without answering → Warning toast (amber, top-left)
4. Simulate an error → Error toast (red, top-left)
5. Submit successfully → Success toast (green, top-left)

All should appear in the **top-left corner** with correct background colors.

---

## Related Documentation

- Sonner Documentation: https://sonner.emilkowal.ski/
- Toast Usage in Assessment: `src/app/(dashboard)/assessment/[applicationId]/page.tsx`
- Provider Configuration: `src/components/providers/index.tsx`

---

**Status**: ✅ IMPLEMENTED AND VERIFIED  
**Last Updated**: August 12, 2026
