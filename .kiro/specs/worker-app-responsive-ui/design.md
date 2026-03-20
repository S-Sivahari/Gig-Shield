# Design Document: Worker App Responsive UI

## Overview

This design document specifies the technical approach for implementing responsive design capabilities and enhanced visual aesthetics in the GigShield Worker App. The Worker App is a React + TypeScript application built with Vite, currently optimized for a fixed mobile width (390px). This enhancement will transform it into a fully responsive application that adapts seamlessly between mobile (≤768px) and desktop (>768px) viewports while introducing modern UI enhancements including elevation shadows, smooth transitions, gradient backgrounds, and micro-interactions.

The implementation follows a mobile-first approach with progressive enhancement for larger screens. All changes are purely presentational and do not modify the existing database schema, API contracts, or business logic. The design leverages CSS custom properties, media queries, and CSS transforms for performance-optimized responsive behavior.

### Key Design Principles

1. **Mobile-First Progressive Enhancement**: Base styles target mobile viewports with media queries adding desktop enhancements
2. **Zero Breaking Changes**: All modifications are additive; existing functionality remains intact
3. **Performance-Optimized**: Use CSS transforms and GPU acceleration for animations; debounce resize events
4. **Accessibility-First**: Maintain WCAG AA contrast ratios; ensure keyboard navigation and screen reader compatibility
5. **Design System Consistency**: Enforce strict adherence to the specified color palette, spacing, and typography scales

### Scope Boundaries

**In Scope:**
- Responsive layout system with 768px breakpoint
- Component-level responsive behavior (padding, typography, spacing)
- Navigation adaptation (bottom bar → sidebar)
- Profile icon click navigation
- Visual enhancements (shadows, transitions, gradients, animations)
- Cross-browser compatibility

**Out of Scope:**
- Database schema modifications
- API endpoint changes
- New feature additions beyond the audit list
- Authentication logic changes
- Business logic modifications
- Backend service changes

## Architecture

### Responsive Architecture Strategy

The responsive system is implemented through a layered CSS architecture:

```
┌─────────────────────────────────────────────────┐
│         index.css (Global Styles)               │
│  - CSS Custom Properties (Design Tokens)        │
│  - Responsive Breakpoint Variables              │
│  - Global Animations & Utilities                │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│      Component-Level CSS Modules                │
│  - Base Mobile Styles (default)                 │
│  - Desktop Media Queries (@media min-width)     │
│  - Component-Specific Responsive Rules          │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│         React Component Layer                    │
│  - useMediaQuery Hook (viewport detection)      │
│  - Conditional Rendering (nav layout)           │
│  - Event Handlers (profile navigation)          │
└─────────────────────────────────────────────────┘
```

### Viewport Detection Strategy

A custom `useMediaQuery` React hook provides viewport state to components requiring conditional rendering:

```typescript
// hooks/useMediaQuery.ts
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [query]);
  
  return matches;
}
```

This hook enables components like `BottomNav` to adapt their layout based on viewport size without prop drilling or context overhead.

### CSS Custom Properties Strategy

All responsive values are defined as CSS custom properties with mobile defaults and desktop overrides:

```css
:root {
  /* Mobile defaults */
  --spacing-page: 16px;
  --font-size-h1: 24px;
  --icon-size-nav: 24px;
  --container-max-width: 390px;
}

@media (min-width: 769px) {
  :root {
    --spacing-page: 20px;        /* +25% */
    --font-size-h1: 27px;        /* +12.5% */
    --icon-size-nav: 28px;       /* +16.7% */
    --container-max-width: 1024px;
  }
}
```

This approach centralizes responsive logic and enables consistent scaling across all components.

### Navigation Layout Transformation

The `BottomNav` component uses CSS Grid with media query-driven layout changes:

**Mobile (≤768px):**
- Fixed position at bottom
- Horizontal grid layout (5 columns)
- Icons + labels stacked vertically

**Desktop (>768px):**
- Fixed position on left side
- Vertical grid layout (5 rows)
- Icons + labels in horizontal arrangement
- Increased width (200px)

The transformation is achieved through CSS without JavaScript layout calculations, ensuring smooth transitions and optimal performance.

## Components and Interfaces

### 1. Responsive Layout System

#### Root Container Enhancement

**File:** `frontend/worker-app/src/index.css`

**Changes:**
- Add desktop breakpoint media query
- Update `#root` max-width for desktop
- Add responsive CSS custom properties

```css
@media (min-width: 769px) {
  :root {
    --mobile-max-width: 1024px;
    --spacing-page: 20px;
    --spacing-card: 20px;
    --font-size-base: 16px;
    --font-size-h1: 27px;
    --font-size-h2: 22px;
    --font-size-h3: 18px;
  }
  
  #root {
    max-width: 1024px;
  }
}
```

#### useMediaQuery Hook

**File:** `frontend/worker-app/src/hooks/useMediaQuery.ts` (new file)

**Interface:**
```typescript
export function useMediaQuery(query: string): boolean;

// Usage:
const isDesktop = useMediaQuery('(min-width: 769px)');
```

**Implementation:**
- Uses `window.matchMedia` API
- Adds event listener for viewport changes
- Returns boolean state
- Cleans up listener on unmount

### 2. Component Responsive Behavior

#### Card Component Enhancement

**File:** `frontend/worker-app/src/components/Card.css`

**Changes:**
- Add 3-level shadow system
- Implement hover effects for desktop
- Add responsive padding

```css
.gs-card {
  padding: 16px;
  transition: transform 300ms ease-in-out, box-shadow 300ms ease-in-out;
}

.gs-card--white {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); /* medium shadow */
}

@media (min-width: 769px) {
  .gs-card {
    padding: 20px; /* +25% */
  }
  
  .gs-card--white:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* high shadow */
    cursor: pointer;
  }
}
```

**Shadow System:**
- Low: `0 2px 4px rgba(0, 0, 0, 0.04)`
- Medium: `0 2px 8px rgba(0, 0, 0, 0.06)`
- High: `0 4px 12px rgba(0, 0, 0, 0.1)`

#### Button Component Enhancement

**File:** `frontend/worker-app/src/components/Button.css`

**Changes:**
- Add responsive padding and font size
- Implement hover and active states
- Add loading state styles

```css
.gs-button {
  padding: 12px 24px;
  font-size: 15px;
  transition: all 300ms ease-in-out;
  min-height: 44px; /* Touch target size */
}

@media (min-width: 769px) {
  .gs-button {
    padding: 14px 28px; /* +16.7% */
    font-size: 16px;
  }
  
  .gs-button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }
}

.gs-button:active:not(:disabled) {
  transform: scale(0.98);
}
```

#### Input Component Enhancement

**File:** `frontend/worker-app/src/components/Input.css`

**Changes:**
- Add responsive padding and font size
- Enhanced focus states with colored borders
- Smooth transitions

```css
.gs-input {
  padding: 12px 16px;
  font-size: 15px;
  border: 1.5px solid var(--border-color);
  transition: border-color 300ms ease-in-out, box-shadow 300ms ease-in-out;
}

.gs-input:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

@media (min-width: 769px) {
  .gs-input {
    padding: 14px 18px; /* +16.7% */
    font-size: 16px;
  }
}
```

### 3. Navigation Responsive Adaptation

#### BottomNav Component Transformation

**File:** `frontend/worker-app/src/components/layout/BottomNav.tsx`

**Interface Changes:**
```typescript
export const BottomNav: React.FC = () => {
  const isDesktop = useMediaQuery('(min-width: 769px)');
  
  return (
    <nav className={`gs-bottom-nav ${isDesktop ? 'gs-bottom-nav--desktop' : ''}`}>
      {/* Navigation items */}
    </nav>
  );
};
```

**File:** `frontend/worker-app/src/components/layout/BottomNav.css`

**Mobile Layout (default):**
```css
.gs-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  background: var(--bg-primary);
  border-top: 1px solid var(--border-color);
  padding: 8px 0;
  z-index: 100;
}

.gs-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  transition: all 300ms ease-in-out;
}

.gs-nav-icon {
  width: 24px;
  height: 24px;
}

.gs-nav-label {
  font-size: 11px;
}
```

**Desktop Layout:**
```css
@media (min-width: 769px) {
  .gs-bottom-nav--desktop {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    right: auto;
    width: 200px;
    grid-template-columns: 1fr;
    grid-template-rows: repeat(5, auto);
    border-top: none;
    border-right: 1px solid var(--border-color);
    padding: 24px 0;
    gap: 8px;
  }
  
  .gs-bottom-nav--desktop .gs-nav-item {
    flex-direction: row;
    justify-content: flex-start;
    padding: 12px 20px;
    gap: 12px;
  }
  
  .gs-bottom-nav--desktop .gs-nav-icon {
    width: 28px;
    height: 28px;
  }
  
  .gs-bottom-nav--desktop .gs-nav-label {
    font-size: 15px;
  }
  
  .gs-bottom-nav--desktop .gs-nav-item:hover {
    background-color: var(--light-blue-fill);
  }
}
```

#### MainLayout Adjustment

**File:** `frontend/worker-app/src/components/layout/MainLayout.css`

**Changes:**
- Add responsive padding for desktop sidebar
- Adjust content area margins

```css
.gs-main-content {
  padding-bottom: 80px; /* Space for bottom nav */
}

@media (min-width: 769px) {
  .gs-main-content {
    margin-left: 200px; /* Space for sidebar */
    padding-bottom: 0;
  }
}
```

### 4. Profile Navigation

#### Dashboard Profile Icon Enhancement

**File:** `frontend/worker-app/src/pages/main/Dashboard.tsx`

**Changes:**
- Add onClick handler to profile avatar
- Add cursor pointer styling

```typescript
export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const handleProfileClick = () => {
    navigate('/profile');
  };
  
  return (
    <div className="gs-dashboard-page animate-fade-in">
      <div className="gs-dash-header">
        <div className="gs-dash-greeting-row">
          <div>
            <h1 className="gs-dash-greeting">Good morning,</h1>
            <p className="gs-dash-name">Ramesh Kumar</p>
          </div>
          <div 
            className="gs-avatar gs-avatar--clickable" 
            onClick={handleProfileClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleProfileClick()}
            aria-label="Go to profile"
          >
            RK
          </div>
        </div>
        {/* Rest of dashboard */}
      </div>
    </div>
  );
};
```

**File:** `frontend/worker-app/src/pages/main/Dashboard.css`

**Changes:**
```css
.gs-avatar--clickable {
  cursor: pointer;
  transition: transform 300ms ease-in-out, box-shadow 300ms ease-in-out;
}

.gs-avatar--clickable:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
}

.gs-avatar--clickable:active {
  transform: scale(0.95);
}
```

### 5. Enhanced Visual Design System

#### Global Shadow System

**File:** `frontend/worker-app/src/index.css`

**Addition:**
```css
:root {
  /* Shadow system */
  --shadow-low: 0 2px 4px rgba(0, 0, 0, 0.04);
  --shadow-medium: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-high: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  /* Transition timing */
  --transition-fast: 150ms ease-in-out;
  --transition-normal: 300ms ease-in-out;
  --transition-slow: 500ms ease-in-out;
}
```

#### Gradient Utilities

**File:** `frontend/worker-app/src/index.css`

**Addition:**
```css
.gradient-blue-white {
  background: linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%);
}

.gradient-auth-bg {
  background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
}
```

### 6. Auth Pages Visual Enhancement

#### Login Page Enhancement

**File:** `frontend/worker-app/src/pages/auth/Login.tsx`

**Changes:**
- Add gradient background wrapper
- Implement staggered animations

```typescript
export const Login: React.FC = () => {
  return (
    <div className="gs-auth-page">
      <div className="gs-auth-background gradient-auth-bg" />
      <div className="gs-auth-content animate-stagger">
        <div className="gs-auth-logo animate-stagger-item" style={{ animationDelay: '0ms' }}>
          {/* Logo */}
        </div>
        <div className="gs-auth-form animate-stagger-item" style={{ animationDelay: '100ms' }}>
          {/* Form fields */}
        </div>
      </div>
    </div>
  );
};
```

**File:** `frontend/worker-app/src/pages/auth/Login.css` (new styles)

**Addition:**
```css
.gs-auth-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.gs-auth-background {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.gs-auth-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
}

@keyframes staggerFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-stagger-item {
  animation: staggerFadeIn 500ms ease-out forwards;
  opacity: 0;
}
```

### 7. Dashboard Visual Enhancement

#### Protection Card Gradient

**File:** `frontend/worker-app/src/pages/main/Dashboard.css`

**Changes:**
```css
.gs-protection-card {
  background: linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%);
  border: 1px solid var(--light-blue-border);
  border-radius: var(--radius-card);
  padding: 20px;
  box-shadow: var(--shadow-medium);
  transition: box-shadow 300ms ease-in-out;
}

@media (min-width: 769px) {
  .gs-protection-card {
    padding: 24px;
  }
  
  .gs-protection-card:hover {
    box-shadow: var(--shadow-high);
  }
}
```

#### Scroll-Based Animations

**File:** `frontend/worker-app/src/pages/main/Dashboard.tsx`

**Changes:**
- Add Intersection Observer for metric cards

```typescript
export const Dashboard: React.FC = () => {
  const metricRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );
    
    metricRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <div className="gs-dashboard-page">
      {/* ... */}
      <div className="gs-metric-grid mt-4">
        {[0, 1, 2, 3].map((index) => (
          <Card 
            key={index}
            ref={(el) => (metricRefs.current[index] = el)}
            className="gs-metric-card"
          >
            {/* Metric content */}
          </Card>
        ))}
      </div>
    </div>
  );
};
```

**File:** `frontend/worker-app/src/pages/main/Dashboard.css`

**Addition:**
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 500ms ease-out forwards;
}

.gs-metric-card {
  opacity: 0;
  transition: transform 300ms ease-in-out;
}

@media (min-width: 769px) {
  .gs-metric-card:hover {
    transform: scale(1.02);
    cursor: pointer;
  }
}
```

### 8. Responsive Images and Icons

#### Icon Sizing System

**File:** `frontend/worker-app/src/index.css`

**Addition:**
```css
:root {
  --icon-size-nav: 24px;
  --icon-size-inline: 16px;
  --icon-size-large: 32px;
}

@media (min-width: 769px) {
  :root {
    --icon-size-nav: 28px;    /* +16.7% */
    --icon-size-inline: 20px; /* +25% */
    --icon-size-large: 40px;  /* +25% */
  }
}
```

All icon components from `lucide-react` should use these CSS custom properties:

```typescript
<Home size={24} className="gs-nav-icon" />
// CSS: .gs-nav-icon { width: var(--icon-size-nav); height: var(--icon-size-nav); }
```

### 9. Performance Optimizations

#### Resize Event Debouncing

**File:** `frontend/worker-app/src/hooks/useMediaQuery.ts`

**Enhancement:**
```typescript
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    return window.matchMedia(query).matches;
  });
  
  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Debounced listener to prevent excessive re-renders
    let timeoutId: number;
    const listener = (e: MediaQueryListEvent) => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setMatches(e.matches);
      }, 100);
    };
    
    media.addEventListener('change', listener);
    return () => {
      clearTimeout(timeoutId);
      media.removeEventListener('change', listener);
    };
  }, [query]);
  
  return matches;
}
```

#### CSS Transform Usage

All animations use CSS transforms instead of layout properties for GPU acceleration:

```css
/* ✅ Good - uses transform */
.gs-card:hover {
  transform: scale(1.02);
}

/* ❌ Bad - triggers layout reflow */
.gs-card:hover {
  width: 102%;
  height: 102%;
}
```

#### Lazy Loading Non-Critical CSS

**File:** `frontend/worker-app/src/main.tsx`

**Enhancement:**
```typescript
// Critical CSS loaded immediately
import './index.css';

// Non-critical animation CSS loaded after initial render
setTimeout(() => {
  import('./animations.css');
}, 0);
```

## Data Models

This feature does not introduce new data models or modify existing ones. All changes are presentational and confined to the frontend layer. The existing data structures remain unchanged:

- User authentication state (managed by React Router and local state)
- Dashboard metrics (mock data with clearly labeled constants)
- Navigation state (React Router location)

### Mock Data Pattern

All components displaying data follow this pattern:

```typescript
// ─── MOCK DATA — replace with API call later ───────
const MOCK_WORKER_NAME = "Ramesh Kumar";
const MOCK_GIGSCORE = 78;
const MOCK_COVERAGE_AMOUNT = 3360;
const MOCK_PREMIUM_PAID = 89;
const MOCK_PREMIUM_TOTAL = 89;
// ────────────────────────────────────────────────────

export const Dashboard: React.FC = () => {
  // Component implementation using mock data
};
```

This pattern ensures:
1. Clear visibility of placeholder data
2. Easy identification for future API integration
3. Consistent formatting across all components
4. No confusion between real and mock data


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies:

1. **Viewport layout properties (1.1, 1.2)** can be combined into a single property about viewport-based max-width
2. **Component padding properties (2.1)** and **icon sizing properties (8.1, 8.3)** follow the same pattern and can be generalized
3. **Navigation position properties (3.1, 3.2)** can be combined into a single property about viewport-based positioning
4. **Hover effect properties (4.2, 5.4, 7.4)** all test the same pattern and can be consolidated
5. **Auth page responsive behavior (6.5)** is redundant with requirements 1.1 and 1.2

The following properties represent the unique, testable correctness guarantees:

### Property 1: Viewport-Based Container Width

*For any* viewport width, the app container max-width should be 390px when viewport ≤768px, and 1024px when viewport >768px, with the container centered on screen.

**Validates: Requirements 1.1, 1.2**

### Property 2: Proportional Scaling

*For any* UI component with responsive sizing, desktop viewport (>768px) should increase padding by 25% and font sizes by 10-15% compared to mobile viewport (≤768px).

**Validates: Requirements 1.3, 2.1, 2.2**

### Property 3: Layout Adjustment Without Reload

*For any* viewport resize event, the app layout should adjust to the new viewport size without triggering a page reload or losing application state.

**Validates: Requirements 1.4**

### Property 4: Interactive Functionality Preservation

*For any* interactive element (button, link, input), functionality should remain intact before and after viewport breakpoint transitions.

**Validates: Requirements 1.5, 3.5**

### Property 5: Card Proportional Spacing

*For any* Card component, aspect ratio and internal spacing proportions should remain consistent across all viewport sizes.

**Validates: Requirements 2.3**

### Property 6: Minimum Touch Target Size

*For any* Button component on mobile viewport (≤768px), the computed dimensions should be at least 44x44 pixels to meet touch target accessibility requirements.

**Validates: Requirements 2.4**

### Property 7: Input Width Constraints

*For any* Input component on desktop viewport (>768px), the width should expand to fill available space while not exceeding the defined maximum width constraint.

**Validates: Requirements 2.5**

### Property 8: Navigation Position Adaptation

*For any* viewport size, the BottomNav component should be positioned at the bottom of the screen when viewport ≤768px, and positioned as a left sidebar when viewport >768px.

**Validates: Requirements 3.1, 3.2**

### Property 9: Navigation Link Preservation

*For any* viewport size, the BottomNav component should contain all five navigation links (Home, Policy, Zone, Payouts, Profile) with active state indicators functioning correctly.

**Validates: Requirements 3.3**

### Property 10: Profile Icon Navigation

*For any* click event on the Dashboard profile icon, the app should navigate to the /profile route while preserving authentication state.

**Validates: Requirements 4.1, 4.5**

### Property 11: Profile Icon Interactive States

*For any* viewport size, the profile icon should display hover state styles on desktop (>768px) and pressed state styles on mobile (≤768px) when interacted with.

**Validates: Requirements 4.2, 4.3**

### Property 12: Profile Icon Position Stability

*For any* changes to the Dashboard, the profile icon should maintain its position in the header and its base styling (size, color, border-radius).

**Validates: Requirements 4.4**

### Property 13: Shadow System Consistency

*For any* Card component, the applied box-shadow should match one of the three defined shadow levels: low (0 2px 4px), medium (0 2px 8px), or high (0 4px 12px).

**Validates: Requirements 5.1**

### Property 14: Transition Timing Consistency

*For any* interactive element with state changes, the CSS transition property should include a duration of 300ms with ease-in-out timing function.

**Validates: Requirements 5.2**

### Property 15: Border Radius Consistency

*For any* component, the border-radius should match the design system specification: Card (12px), Button (12px), Input (10px), Badge (20px).

**Validates: Requirements 5.3**

### Property 16: Desktop Hover Effects

*For any* clickable element on desktop viewport (>768px), hovering should trigger a visual change (transform, shadow, or background color).

**Validates: Requirements 5.4, 7.4**

### Property 17: WCAG AA Contrast Compliance

*For any* text element or interactive element, the contrast ratio between foreground and background colors should meet or exceed WCAG AA standards (4.5:1 for normal text, 3:1 for large text).

**Validates: Requirements 5.5**

### Property 18: Auth Page Gradient Background

*For any* auth page (Login, OTP, Registration), the page should have a gradient background applied using the defined gradient utility classes.

**Validates: Requirements 6.1**

### Property 19: Auth Input Focus States

*For any* Input component on auth pages, focusing the input should apply a colored border (primary blue) and a subtle box-shadow.

**Validates: Requirements 6.3**

### Property 20: Dashboard Protection Card Gradient

*For any* render of the Dashboard, the protection card should have a gradient background from light blue (#EFF6FF) to white (#FFFFFF).

**Validates: Requirements 7.1**

### Property 21: Dashboard Font Weight Hierarchy

*For any* text element on the Dashboard, the font-weight should be one of the specified values: 400 (normal), 500 (medium), or 600 (semibold).

**Validates: Requirements 7.3**

### Property 22: Icon Size Scaling

*For any* icon element, the size should be 20% larger on desktop viewport (>768px) compared to mobile viewport (≤768px), with context-specific base sizes (nav: 24px→28px, inline: 16px→20px).

**Validates: Requirements 8.1, 8.3**

### Property 23: SVG Icon Format

*For any* icon element in the application, the element type should be SVG to ensure crisp rendering at all scales.

**Validates: Requirements 8.2**

### Property 24: Icon Color Consistency

*For any* icon element, the color should be defined using CSS custom properties from the design system (e.g., var(--primary-blue), var(--text-muted)).

**Validates: Requirements 8.4**

### Property 25: Icon Accessibility Labels

*For any* icon element that conveys meaning or is interactive, the element should have an appropriate aria-label attribute for screen reader accessibility.

**Validates: Requirements 8.5**

### Property 26: CSS Transform Animation Usage

*For any* animated element, the animation should use CSS transform properties (translate, scale, rotate) rather than layout properties (width, height, top, left) for GPU acceleration.

**Validates: Requirements 9.4**

### Property 27: Resize Event Debouncing

*For any* sequence of viewport resize events, the resize handler should be debounced to limit execution frequency and prevent excessive re-renders.

**Validates: Requirements 9.5**

### Property 28: CSS Vendor Prefixes

*For any* CSS property with limited browser support (e.g., backdrop-filter, appearance), the stylesheet should include appropriate vendor prefixes (-webkit-, -moz-, -ms-).

**Validates: Requirements 10.3**

### Property 29: CSS Feature Fallbacks

*For any* modern CSS feature used (e.g., CSS Grid, custom properties), the stylesheet should provide fallback styles for browsers that don't support the feature.

**Validates: Requirements 10.4**

## Error Handling

### Viewport Detection Errors

**Scenario:** `window.matchMedia` is not supported in the browser

**Handling:**
- The `useMediaQuery` hook should check for `window.matchMedia` existence
- If unavailable, default to mobile layout (safer fallback)
- Log a warning to console for debugging

```typescript
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      console.warn('matchMedia not supported, defaulting to mobile layout');
      return false; // Default to mobile
    }
    return window.matchMedia(query).matches;
  });
  
  // ... rest of implementation
}
```

### CSS Custom Property Fallbacks

**Scenario:** Browser doesn't support CSS custom properties

**Handling:**
- Provide fallback values inline before custom property usage
- Use PostCSS plugin to generate fallback CSS during build

```css
.gs-card {
  padding: 16px; /* Fallback */
  padding: var(--spacing-card, 16px); /* With fallback in var() */
}
```

### Intersection Observer Unavailability

**Scenario:** Browser doesn't support Intersection Observer API

**Handling:**
- Check for Intersection Observer support before use
- If unavailable, show elements immediately without animation
- Use polyfill for older browsers if needed

```typescript
useEffect(() => {
  if (!('IntersectionObserver' in window)) {
    // Show all elements immediately
    metricRefs.current.forEach((ref) => {
      if (ref) ref.classList.add('animate-fade-in-up');
    });
    return;
  }
  
  // Normal Intersection Observer implementation
}, []);
```

### Navigation State Loss

**Scenario:** Navigation occurs but authentication state is lost

**Handling:**
- Verify authentication state is stored in persistent storage (localStorage/sessionStorage)
- Add error boundary around navigation to catch state loss
- Redirect to login if authentication state is missing after navigation

```typescript
const handleProfileClick = () => {
  try {
    const authState = localStorage.getItem('authState');
    if (!authState) {
      console.error('Auth state missing, redirecting to login');
      navigate('/login');
      return;
    }
    navigate('/profile');
  } catch (error) {
    console.error('Navigation error:', error);
    // Stay on current page
  }
};
```

### Resize Event Flooding

**Scenario:** Rapid resize events cause performance degradation

**Handling:**
- Implement debouncing in `useMediaQuery` hook (100ms delay)
- Use `requestAnimationFrame` for layout calculations
- Cancel pending operations on unmount

```typescript
useEffect(() => {
  let rafId: number;
  let timeoutId: number;
  
  const listener = (e: MediaQueryListEvent) => {
    clearTimeout(timeoutId);
    cancelAnimationFrame(rafId);
    
    timeoutId = window.setTimeout(() => {
      rafId = requestAnimationFrame(() => {
        setMatches(e.matches);
      });
    }, 100);
  };
  
  // ... rest of implementation
  
  return () => {
    clearTimeout(timeoutId);
    cancelAnimationFrame(rafId);
    media.removeEventListener('change', listener);
  };
}, [query]);
```

### Gradient Rendering Issues

**Scenario:** Browser doesn't render CSS gradients correctly

**Handling:**
- Provide solid color fallback before gradient
- Test gradient rendering in target browsers
- Use simpler gradient syntax for better compatibility

```css
.gs-protection-card {
  background-color: #EFF6FF; /* Fallback solid color */
  background: linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%);
}
```

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests** focus on:
- Specific examples of responsive behavior at exact breakpoints
- Edge cases (viewport exactly at 768px, very small/large viewports)
- Integration between components (MainLayout + BottomNav)
- Error conditions (missing matchMedia, no Intersection Observer)

**Property-Based Tests** focus on:
- Universal properties across all viewport sizes
- Proportional scaling relationships
- Consistency of design system values
- Accessibility requirements across all elements

### Property-Based Testing Configuration

**Library:** `fast-check` (JavaScript/TypeScript property-based testing library)

**Installation:**
```bash
npm install --save-dev fast-check @types/fast-check
```

**Configuration:**
- Minimum 100 iterations per property test
- Each test references its design document property
- Tag format: `Feature: worker-app-responsive-ui, Property {number}: {property_text}`

### Unit Test Examples

**Test File:** `frontend/worker-app/src/__tests__/responsive.test.tsx`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

describe('Responsive Layout System', () => {
  beforeEach(() => {
    // Reset viewport
    window.innerWidth = 375;
    window.innerHeight = 667;
  });
  
  it('should apply 390px max-width on mobile viewport', () => {
    window.innerWidth = 375;
    const { container } = render(
      <BrowserRouter>
        <div id="root">Test</div>
      </BrowserRouter>
    );
    
    const root = container.querySelector('#root');
    const styles = window.getComputedStyle(root!);
    expect(styles.maxWidth).toBe('390px');
  });
  
  it('should apply 1024px max-width on desktop viewport', () => {
    window.innerWidth = 1200;
    window.dispatchEvent(new Event('resize'));
    
    const { container } = render(
      <BrowserRouter>
        <div id="root">Test</div>
      </BrowserRouter>
    );
    
    const root = container.querySelector('#root');
    const styles = window.getComputedStyle(root!);
    expect(styles.maxWidth).toBe('1024px');
  });
  
  it('should handle viewport exactly at breakpoint (768px)', () => {
    window.innerWidth = 768;
    window.dispatchEvent(new Event('resize'));
    
    const { container } = render(
      <BrowserRouter>
        <div id="root">Test</div>
      </BrowserRouter>
    );
    
    const root = container.querySelector('#root');
    const styles = window.getComputedStyle(root!);
    // At exactly 768px, should use mobile layout
    expect(styles.maxWidth).toBe('390px');
  });
});

describe('Profile Icon Navigation', () => {
  it('should navigate to /profile when clicked', async () => {
    const { getByLabelText } = render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    const profileIcon = getByLabelText('Go to profile');
    fireEvent.click(profileIcon);
    
    await waitFor(() => {
      expect(window.location.pathname).toBe('/profile');
    });
  });
  
  it('should preserve auth state after navigation', async () => {
    localStorage.setItem('authState', JSON.stringify({ userId: '123' }));
    
    const { getByLabelText } = render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    const profileIcon = getByLabelText('Go to profile');
    fireEvent.click(profileIcon);
    
    await waitFor(() => {
      const authState = localStorage.getItem('authState');
      expect(authState).toBeTruthy();
      expect(JSON.parse(authState!).userId).toBe('123');
    });
  });
});

describe('Button Loading State', () => {
  it('should display loading indicator during form submission', async () => {
    const { getByRole, getByText } = render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const submitButton = getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(getByText(/loading/i)).toBeInTheDocument();
    });
  });
});

describe('Lazy CSS Loading', () => {
  it('should load animations.css after initial render', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      const animationStyles = document.querySelector('link[href*="animations"]');
      expect(animationStyles).toBeInTheDocument();
    }, { timeout: 1000 });
  });
});
```

### Property-Based Test Examples

**Test File:** `frontend/worker-app/src/__tests__/responsive.properties.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { render } from '@testing-library/react';

describe('Property-Based Tests: Responsive UI', () => {
  
  it('Property 1: Viewport-Based Container Width', () => {
    /**
     * Feature: worker-app-responsive-ui
     * Property 1: For any viewport width, the app container max-width 
     * should be 390px when viewport ≤768px, and 1024px when viewport >768px
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 2560 }), // viewport widths
        (viewportWidth) => {
          window.innerWidth = viewportWidth;
          window.dispatchEvent(new Event('resize'));
          
          const root = document.getElementById('root');
          const styles = window.getComputedStyle(root!);
          const maxWidth = parseInt(styles.maxWidth);
          
          if (viewportWidth <= 768) {
            expect(maxWidth).toBe(390);
          } else {
            expect(maxWidth).toBe(1024);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('Property 2: Proportional Scaling', () => {
    /**
     * Feature: worker-app-responsive-ui
     * Property 2: For any UI component with responsive sizing, desktop viewport 
     * should increase padding by 25% and font sizes by 10-15% compared to mobile
     */
    fc.assert(
      fc.property(
        fc.constantFrom('Card', 'Button', 'Input'),
        (componentType) => {
          // Measure mobile
          window.innerWidth = 375;
          window.dispatchEvent(new Event('resize'));
          const { container: mobileContainer } = render(
            getComponentByType(componentType)
          );
          const mobileEl = mobileContainer.firstChild as HTMLElement;
          const mobileStyles = window.getComputedStyle(mobileEl);
          const mobilePadding = parseInt(mobileStyles.padding);
          const mobileFontSize = parseInt(mobileStyles.fontSize);
          
          // Measure desktop
          window.innerWidth = 1200;
          window.dispatchEvent(new Event('resize'));
          const { container: desktopContainer } = render(
            getComponentByType(componentType)
          );
          const desktopEl = desktopContainer.firstChild as HTMLElement;
          const desktopStyles = window.getComputedStyle(desktopEl);
          const desktopPadding = parseInt(desktopStyles.padding);
          const desktopFontSize = parseInt(desktopStyles.fontSize);
          
          // Verify padding increase
          const paddingIncrease = (desktopPadding - mobilePadding) / mobilePadding;
          expect(paddingIncrease).toBeCloseTo(0.25, 1); // 25% ±10%
          
          // Verify font size increase
          const fontIncrease = (desktopFontSize - mobileFontSize) / mobileFontSize;
          expect(fontIncrease).toBeGreaterThanOrEqual(0.10);
          expect(fontIncrease).toBeLessThanOrEqual(0.15);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('Property 6: Minimum Touch Target Size', () => {
    /**
     * Feature: worker-app-responsive-ui
     * Property 6: For any Button component on mobile viewport, 
     * dimensions should be at least 44x44 pixels
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 768 }), // mobile viewport range
        fc.string(), // button text
        (viewportWidth, buttonText) => {
          window.innerWidth = viewportWidth;
          window.dispatchEvent(new Event('resize'));
          
          const { getByText } = render(
            <Button>{buttonText || 'Click'}</Button>
          );
          
          const button = getByText(buttonText || 'Click');
          const rect = button.getBoundingClientRect();
          
          expect(rect.width).toBeGreaterThanOrEqual(44);
          expect(rect.height).toBeGreaterThanOrEqual(44);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('Property 13: Shadow System Consistency', () => {
    /**
     * Feature: worker-app-responsive-ui
     * Property 13: For any Card component, the applied box-shadow 
     * should match one of the three defined shadow levels
     */
    const VALID_SHADOWS = [
      '0 2px 4px rgba(0, 0, 0, 0.04)',  // low
      '0 2px 8px rgba(0, 0, 0, 0.06)',  // medium
      '0 4px 12px rgba(0, 0, 0, 0.1)',  // high
    ];
    
    fc.assert(
      fc.property(
        fc.constantFrom('white', 'blue'),
        (variant) => {
          const { container } = render(
            <Card variant={variant}>Content</Card>
          );
          
          const card = container.firstChild as HTMLElement;
          const styles = window.getComputedStyle(card);
          const boxShadow = styles.boxShadow;
          
          const matchesValidShadow = VALID_SHADOWS.some(shadow => 
            boxShadow.includes(shadow) || 
            normalizeBoxShadow(boxShadow) === normalizeBoxShadow(shadow)
          );
          
          expect(matchesValidShadow).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('Property 15: Border Radius Consistency', () => {
    /**
     * Feature: worker-app-responsive-ui
     * Property 15: For any component, the border-radius should match 
     * the design system specification
     */
    const COMPONENT_RADIUS = {
      Card: 12,
      Button: 12,
      Input: 10,
      Badge: 20,
    };
    
    fc.assert(
      fc.property(
        fc.constantFrom('Card', 'Button', 'Input', 'Badge'),
        (componentType) => {
          const { container } = render(
            getComponentByType(componentType)
          );
          
          const element = container.firstChild as HTMLElement;
          const styles = window.getComputedStyle(element);
          const borderRadius = parseInt(styles.borderRadius);
          
          expect(borderRadius).toBe(COMPONENT_RADIUS[componentType]);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('Property 17: WCAG AA Contrast Compliance', () => {
    /**
     * Feature: worker-app-responsive-ui
     * Property 17: For any text element, contrast ratio should meet 
     * WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
     */
    fc.assert(
      fc.property(
        fc.constantFrom('Dashboard', 'Login', 'Policy'),
        (pageName) => {
          const { container } = render(getPageByName(pageName));
          
          const textElements = container.querySelectorAll('p, span, h1, h2, h3, button, a');
          
          textElements.forEach((element) => {
            const styles = window.getComputedStyle(element);
            const color = styles.color;
            const backgroundColor = styles.backgroundColor;
            const fontSize = parseInt(styles.fontSize);
            
            const contrastRatio = calculateContrastRatio(color, backgroundColor);
            
            if (fontSize >= 18 || (fontSize >= 14 && styles.fontWeight >= '700')) {
              // Large text: 3:1 minimum
              expect(contrastRatio).toBeGreaterThanOrEqual(3.0);
            } else {
              // Normal text: 4.5:1 minimum
              expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('Property 22: Icon Size Scaling', () => {
    /**
     * Feature: worker-app-responsive-ui
     * Property 22: For any icon element, size should be 20% larger 
     * on desktop compared to mobile
     */
    fc.assert(
      fc.property(
        fc.constantFrom('nav', 'inline'),
        (iconContext) => {
          // Measure mobile
          window.innerWidth = 375;
          window.dispatchEvent(new Event('resize'));
          const { container: mobileContainer } = render(
            getIconByContext(iconContext)
          );
          const mobileIcon = mobileContainer.querySelector('svg')!;
          const mobileSize = parseInt(mobileIcon.getAttribute('width') || '0');
          
          // Measure desktop
          window.innerWidth = 1200;
          window.dispatchEvent(new Event('resize'));
          const { container: desktopContainer } = render(
            getIconByContext(iconContext)
          );
          const desktopIcon = desktopContainer.querySelector('svg')!;
          const desktopSize = parseInt(desktopIcon.getAttribute('width') || '0');
          
          const sizeIncrease = (desktopSize - mobileSize) / mobileSize;
          expect(sizeIncrease).toBeCloseTo(0.20, 1); // 20% ±10%
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('Property 27: Resize Event Debouncing', () => {
    /**
     * Feature: worker-app-responsive-ui
     * Property 27: For any sequence of resize events, the handler 
     * should be debounced to limit execution frequency
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 5, max: 50 }), // number of rapid resize events
        (numResizes) => {
          let callCount = 0;
          const mockHandler = () => { callCount++; };
          
          // Trigger rapid resize events
          for (let i = 0; i < numResizes; i++) {
            window.innerWidth = 375 + i;
            window.dispatchEvent(new Event('resize'));
          }
          
          // Wait for debounce period
          setTimeout(() => {
            // Handler should be called far fewer times than resize events
            expect(callCount).toBeLessThan(numResizes / 2);
          }, 200);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Helper functions
function getComponentByType(type: string) {
  switch (type) {
    case 'Card': return <Card>Test</Card>;
    case 'Button': return <Button>Test</Button>;
    case 'Input': return <Input />;
    case 'Badge': return <Badge>Test</Badge>;
    default: return <div>Test</div>;
  }
}

function calculateContrastRatio(color1: string, color2: string): number {
  // Implementation of WCAG contrast ratio calculation
  // Convert RGB to relative luminance and calculate ratio
  // ... (standard WCAG formula)
}

function normalizeBoxShadow(shadow: string): string {
  // Normalize box-shadow string for comparison
  return shadow.replace(/\s+/g, ' ').trim();
}
```

### Test Coverage Goals

- **Unit Tests:** 80% code coverage minimum
- **Property Tests:** All 29 correctness properties implemented
- **Integration Tests:** Key user flows (auth → dashboard → profile)
- **Visual Regression Tests:** Screenshot comparison for responsive layouts
- **Accessibility Tests:** Automated WCAG compliance checks using axe-core

### Testing Tools

- **Unit Testing:** Vitest + React Testing Library
- **Property Testing:** fast-check
- **E2E Testing:** Playwright (for cross-browser validation)
- **Accessibility Testing:** axe-core + jest-axe
- **Visual Regression:** Percy or Chromatic

### Continuous Integration

All tests should run on:
- Pull request creation
- Merge to main branch
- Nightly builds for comprehensive property test runs (1000+ iterations)

Property-based tests with 100 iterations run on every PR. Extended runs with 1000+ iterations run nightly to catch rare edge cases.
