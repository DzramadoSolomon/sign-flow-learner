# Audio Playback Feature Guide

## Overview

The GSL Learning Platform includes an **audio playback feature** exclusively for Hearing Learner Mode users. This feature reads lesson notes aloud using text-to-speech (TTS) technology, providing an audio-enhanced learning experience.

---

## Feature Location

**Component**: `src/components/lesson/NotesSection.tsx`

**Visibility**: Only visible when learning mode is set to `'hearing'`

**Position**: Top-right corner of the "Lesson Notes" card header

---

## User Interface

### Play Button
- **Icon**: Play icon + Volume2 icon
- **Text**: "Listen"
- **Action**: Starts reading the lesson notes aloud

### Pause Button
- **Icon**: Pause icon
- **Text**: "Pause"
- **Action**: Stops the audio playback immediately

### Visual States
- **Default**: Play button with "Listen" text
- **Playing**: Pause button with "Pause" text
- **Auto-reset**: Returns to Play state when audio completes

---

## How It Works

### Technology Stack

**Browser API**: Web Speech API (`window.speechSynthesis`)

**Compatibility**: All modern browsers (Chrome, Firefox, Safari, Edge)

### Text Processing

Before text is spoken, markdown formatting is removed:

```typescript
// Cleans markdown symbols for natural speech
- Headers (#, ##, ###) → removed
- Bold (**text**) → plain text
- Italic (*text*) → plain text
- Links [text](url) → text only
- Images ![alt](url) → removed
- Code markers (`) → removed
- Bullet points (-, •) → removed
```

### Speech Settings

```typescript
utterance.rate = 0.9;    // 90% speed for clarity
utterance.pitch = 1;      // Normal pitch
utterance.volume = 1;     // Full volume
```

**Rate**: Slightly slower than normal speech (0.9x) for better comprehension of educational content.

---

## User Workflow

### Step 1: Navigate to a Lesson
1. Select "Hearing Learner Mode" on the homepage
2. Click on any lesson from the dashboard or lessons page
3. Navigate to Step 1 (Content) where notes are displayed

### Step 2: Start Audio Playback
1. Look for the "Listen" button in the top-right corner of the "Lesson Notes" card
2. Click the "Listen" button
3. Audio playback begins immediately

### Step 3: Control Playback
- **To Pause**: Click the "Pause" button while audio is playing
- **To Resume**: Click "Listen" again after pausing (restarts from beginning)

### Step 4: Automatic Stop
- Audio automatically stops when it reaches the end of the text
- Button returns to "Listen" state

---

## Technical Details

### State Management

```typescript
const [isPlaying, setIsPlaying] = useState(false);
```

**States**:
- `false`: Audio is not playing (shows Play button)
- `true`: Audio is currently playing (shows Pause button)

### Lifecycle Management

**On Mount**: No audio plays automatically

**On Unmount**: Audio is cancelled if playing

**On Text Change**: Audio stops and resets (e.g., when "Show Full Script" is toggled)

### Event Handlers

```typescript
// When audio completes naturally
utterance.onend = () => setIsPlaying(false);

// When an error occurs
utterance.onerror = () => setIsPlaying(false);
```

---

## Mode-Specific Behavior

### Deaf/Hard-of-Hearing Mode
- Audio button is **NOT displayed**
- No TTS functionality available
- Visual-only learning experience

### Hearing Learner Mode
- Audio button is **displayed**
- TTS functionality enabled
- Audio-enhanced learning experience

### Code Implementation

```typescript
{mode === 'hearing' && (
  <Button onClick={handlePlayPause}>
    {isPlaying ? (
      <><Pause /> Pause</>
    ) : (
      <><Play /><Volume2 /> Listen</>
    )}
  </Button>
)}
```

---

## Accessibility

### Screen Reader Support
- Button has `aria-label` attribute
- Labels change based on state:
  - Playing: `"Pause lesson notes"`
  - Paused: `"Play lesson notes"`

### Keyboard Navigation
- Button is fully keyboard accessible
- Press `Tab` to focus, `Enter` or `Space` to activate

### Visual Indicators
- Clear icon changes (Play ↔ Pause)
- Text labels for clarity
- Outline variant for non-intrusive design

---

## Browser Compatibility

### Supported Browsers
- ✅ **Chrome**: Full support, high-quality voices
- ✅ **Firefox**: Full support
- ✅ **Safari**: Full support (macOS/iOS voices)
- ✅ **Edge**: Full support, high-quality voices

### Voice Quality
- **Chrome/Edge**: High-quality system voices
- **Safari**: Native Apple voices (Siri-quality)
- **Firefox**: Standard system voices

### Limitations
- Voice quality depends on operating system
- Some browsers may have limited voice options
- Speech rate and pitch support varies slightly

---

## Troubleshooting

### Audio Not Playing
**Issue**: Clicking "Listen" doesn't start audio

**Solutions**:
1. Check browser compatibility (use modern browser)
2. Ensure system volume is not muted
3. Try a different browser if issue persists

### Audio Stops Unexpectedly
**Issue**: Audio cuts off mid-sentence

**Cause**: Text change detected (e.g., "Show Full Script" toggled)

**Solution**: This is expected behavior. Click "Listen" again to restart.

### Poor Voice Quality
**Issue**: Robotic or low-quality voice

**Solutions**:
1. Update your operating system (improves voice engines)
2. Consider upgrading to ElevenLabs integration (future enhancement)

---

## Future Enhancements

### Short-Term Improvements
1. **Playback Progress**: Visual indicator showing current position
2. **Speed Control**: Slider to adjust speech rate (0.5x - 2x)
3. **Voice Selection**: Dropdown to choose from available system voices

### Long-Term Upgrades
1. **ElevenLabs Integration**: High-quality, natural-sounding voices
   - Realistic emotion and intonation
   - Multiple voice options
   - Professional audio quality

2. **OpenAI TTS**: Advanced voice synthesis
   - Multiple voice personalities
   - Emotion control
   - Higher quality than browser TTS

3. **Audio Caching**: Save generated audio for offline playback

4. **Audio Highlights**: Synchronized text highlighting as audio plays

5. **Bookmarking**: Resume from last position in long lessons

---

## Developer Guide

### Adding Audio to New Components

1. **Import Dependencies**:
```typescript
import { useLearningMode } from '@/contexts/LearningModeContext';
import { Play, Pause, Volume2 } from 'lucide-react';
```

2. **Set Up State**:
```typescript
const { mode } = useLearningMode();
const [isPlaying, setIsPlaying] = useState(false);
```

3. **Implement Handler**:
```typescript
const handlePlayPause = () => {
  if (isPlaying) {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  } else {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  }
};
```

4. **Add Button (Conditional)**:
```typescript
{mode === 'hearing' && (
  <Button onClick={handlePlayPause}>
    {isPlaying ? <Pause /> : <><Play /><Volume2 /></>}
  </Button>
)}
```

---

## Testing Checklist

### Functional Testing
- [ ] Button appears only in hearing mode
- [ ] Audio plays when clicking "Listen"
- [ ] Audio pauses when clicking "Pause"
- [ ] Auto-stops at end of text
- [ ] Restarts from beginning on resume
- [ ] Stops when text changes

### Visual Testing
- [ ] Button positioned correctly (top-right)
- [ ] Icons render properly
- [ ] State changes are clear (Play ↔ Pause)
- [ ] Mobile responsive
- [ ] Dark mode compatible

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader announces button state
- [ ] Focus indicators visible
- [ ] Color contrast meets standards

### Browser Testing
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (macOS/iOS)
- [ ] Mobile browsers

---

## Related Documentation

- **Dual-Mode Guide**: `docs/DUAL_MODE_GUIDE.md`
- **Accessibility Guide**: `docs/ACCESSIBILITY_GUIDE.md`
- **Content Creation**: `docs/CONTENT_GUIDE.md`

For technical support, refer to the project README or contact the development team.
