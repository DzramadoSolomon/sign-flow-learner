# Accessibility Blueprint for GSL Learning Platform

## Core Principles

The GSL Learning Platform is built on these accessibility foundations:

1. **Universal Design** - Features work for everyone, regardless of ability
2. **Multiple Pathways** - Content available through various sensory modes
3. **User Control** - Learners choose how they interact with content
4. **Inclusive by Default** - Accessibility is built-in, not added later

## Dual-Mode Learning System

### Visual Mode (Deaf/Hard-of-Hearing Optimized)

**Core Features:**
- ✅ Zero audio dependency
- ✅ High-contrast visual design
- ✅ Clear, large videos
- ✅ Detailed text descriptions
- ✅ Visual feedback for all interactions
- ✅ No sound-based alerts

**Technical Requirements:**
- All content must be fully comprehensible without audio
- Visual indicators for system states
- Haptic feedback support (where available)
- Keyboard navigation fully supported

### Audio + Visual Mode (Hearing Learner Optimized)

**Core Features:**
- ✅ Voice narration available
- ✅ Audio pacing guides
- ✅ Spoken instructions
- ✅ Sound notifications (with visual backup)
- ✅ Audio-synchronized captions

**Technical Requirements:**
- Audio must enhance, not replace, visual content
- All audio content must have visual alternatives
- Audio can be disabled without losing functionality

## Keyboard Navigation Standards

### Global Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move to next interactive element |
| `Shift + Tab` | Move to previous interactive element |
| `Enter` / `Space` | Activate button or link |
| `Esc` | Close modal/dialog |
| `Arrow Keys` | Navigate within component (lists, menus) |

### Lesson Navigation

| Key | Action |
|-----|--------|
| `→` | Next section/question |
| `←` | Previous section/question |
| `Space` | Play/Pause video |
| `M` | Toggle mode switcher |
| `1-5` | Select quiz answer (when quiz is active) |

### Implementation

All interactive elements must:
```tsx
// Buttons
<button
  onClick={handleClick}
  onKeyPress={(e) => e.key === 'Enter' && handleClick()}
  aria-label="Descriptive action"
  tabIndex={0}
>
  Button Text
</button>

// Interactive divs (avoid if possible, use <button> instead)
<div
  role="button"
  onClick={handleClick}
  onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick()}
  aria-label="Descriptive action"
  tabIndex={0}
>
  Content
</div>
```

## ARIA Landmarks & Roles

### Required Landmarks

```html
<!-- Main navigation -->
<nav role="navigation" aria-label="Main navigation">
  <!-- Navigation items -->
</nav>

<!-- Page header -->
<header role="banner">
  <!-- Site header content -->
</header>

<!-- Main content area -->
<main role="main">
  <!-- Primary page content -->
</main>

<!-- Sidebar navigation -->
<aside role="complementary" aria-label="Lesson navigation">
  <!-- Sidebar content -->
</aside>

<!-- Page footer -->
<footer role="contentinfo">
  <!-- Footer content -->
</footer>
```

### Component Roles

```tsx
// Quiz Section
<section role="region" aria-labelledby="quiz-heading">
  <h2 id="quiz-heading">Lesson Quiz</h2>
  <!-- Quiz content -->
</section>

// Video Player
<div role="region" aria-label="Lesson video">
  <iframe
    title="GSL Alphabet Lesson 1"
    aria-label="Video demonstration of signs A through E"
    src="..."
  />
</div>

// Alert Messages
<div role="alert" aria-live="assertive">
  Correct! Well done.
</div>

// Status Updates
<div role="status" aria-live="polite" aria-atomic="true">
  Question 3 of 5
</div>
```

## Caption Standards

### Video Captions

All videos must include captions that:

1. **Describe speech** (when applicable in hearing mode)
2. **Describe important sounds** (when applicable)
3. **Indicate who is speaking** (if multiple people)
4. **Use proper timing** (synchronized with video)
5. **Maintain readability** (proper font size, contrast)

**Caption Format:**
```
[Instructor demonstrates letter A]
Narrator: "Form a closed fist with your thumb on the side."
[Hand rotates to show side view]
[Important: Notice thumb placement]
```

### Live Caption Toggle

```tsx
// Implement caption toggle
const [captionsEnabled, setCaptionsEnabled] = useState(true);

<video>
  <track
    kind="captions"
    src="captions.vtt"
    srclang="en"
    label="English"
    default={captionsEnabled}
  />
</video>

<button
  onClick={() => setCaptionsEnabled(!captionsEnabled)}
  aria-pressed={captionsEnabled}
>
  {captionsEnabled ? 'Hide' : 'Show'} Captions
</button>
```

## Color Contrast Requirements

### WCAG 2.1 AA Standards (Minimum)

- **Normal text**: 4.5:1 contrast ratio
- **Large text** (18pt+): 3:1 contrast ratio
- **UI components**: 3:1 contrast ratio
- **Focus indicators**: 3:1 contrast ratio

### Implementation

Use CSS custom properties for consistent theming:

```css
:root {
  /* High contrast text colors */
  --text-primary: hsl(0, 0%, 10%);      /* #1a1a1a */
  --text-secondary: hsl(0, 0%, 30%);    /* #4d4d4d */
  --text-muted: hsl(0, 0%, 45%);        /* #737373 */
  
  /* Background colors */
  --bg-primary: hsl(0, 0%, 100%);       /* #ffffff */
  --bg-secondary: hsl(0, 0%, 97%);      /* #f7f7f7 */
  
  /* Interactive elements */
  --interactive: hsl(215, 100%, 50%);   /* #0066ff */
  --interactive-hover: hsl(215, 100%, 40%); /* #0052cc */
  
  /* Focus indicator */
  --focus: hsl(215, 100%, 50%);
  --focus-ring: 0 0 0 3px hsla(215, 100%, 50%, 0.3);
}

/* Dark mode */
[data-theme="dark"] {
  --text-primary: hsl(0, 0%, 95%);
  --text-secondary: hsl(0, 0%, 75%);
  --bg-primary: hsl(0, 0%, 10%);
  --bg-secondary: hsl(0, 0%, 15%);
}
```

### Testing Contrast

```bash
# Use browser DevTools or online tools
# Recommended: https://contrast-ratio.com/
# Check all text/background combinations
```

## Focus Indicators

### Visible Focus States

All interactive elements must have clear focus indicators:

```css
/* Base focus style */
*:focus {
  outline: none;
}

*:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Button focus */
button:focus-visible {
  box-shadow: var(--focus-ring);
}

/* Link focus */
a:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 4px;
}

/* Custom interactive elements */
[role="button"]:focus-visible,
[tabindex]:focus-visible {
  box-shadow: var(--focus-ring);
}
```

### Skip Links

Provide skip navigation for keyboard users:

```tsx
// Add at top of page
<a 
  href="#main-content" 
  className="skip-link"
>
  Skip to main content
</a>

<style>
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--bg-primary);
  color: var(--text-primary);
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
</style>
```

## Screen Reader Support

### Semantic HTML

Use appropriate HTML elements:

```html
<!-- ❌ Wrong -->
<div class="button" onclick="...">Click me</div>

<!-- ✅ Correct -->
<button onclick="...">Click me</button>

<!-- ❌ Wrong -->
<div class="heading">Lesson Title</div>

<!-- ✅ Correct -->
<h2>Lesson Title</h2>
```

### ARIA Labels

```tsx
// Descriptive labels
<button aria-label="Play lesson video">
  <PlayIcon />
</button>

// Form inputs
<label htmlFor="search">Search lessons</label>
<input
  id="search"
  type="text"
  aria-describedby="search-hint"
/>
<span id="search-hint">
  Enter keywords to find lessons
</span>

// Complex widgets
<div
  role="tablist"
  aria-label="Lesson sections"
>
  <button
    role="tab"
    aria-selected={isSelected}
    aria-controls="panel-id"
  >
    Video
  </button>
</div>
```

### Live Regions

```tsx
// Quiz feedback
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  {feedback && <p>{feedback}</p>}
</div>

// Urgent alerts
<div
  role="alert"
  aria-live="assertive"
>
  {error && <p>{error}</p>}
</div>

// Progress updates
<div
  role="status"
  aria-live="polite"
  aria-label="Quiz progress"
>
  Question {current} of {total}
</div>
```

## Icon Accessibility

### Icon-Only Buttons

```tsx
// ❌ Wrong - no text alternative
<button>
  <TrashIcon />
</button>

// ✅ Correct - with aria-label
<button aria-label="Delete lesson">
  <TrashIcon aria-hidden="true" />
</button>

// ✅ Better - with visible text
<button>
  <TrashIcon aria-hidden="true" />
  <span>Delete</span>
</button>

// ✅ Best - with sr-only text
<button>
  <TrashIcon aria-hidden="true" />
  <span className="sr-only">Delete lesson</span>
</button>
```

### Decorative Icons

```tsx
// Mark as decorative
<HomeIcon aria-hidden="true" />
<span>Home</span>
```

## Visual Design for Non-Verbal Users

### Visual Indicators

```tsx
// Success state
<div className="flex items-center gap-2 text-success">
  <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
  <span>Correct answer!</span>
</div>

// Error state
<div className="flex items-center gap-2 text-error">
  <XCircleIcon className="h-5 w-5" aria-hidden="true" />
  <span>Incorrect. Try again.</span>
</div>

// Loading state
<div className="flex items-center gap-2">
  <LoaderIcon className="h-5 w-5 animate-spin" aria-hidden="true" />
  <span aria-live="polite">Loading lesson...</span>
</div>
```

### Visual Hierarchy

```css
/* Use size, weight, and spacing for hierarchy */
.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.body-text {
  font-size: 1rem;
  line-height: 1.6;
}

/* Use spacing for grouping */
.related-items {
  display: flex;
  gap: 0.5rem; /* Items in a group */
}

.separate-sections {
  margin-bottom: 2rem; /* Between sections */
}
```

## Testing Checklist

### Automated Testing

- [ ] Run Lighthouse accessibility audit
- [ ] Use axe DevTools browser extension
- [ ] Check WAVE browser extension
- [ ] Validate HTML semantics
- [ ] Test color contrast ratios

### Manual Testing

- [ ] Navigate entire site with keyboard only
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Verify all images have alt text
- [ ] Check all videos have captions
- [ ] Test with browser zoom at 200%
- [ ] Verify focus indicators are visible
- [ ] Test with audio completely off
- [ ] Test in high contrast mode

### User Testing

- [ ] Test with deaf/hard-of-hearing users
- [ ] Test with screen reader users
- [ ] Test with keyboard-only users
- [ ] Gather feedback on mode switching
- [ ] Verify content is comprehensible in both modes

## Quick Reference

### Utility Classes

```css
/* Screen reader only text */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Focus visible ring */
.focus-ring:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 2px;
}
```

### Common Patterns

```tsx
// Accessible Modal
<Dialog
  open={open}
  onOpenChange={setOpen}
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <DialogContent>
    <DialogHeader>
      <DialogTitle id="dialog-title">
        Lesson Complete
      </DialogTitle>
      <DialogDescription id="dialog-description">
        You've completed all exercises
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>

// Accessible Tabs
<Tabs defaultValue="video">
  <TabsList aria-label="Lesson sections">
    <TabsTrigger value="video">Video</TabsTrigger>
    <TabsTrigger value="notes">Notes</TabsTrigger>
    <TabsTrigger value="quiz">Quiz</TabsTrigger>
  </TabsList>
  <TabsContent value="video">...</TabsContent>
</Tabs>
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM Resources](https://webaim.org/resources/)
- [A11y Project](https://www.a11yproject.com/)
