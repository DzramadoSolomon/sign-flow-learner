# GSL Learning Platform - Developer Documentation

Welcome to the GSL (Ghanaian Sign Language) Learning Platform documentation. This guide will help you understand the platform architecture, add new content, and extend functionality.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Architecture Overview](#architecture-overview)
3. [Adding New Lessons](#adding-new-lessons)
4. [Adding Videos](#adding-videos)
5. [Creating Lesson Notes](#creating-lesson-notes)
6. [Building Quizzes](#building-quizzes)
7. [Designing Exercises](#designing-exercises)
8. [Deployment Guide](#deployment-guide)

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd gsl-learning-platform

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

### Project Structure

```
src/
├── components/          # Reusable React components
│   ├── lesson/         # Lesson-specific components
│   │   ├── VideoSection.tsx
│   │   ├── NotesSection.tsx
│   │   ├── QuizSection.tsx
│   │   └── ExerciseSection.tsx
│   ├── LessonCard.tsx  # Lesson preview card
│   └── ui/             # shadcn UI components
├── data/
│   └── lessons/        # Lesson data files
│       └── beginner/   # Beginner level lessons
│           ├── lesson1.json
│           ├── lesson2.json
│           └── lesson3.json
├── pages/              # Route pages
│   ├── Index.tsx       # Landing page
│   ├── Lessons.tsx     # Lesson browser
│   └── Lesson.tsx      # Individual lesson viewer
├── types/              # TypeScript type definitions
│   └── lesson.ts
└── App.tsx            # Main app component with routing
```

---

## Architecture Overview

### Modular Design Philosophy

The platform is built with modularity in mind. Each lesson exists as a self-contained JSON file containing:
- Metadata (title, description, level, objectives)
- Video URL
- Markdown-formatted notes
- Quiz questions with answers
- Practice exercises

This design allows you to:
- Add new lessons without modifying core code
- Update content independently
- Scale from beginner to advanced levels easily

### Key Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling with custom design system
- **shadcn/ui** - Component library
- **React Router** - Navigation
- **React Markdown** - Markdown rendering for notes

---

## Adding New Lessons

### Step 1: Create Lesson JSON File

Create a new file in `src/data/lessons/[level]/lesson[number].json`

Example: `src/data/lessons/beginner/lesson4.json`

### Step 2: Define Lesson Structure

```json
{
  "metadata": {
    "id": "beginner-4",
    "title": "Your Lesson Title",
    "description": "Brief description of the lesson",
    "level": "beginner",
    "duration": 20,
    "objectives": [
      "First learning objective",
      "Second learning objective",
      "Third learning objective"
    ],
    "tags": ["tag1", "tag2", "tag3"],
    "order": 4
  },
  "videoUrl": "https://www.youtube.com/embed/VIDEO_ID",
  "notes": "# Markdown content here\n\nYour lesson notes...",
  "quiz": [ /* Quiz questions array */ ],
  "exercises": [ /* Exercises array */ ]
}
```

### Step 3: Import in Lessons Page

Edit `src/pages/Lessons.tsx`:

```typescript
import lesson4 from "@/data/lessons/beginner/lesson4.json";

const lessons = [lesson1, lesson2, lesson3, lesson4];
```

### Step 4: Add to Lesson Viewer

Edit `src/pages/Lesson.tsx`:

```typescript
import lesson4 from "@/data/lessons/beginner/lesson4.json";

const lessonsMap: { [key: string]: LessonContent } = {
  'beginner-1': lesson1 as LessonContent,
  'beginner-2': lesson2 as LessonContent,
  'beginner-3': lesson3 as LessonContent,
  'beginner-4': lesson4 as LessonContent,
};
```

---

## Adding Videos

### Supported Video Sources

1. **YouTube** (Recommended for external hosting)
2. **Vimeo**
3. **Self-hosted MP4** (for local videos)

### YouTube Videos

```json
{
  "videoUrl": "https://www.youtube.com/embed/VIDEO_ID"
}
```

To get the embed URL:
1. Go to your YouTube video
2. Click "Share" → "Embed"
3. Copy the URL from the `src` attribute

### Vimeo Videos

```json
{
  "videoUrl": "https://player.vimeo.com/video/VIDEO_ID"
}
```

### Self-Hosted Videos

1. Place MP4 file in `public/videos/`
2. Reference in lesson:

```json
{
  "videoUrl": "/videos/lesson-4-demo.mp4"
}
```

### Video Guidelines

- **Resolution**: Minimum 720p (1280x720), recommended 1080p
- **Format**: MP4 (H.264 codec) for self-hosted
- **Duration**: Keep under 15 minutes per segment
- **Lighting**: Ensure hands are clearly visible
- **Background**: Use contrasting background for better visibility

---

## Creating Lesson Notes

### Markdown Format

Lesson notes use Markdown for easy formatting. The platform supports:

- Headings (`#`, `##`, `###`)
- Lists (ordered and unordered)
- Bold and italic text
- Links
- Paragraphs

### Example Structure

```markdown
# Lesson Title

## Introduction
Brief introduction to the topic...

## Main Content

### Subtopic 1
- Point 1
- Point 2
- Point 3

### Subtopic 2
**Important tip**: Use bold for emphasis

## Practice Tips
1. First tip
2. Second tip
3. Third tip

## Common Mistakes
- Mistake 1 and how to avoid it
- Mistake 2 and correction method
```

### Best Practices

1. **Use Clear Headings**: Structure content hierarchically
2. **Include Visual Descriptions**: Describe hand shapes clearly
3. **Add Practice Tips**: Help learners avoid common mistakes
4. **Keep Sections Focused**: Break long content into digestible chunks
5. **Use Lists**: Make information scannable

### Formatting Tips

```markdown
# H1 - Main lesson title
## H2 - Major sections
### H3 - Subsections

**Bold** for hand shapes and key terms
*Italic* for emphasis
- Bullet points for tips
1. Numbered lists for sequences
```

---

## Building Quizzes

### Quiz Question Structure

```json
{
  "quiz": [
    {
      "id": "q1",
      "question": "What is the correct hand shape for the letter 'A' in GSL?",
      "options": [
        "Closed fist with thumb on the side",
        "Open palm facing up",
        "Index finger pointing up",
        "Curved hand like letter C"
      ],
      "correctAnswer": "Closed fist with thumb on the side",
      "explanation": "Letter A is formed with a closed fist and the thumb resting visibly on the side of your hand."
    }
  ]
}
```

### Quiz Question Types

#### Multiple Choice (Current Implementation)
- 4 options per question
- 1 correct answer
- Optional explanation

#### Future Enhancements
- True/False questions
- Fill-in-the-blank
- Image-based recognition
- Video response matching

### Writing Good Quiz Questions

1. **Be Specific**: Ask about concrete concepts taught in the lesson
2. **Avoid Ambiguity**: Make sure there's only one correct answer
3. **Use Clear Language**: Keep questions simple and direct
4. **Provide Explanations**: Help learners understand why an answer is correct
5. **Progressive Difficulty**: Start easy, increase complexity

### Example Quiz Patterns

**Knowledge Recall**:
```json
{
  "question": "Which letter requires a motion in GSL?",
  "options": ["A", "E", "G", "J"],
  "correctAnswer": "J",
  "explanation": "Letter J is unique because it involves drawing a 'J' shape in the air."
}
```

**Application**:
```json
{
  "question": "When signing 'Hello', what should your facial expression be?",
  "options": [
    "Neutral expression",
    "Smile warmly",
    "Serious expression",
    "Closed eyes"
  ],
  "correctAnswer": "Smile warmly",
  "explanation": "Facial expressions are crucial in sign language. A warm smile during greetings shows friendliness and engagement."
}
```

---

## Designing Exercises

### Exercise Structure

```json
{
  "exercises": [
    {
      "id": "ex1",
      "instruction": "Practice spelling these words using letters A-E",
      "type": "practice",
      "content": {
        "words": ["CAB", "BED", "ACE", "BAD", "DAD"]
      }
    }
  ]
}
```

### Exercise Types

#### 1. Practice Exercise
Repetitive practice to build muscle memory

```json
{
  "id": "ex1",
  "instruction": "Practice each letter 10 times in front of a mirror",
  "type": "practice",
  "content": {
    "repetitions": 10,
    "letters": ["A", "B", "C", "D", "E"]
  }
}
```

#### 2. Video Response Exercise
Record and compare your signing

```json
{
  "id": "ex2",
  "instruction": "Record yourself signing these words and compare to the lesson video",
  "type": "video-response",
  "content": {
    "words": ["HELLO", "THANK YOU", "SORRY"]
  }
}
```

#### 3. Matching Exercise
Connect signs with meanings

```json
{
  "id": "ex3",
  "instruction": "Match the description to the correct sign",
  "type": "matching",
  "content": {
    "pairs": [
      { "description": "Closed fist with thumb visible", "sign": "Letter A" },
      { "description": "Flat hand, fingers together", "sign": "Letter B" }
    ]
  }
}
```

### Progressive Exercise Design

**Lesson 1 Exercises** (Foundation):
- Practice individual letters
- Mirror work for hand shapes
- Slow, deliberate movements

**Lesson 2 Exercises** (Building):
- Combine letters from Lesson 1 + 2
- Spell simple words
- Work on transitions

**Lesson 3 Exercises** (Integration):
- Use previous letters in greeting phrases
- Practice with context
- Add facial expressions

### Exercise Best Practices

1. **Build on Previous Lessons**: Reference earlier material
2. **Vary Activity Types**: Mix repetition, creation, and recognition
3. **Set Clear Goals**: Specific instructions and success criteria
4. **Include Repetitions**: Muscle memory requires practice
5. **Encourage Self-Assessment**: Use mirrors, recordings

---

## Deployment Guide

### Building for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

### Deployment Options

#### Option 1: Lovable Platform (Recommended)

1. Click "Share" → "Publish" in Lovable interface
2. Your app is automatically deployed
3. Get a `.lovable.app` domain
4. Optional: Connect custom domain in Project Settings

#### Option 2: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo to Vercel dashboard for automatic deploys.

#### Option 3: Netlify

1. Connect GitHub repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Deploy automatically on push

#### Option 4: GitHub Pages

```bash
# Install gh-pages
npm install -D gh-pages

# Add to package.json scripts:
"deploy": "gh-pages -d dist"

# Deploy
npm run deploy
```

### Environment Variables

If you need environment variables (for APIs, etc.):

1. Create `.env` file:
```
VITE_API_KEY=your_api_key
VITE_API_URL=https://api.example.com
```

2. Access in code:
```typescript
const apiKey = import.meta.env.VITE_API_KEY;
```

3. Set in deployment platform's environment variables section

### Performance Optimization

- Videos: Use CDN or video hosting (YouTube/Vimeo) for better performance
- Images: Optimize and use WebP format when possible
- Lazy Loading: Videos and images load only when needed
- Code Splitting: Implemented via React lazy loading

---

## Maintenance & Updates

### Adding New Lesson Levels

Create new folders: `intermediate/` or `advanced/`

```
src/data/lessons/
├── beginner/
├── intermediate/  # New
│   ├── lesson1.json
│   └── lesson2.json
└── advanced/      # New
    └── lesson1.json
```

### Updating Existing Lessons

1. Edit the JSON file
2. Changes reflect immediately in development
3. Rebuild and redeploy for production

### Content Review Checklist

Before publishing new lessons:
- [ ] Video links work and are embedded correctly
- [ ] Lesson notes are grammatically correct
- [ ] All quiz answers are accurate
- [ ] Exercises build on previous content
- [ ] Objectives match lesson content
- [ ] Tags are relevant
- [ ] Duration estimate is realistic

---

## Troubleshooting

### Common Issues

**Video not loading:**
- Check if URL is correct and accessible
- Ensure embed URL format (not watch URL)
- Verify CORS settings for self-hosted videos

**Lesson not appearing:**
- Verify JSON syntax is valid
- Check import statements in Lessons.tsx and Lesson.tsx
- Ensure lesson ID is unique

**Markdown not rendering:**
- Check for proper escaping of special characters
- Verify newline characters (`\n`) in JSON strings

**Build errors:**
- Run `npm install` to ensure dependencies are up to date
- Check TypeScript types match JSON structure
- Review console for specific error messages

---

## Contributing

### Code Style

- Use TypeScript for type safety
- Follow existing component patterns
- Use semantic HTML elements
- Maintain accessibility standards (WCAG)
- Comment complex logic

### Pull Request Process

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-lesson`)
3. Commit changes (`git commit -m 'Add lesson 4: Numbers'`)
4. Push to branch (`git push origin feature/new-lesson`)
5. Open Pull Request

---

## Support & Resources

- **Documentation**: `docs/README.md` (this file)
- **Component Docs**: See individual component files for prop documentation
- **Design System**: Review `src/index.css` for color tokens and styles

---

## License

[Specify your license here]

---

**Last Updated**: 2025-11-03
**Version**: 1.0.0
