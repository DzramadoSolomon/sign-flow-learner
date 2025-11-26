# Dual-Mode Learning System Guide

## Overview

The GSL Learning Platform supports two distinct learning modes to accommodate diverse learner needs:

1. **Visual Mode (Deaf/Hard-of-Hearing)** - Optimized for learners who rely primarily on visual information
2. **Audio + Visual Mode (Hearing)** - Includes voice narration and audio guides alongside visual content

---

## Architecture

### Mode Context

The learning mode is managed through a React Context (`LearningModeContext`) that:
- Stores the current mode in `localStorage`
- Provides mode state globally throughout the app
- Allows easy mode switching via `useLearningMode()` hook

### Lesson Data Structure

Each lesson now supports dual-mode content with the following structure:

```json
{
  "metadata": {
    "id": "beginner-1",
    "title": "Lesson Title",
    "description": "...",
    "level": "beginner",
    "duration": 15,
    "objectives": [...],
    "tags": [...],
    "order": 1
  },
  "deaf": {
    "videoUrl": "...",
    "notes": "Visual-first markdown content...",
    "quiz": [...],
    "exercises": [...]
  },
  "hearing": {
    "videoUrl": "...",
    "notes": "Audio-enhanced markdown content with images...",
    "quiz": [...],
    "exercises": [...]
  }
}
```

### File Organization

```
src/data/lessons/
├── beginner/
│   ├── lesson1-dual.json
│   ├── lesson2-dual.json
│   └── lesson3-dual.json
├── intermediate/
│   └── ...
└── advanced/
    └── ...
```

---

## Key Features

### Audio Playback (Hearing Mode Only)

**Location**: `src/components/lesson/NotesSection.tsx`

The lesson notes section includes a "Listen" button for Hearing Learner Mode users that reads the lesson notes aloud using text-to-speech technology.

**Features**:
- Play/Pause button in the top-right corner of the notes card
- Browser-based Web Speech API (no backend required)
- Automatic markdown cleaning for natural speech
- Auto-stop on completion or text change

**Usage**:
```typescript
// Automatically shown when mode === 'hearing'
{mode === 'hearing' && (
  <Button onClick={handlePlayPause}>
    {isPlaying ? <Pause /> : <><Play /><Volume2 /></>}
  </Button>
)}
```

See `docs/AUDIO_FEATURE_GUIDE.md` for detailed documentation.

### Image Support

**Both modes** now support images in lesson notes using standard markdown syntax:

```markdown
![Alt text](/path/to/image.png)
```

**Example**:
```markdown
# Lesson Title

![GSL Logo](/favicon.ico)

## Introduction
This lesson covers...
```

**Supported Locations**:
- Public folder: `/image.png` (e.g., `/favicon.ico`)
- External URLs: `https://example.com/image.png`

**Automatic Styling**:
- Rounded corners
- Drop shadow
- Border for clarity
- Responsive sizing
- Proper spacing

---

## Creating Dual-Mode Lessons

### Step 1: Plan Both Versions

Before creating content, plan how each mode will differ:

**Visual Mode (Deaf) Should Include:**
- Clear, detailed visual descriptions
- Step-by-step visual breakdowns
- Mirror practice suggestions
- Photo comparison tips
- Visual cues and markers (✓, →, ★)
- Images for visual learning
- No audio dependency whatsoever

**Audio + Visual Mode (Hearing) Should Include:**
- Voice narration scripts
- Spoken mnemonics
- Audio pacing guides
- Verbal association techniques
- "Say it out loud" practice tips
- **"Click Listen button" prompts**
- Audio-synchronized content
- Images for visual reference

### Step 2: Create the Metadata

Start with shared metadata that applies to both modes:

```json
{
  "metadata": {
    "id": "unique-lesson-id",
    "title": "Lesson Title",
    "description": "Brief description",
    "level": "beginner|intermediate|advanced",
    "duration": 15,
    "objectives": [
      "Specific learning goal 1",
      "Specific learning goal 2"
    ],
    "tags": ["relevant", "tags"],
    "order": 1
  }
}
```

### Step 3: Create Visual Mode Content

#### Video Selection
- Choose videos with clear, unobstructed views
- Ensure good lighting and contrast
- Use close-up shots of hand formations
- No audio narration needed

#### Writing Notes (with Images)
```markdown
# Lesson Title (Visual Mode)

![Lesson Diagram](/images/lesson-diagram.png)

## Visual Learning Focus
[Explain that this content is optimized for visual learning]

## Sign Name

### Visual Description
- **Hand Shape**: Detailed description
- **Finger Position**: Specific placement
- **Palm Orientation**: Direction it faces
- **Visual Cue**: Memory aid using visual metaphor

![Hand Position Reference](/images/hand-position.png)

### Practice Tips
- Use a mirror
- Take photos for comparison
- Watch video in slow motion
- Check angles and positioning

## Visual Practice Sequence
[Step-by-step visual practice guide]
```

#### Creating Quiz Questions
```json
{
  "id": "q1",
  "videoUrl": "https://youtube.com/embed/...",
  "question": "What letter/sign is being shown in this video?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "Option A",
  "explanation": "Clear visual explanation of why this is correct"
}
```

#### Designing Exercises
```json
{
  "id": "ex1",
  "instruction": "Practice in front of a mirror. Watch for [specific visual details].",
  "type": "practice",
  "content": {
    "focusAreas": ["specific", "visual", "elements"],
    "visualCues": "Use mirror to verify positioning"
  }
}
```

### Step 4: Create Audio + Visual Mode Content

#### Video Selection
- Can include narrated videos
- Audio descriptions are helpful
- Can use videos with background music
- Voice-guided demonstrations work well

#### Writing Notes (with Audio Prompts & Images)
```markdown
# Lesson Title (Audio + Visual Mode)

![GSL Logo](/favicon.ico)

## Welcome to Audio-Enhanced Learning
[Explain that this content includes voice guidance]

**Pro Tip**: Click the "Listen" button in the top right to have this lesson read aloud!

## Sign Name

### Audio Description
*Listen to the pronunciation guide as you watch*

- **Hand Shape**: Description + verbal cue
- **Finger Position**: Description + what to say
- **Palm Orientation**: Description + audio marker
- **Verbal Cue**: "Say [word] to remember this sign"

![Hand Formation Guide](/images/hand-guide.png)

### Voice-Guided Practice
- Listen to pacing in audio
- Follow spoken instructions
- Use verbal repetition
- Record and review yourself

## Audio-Enhanced Practice Sequence
[Step-by-step practice with audio cues]
```

#### Creating Quiz Questions
```json
{
  "id": "q1",
  "videoUrl": "https://youtube.com/embed/...",
  "question": "Listen to the audio cue and identify the sign:",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "Option A",
  "explanation": "Audio guide: [Spoken explanation of the correct answer]"
}
```

#### Designing Exercises
```json
{
  "id": "ex1",
  "instruction": "Follow the audio guide and say each letter/sign out loud as you practice.",
  "type": "practice",
  "content": {
    "focusAreas": ["listening", "speaking", "coordinating"],
    "audioCue": "Follow the spoken rhythm in the guide"
  }
}
```

---

## Adding Images to Lesson Notes

### Step-by-Step Guide

1. **Prepare Your Image**:
   - Optimize size (web-friendly, under 500KB)
   - Use `.png`, `.jpg`, or `.webp` format
   - Ensure high quality and clarity

2. **Add Image to Project**:
   - Place in `public/` folder (e.g., `public/images/lesson1-diagram.png`)
   - Or use external URL (CDN/hosting)

3. **Reference in Markdown**:
   ```markdown
   ![Description of image](/images/lesson1-diagram.png)
   ```

4. **Example with Logo**:
   ```markdown
   # GSL Alphabet: A-E

   ![GSL Logo](/favicon.ico)

   ## Welcome to this lesson...
   ```

### Image Best Practices

✅ **DO**:
- Use descriptive alt text for accessibility
- Place images near relevant content
- Optimize file sizes for faster loading
- Use consistent image styles
- Include captions when helpful

❌ **DON'T**:
- Use overly large images (slow loading)
- Skip alt text (bad for accessibility)
- Use low-quality or blurry images
- Place images randomly without context

---

## Content Guidelines

### Visual Mode Best Practices

✅ **DO:**
- Use highly descriptive visual language
- Include multiple viewing angles in videos
- Provide visual metaphors and comparisons
- Suggest mirror and photo practice
- Use emojis and visual markers (✓, →, ★)
- Emphasize clear, distinct hand shapes
- Include visual troubleshooting tips
- **Add images to enhance visual learning**

❌ **DON'T:**
- Reference sound, audio, or "listen"
- Assume any auditory comprehension
- Use audio-dependent videos
- Include audio-only instructions
- Reference rhythm through sound
- Mention the "Listen" button

### Audio + Visual Mode Best Practices

✅ **DO:**
- Include voice narration scripts
- Suggest speaking out loud while signing
- Use verbal mnemonics
- Reference audio cues and pacing
- Include "say this" prompts
- Suggest recording and playback
- Use rhythm and vocal guidance
- **Prompt users to click "Listen" button**
- **Add images for visual reference**

❌ **DON'T:**
- Make audio mandatory (keep visuals strong)
- Forget that some may use this with muted audio
- Lose the visual quality of instructions
- Over-rely on audio alone

---

## Technical Implementation

### Loading Mode-Specific Content

In lesson components, load content based on current mode:

```typescript
import { useLearningMode } from '@/contexts/LearningModeContext';
import lessonData from '@/data/lessons/beginner/lesson1-dual.json';
import { DualModeLessonContent } from '@/types/lesson';

const LessonComponent = () => {
  const { mode } = useLearningMode();
  const lesson = lessonData as DualModeLessonContent;
  
  // Get mode-specific content
  const content = lesson[mode]; // lesson.deaf or lesson.hearing
  
  return (
    <>
      <VideoSection videoUrl={content.videoUrl} />
      <NotesSection notes={content.notes} /> {/* Auto-shows audio button for hearing mode */}
      <QuizSection questions={content.quiz} />
      <ExerciseSection exercises={content.exercises} />
    </>
  );
};
```

### Mode Switcher Component

Users can switch modes at any time using the `<ModeSwitcher />` component:

```typescript
import { ModeSwitcher } from '@/components/ModeSwitcher';

// Use in settings or dashboard
<ModeSwitcher />
```

---

## Quality Checklist

### For Visual Mode Content

- [ ] All instructions can be understood without audio
- [ ] Videos have clear visual demonstrations
- [ ] Text descriptions are highly detailed
- [ ] Visual cues and metaphors are included
- [ ] Mirror practice is suggested where appropriate
- [ ] No audio-dependent elements present
- [ ] Images enhance visual learning (if used)
- [ ] No "Listen" button references

### For Audio + Visual Mode Content

- [ ] Voice narration is available or scripted
- [ ] Verbal cues enhance learning
- [ ] Audio pacing guides are included
- [ ] "Speak aloud" practice is suggested
- [ ] Visual content is still strong (not audio-only)
- [ ] Rhythm and timing are addressed
- [ ] "Listen" button is mentioned in content
- [ ] Images provide visual support (if used)

### For Both Modes

- [ ] Learning objectives are clearly stated
- [ ] Content is accurate and verified
- [ ] Videos are high quality
- [ ] Quiz questions have 5 items each
- [ ] Exercises are practical and achievable
- [ ] Content respects learner preferences
- [ ] Images (if used) have descriptive alt text
- [ ] Images load quickly and display properly

---

## Testing Your Dual-Mode Lessons

### 1. Visual Mode Test
- Turn off all audio on your device
- Go through the entire lesson
- Can you complete everything without audio?
- Are all instructions clear?
- Do images enhance understanding?

### 2. Audio + Visual Mode Test
- Enable audio and narration
- Follow along with spoken guides
- Click the "Listen" button
- Does audio enhance the experience?
- Are verbal cues helpful?
- Do images complement the audio?

### 3. Mode Switching Test
- Switch between modes mid-lesson
- Does content load correctly?
- Is the experience seamless?
- Do features appear/disappear correctly?

### 4. Image Testing
- Verify all images load
- Check responsiveness on mobile
- Confirm alt text is descriptive
- Test with slow internet connection

---

## Migration from Single-Mode Lessons

To convert existing single-mode lessons to dual-mode:

1. Rename file from `lesson1.json` to `lesson1-dual.json`
2. Wrap existing content in `"deaf"` object
3. Copy and modify for `"hearing"` object
4. Add audio-specific enhancements to hearing mode
5. Ensure visual mode has no audio dependencies
6. Add "Listen" button prompts to hearing mode
7. Add images if they enhance learning
8. Test both modes thoroughly

---

## Common Mistakes to Avoid

### Visual Mode Mistakes

❌ "Listen to the video" → ✅ "Watch the video carefully"
❌ "The audio guide explains..." → ✅ "The video demonstrates..."
❌ Audio-dependent quiz questions → ✅ Visual-only questions
❌ Vague hand descriptions → ✅ Precise, detailed descriptions
❌ Mentioning "Listen" button → ✅ No audio references

### Audio + Visual Mode Mistakes

❌ Audio-only instructions → ✅ Audio + visual instructions
❌ Ignoring visual learners → ✅ Strong visuals with audio enhancement
❌ No verbal practice → ✅ Include "say it out loud" exercises
❌ Not mentioning "Listen" button → ✅ Prompt users to use audio feature

### Image Mistakes

❌ Missing alt text → ✅ Descriptive alt text for all images
❌ Overly large files → ✅ Optimized web-friendly images
❌ Random placement → ✅ Strategic placement near relevant content
❌ Low quality images → ✅ Clear, high-quality visuals

---

## Getting Help

- **Audio Feature**: See `docs/AUDIO_FEATURE_GUIDE.md`
- **Technical Issues**: Check implementation in `src/contexts/LearningModeContext.tsx`
- **Content Questions**: Review examples in `lesson1-dual.json`
- **Accessibility Concerns**: See `docs/ACCESSIBILITY_GUIDE.md`
- **Best Practices**: Refer to `docs/CONTENT_GUIDE.md`

---

## Resources

- [Audio Feature Guide](./AUDIO_FEATURE_GUIDE.md) - Complete audio playback documentation
- [Accessibility Guidelines](./ACCESSIBILITY_GUIDE.md)
- [Video Production Guide](./VIDEO_QUIZ_GUIDE.md)
- [Content Creation Guide](./CONTENT_GUIDE.md)
