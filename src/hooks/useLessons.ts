import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { LessonContent, LessonMetadata, QuizQuestion, Exercise } from '@/types/lesson';

interface DatabaseLesson {
  id: string;
  lesson_id: string;
  title: string;
  description: string | null;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  lesson_order: number;
  objectives: string[];
  tags: string[];
  video_url: string | null;
  notes: string | null;
  quiz: QuizQuestion[];
  exercises: Exercise[];
  deaf_content: any;
  hearing_content: any;
  is_dual_mode: boolean;
  is_published: boolean;
}

// Convert database lesson to frontend format
const transformLesson = (dbLesson: DatabaseLesson): LessonContent => ({
  metadata: {
    id: dbLesson.lesson_id,
    title: dbLesson.title,
    description: dbLesson.description || '',
    level: dbLesson.level,
    duration: dbLesson.duration,
    objectives: dbLesson.objectives || [],
    tags: dbLesson.tags || [],
    order: dbLesson.lesson_order,
  },
  videoUrl: dbLesson.video_url || undefined,
  notes: dbLesson.notes || '',
  quiz: dbLesson.quiz || [],
  exercises: dbLesson.exercises || [],
});

// Fetch all lessons by level
export const useLessons = (level?: string) => {
  return useQuery({
    queryKey: ['lessons', level],
    queryFn: async () => {
      let query = supabase
        .from('lessons')
        .select('*')
        .eq('is_published', true)
        .order('lesson_order', { ascending: true });

      if (level) {
        query = query.eq('level', level);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching lessons:', error);
        throw error;
      }

      return (data as unknown as DatabaseLesson[]).map(transformLesson);
    },
  });
};

// Fetch a single lesson by ID
export const useLesson = (lessonId: string) => {
  return useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('is_published', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching lesson:', error);
        throw error;
      }

      if (!data) {
        return null;
      }

      return transformLesson(data as unknown as DatabaseLesson);
    },
    enabled: !!lessonId,
  });
};

// Fetch lesson metadata only (for listing)
export const useLessonMetadata = (level?: string) => {
  return useQuery({
    queryKey: ['lesson-metadata', level],
    queryFn: async () => {
      let query = supabase
        .from('lessons')
        .select('lesson_id, title, description, level, duration, lesson_order, objectives, tags')
        .eq('is_published', true)
        .order('lesson_order', { ascending: true });

      if (level) {
        query = query.eq('level', level);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching lesson metadata:', error);
        throw error;
      }

      return data.map((lesson: any): LessonMetadata => ({
        id: lesson.lesson_id,
        title: lesson.title,
        description: lesson.description || '',
        level: lesson.level,
        duration: lesson.duration,
        objectives: lesson.objectives || [],
        tags: lesson.tags || [],
        order: lesson.lesson_order,
      }));
    },
  });
};
