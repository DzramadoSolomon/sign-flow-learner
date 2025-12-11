# GSL Dictionary Feature Guide

This guide covers the GSL Dictionary feature, including vocabulary browsing, favorites system, and quiz functionality.

## Table of Contents

1. [Overview](#overview)
2. [Dictionary Features](#dictionary-features)
3. [Favorites System](#favorites-system)
4. [Vocabulary Quiz](#vocabulary-quiz)
5. [Adding/Editing Dictionary Words](#addingediting-dictionary-words)
6. [Technical Implementation](#technical-implementation)

---

## Overview

The GSL Dictionary is a searchable vocabulary reference that allows users to learn Ghanaian Sign Language (GSL) signs through embedded YouTube videos. It supports:

- **A-Z letter filtering** - Browse words by first letter
- **Search functionality** - Find specific words quickly
- **Favorites** - Bookmark words for later review
- **Quiz mode** - Test knowledge on favorited words

The dictionary is accessible from:
- Dashboard quick actions
- Sidebar navigation
- Both Deaf/Hard-of-Hearing and Hearing Learner modes

---

## Dictionary Features

### Browsing Words

Users can browse the dictionary in two ways:

1. **Letter Filter**: Click any letter (A-Z) to show words starting with that letter
2. **Search**: Type in the search box to filter words by name

### Viewing Sign Videos

Each dictionary word has an associated YouTube video demonstrating the sign:

1. Click the **Play** button on any word card
2. A modal dialog opens with the embedded YouTube video
3. The video auto-plays when the dialog opens
4. Close the dialog by clicking outside or pressing the X button

### Mobile Optimization

The dictionary is optimized for mobile portrait view:
- Single-column list layout on small screens
- Compact word cards with essential information
- Responsive video dialog that fits the screen

---

## Favorites System

### Adding Favorites

1. Click the **Heart icon** on any word card
2. The heart fills in red to indicate the word is favorited
3. Favorites are saved to `localStorage` and persist across sessions

### Viewing Favorites

1. Click the **"Favorites"** tab at the top of the dictionary
2. Only favorited words are displayed
3. Shows a count of total favorited words

### Removing Favorites

1. Click the filled **Heart icon** on a favorited word
2. The heart returns to outline state
3. The word is removed from favorites

### Storage

Favorites are stored in `localStorage` under the key:
```
gsl_dictionary_favorites
```

Data format:
```json
["word1", "word2", "word3"]
```

---

## Vocabulary Quiz

The quiz mode tests users on their favorited vocabulary words.

### Requirements

- **Minimum 4 favorited words** required to start a quiz
- Quiz randomly selects from favorited words only

### Quiz Flow

1. Navigate to the **"Quiz"** tab in the dictionary
2. Click **"Start Quiz"** button
3. Each question shows 4 answer options
4. Watch the video and select the correct word
5. Immediate feedback shows correct/incorrect
6. Progress through all questions
7. View final score at the end

### Quiz Features

- **Random question order** - Questions are shuffled each quiz
- **Video-based questions** - Each question plays a sign video
- **Multiple choice** - 4 options per question (1 correct, 3 random)
- **Progress tracking** - Shows current question number
- **Score display** - Final percentage and correct count
- **Retry option** - Start a new quiz after completion

### Quiz Logic

```typescript
// Quiz generates questions from favorites
const generateQuizQuestions = () => {
  const shuffled = [...favoriteWords].sort(() => Math.random() - 0.5);
  return shuffled.map(word => ({
    correctAnswer: word,
    options: generateOptions(word), // 1 correct + 3 random
    videoUrl: word.videoUrl
  }));
};
```

---

## Adding/Editing Dictionary Words

### Dictionary Data Location

All dictionary words are stored in:
```
src/data/dictionary.ts
```

### Word Structure

Each dictionary word follows this interface:

```typescript
interface DictionaryWord {
  id: string;           // Unique identifier (lowercase, no spaces)
  word: string;         // Display name of the word
  category: string;     // Category (e.g., "Greetings", "Numbers", "Family")
  videoUrl: string;     // YouTube embed URL
  description?: string; // Optional description of the sign
}
```

### Adding a New Word

1. Open `src/data/dictionary.ts`
2. Add a new entry to the `dictionaryWords` array:

```typescript
export const dictionaryWords: DictionaryWord[] = [
  // ... existing words
  
  {
    id: "new-word",
    word: "New Word",
    category: "Category Name",
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID",
    description: "Optional description of how to make this sign"
  },
];
```

### YouTube Video URL Format

**Important**: Use the **embed** URL format, not the regular watch URL:

```
✅ Correct: https://www.youtube.com/embed/VIDEO_ID
❌ Wrong:   https://www.youtube.com/watch?v=VIDEO_ID
```

To convert a YouTube URL:
1. Get the video ID from `youtube.com/watch?v=VIDEO_ID`
2. Use format: `https://www.youtube.com/embed/VIDEO_ID`

### Adding Video Parameters

You can add autoplay and other parameters:

```typescript
videoUrl: "https://www.youtube.com/embed/VIDEO_ID?autoplay=1&rel=0"
```

Common parameters:
- `autoplay=1` - Auto-play when loaded
- `rel=0` - Don't show related videos
- `start=10` - Start at 10 seconds
- `end=30` - End at 30 seconds

### Categories

Current categories include:
- Greetings
- Numbers
- Family
- Colors
- Days
- Common Phrases
- Actions/Verbs
- Objects

To add a new category, simply use the new category name in the `category` field.

### Editing Existing Words

1. Find the word in `src/data/dictionary.ts`
2. Modify the relevant fields
3. Save the file

Example - updating a video URL:
```typescript
{
  id: "hello",
  word: "Hello",
  category: "Greetings",
  videoUrl: "https://www.youtube.com/embed/NEW_VIDEO_ID", // Updated
  description: "Wave hand side to side"
},
```

### Removing Words

1. Find the word entry in the array
2. Delete the entire object (including the trailing comma if needed)
3. Save the file

---

## Technical Implementation

### File Structure

```
src/
├── data/
│   └── dictionary.ts          # Dictionary word data
├── components/
│   └── dictionary/
│       └── VocabularyQuiz.tsx  # Quiz component
└── pages/
    └── Dictionary.tsx          # Main dictionary page
```

### Key Components

#### Dictionary Page (`src/pages/Dictionary.tsx`)

Main page component handling:
- Tab navigation (All Words, Favorites, Quiz)
- Search and letter filtering
- Favorites management (localStorage)
- Video dialog display
- Mobile responsiveness

#### Vocabulary Quiz (`src/components/dictionary/VocabularyQuiz.tsx`)

Quiz component handling:
- Question generation from favorites
- Answer validation
- Score tracking
- Progress display

### State Management

```typescript
// Dictionary page state
const [searchTerm, setSearchTerm] = useState("");
const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
const [selectedWord, setSelectedWord] = useState<DictionaryWord | null>(null);
const [favorites, setFavorites] = useState<string[]>([]);
const [activeTab, setActiveTab] = useState("all");
```

### localStorage Keys

| Key | Purpose | Data Type |
|-----|---------|-----------|
| `gsl_dictionary_favorites` | User's favorited words | `string[]` |

### Filtering Logic

```typescript
// Filter words based on search, letter, and tab
const filteredWords = dictionaryWords.filter(word => {
  const matchesSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesLetter = !selectedLetter || word.word.startsWith(selectedLetter);
  const matchesFavorites = activeTab !== "favorites" || favorites.includes(word.id);
  return matchesSearch && matchesLetter && matchesFavorites;
});
```

---

## Customization

### Styling

The dictionary uses Tailwind CSS with semantic tokens from the design system:

- Cards use `bg-card` and `border-border`
- Text uses `text-foreground` and `text-muted-foreground`
- Accent colors use `text-primary` and theme variables

### Adding New Features

Potential enhancements:
1. **Categories filter** - Filter by category in addition to letters
2. **Recent words** - Track recently viewed words
3. **Progress tracking** - Show which words user has learned
4. **Spaced repetition** - Quiz algorithm based on learning science
5. **Export favorites** - Download favorites list

---

## Troubleshooting

### Video Not Playing

1. Check the YouTube URL format (must be embed URL)
2. Verify the video is not private or deleted
3. Check for ad blockers interfering

### Favorites Not Saving

1. Check if localStorage is enabled in browser
2. Clear browser storage and re-add favorites
3. Check console for storage quota errors

### Quiz Not Starting

1. Ensure at least 4 words are favorited
2. Check the Favorites tab to verify favorites are saved
3. Refresh the page and try again

---

## API Reference

### DictionaryWord Interface

```typescript
interface DictionaryWord {
  id: string;
  word: string;
  category: string;
  videoUrl: string;
  description?: string;
}
```

### VocabularyQuiz Props

```typescript
interface VocabularyQuizProps {
  favoriteWords: DictionaryWord[];
  allWords: DictionaryWord[];
}
```

### Quiz Question Interface

```typescript
interface QuizQuestion {
  word: DictionaryWord;
  options: DictionaryWord[];
}
```
