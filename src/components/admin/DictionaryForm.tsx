import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface DictionaryFormProps {
  initialData?: {
    word: string;
    description: string;
    video_id: string;
    category: string;
  };
  onSubmit: (data: { word: string; description: string; video_id: string; category: string }) => void;
  isLoading?: boolean;
}

export const DictionaryForm = ({ initialData, onSubmit, isLoading }: DictionaryFormProps) => {
  const [word, setWord] = useState(initialData?.word || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [videoId, setVideoId] = useState(initialData?.video_id || '');
  const [category, setCategory] = useState(initialData?.category || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      word: word.trim(),
      description: description.trim(),
      video_id: videoId.trim(),
      category: category.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="word">Word *</Label>
        <Input
          id="word"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="e.g., Hello"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., A greeting"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="videoId">YouTube Video ID *</Label>
        <Input
          id="videoId"
          value={videoId}
          onChange={(e) => setVideoId(e.target.value)}
          placeholder="e.g., dQw4w9WgXcQ"
          required
        />
        <p className="text-xs text-muted-foreground">
          The video ID is the part after "v=" in YouTube URLs
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Input
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g., Greetings, Action, Family"
          required
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {initialData ? 'Update Word' : 'Add Word'}
      </Button>
    </form>
  );
};
