# Content Creation Guide

This guide provides detailed instructions for content creators adding lessons to the GSL Learning Platform.

## Quick Start Checklist

Before creating a new lesson, ensure you have:
- [ ] Defined learning objectives
- [ ] Prepared or identified video content
- [ ] Written detailed lesson notes
- [ ] Created at least 3 quiz questions
- [ ] Designed 2-3 practice exercises
- [ ] Reviewed content for accuracy

## Lesson Planning Template

### 1. Define Objectives

**What will students learn?**
- List 3-5 specific, measurable objectives
- Use action verbs (master, recognize, demonstrate, practice)
- Ensure objectives are achievable in the lesson duration

Example:
- ✓ "Master hand shapes for letters K through O"
- ✗ "Learn sign language" (too broad)

### 2. Choose Duration

- **10-15 minutes**: Single concept (e.g., 5 alphabet letters)
- **15-20 minutes**: Multiple related concepts (e.g., greetings + responses)
- **20-30 minutes**: Complex topic with practice (e.g., conversational phrases)

### 3. Select Appropriate Level

- **Beginner**: No prior knowledge required
- **Intermediate**: Assumes completion of beginner lessons
- **Advanced**: Requires intermediate proficiency

## Video Content Guidelines

### Recording Tips

**Equipment:**
- Camera: Minimum 1080p resolution
- Lighting: Front-facing, bright natural or ring light
- Background: Solid color that contrasts with skin tone (avoid white or very light backgrounds)
- Microphone: Clear audio for explanations

**Framing:**
- Show from waist up (include full signing space)
- Keep hands in frame at all times
- Maintain consistent framing throughout video

**Demonstration:**
- Slow, deliberate movements initially
- Repeat each sign 2-3 times
- Show from multiple angles if helpful
- Explain while signing

**Video Structure:**
1. Introduction (10%)
2. Demonstration of each sign (70%)
3. Practice together segment (15%)
4. Summary (5%)

### Video Hosting

**YouTube (Recommended):**
- Upload to dedicated GSL Learning channel
- Title format: "GSL Lesson [Number]: [Title]"
- Add closed captions/subtitles
- Set to "Unlisted" or "Public"
- Add to lesson playlist

**Getting Embed Code:**
1. Open video on YouTube
2. Click "Share" button
3. Click "Embed"
4. Copy the URL from `src="..."`
5. Use this URL in your lesson JSON

## Writing Lesson Notes

### Structure

Every lesson should follow this structure:

```markdown
# [Lesson Title]

## Introduction
Brief overview of what students will learn (2-3 sentences)

## [Main Sign 1]
- **Hand Shape**: Detailed description
- **Position**: Where hands are positioned
- **Movement**: Any motion involved
- **Tip**: Common mistake or helpful hint

## [Main Sign 2]
[Same structure as above]

## Practice Tips
1. Specific practice suggestions
2. How to self-check accuracy
3. Common mistakes to avoid

## Review Section (if applicable)
- Connect to previous lessons
- Show how concepts build

## Cultural Notes (if applicable)
- Context about Deaf culture
- Appropriate usage
- Social etiquette
```

### Writing Style

**Do:**
- Use clear, simple language
- Be specific and descriptive
- Include tips for accuracy
- Mention common mistakes
- Add cultural context when relevant

**Don't:**
- Assume knowledge not yet taught
- Use jargon without explanation
- Skip steps in instructions
- Overload with information

### Example: Good vs. Poor Descriptions

**❌ Poor:**
"Make the sign for 'B'"

**✓ Good:**
"Letter B - Form a flat hand with all four fingers extended straight up and held together. Your thumb should be tucked across your palm. Keep your palm facing forward. Hold your hand at shoulder height."

## Creating Effective Quizzes

### Question Types & When to Use Them

**Knowledge Recall** (Early lessons):
- Tests basic facts and definitions
- "What is the hand shape for letter X?"
- Good for: alphabet, basic vocabulary

**Application** (Mid lessons):
- Tests understanding in context
- "When would you use this sign?"
- Good for: greetings, conversations, phrases

**Analysis** (Advanced lessons):
- Tests deeper understanding
- "What makes this sign different from...?"
- Good for: similar signs, nuanced meanings

### Writing Quiz Questions

**Structure:**
```json
{
  "id": "unique-id",
  "question": "Clear, specific question?",
  "options": [
    "Correct answer",
    "Plausible wrong answer",
    "Another wrong answer",
    "Third wrong answer"
  ],
  "correctAnswer": "Correct answer",
  "explanation": "Why this is correct and what students should remember"
}
```

**Question Quality Checklist:**
- [ ] Question is clear and unambiguous
- [ ] Only one answer is definitively correct
- [ ] Wrong answers are plausible but clearly incorrect
- [ ] Explanation teaches, not just confirms
- [ ] Relates directly to lesson content

**Example Questions:**

**Beginner:**
```json
{
  "question": "Which letter is formed with only the pinky finger extended?",
  "options": ["H", "I", "J", "K"],
  "correctAnswer": "I",
  "explanation": "Letter I is signed with only the pinky extended upward, while other fingers remain closed in a fist."
}
```

**Intermediate:**
```json
{
  "question": "When signing 'THANK YOU', which direction should your hand move?",
  "options": [
    "From chin forward and down",
    "From forehead to chin",
    "Circular motion on chest",
    "Side to side at shoulder"
  ],
  "correctAnswer": "From chin forward and down",
  "explanation": "THANK YOU starts at the chin and moves forward and downward toward the person you're thanking, accompanied by a smile."
}
```

## Designing Practice Exercises

### Exercise Progression

**Lesson 1 (Foundation):**
- Individual sign practice
- Mirror work
- Repetition focus

**Lesson 2-3 (Building):**
- Combining signs
- Simple sequences
- Adding facial expressions

**Lesson 4+ (Integration):**
- Conversational practice
- Context-based exercises
- Creative application

### Exercise Types Explained

#### 1. Mirror Practice
**When to use:** New hand shapes, fine motor control
```json
{
  "instruction": "Stand in front of a mirror. Practice each sign 10 times, checking your hand shape matches the video.",
  "type": "practice",
  "content": {
    "repetitions": 10,
    "signs": ["Sign1", "Sign2"]
  }
}
```

#### 2. Word Spelling
**When to use:** Alphabet lessons, fingerspelling
```json
{
  "instruction": "Practice spelling these words using the alphabet you've learned",
  "type": "practice",
  "content": {
    "words": ["CAT", "DOG", "BOOK"]
  }
}
```

#### 3. Sequence Building
**When to use:** Phrases, conversations
```json
{
  "instruction": "Practice this greeting sequence: HELLO → HOW ARE YOU? → THANK YOU → GOODBYE",
  "type": "practice",
  "content": {
    "sequence": ["HELLO", "HOW ARE YOU", "THANK YOU", "GOODBYE"]
  }
}
```

#### 4. Video Recording
**When to use:** Self-assessment, advanced practice
```json
{
  "instruction": "Record yourself signing these phrases. Watch back and compare to the lesson video.",
  "type": "video-response",
  "content": {
    "phrases": ["Good morning", "How are you?", "I'm fine, thank you"]
  }
}
```

### Exercise Writing Tips

1. **Be Specific**: "Practice 10 times" vs. "Practice a lot"
2. **Set Goals**: Define what success looks like
3. **Build Incrementally**: Easy → Medium → Hard
4. **Reference Previous Material**: Connect lessons
5. **Encourage Self-Check**: Use mirrors, recordings, checklists

## Tags & Metadata

### Choosing Good Tags

**Purpose:** Help students find related content and filter lessons

**Examples:**
- **Content tags**: `alphabet`, `numbers`, `greetings`, `conversation`
- **Skill tags**: `fingerspelling`, `facial-expressions`, `grammar`
- **Context tags**: `formal`, `informal`, `professional`, `social`

**Guidelines:**
- Use 3-5 tags per lesson
- Be consistent across similar lessons
- Choose tags students would search for
- Avoid overly specific tags

### Level Assignment

**Beginner:**
- No prerequisites
- Basic alphabet, numbers
- Common greetings
- Simple vocabulary

**Intermediate:**
- Requires beginner completion
- Sentence structure
- Conversational skills
- Context-aware signing

**Advanced:**
- Requires intermediate proficiency
- Complex grammar
- Storytelling
- Cultural nuances
- Regional variations

## Quality Assurance Checklist

### Before Publishing

**Content Review:**
- [ ] All signs demonstrated correctly
- [ ] Notes are clear and accurate
- [ ] Video link works and embeds properly
- [ ] Quiz answers are correct
- [ ] Exercises are appropriate for level
- [ ] No typos or grammatical errors

**Technical Review:**
- [ ] JSON syntax is valid
- [ ] All required fields are filled
- [ ] IDs are unique
- [ ] Duration is realistic
- [ ] Tags are appropriate

**Accessibility Review:**
- [ ] Video has good lighting and framing
- [ ] Notes are clear for screen readers
- [ ] Instructions are unambiguous
- [ ] No assumptions about ability

**User Experience:**
- [ ] Lesson flows logically
- [ ] Difficulty is appropriate for level
- [ ] Builds on previous lessons
- [ ] Provides adequate practice

### Testing New Lessons

1. **Self-Review**: Complete lesson as if you're a student
2. **Peer Review**: Have another instructor review
3. **User Test**: Have a beginner try the lesson
4. **Iterate**: Refine based on feedback

## Examples: Complete Lessons

### Example 1: Beginner Alphabet Lesson

**Good Structure:**
- 5 letters per lesson (manageable chunk)
- Clear hand shape descriptions
- Practice words using learned letters
- Mirror practice exercise
- Quiz on hand shapes

**Duration:** 15 minutes (realistic for 5 letters)

### Example 2: Intermediate Conversation Lesson

**Good Structure:**
- Builds on beginner greetings
- Adds conversational responses
- Includes cultural context
- Practices question forms
- Role-play exercise

**Duration:** 20 minutes (conversation practice takes time)

### Example 3: Advanced Grammar Lesson

**Good Structure:**
- Assumes vocabulary knowledge
- Focuses on structure and order
- Includes complex examples
- Video analysis exercise
- Contextual quiz questions

**Duration:** 25 minutes (complex concepts need time)

## Common Mistakes to Avoid

### Content Mistakes

❌ **Too Much Information:**
Trying to teach 10 letters in 15 minutes

✓ **Right Amount:**
5 letters with adequate practice time

---

❌ **Assuming Knowledge:**
Using signs not yet taught in instructions

✓ **Building Progressively:**
Only referencing previously taught content

---

❌ **Poor Video Quality:**
Dim lighting, hands cut off in frame

✓ **Professional Quality:**
Well-lit, properly framed, clear demonstration

### Quiz Mistakes

❌ **Ambiguous Questions:**
"What's the best way to sign 'Hello'?" (subjective)

✓ **Clear Questions:**
"Which movement is used when signing 'Hello'?" (objective)

---

❌ **Trick Questions:**
Designed to confuse rather than test knowledge

✓ **Fair Questions:**
Test understanding of taught material

### Exercise Mistakes

❌ **Vague Instructions:**
"Practice the signs from this lesson"

✓ **Specific Instructions:**
"Practice letters A-E, 5 times each, focusing on thumb position"

---

❌ **No Self-Check:**
Exercise with no way to verify correctness

✓ **Built-in Assessment:**
"Use a mirror to check hand shape matches video"

## Getting Help

**Questions about:**
- Content accuracy → Contact lead instructor
- Technical implementation → See docs/README.md
- Video production → See video guidelines section
- Accessibility → Review WCAG guidelines

---

**Remember:** Quality over quantity. One excellent lesson is better than three mediocre ones!

---

**Last Updated**: 2025-11-03
