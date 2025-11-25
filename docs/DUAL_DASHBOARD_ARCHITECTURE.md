# Dual Dashboard Architecture Documentation

## Overview

The GSL Learning Platform features two distinct dashboard interfaces optimized for different learning modes: **Visual Mode** (for deaf/hard-of-hearing learners) and **Audio + Visual Mode** (for hearing learners). This document explains the architectural changes and design decisions.

---

## Architecture Components

### 1. Main Dashboard Component (`src/pages/Dashboard.tsx`)

**Purpose**: Acts as a router component that determines which dashboard to display based on the user's selected learning mode.

**Key Features**:
- Imports `useLearningMode` hook to access the current mode
- Conditionally renders either `DeafDashboard` or `HearingDashboard`
- Maintains consistent layout wrapper (sidebar, header, mobile navigation)
- No longer contains dashboard content directly - purely a routing component

**Code Flow**:
```typescript
const { mode } = useLearningMode(); // Get current learning mode
const dashboardContent = mode === 'deaf' ? <DeafDashboard /> : <HearingDashboard />;
```

---

### 2. Deaf Dashboard (`src/pages/dashboards/DeafDashboard.tsx`)

**Purpose**: Visual-first dashboard optimized for deaf and hard-of-hearing learners.

**Design Principles**:
- **High Visual Emphasis**: Larger text, bolder typography, bigger cards
- **Enhanced Contrast**: Border-2 on cards, high-contrast color schemes
- **Visual Indicators**: Emojis, icons, and visual badges for all information
- **Zero Audio Dependency**: No audio-related features or references
- **Larger Touch Targets**: Bigger interactive elements for better accessibility
- **Visual Mode Badge**: Eye icon indicator showing active mode

**Key Differences from Hearing Dashboard**:
- Larger stat cards with 3xl font sizes vs 2xl
- Border-2 on cards vs standard border
- More prominent visual icons (6w-6 vs h-5 w-5)
- Emoji indicators for engagement (👋, 🔥, 🏆)
- PlayCircle icons for video content emphasis
- Higher contrast backgrounds and gradients
- Larger progress bars (h-4 vs h-3)

**Example Elements**:
```tsx
// Large, high-contrast stat card
<Card className="p-6 border-2 hover:shadow-lg transition-shadow">
  <div className="flex items-center gap-3 mb-3">
    <div className="p-3 rounded-lg bg-primary/20 text-primary">
      <img src="/favicon.ico" alt="GSL" className="h-6 w-6" />
    </div>
    <p className="text-sm font-medium text-muted-foreground">Lessons Completed</p>
  </div>
  <p className="text-3xl font-bold">{stats.lessonsCompleted}/{stats.totalLessons}</p>
</Card>
```

---

### 3. Hearing Dashboard (`src/pages/dashboards/HearingDashboard.tsx`)

**Purpose**: Audio-enhanced dashboard optimized for hearing learners with access to both audio and visual content.

**Design Principles**:
- **Audio Integration**: References to audio features, listening hours, voice narration
- **Balanced Approach**: Standard sizing for comfortable reading and interaction
- **Audio Indicators**: Headphones, speaker, and microphone icons
- **Audio-Specific Stats**: Listening hours tracking
- **Audio Learning Tips**: Helpful suggestions for audio-enhanced learning
- **Audio Mode Badge**: Volume2 icon indicator showing active mode

**Key Differences from Deaf Dashboard**:
- Standard card borders (border vs border-2)
- Normal text sizes (2xl vs 3xl)
- Audio-related statistics (listening hours)
- Volume/headphone icons throughout
- Audio learning tips section
- References to "audio lessons" and "narration"
- Achievements include "Audio Learner" badge

**Example Elements**:
```tsx
// Audio learning tip card
<Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-200/20">
  <div className="flex items-start gap-4">
    <div className="p-3 rounded-full bg-blue-500/20">
      <Mic className="h-6 w-6 text-blue-500" />
    </div>
    <div className="flex-1">
      <h3 className="font-semibold mb-1">Audio Learning Tip</h3>
      <p className="text-sm text-muted-foreground">
        Use headphones for the best audio experience...
      </p>
    </div>
  </div>
</Card>
```

---

## Data Flow

### Mode Selection Flow

1. **Homepage** (`src/pages/Index.tsx`)
   - User sees `ModeSwitcher` component
   - Clicks either "Visual Mode" or "Audio + Visual Mode"
   - Selection triggers `setMode()` in `LearningModeContext`
   - Mode is saved to `localStorage` for persistence
   - User is navigated to `/dashboard`

2. **Dashboard Routing** (`src/pages/Dashboard.tsx`)
   - Component reads current mode from `useLearningMode()` hook
   - Conditionally renders appropriate dashboard:
     - `mode === 'deaf'` → `<DeafDashboard />`
     - `mode === 'hearing'` → `<HearingDashboard />`

3. **Mode Persistence**
   - Mode preference stored in `localStorage` as `learningMode`
   - Persists across sessions and page refreshes
   - Initialized on app load by `LearningModeContext`

---

## Visual Comparison

### Layout Similarities
Both dashboards share:
- Same grid structure (lg:grid-cols-3)
- Same section organization (stats, progress, recent lessons, achievements)
- Same responsive breakpoints
- Same navigation structure

### Visual Differences

| Feature | Deaf Dashboard | Hearing Dashboard |
|---------|---------------|-------------------|
| **Text Size** | Larger (3xl-5xl) | Standard (2xl-4xl) |
| **Card Borders** | Bold (border-2) | Standard (border) |
| **Icons** | h-6 w-6 | h-5 w-5 |
| **Mode Badge** | Eye icon | Volume2 icon |
| **Stat Cards** | 4 visual stats | 4 stats (includes listening hours) |
| **Achievements** | 4 general achievements | Includes "Audio Learner" |
| **Special Sections** | Visual emphasis cards | Audio learning tips |
| **Emojis** | Present (👋, 🔥, 🏆) | Minimal |
| **CTA Icon** | PlayCircle | Volume2 |

---

## Key Design Decisions

### Why Separate Components?

**Decision**: Create two completely separate dashboard components rather than one component with conditional rendering.

**Reasoning**:
1. **Clarity**: Each dashboard has distinct design language and requirements
2. **Maintainability**: Easier to modify one mode without affecting the other
3. **Performance**: No unnecessary conditional checks within the component
4. **Scalability**: Easy to add mode-specific features without complexity
5. **Code Readability**: Clear separation of concerns

### Why Different Visual Hierarchies?

**Deaf Dashboard**:
- Larger elements compensate for lack of audio cues
- Visual prominence ensures information isn't missed
- High contrast aids visual scanning
- Emojis provide emotional context without sound

**Hearing Dashboard**:
- Standard sizing works well with audio reinforcement
- Audio cues complement visual information
- Balance between visual and auditory learning
- Room for audio-specific controls and indicators

---

## Future Enhancements

### Planned Features

1. **Mode-Specific Content Loading**
   - Fetch different lesson content based on mode
   - Load transcripts for deaf mode
   - Load audio files for hearing mode

2. **Analytics by Mode**
   - Track learning patterns per mode
   - Optimize content based on mode-specific metrics
   - A/B test design improvements

3. **Advanced Accessibility**
   - Haptic feedback for deaf mode (mobile)
   - Audio quality settings for hearing mode
   - Customizable visual contrast levels

4. **Mode Switching**
   - Allow mode switching from dashboard
   - Smooth transition between interfaces
   - Preserve progress across modes

---

## Testing Considerations

### Mode Testing Checklist

- [ ] Visual mode displays correctly on mobile
- [ ] Hearing mode displays correctly on mobile
- [ ] Mode persists after page refresh
- [ ] Switching modes updates dashboard instantly
- [ ] All icons render correctly in both modes
- [ ] Responsive breakpoints work in both modes
- [ ] Color contrast meets WCAG standards (especially deaf mode)
- [ ] Touch targets are adequate size (especially deaf mode)

### Accessibility Testing

**Deaf Mode**:
- Test with screen reader in visual-only mode
- Verify all information available without sound
- Check color contrast ratios (aim for AAA)
- Test keyboard navigation

**Hearing Mode**:
- Verify audio indicators are clear
- Test with headphones
- Check audio-related tooltips
- Ensure visual fallbacks exist

---

## Code Organization

```
src/
├── contexts/
│   └── LearningModeContext.tsx    # Mode state management
├── components/
│   └── ModeSwitcher.tsx           # Mode selection component
├── pages/
│   ├── Dashboard.tsx              # Main dashboard router
│   ├── dashboards/
│   │   ├── DeafDashboard.tsx      # Visual-first dashboard
│   │   └── HearingDashboard.tsx   # Audio-enhanced dashboard
│   └── Index.tsx                  # Landing page with mode selection
└── types/
    └── lesson.ts                  # Shared types including mode types
```

---

## Developer Guidelines

### When to Modify Deaf Dashboard

Modify `DeafDashboard.tsx` when:
- Adding features that need visual emphasis
- Improving visual accessibility
- Adding video-centric features
- Enhancing visual indicators

### When to Modify Hearing Dashboard

Modify `HearingDashboard.tsx` when:
- Adding audio features
- Implementing voice guidance
- Adding audio-related statistics
- Creating audio learning tips

### When to Modify Both

Modify both when:
- Changing core functionality (progress tracking, lesson navigation)
- Updating data structures
- Adding new sections that apply to both modes
- Fixing bugs that affect both interfaces

---

## Summary

The dual dashboard architecture provides:
- **Tailored Experiences**: Each mode optimized for its target audience
- **Accessibility First**: Design decisions based on user needs
- **Maintainability**: Clear separation of concerns
- **Scalability**: Easy to extend with mode-specific features
- **Flexibility**: Users can switch modes based on context

This architecture ensures that both deaf/hard-of-hearing learners and hearing learners receive an optimal, accessible learning experience suited to their needs.
