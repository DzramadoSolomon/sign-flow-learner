# Video Quiz Creation Guide

## Overview

All quizzes in the GSL Learning Platform use **video-based questions** to help learners practice sign recognition in a realistic context. Each lesson must have exactly **5 quiz questions**, with each question featuring a video demonstration.

## Video Requirements

### Technical Specifications
- **Platform**: YouTube (use embed URLs)
- **Duration**: 5-15 seconds per video
- **Format**: MP4, 1080p minimum
- **Aspect Ratio**: 16:9

### Content Guidelines
- **Framing**: Chest up to top of head (show full signing space)
- **Lighting**: Bright, even lighting with no shadows on hands
- **Background**: Plain, contrasting background (avoid patterns)
- **Clothing**: Solid colors that contrast with skin tone
- **Clarity**: Clear, deliberate movements at normal signing speed
- **Focus**: Show ONE specific sign per video

### Recording Tips
1. Position camera at signer's eye level
2. Ensure hands stay in frame during entire movement
3. Include facial expressions when relevant
4. Record in a quiet environment
5. Use a tripod for stability
6. Record multiple takes and choose the clearest

## Quiz Structure

### Required Elements (Per Question)

```json
{
  "id": "q1",                                          // Unique identifier
  "videoUrl": "https://www.youtube.com/embed/VIDEO_ID", // YouTube embed URL
  "question": "What sign is being shown in this video?", // Clear question
  "options": [                                         // 4 answer options
    "Option A",
    "Option B", 
    "Option C",
    "Option D"
  ],
  "correctAnswer": "Option A",                         // Must match one option exactly
  "explanation": "Brief explanation reinforcing the correct answer" // Optional but recommended
}
```

### Question Patterns

Use varied question formats to maintain engagement:
- "What sign is being shown in this video?"
- "Which letter is being demonstrated?"
- "Identify the greeting shown"
- "What word/phrase is being signed?"
- "Which sign matches this video?"

## Creating Effective Video Quizzes

### Step 1: Plan Your Questions
- Cover key concepts from the lesson
- Mix difficulty levels (3 easy, 1 medium, 1 challenging)
- Include common confusions (similar-looking signs)
- Ensure progression from simple to complex

### Step 2: Select Answer Options
- Make all options plausible
- Include common mistakes as distractors
- Use signs that are visually similar when appropriate
- Ensure only ONE clearly correct answer

### Step 3: Write Explanations
- Describe the key features of the correct sign
- Mention what makes it distinct from similar signs
- Reinforce proper technique
- Keep under 30 words

## Examples by Lesson Type

### Alphabet Lesson (Beginner)
```json
{
  "quiz": [
    {
      "id": "q1",
      "videoUrl": "https://www.youtube.com/embed/ABC123",
      "question": "What letter is being shown in this video?",
      "options": ["Letter A", "Letter S", "Letter E", "Letter M"],
      "correctAnswer": "Letter A",
      "explanation": "Letter A is a closed fist with the thumb resting on the side of your hand, palm facing forward."
    },
    {
      "id": "q2",
      "videoUrl": "https://www.youtube.com/embed/DEF456",
      "question": "Which letter is being demonstrated?",
      "options": ["Letter B", "Letter C", "Letter D", "Letter O"],
      "correctAnswer": "Letter B",
      "explanation": "Letter B is a flat hand with all fingers extended together and the thumb tucked across the palm."
    }
    // ... 3 more questions
  ]
}
```

### Greetings Lesson (Beginner)
```json
{
  "quiz": [
    {
      "id": "q1",
      "videoUrl": "https://www.youtube.com/embed/GHI789",
      "question": "What greeting is shown in this video?",
      "options": ["Hello", "Goodbye", "Thank you", "Please"],
      "correctAnswer": "Hello",
      "explanation": "The 'Hello' sign in GSL is shown by waving your hand with palm facing out, moving side to side."
    }
    // ... 4 more questions
  ]
}
```

### Numbers Lesson (Beginner)
```json
{
  "quiz": [
    {
      "id": "q1",
      "videoUrl": "https://www.youtube.com/embed/JKL012",
      "question": "What number is being signed?",
      "options": ["3", "5", "7", "9"],
      "correctAnswer": "5",
      "explanation": "The number 5 is shown with all five fingers extended and spread apart, palm facing forward."
    }
    // ... 4 more questions
  ]
}
```

## Common Mistakes to Avoid

### ❌ Don't Do This
```json
{
  "id": "q1",
  "videoUrl": "https://youtube.com/watch?v=ABC123",  // Wrong URL format
  "question": "Is this letter A?",                    // Yes/no question
  "options": ["Yes", "No"],                           // Only 2 options
  "correctAnswer": "Yes"
  // Missing explanation
}
```

### ✅ Do This Instead
```json
{
  "id": "q1",
  "videoUrl": "https://www.youtube.com/embed/ABC123", // Correct embed URL
  "question": "What letter is shown in this video?",   // Open question
  "options": ["Letter A", "Letter E", "Letter S", "Letter T"], // 4 options
  "correctAnswer": "Letter A",
  "explanation": "Letter A is formed with a closed fist and thumb on the side."
}
```

## Quality Checklist

Before publishing a lesson, verify:

### Videos
- [ ] All 5 videos are unique and working
- [ ] URLs are in YouTube embed format (`/embed/VIDEO_ID`)
- [ ] Videos are 5-15 seconds long
- [ ] Sign is clearly visible in each video
- [ ] Lighting and framing are appropriate
- [ ] Videos match the correct answers

### Questions
- [ ] Exactly 5 questions per lesson
- [ ] Questions follow recommended patterns
- [ ] All questions are clear and unambiguous
- [ ] Mix of difficulty levels included

### Options
- [ ] Each question has exactly 4 options
- [ ] Options are plausible and related
- [ ] Only one clearly correct answer per question
- [ ] Distractors include common mistakes

### Answers & Explanations
- [ ] Correct answers match video demonstrations
- [ ] Correct answer text matches option text exactly
- [ ] Explanations describe key features
- [ ] Explanations are concise (under 30 words)

## Getting Video Content

### Option 1: Record Your Own
- Follow technical specifications above
- Use a smartphone or camera with good quality
- Upload to YouTube as unlisted
- Get embed URL from YouTube share options

### Option 2: Use Existing GSL Resources
- Ensure you have permission to use
- Verify signs match GSL (not ASL or other sign languages)
- Check video quality meets requirements
- Create playlists for organized content

### Option 3: Collaborate with Deaf Community
- Work with GSL native signers
- Ensure cultural accuracy
- Get feedback on sign clarity
- Build authentic content library

## Updating Existing Lessons

When converting text-based quizzes to video format:

1. **Review existing questions** - Identify which concepts to test
2. **Record/source videos** - Create or find appropriate video demonstrations
3. **Rewrite questions** - Adapt to video format ("What sign is shown?")
4. **Adjust options** - Ensure they work with visual recognition
5. **Update explanations** - Focus on visual features of signs
6. **Test thoroughly** - Verify videos play and answers are correct

## Need Help?

- **Technical Issues**: Check docs/README.md for video embedding help
- **Content Questions**: See docs/CONTENT_GUIDE.md for lesson planning
- **Sign Accuracy**: Consult with GSL experts or Deaf community members
- **Video Production**: Review equipment and recording setup guides

---

Remember: Quality video content is essential for effective sign language learning. Take time to create clear, accurate demonstrations that help learners succeed!
