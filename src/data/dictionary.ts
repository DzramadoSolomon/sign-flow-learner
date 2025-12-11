// Dictionary data with common words A-Z and placeholder YouTube video IDs
// Replace videoId values with actual YouTube video IDs for each sign

export interface DictionaryWord {
  word: string;
  description: string;
  videoId: string; // YouTube video ID
  category: string;
}

export const dictionaryWords: DictionaryWord[] = [
  // A
  { word: "Apple", description: "A common fruit", videoId: "dQw4w9WgXcQ", category: "Food" },
  { word: "Animal", description: "Living creatures", videoId: "dQw4w9WgXcQ", category: "Nature" },
  { word: "Ask", description: "To request information", videoId: "dQw4w9WgXcQ", category: "Action" },
  
  // B
  { word: "Baby", description: "A young child", videoId: "dQw4w9WgXcQ", category: "Family" },
  { word: "Book", description: "Written or printed pages", videoId: "dQw4w9WgXcQ", category: "Objects" },
  { word: "Brother", description: "Male sibling", videoId: "dQw4w9WgXcQ", category: "Family" },
  
  // C
  { word: "Cat", description: "A domestic feline", videoId: "dQw4w9WgXcQ", category: "Animals" },
  { word: "Car", description: "A motor vehicle", videoId: "dQw4w9WgXcQ", category: "Transport" },
  { word: "Come", description: "Move towards", videoId: "dQw4w9WgXcQ", category: "Action" },
  
  // D
  { word: "Dog", description: "A domestic canine", videoId: "dQw4w9WgXcQ", category: "Animals" },
  { word: "Door", description: "Entry/exit point", videoId: "dQw4w9WgXcQ", category: "Objects" },
  { word: "Drink", description: "To consume liquid", videoId: "dQw4w9WgXcQ", category: "Action" },
  
  // E
  { word: "Eat", description: "To consume food", videoId: "dQw4w9WgXcQ", category: "Action" },
  { word: "Eye", description: "Organ for seeing", videoId: "dQw4w9WgXcQ", category: "Body" },
  { word: "Evening", description: "End of day", videoId: "dQw4w9WgXcQ", category: "Time" },
  
  // F
  { word: "Father", description: "Male parent", videoId: "dQw4w9WgXcQ", category: "Family" },
  { word: "Food", description: "What we eat", videoId: "dQw4w9WgXcQ", category: "Food" },
  { word: "Friend", description: "A companion", videoId: "dQw4w9WgXcQ", category: "People" },
  
  // G
  { word: "Go", description: "To move/travel", videoId: "dQw4w9WgXcQ", category: "Action" },
  { word: "Good", description: "Positive quality", videoId: "dQw4w9WgXcQ", category: "Adjective" },
  { word: "Goodbye", description: "Farewell greeting", videoId: "dQw4w9WgXcQ", category: "Greetings" },
  
  // H
  { word: "Hello", description: "A greeting", videoId: "dQw4w9WgXcQ", category: "Greetings" },
  { word: "Help", description: "To assist", videoId: "dQw4w9WgXcQ", category: "Action" },
  { word: "House", description: "A dwelling", videoId: "dQw4w9WgXcQ", category: "Places" },
  
  // I
  { word: "I", description: "First person pronoun", videoId: "dQw4w9WgXcQ", category: "Pronouns" },
  { word: "Ice", description: "Frozen water", videoId: "dQw4w9WgXcQ", category: "Nature" },
  
  // J
  { word: "Job", description: "Work/employment", videoId: "dQw4w9WgXcQ", category: "Work" },
  { word: "Jump", description: "To leap", videoId: "dQw4w9WgXcQ", category: "Action" },
  
  // K
  { word: "Key", description: "Tool for locks", videoId: "dQw4w9WgXcQ", category: "Objects" },
  { word: "Kind", description: "Caring nature", videoId: "dQw4w9WgXcQ", category: "Adjective" },
  
  // L
  { word: "Learn", description: "To gain knowledge", videoId: "dQw4w9WgXcQ", category: "Action" },
  { word: "Love", description: "Deep affection", videoId: "dQw4w9WgXcQ", category: "Emotions" },
  
  // M
  { word: "Mother", description: "Female parent", videoId: "dQw4w9WgXcQ", category: "Family" },
  { word: "Money", description: "Currency", videoId: "dQw4w9WgXcQ", category: "Objects" },
  { word: "Morning", description: "Start of day", videoId: "dQw4w9WgXcQ", category: "Time" },
  
  // N
  { word: "Name", description: "What you're called", videoId: "dQw4w9WgXcQ", category: "Identity" },
  { word: "Night", description: "Dark hours", videoId: "dQw4w9WgXcQ", category: "Time" },
  { word: "No", description: "Negative response", videoId: "dQw4w9WgXcQ", category: "Response" },
  
  // O
  { word: "Open", description: "Not closed", videoId: "dQw4w9WgXcQ", category: "Action" },
  { word: "Orange", description: "A citrus fruit", videoId: "dQw4w9WgXcQ", category: "Food" },
  
  // P
  { word: "Please", description: "Polite request", videoId: "dQw4w9WgXcQ", category: "Polite" },
  { word: "Phone", description: "Communication device", videoId: "dQw4w9WgXcQ", category: "Objects" },
  
  // Q
  { word: "Question", description: "An inquiry", videoId: "dQw4w9WgXcQ", category: "Communication" },
  { word: "Quiet", description: "Low noise", videoId: "dQw4w9WgXcQ", category: "Adjective" },
  
  // R
  { word: "Rain", description: "Water from sky", videoId: "dQw4w9WgXcQ", category: "Weather" },
  { word: "Run", description: "Fast movement", videoId: "dQw4w9WgXcQ", category: "Action" },
  
  // S
  { word: "School", description: "Place of learning", videoId: "dQw4w9WgXcQ", category: "Places" },
  { word: "Sister", description: "Female sibling", videoId: "dQw4w9WgXcQ", category: "Family" },
  { word: "Sorry", description: "Expression of regret", videoId: "dQw4w9WgXcQ", category: "Polite" },
  
  // T
  { word: "Thank you", description: "Expression of gratitude", videoId: "dQw4w9WgXcQ", category: "Polite" },
  { word: "Teacher", description: "One who instructs", videoId: "dQw4w9WgXcQ", category: "People" },
  { word: "Time", description: "Hours and minutes", videoId: "dQw4w9WgXcQ", category: "Time" },
  
  // U
  { word: "Understand", description: "To comprehend", videoId: "dQw4w9WgXcQ", category: "Action" },
  { word: "Us", description: "Pronoun for group", videoId: "dQw4w9WgXcQ", category: "Pronouns" },
  
  // V
  { word: "Very", description: "To a high degree", videoId: "dQw4w9WgXcQ", category: "Adverb" },
  { word: "Visit", description: "To go see", videoId: "dQw4w9WgXcQ", category: "Action" },
  
  // W
  { word: "Water", description: "Essential liquid", videoId: "dQw4w9WgXcQ", category: "Nature" },
  { word: "Work", description: "Employment/labor", videoId: "dQw4w9WgXcQ", category: "Work" },
  { word: "Write", description: "To record text", videoId: "dQw4w9WgXcQ", category: "Action" },
  
  // X
  { word: "X-ray", description: "Medical imaging", videoId: "dQw4w9WgXcQ", category: "Medical" },
  
  // Y
  { word: "Yes", description: "Affirmative response", videoId: "dQw4w9WgXcQ", category: "Response" },
  { word: "You", description: "Second person pronoun", videoId: "dQw4w9WgXcQ", category: "Pronouns" },
  { word: "Yesterday", description: "The day before", videoId: "dQw4w9WgXcQ", category: "Time" },
  
  // Z
  { word: "Zero", description: "Number 0", videoId: "dQw4w9WgXcQ", category: "Numbers" },
];

// Get all unique first letters
export const getAlphabetLetters = (): string[] => {
  const letters = new Set(dictionaryWords.map(w => w.word[0].toUpperCase()));
  return Array.from(letters).sort();
};

// Get words by first letter
export const getWordsByLetter = (letter: string): DictionaryWord[] => {
  return dictionaryWords.filter(w => w.word[0].toUpperCase() === letter.toUpperCase());
};

// Search words
export const searchWords = (query: string): DictionaryWord[] => {
  const lowerQuery = query.toLowerCase();
  return dictionaryWords.filter(w => 
    w.word.toLowerCase().includes(lowerQuery) ||
    w.description.toLowerCase().includes(lowerQuery) ||
    w.category.toLowerCase().includes(lowerQuery)
  );
};
