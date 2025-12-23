import { z } from 'zod';

// Lesson validation schema - returns plain object compatible with Supabase Json type
export const lessonSchema = z.object({
  lesson_id: z.string().min(1, 'Lesson ID is required').max(50, 'Lesson ID must be 50 characters or less').regex(/^[a-zA-Z0-9-]+$/, 'Lesson ID can only contain letters, numbers, and hyphens'),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  description: z.string().max(1000, 'Description must be 1000 characters or less').optional().default(''),
  level: z.enum(['beginner', 'intermediate', 'advanced'], { errorMap: () => ({ message: 'Level must be beginner, intermediate, or advanced' }) }),
  duration: z.number().min(1, 'Duration must be at least 1 minute').max(180, 'Duration must be 180 minutes or less'),
  lesson_order: z.number().min(1, 'Order must be at least 1').max(1000, 'Order must be 1000 or less'),
  objectives: z.array(z.string().max(500, 'Each objective must be 500 characters or less')).max(10, 'Maximum 10 objectives allowed').optional().default([]),
  tags: z.array(z.string().max(50, 'Each tag must be 50 characters or less')).max(20, 'Maximum 20 tags allowed').optional().default([]),
  video_url: z.string().max(500).optional().or(z.literal('')),
  notes: z.string().max(10000, 'Notes must be 10000 characters or less').optional().default(''),
  quiz: z.array(z.record(z.unknown())).max(20, 'Maximum 20 quiz questions allowed').optional().default([]),
  exercises: z.array(z.record(z.unknown())).max(20, 'Maximum 20 exercises allowed').optional().default([]),
  is_published: z.boolean().default(true)
});

// Dictionary word validation schema
export const dictionaryWordSchema = z.object({
  word: z.string().min(1, 'Word is required').max(100, 'Word must be 100 characters or less').trim(),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be 500 characters or less').trim(),
  video_id: z.string().min(1, 'Video ID is required').max(100, 'Video ID must be 100 characters or less').regex(/^[a-zA-Z0-9_-]+$/, 'Invalid YouTube video ID format').trim(),
  category: z.string().min(1, 'Category is required').max(50, 'Category must be 50 characters or less').trim()
});

// Helper to validate and return required fields for dictionary
export function validateDictionaryWord(data: unknown): { word: string; description: string; video_id: string; category: string } {
  const result = dictionaryWordSchema.parse(data);
  return {
    word: result.word,
    description: result.description,
    video_id: result.video_id,
    category: result.category
  };
}

export type LessonFormData = z.infer<typeof lessonSchema>;
export type DictionaryWordFormData = z.infer<typeof dictionaryWordSchema>;
