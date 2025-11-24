export interface LessonMetadata {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  objectives: string[];
  tags: string[];
  order: number;
}

export interface QuizQuestion {
  id: string;
  videoUrl: string; // YouTube embed URL showing the sign
  question: string; // e.g., "What sign is being shown in this video?"
  options: string[]; // Different sign options
  correctAnswer: string;
  explanation?: string;
}

export interface Exercise {
  id: string;
  instruction: string;
  type: 'practice' | 'video-response' | 'matching';
  content: any;
}

// Mode-specific content
export interface ModeContent {
  videoUrl?: string;
  notes: string; // Markdown content
  quiz: QuizQuestion[];
  exercises: Exercise[];
}

// New dual-mode lesson structure
export interface DualModeLessonContent {
  metadata: LessonMetadata;
  deaf: ModeContent;
  hearing: ModeContent;
}

// Legacy single-mode structure (for backward compatibility)
export interface LessonContent {
  metadata: LessonMetadata;
  videoUrl?: string;
  notes: string;
  quiz: QuizQuestion[];
  exercises: Exercise[];
}
