# Dual-Mode Learning System Guide

## Overview

The GSL Learning Platform supports two distinct learning modes to accommodate diverse learner needs:

1. **Visual Mode (Deaf/Hard-of-Hearing)** - Optimized for learners who rely primarily on visual information
2. **Audio + Visual Mode (Hearing)** - Includes voice narration and audio guides alongside visual content

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
    "notes": "Audio-enhanced markdown content...",
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

## Creating Dual-Mode Lessons

### Step 1: Plan Both Versions

Before creating content, plan how each mode will differ:

**Visual Mode (Deaf) Should Include:**
- Clear, detailed visual descriptions
- Step-by-step visual breakdowns
- Mirror practice suggestions
- Photo comparison tips
- Visual cues and markers
- No audio dependency whatsoever

**Audio + Visual Mode (Hearing) Should Include:**
- Voice narration scripts
- Spoken mnemonics
- Audio pacing guides
- Verbal association techniques
- "Say it out loud" practice tips
- Audio-synchronized content

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

#### Writing Notes
```markdown
# Lesson Title (Visual Mode)

## Visual Learning Focus
[Explain that this content is optimized for visual learning]

## Sign Name

### Visual Description
- **Hand Shape**: Detailed description
- **Finger Position**: Specific placement
- **Palm Orientation**: Direction it faces
- **Visual Cue**: Memory aid using visual metaphor

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

#### Writing Notes
```markdown
# Lesson Title (Audio + Visual Mode)

## Welcome to Audio-Enhanced Learning
[Explain that this content includes voice guidance]

## Sign Name

### Audio Description
*Listen to the pronunciation guide as you watch*

- **Hand Shape**: Description + verbal cue
- **Finger Position**: Description + what to say
- **Palm Orientation**: Description + audio marker
- **Verbal Cue**: "Say [word] to remember this sign"

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

❌ **DON'T:**
- Reference sound, audio, or "listen"
- Assume any auditory comprehension
- Use audio-dependent videos
- Include audio-only instructions
- Reference rhythm through sound

### Audio + Visual Mode Best Practices

✅ **DO:**
- Include voice narration scripts
- Suggest speaking out loud while signing
- Use verbal mnemonics
- Reference audio cues and pacing
- Include "say this" prompts
- Suggest recording and playback
- Use rhythm and vocal guidance

❌ **DON'T:**
- Make audio mandatory (keep visuals strong)
- Forget that some may use this with muted audio
- Lose the visual quality of instructions
- Over-rely on audio alone

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
      <NotesSection notes={content.notes} />
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

## Quality Checklist

### For Visual Mode Content

- [ ] All instructions can be understood without audio
- [ ] Videos have clear visual demonstrations
- [ ] Text descriptions are highly detailed
- [ ] Visual cues and metaphors are included
- [ ] Mirror practice is suggested where appropriate
- [ ] No audio-dependent elements present

### For Audio + Visual Mode Content

- [ ] Voice narration is available or scripted
- [ ] Verbal cues enhance learning
- [ ] Audio pacing guides are included
- [ ] "Speak aloud" practice is suggested
- [ ] Visual content is still strong (not audio-only)
- [ ] Rhythm and timing are addressed

### For Both Modes

- [ ] Learning objectives are clearly stated
- [ ] Content is accurate and verified
- [ ] Videos are high quality
- [ ] Quiz questions have 5 items each
- [ ] Exercises are practical and achievable
- [ ] Content respects learner preferences

## Testing Your Dual-Mode Lessons

1. **Visual Mode Test:**
   - Turn off all audio on your device
   - Go through the entire lesson
   - Can you complete everything without audio?
   - Are all instructions clear?

2. **Audio + Visual Mode Test:**
   - Enable audio and narration
   - Follow along with spoken guides
   - Does audio enhance the experience?
   - Are verbal cues helpful?

3. **Mode Switching Test:**
   - Switch between modes mid-lesson
   - Does content load correctly?
   - Is the experience seamless?

## Migration from Single-Mode Lessons

To convert existing single-mode lessons to dual-mode:

1. Rename file from `lesson1.json` to `lesson1-dual.json`
2. Wrap existing content in `"deaf"` object
3. Copy and modify for `"hearing"` object
4. Add audio-specific enhancements to hearing mode
5. Ensure visual mode has no audio dependencies
6. Test both modes thoroughly

## Common Mistakes to Avoid

### Visual Mode Mistakes

❌ "Listen to the video" → ✅ "Watch the video carefully"
❌ "The audio guide explains..." → ✅ "The video demonstrates..."
❌ Audio-dependent quiz questions → ✅ Visual-only questions
❌ Vague hand descriptions → ✅ Precise, detailed descriptions

### Audio + Visual Mode Mistakes

❌ Audio-only instructions → ✅ Audio + visual instructions
❌ Ignoring visual learners → ✅ Strong visuals with audio enhancement
❌ No verbal practice → ✅ Include "say it out loud" exercises

## Getting Help

- **Technical Issues**: Check implementation in `src/contexts/LearningModeContext.tsx`
- **Content Questions**: Review examples in `lesson1-dual.json`
- **Accessibility Concerns**: See `ACCESSIBILITY_GUIDE.md`
- **Best Practices**: Refer to `CONTENT_GUIDE.md`

## Resources

- [Accessibility Guidelines](./ACCESSIBILITY_GUIDE.md)
- [Video Production Guide](./VIDEO_QUIZ_GUIDE.md)
- [Content Creation Guide](./CONTENT_GUIDE.md)
