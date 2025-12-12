import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DictionaryWord {
  id: string;
  word: string;
  description: string;
  video_id: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export const useDictionary = () => {
  return useQuery({
    queryKey: ['dictionary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dictionary')
        .select('*')
        .order('word', { ascending: true });

      if (error) throw error;
      return data as DictionaryWord[];
    },
  });
};

export const useCreateDictionaryWord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (word: Omit<DictionaryWord, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('dictionary')
        .insert(word)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dictionary'] });
    },
  });
};

export const useUpdateDictionaryWord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...word }: Partial<DictionaryWord> & { id: string }) => {
      const { data, error } = await supabase
        .from('dictionary')
        .update(word)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dictionary'] });
    },
  });
};

export const useDeleteDictionaryWord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('dictionary')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dictionary'] });
    },
  });
};

// Helper functions
export const getAlphabetLetters = (words: DictionaryWord[]): string[] => {
  const letters = new Set(words.map(w => w.word[0].toUpperCase()));
  return Array.from(letters).sort();
};

export const searchWords = (words: DictionaryWord[], query: string): DictionaryWord[] => {
  const lowerQuery = query.toLowerCase();
  return words.filter(w =>
    w.word.toLowerCase().includes(lowerQuery) ||
    w.description.toLowerCase().includes(lowerQuery) ||
    w.category.toLowerCase().includes(lowerQuery)
  );
};
