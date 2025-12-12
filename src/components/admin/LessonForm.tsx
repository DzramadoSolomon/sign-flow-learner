import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Save, Loader2 } from 'lucide-react';

interface QuizQuestion {
  id: string;
  videoUrl: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

interface Exercise {
  id: string;
  instruction: string;
  type: string;
  content: any;
}

interface LessonFormData {
  lesson_id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  lesson_order: number;
  objectives: string[];
  tags: string[];
  video_url: string;
  notes: string;
  quiz: QuizQuestion[];
  exercises: Exercise[];
  is_published: boolean;
}

interface LessonFormProps {
  initialData?: Partial<LessonFormData>;
  onSubmit: (data: LessonFormData) => Promise<void>;
  isLoading?: boolean;
}

const defaultFormData: LessonFormData = {
  lesson_id: '',
  title: '',
  description: '',
  level: 'beginner',
  duration: 15,
  lesson_order: 1,
  objectives: [''],
  tags: [''],
  video_url: '',
  notes: '',
  quiz: [],
  exercises: [],
  is_published: true,
};

export const LessonForm = ({ initialData, onSubmit, isLoading }: LessonFormProps) => {
  const [formData, setFormData] = useState<LessonFormData>({
    ...defaultFormData,
    ...initialData,
    objectives: initialData?.objectives?.length ? initialData.objectives : [''],
    tags: initialData?.tags?.length ? initialData.tags : [''],
    quiz: initialData?.quiz || [],
    exercises: initialData?.exercises || [],
  });

  const updateField = <K extends keyof LessonFormData>(field: K, value: LessonFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'objectives' | 'tags', index: number, value: string) => {
    const arr = [...formData[field]];
    arr[index] = value;
    updateField(field, arr);
  };

  const addArrayItem = (field: 'objectives' | 'tags') => {
    updateField(field, [...formData[field], '']);
  };

  const removeArrayItem = (field: 'objectives' | 'tags', index: number) => {
    if (formData[field].length > 1) {
      updateField(field, formData[field].filter((_, i) => i !== index));
    }
  };

  // Quiz management
  const addQuizQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `q${Date.now()}`,
      videoUrl: '',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
    };
    updateField('quiz', [...formData.quiz, newQuestion]);
  };

  const updateQuizQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const quiz = [...formData.quiz];
    quiz[index] = { ...quiz[index], [field]: value };
    updateField('quiz', quiz);
  };

  const updateQuizOption = (qIndex: number, oIndex: number, value: string) => {
    const quiz = [...formData.quiz];
    const options = [...quiz[qIndex].options];
    options[oIndex] = value;
    quiz[qIndex] = { ...quiz[qIndex], options };
    updateField('quiz', quiz);
  };

  const removeQuizQuestion = (index: number) => {
    updateField('quiz', formData.quiz.filter((_, i) => i !== index));
  };

  // Exercise management
  const addExercise = () => {
    const newExercise: Exercise = {
      id: `ex${Date.now()}`,
      instruction: '',
      type: 'practice',
      content: {},
    };
    updateField('exercises', [...formData.exercises, newExercise]);
  };

  const updateExercise = (index: number, field: keyof Exercise, value: any) => {
    const exercises = [...formData.exercises];
    exercises[index] = { ...exercises[index], [field]: value };
    updateField('exercises', exercises);
  };

  const removeExercise = (index: number) => {
    updateField('exercises', formData.exercises.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Filter out empty array items
    const cleanedData = {
      ...formData,
      objectives: formData.objectives.filter(o => o.trim()),
      tags: formData.tags.filter(t => t.trim()),
    };
    await onSubmit(cleanedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="quiz">Quiz ({formData.quiz.length})</TabsTrigger>
          <TabsTrigger value="exercises">Exercises ({formData.exercises.length})</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lesson_id">Lesson ID *</Label>
              <Input
                id="lesson_id"
                value={formData.lesson_id}
                onChange={e => updateField('lesson_id', e.target.value)}
                placeholder="e.g., beginner-2"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e => updateField('title', e.target.value)}
                placeholder="Lesson title"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => updateField('description', e.target.value)}
              placeholder="Brief description of the lesson"
              rows={2}
            />
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Level *</Label>
              <Select value={formData.level} onValueChange={v => updateField('level', v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (min)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={e => updateField('duration', parseInt(e.target.value) || 15)}
                min={1}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                type="number"
                value={formData.lesson_order}
                onChange={e => updateField('lesson_order', parseInt(e.target.value) || 1)}
                min={1}
              />
            </div>
            <div className="space-y-2">
              <Label>Published</Label>
              <Select value={formData.is_published ? 'yes' : 'no'} onValueChange={v => updateField('is_published', v === 'yes')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No (Draft)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Objectives */}
          <div className="space-y-2">
            <Label>Learning Objectives</Label>
            {formData.objectives.map((obj, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={obj}
                  onChange={e => handleArrayChange('objectives', i, e.target.value)}
                  placeholder={`Objective ${i + 1}`}
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayItem('objectives', i)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem('objectives')}>
              <Plus className="h-4 w-4 mr-1" /> Add Objective
            </Button>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, i) => (
                <div key={i} className="flex gap-1">
                  <Input
                    value={tag}
                    onChange={e => handleArrayChange('tags', i, e.target.value)}
                    placeholder="Tag"
                    className="w-32"
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayItem('tags', i)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem('tags')}>
              <Plus className="h-4 w-4 mr-1" /> Add Tag
            </Button>
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="video_url">Video URL (YouTube embed)</Label>
            <Input
              id="video_url"
              value={formData.video_url}
              onChange={e => updateField('video_url', e.target.value)}
              placeholder="https://www.youtube.com/embed/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Lesson Notes (Markdown)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={e => updateField('notes', e.target.value)}
              placeholder="# Lesson Title&#10;&#10;Write your lesson content in Markdown..."
              rows={15}
              className="font-mono text-sm"
            />
          </div>
        </TabsContent>

        {/* Quiz Tab */}
        <TabsContent value="quiz" className="space-y-4 mt-4">
          {formData.quiz.map((q, qIndex) => (
            <Card key={q.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Question {qIndex + 1}</CardTitle>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeQuizQuestion(qIndex)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Video URL</Label>
                  <Input
                    value={q.videoUrl}
                    onChange={e => updateQuizQuestion(qIndex, 'videoUrl', e.target.value)}
                    placeholder="https://www.youtube.com/embed/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Question</Label>
                  <Input
                    value={q.question}
                    onChange={e => updateQuizQuestion(qIndex, 'question', e.target.value)}
                    placeholder="What is being signed in the video?"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Options (4)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt, oIndex) => (
                      <Input
                        key={oIndex}
                        value={opt}
                        onChange={e => updateQuizOption(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Correct Answer</Label>
                  <Select value={q.correctAnswer} onValueChange={v => updateQuizQuestion(qIndex, 'correctAnswer', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {q.options.filter(o => o).map((opt, i) => (
                        <SelectItem key={i} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Explanation (optional)</Label>
                  <Textarea
                    value={q.explanation || ''}
                    onChange={e => updateQuizQuestion(qIndex, 'explanation', e.target.value)}
                    placeholder="Why is this the correct answer?"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          <Button type="button" variant="outline" onClick={addQuizQuestion}>
            <Plus className="h-4 w-4 mr-1" /> Add Quiz Question
          </Button>
        </TabsContent>

        {/* Exercises Tab */}
        <TabsContent value="exercises" className="space-y-4 mt-4">
          {formData.exercises.map((ex, exIndex) => (
            <Card key={ex.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Exercise {exIndex + 1}</CardTitle>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeExercise(exIndex)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={ex.type} onValueChange={v => updateExercise(exIndex, 'type', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="practice">Practice</SelectItem>
                      <SelectItem value="video-response">Video Response</SelectItem>
                      <SelectItem value="matching">Matching</SelectItem>
                      <SelectItem value="reading">Reading</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Instruction</Label>
                  <Textarea
                    value={ex.instruction}
                    onChange={e => updateExercise(exIndex, 'instruction', e.target.value)}
                    placeholder="Exercise instructions..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          <Button type="button" variant="outline" onClick={addExercise}>
            <Plus className="h-4 w-4 mr-1" /> Add Exercise
          </Button>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {initialData?.lesson_id ? 'Update Lesson' : 'Create Lesson'}
        </Button>
      </div>
    </form>
  );
};
