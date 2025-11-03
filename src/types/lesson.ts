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
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface Exercise {
  id: string;
  instruction: string;
  type: 'practice' | 'video-response' | 'matching';
  content: any;
}

export interface LessonContent {
  metadata: LessonMetadata;
  videoUrl?: string;
  notes: string; // Markdown content
  quiz: QuizQuestion[];
  exercises: Exercise[];
}
