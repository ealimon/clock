# Large Clock

A clean, large-faced clock and date application crafted for desk, wall, and nightstand glanceability.

## Features

- **Multiple Clock Faces**:
  - **Digital**: Ultra-large tabular numerals with AM/PM indicator and smooth colon pulse.
  - **Analog**: Vector dial with precision tick marks, hour numerals, sweeping/ticking second hand, and watch-style date aperture.
  - **Flip**: Split-flap retro mechanical card style.
  - **Dual**: Side-by-side analog and digital faces for wide displays.
- **Prominent Date Display**:
  - Day of the week in bold display type.
  - Full calendar date (customizable to Full, Standard, Compact, or ISO formats).
  - Day-of-year, week-of-year, and local timezone details.
- **Color Themes**:
  - **Studio Dark**: Modern charcoal slate.
  - **OLED Black**: Pure #000000 background for bedside nightstands and battery efficiency.
  - **Paper Light**: High-contrast Swiss Bauhaus/Mondaine aesthetic.
  - **Warm Amber**: Low blue-light mode for evening relaxation.
  - **Sage**: Calm muted forest aesthetic.
- **Glanceable Controls**:
  - Auto-hiding control toolbar on mouse/touch inactivity.
  - 12-hour / 24-hour toggle.
  - Seconds toggle.
  - Optional soft acoustic tick and hourly chime (Web Audio API).
  - Fullscreen display toggle.
  - Keyboard shortcuts (`F` for fullscreen, `M` for mode, `T` for theme, `S` for seconds, `2` for 12/24h, `D` for date).

## Tech Stack

- **React 19**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Lucide Icons**

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm / yarn

### Installation

```bash
# Clone the repository
git clone <your-repository-url>
cd large-clock

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open `http://localhost:3000` to view the application in your browser.

### Building for Production

```bash
npm run build
npm run preview
```

## License

Apache-2.0
