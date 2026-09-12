# UI Design System

## Design Tokens

### Colors

```css
--bg-primary:    #171717    /* Main background */
--bg-panel:      #202020    /* Sidebar/panel background */
--bg-panel-hover:#2A2A2A    /* Panel hover state */
--bg-elevated:   #282828    /* Elevated surfaces */
--bg-canvas:     #1a1a1a    /* Canvas viewport */

--border-primary:#303030    /* Primary border */
--border-subtle: #262626    /* Subtle divider */

--text-primary:  #F5F5F5    /* Primary text */
--text-secondary:#A3A3A3    /* Secondary text */
--text-tertiary: #6B6B6B    /* Placeholder/disabled */

--accent:        #FF6A00    /* Primary action/selection */
--accent-hover:  #FF8020    /* Accent hover */
--accent-muted:  rgba(255,106,0,0.12)  /* Accent background */

--success:       #22C55E
--warning:       #F59E0B
--danger:        #EF4444
```

### Typography

```css
--font-family: 'Inter', system-ui, sans-serif
--font-mono:   'SF Mono', 'Fira Code', monospace

--text-xs:  11px   /* Small labels, badges */
--text-sm:  12px   /* Secondary text */
--text-base:13px   /* Body text */
--text-md:  14px   /* Emphasized body */
--text-lg:  16px   /* Section titles */
--text-xl:  20px   /* Page titles */
--text-2xl: 24px   /* Header */

--weight-regular: 400
--weight-medium:  500
--weight-semibold:600
--weight-bold:    700

--leading-tight:  1.2
--leading-normal: 1.5
```

### Spacing (8px Grid)

```css
--space-1: 4px   --space-2: 8px   --space-3: 12px
--space-4: 16px  --space-5: 20px  --space-6: 24px
--space-8: 32px  --space-10:40px  --space-12:48px
```

### Border Radius

```css
--radius-sm: 4px    /* Inputs, small elements */
--radius-md: 8px    /* Buttons, panels */
--radius-lg: 12px   /* Dialogs, cards */
--radius-xl: 16px   /* Modal dialogs */
--radius-full: 9999px /* Avatars, pills */
```

### Shadows

```css
--shadow-sm: 0 1px 3px rgba(0,0,0,0.3)
--shadow-md: 0 4px 12px rgba(0,0,0,0.4)
--shadow-lg: 0 8px 32px rgba(0,0,0,0.5)
```

## Layout Structure

```
┌──────────────────────────────────────────────────────┐
│  TopNavigationBar (56px)                              │
├──────┬───────────────────────────────┬────────────────┤
│      │                               │                │
│ Left │    Canvas Area                │  Right         │
│Side  │    (dot grid bg)              │  Inspector     │
│ bar  │    phone frame                │  (320px)       │
│(260px)│   ░░░░░░░░░░░░░░            │  Layers        │
│      │    zoom + pan                 │  Position      │
│      │                               │  Appearance    │
│      │                               │  Animation     │
├──────┴───────────────────────────────┴────────────────┤
│  BottomStatusBar (32px)                               │
└──────────────────────────────────────────────────────┘
```

## Interaction Guidelines

- All interactive elements have `transition: 150ms ease`
- Hover states use `background: var(--bg-panel-hover)`
- Active/selected states use `var(--accent-muted)` background
- No browser default styles (button, input, select all reset)
- Scrollbar is custom 6px dark style
- Focus state uses accent color border
