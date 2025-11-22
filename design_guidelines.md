# Design Guidelines: Rektbot Liquidation Dashboard

## Design Approach

**Reference-Based Approach** drawing from leading crypto analytics and trading platforms:
- **Primary References**: TradingView (data visualization), Dune Analytics (crypto metrics), Glassnode (time series clarity)
- **Key Principles**: Data-first hierarchy, functional efficiency, instant readability, minimal cognitive load

This is a specialized analytics tool where clarity and data accessibility trump visual flair.

---

## Layout System

**Spacing Primitives**
Use Tailwind units: **2, 4, 6, 8, 12, 16** (e.g., p-4, gap-6, mb-8)
- Component spacing: 4-6 units
- Section spacing: 12-16 units  
- Container padding: 6-8 units

**Grid Structure**
- Full-width dashboard layout with max-w-7xl container
- Single-column on mobile, expand to multi-column on desktop (lg:)
- Chart area takes 100% width, stats grid at 2-3 columns

---

## Typography

**Font Stack**
- Primary: Inter or Roboto (via Google Fonts CDN) - excellent for data/numbers
- Monospace: JetBrains Mono for numeric data, timestamps, addresses

**Hierarchy**
- Dashboard Title: text-2xl/3xl, font-semibold
- Section Headers: text-lg/xl, font-medium
- Chart Labels: text-sm, font-normal
- Data Values: text-base/lg, font-mono for numbers
- Timestamps: text-xs/sm, font-mono, opacity-75

---

## Component Library

### Navigation/Header
- Compact top bar (h-16) with dashboard title on left
- Time range selector (Day/Week/Month buttons) on right
- Sticky positioning for persistent access

### Chart Section
- Primary real estate: dual time series line chart (Long vs Short liquidations)
- Chart container with subtle border, rounded corners (rounded-lg)
- Height: 400-500px on desktop, 300px on mobile
- Use Chart.js or similar for rendering (not custom implementation)
- Legend positioned top-right within chart area
- Interactive tooltips on hover showing exact values + timestamps

### Statistics Grid
Below chart: 3-column grid (1-col mobile) showing:
- Total Long Rekt (count + recent 24h)
- Total Short Rekt (count + recent 24h)  
- Long/Short Ratio metric

Each stat card: p-6, border, rounded-lg
- Large numeric value (text-3xl, font-mono)
- Small descriptive label (text-sm, opacity-75)
- Optional trend indicator (↑/↓ with percentage)

### Time Range Selector
Button group with pill-style design:
- Three buttons: "24H" | "7D" | "30D"
- Active state: filled background
- Inactive: border only, transparent fill
- Rounded corners on outer buttons (rounded-l/rounded-r)

### Live Status Indicator
Small badge in header showing connection status:
- "Live" with pulsing dot when connected
- "Connecting..." when initializing
- "Error" state if relay connection fails

### Recent Events List (Optional Enhancement)
Scrollable list below stats showing last 10-20 liquidations:
- Each row: timestamp | type badge | message excerpt
- Alternating subtle background for rows
- Fixed height with overflow-y-scroll

---

## Layout Structure

```
[Header Bar - sticky]
  - Dashboard Title | Time Selector + Live Status

[Main Container - max-w-7xl, px-6/8]
  
  [Chart Section - mb-12]
    - Time Series Chart (full width)
  
  [Stats Grid - mb-12]
    - 3 metric cards (grid-cols-1 md:grid-cols-3, gap-6)
  
  [Recent Events List - optional]
    - Scrollable table/list
```

---

## Visual Treatment

**Borders & Elevation**
- Subtle borders (border, not border-2) for card separation
- Rounded corners: rounded-lg for cards, rounded-md for buttons
- No heavy shadows - prefer single border definition

**Spacing Rhythm**
- Consistent vertical spacing: sections separated by mb-12 to mb-16
- Inner card padding: p-6 standard
- Grid gaps: gap-4 to gap-6

---

## Icons

**Library**: Heroicons (via CDN)
- Chart icon for dashboard title
- Arrow trend icons for statistics
- Clock icon for timestamps
- Wifi/signal icon for connection status

Use outline style primarily, solid for active states.

---

## Responsive Behavior

**Mobile (base)**
- Stack all elements vertically
- Chart height reduces to 300px
- Stats grid becomes single column
- Hide optional elements if space-constrained

**Desktop (lg:)**
- Multi-column layouts expand
- Chart at full 500px height
- Stats grid at 3 columns
- More generous spacing (12-16 units)

---

## Performance Considerations

- Chart renders on canvas (not DOM-heavy SVG)
- Limit recent events list to 20 items max
- Lazy load historical data when time range changes
- Loading states for chart while fetching data

---

## Images

**No hero images required** - this is a data dashboard, not marketing.

Background treatment: solid color or extremely subtle gradient if needed for visual interest, but prioritize clean, distraction-free data presentation.