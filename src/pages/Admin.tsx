import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Plus, Edit, Trash2, Loader2, Shield, ArrowLeft, BookOpen, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { MobileSidebar } from '@/components/MobileSidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { useIsAdmin } from '@/hooks/useUserRole';
import { useLessons } from '@/hooks/useLessons';
import { useDictionary, type DictionaryWord } from '@/hooks/useDictionary';
import { LessonForm } from '@/components/admin/LessonForm';
import { DictionaryForm } from '@/components/admin/DictionaryForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { lessonSchema, dictionaryWordSchema } from '@/lib/validation';
import { ZodError } from 'zod';
import type { Json } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';

const Admin = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useIsAdmin();
  const { data: lessons = [], isLoading: lessonsLoading } = useLessons();
  const { data: dictionaryWords = [], isLoading: dictionaryLoading } = useDictionary();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [isDictionaryDialogOpen, setIsDictionaryDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [editingWord, setEditingWord] = useState<DictionaryWord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You don't have admin privileges to access this page.
            </p>
            <Link to="/dashboard">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Lesson handlers - using edge functions for secure server-side authorization
  const handleCreateLesson = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Validate input data
      const validated = lessonSchema.parse(data);
      
      const { data: response, error } = await supabase.functions.invoke('admin-lessons', {
        body: {
          action: 'create',
          userId: user?.id,
          lessonData: {
            lesson_id: validated.lesson_id,
            title: validated.title,
            description: validated.description,
            level: validated.level,
            duration: validated.duration,
            lesson_order: validated.lesson_order,
            objectives: validated.objectives as Json,
            tags: validated.tags as Json,
            video_url: validated.video_url || null,
            notes: validated.notes,
            quiz: validated.quiz as Json,
            exercises: validated.exercises as Json,
            is_published: validated.is_published,
          },
        },
      });

      if (error) throw new Error(error.message);
      if (response?.error) throw new Error(response.error);

      toast({ title: 'Success', description: 'Lesson created successfully!' });
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['lesson-metadata'] });
      setIsLessonDialogOpen(false);
    } catch (error: any) {
      if (error instanceof ZodError) {
        const messages = error.errors.map(e => e.message).join(', ');
        toast({ title: 'Validation Error', description: messages, variant: 'destructive' });
      } else {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateLesson = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Validate input data
      const validated = lessonSchema.parse(data);
      
      const { data: response, error } = await supabase.functions.invoke('admin-lessons', {
        body: {
          action: 'update',
          userId: user?.id,
          lessonId: editingLesson.metadata.id,
          lessonData: {
            title: validated.title,
            description: validated.description,
            level: validated.level,
            duration: validated.duration,
            lesson_order: validated.lesson_order,
            objectives: validated.objectives as Json,
            tags: validated.tags as Json,
            video_url: validated.video_url || null,
            notes: validated.notes,
            quiz: validated.quiz as Json,
            exercises: validated.exercises as Json,
            is_published: validated.is_published,
          },
        },
      });

      if (error) throw new Error(error.message);
      if (response?.error) throw new Error(response.error);

      toast({ title: 'Success', description: 'Lesson updated successfully!' });
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['lesson-metadata'] });
      queryClient.invalidateQueries({ queryKey: ['lesson', editingLesson.metadata.id] });
      setEditingLesson(null);
    } catch (error: any) {
      if (error instanceof ZodError) {
        const messages = error.errors.map(e => e.message).join(', ');
        toast({ title: 'Validation Error', description: messages, variant: 'destructive' });
      } else {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      const { data: response, error } = await supabase.functions.invoke('admin-lessons', {
        body: {
          action: 'delete',
          userId: user?.id,
          lessonId,
        },
      });

      if (error) throw new Error(error.message);
      if (response?.error) throw new Error(response.error);

      toast({ title: 'Success', description: 'Lesson deleted successfully!' });
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['lesson-metadata'] });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  // Dictionary handlers - using edge functions for secure server-side authorization
  const handleCreateWord = async (data: { word: string; description: string; video_id: string; category: string }) => {
    try {
      // Validate input data
      const validated = dictionaryWordSchema.parse(data);
      
      const { data: response, error } = await supabase.functions.invoke('admin-dictionary', {
        body: {
          action: 'create',
          userId: user?.id,
          wordData: {
            word: validated.word,
            description: validated.description,
            video_id: validated.video_id,
            category: validated.category,
          },
        },
      });

      if (error) throw new Error(error.message);
      if (response?.error) throw new Error(response.error);

      toast({ title: 'Success', description: 'Word added successfully!' });
      queryClient.invalidateQueries({ queryKey: ['dictionary'] });
      setIsDictionaryDialogOpen(false);
    } catch (error: any) {
      if (error instanceof ZodError) {
        const messages = error.errors.map(e => e.message).join(', ');
        toast({ title: 'Validation Error', description: messages, variant: 'destructive' });
      } else {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    }
  };

  const handleUpdateWord = async (data: { word: string; description: string; video_id: string; category: string }) => {
    if (!editingWord) return;
    try {
      // Validate input data
      const validated = dictionaryWordSchema.parse(data);
      
      const { data: response, error } = await supabase.functions.invoke('admin-dictionary', {
        body: {
          action: 'update',
          userId: user?.id,
          wordId: editingWord.id,
          wordData: {
            word: validated.word,
            description: validated.description,
            video_id: validated.video_id,
            category: validated.category,
          },
        },
      });

      if (error) throw new Error(error.message);
      if (response?.error) throw new Error(response.error);

      toast({ title: 'Success', description: 'Word updated successfully!' });
      queryClient.invalidateQueries({ queryKey: ['dictionary'] });
      setEditingWord(null);
    } catch (error: any) {
      if (error instanceof ZodError) {
        const messages = error.errors.map(e => e.message).join(', ');
        toast({ title: 'Validation Error', description: messages, variant: 'destructive' });
      } else {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    }
  };

  const handleDeleteWord = async (id: string) => {
    try {
      const { data: response, error } = await supabase.functions.invoke('admin-dictionary', {
        body: {
          action: 'delete',
          userId: user?.id,
          wordId: id,
        },
      });

      if (error) throw new Error(error.message);
      if (response?.error) throw new Error(response.error);

      toast({ title: 'Success', description: 'Word deleted successfully!' });
      queryClient.invalidateQueries({ queryKey: ['dictionary'] });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const adminContent = (
    <div className="py-4 md:py-8">
      <div className="container mx-auto px-3 md:px-4">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">Admin Panel</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage lessons and dictionary words</p>
        </div>

        <Tabs defaultValue="lessons" className="space-y-4 md:space-y-6">
          <TabsList className="w-full md:w-auto grid grid-cols-2 md:flex">
            <TabsTrigger value="lessons" className="gap-2 text-sm">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden xs:inline">Lessons</span>
              <span className="xs:hidden">Lessons</span>
            </TabsTrigger>
            <TabsTrigger value="dictionary" className="gap-2 text-sm">
              <BookOpen className="h-4 w-4" />
              <span className="hidden xs:inline">Dictionary</span>
              <span className="xs:hidden">Dict</span>
            </TabsTrigger>
          </TabsList>

          {/* Lessons Tab */}
          <TabsContent value="lessons">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-semibold">Lesson Management</h2>
              <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
                <DialogTrigger asChild>
                  <Button size={isMobile ? "sm" : "default"} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Lesson
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Lesson</DialogTitle>
                  </DialogHeader>
                  <LessonForm onSubmit={handleCreateLesson} isLoading={isSubmitting} />
                </DialogContent>
              </Dialog>
            </div>

            {lessonsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : lessons.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">No lessons found. Create your first lesson!</p>
                  <Button onClick={() => setIsLessonDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Lesson
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {lessons.map((lesson) => (
                  <Card key={lesson.metadata.id}>
                    <CardHeader className="pb-2 px-3 md:px-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base md:text-lg truncate">{lesson.metadata.title}</CardTitle>
                          <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{lesson.metadata.description}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Dialog open={editingLesson?.metadata.id === lesson.metadata.id} onOpenChange={(open) => !open && setEditingLesson(null)}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setEditingLesson(lesson)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Edit Lesson</DialogTitle>
                              </DialogHeader>
                              {editingLesson && (
                                <LessonForm
                                  initialData={{
                                    lesson_id: editingLesson.metadata.id,
                                    title: editingLesson.metadata.title,
                                    description: editingLesson.metadata.description,
                                    level: editingLesson.metadata.level,
                                    duration: editingLesson.metadata.duration,
                                    lesson_order: editingLesson.metadata.order,
                                    objectives: editingLesson.metadata.objectives,
                                    tags: editingLesson.metadata.tags,
                                    video_url: editingLesson.videoUrl || '',
                                    notes: editingLesson.notes,
                                    quiz: editingLesson.quiz,
                                    exercises: editingLesson.exercises,
                                    is_published: true,
                                  }}
                                  onSubmit={handleUpdateLesson}
                                  isLoading={isSubmitting}
                                />
                              )}
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Lesson?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete "{lesson.metadata.title}". This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteLesson(lesson.metadata.id)} className="bg-destructive text-destructive-foreground">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-3 md:px-6 pt-2">
                      <div className="flex flex-wrap gap-1.5 md:gap-2">
                        <Badge variant="secondary" className="text-xs">{lesson.metadata.level}</Badge>
                        <Badge variant="outline" className="text-xs">Order: {lesson.metadata.order}</Badge>
                        <Badge variant="outline" className="text-xs">{lesson.metadata.duration} min</Badge>
                        <Badge variant="outline" className="text-xs">{lesson.quiz.length} quiz</Badge>
                        <Badge variant="outline" className="text-xs">{lesson.exercises.length} exercises</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Dictionary Tab */}
          <TabsContent value="dictionary">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-semibold">Dictionary ({dictionaryWords.length} words)</h2>
              <Dialog open={isDictionaryDialogOpen} onOpenChange={setIsDictionaryDialogOpen}>
                <DialogTrigger asChild>
                  <Button size={isMobile ? "sm" : "default"} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Word
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] md:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add New Word</DialogTitle>
                  </DialogHeader>
                  <DictionaryForm onSubmit={handleCreateWord} isLoading={isSubmitting} />
                </DialogContent>
              </Dialog>
            </div>

            {dictionaryLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : dictionaryWords.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">No words found. Add your first word!</p>
                  <Button onClick={() => setIsDictionaryDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Word
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-2">
                {dictionaryWords.map((word) => (
                  <Card key={word.id} className="p-3 md:p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm md:text-base">{word.word}</h3>
                          <Badge variant="outline" className="text-xs">{word.category}</Badge>
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{word.description}</p>
                        <p className="text-xs text-muted-foreground mt-1 truncate">Video: {word.video_id}</p>
                      </div>
                      <div className="flex gap-2 shrink-0 self-end sm:self-center">
                        <Dialog open={editingWord?.id === word.id} onOpenChange={(open) => !open && setEditingWord(null)}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setEditingWord(word)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-[95vw] md:max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Edit Word</DialogTitle>
                            </DialogHeader>
                            {editingWord && (
                              <DictionaryForm
                                initialData={{
                                  word: editingWord.word,
                                  description: editingWord.description,
                                  video_id: editingWord.video_id,
                                  category: editingWord.category,
                                }}
                                onSubmit={handleUpdateWord}
                                isLoading={isSubmitting}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Word?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{word.word}". This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteWord(word.id)} className="bg-destructive text-destructive-foreground">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-4 px-4 py-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <MobileSidebar />
              </SheetContent>
            </Sheet>
            <Link to="/" className="flex items-center gap-2">
              <img src="/favicon.ico" alt="GSL Logo" className="h-6 w-6" />
              <span className="font-bold text-lg">Admin</span>
            </Link>
          </div>
        </header>
        {adminContent}
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1">
          <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center gap-4">
                <SidebarTrigger>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SidebarTrigger>
                <Link to="/" className="flex items-center gap-2">
                  <img src="/favicon.ico" alt="GSL Logo" className="h-6 w-6" />
                  <span className="font-bold text-lg">Admin Panel</span>
                </Link>
                <Badge variant="secondary" className="ml-auto">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              </div>
            </div>
          </header>
          {adminContent}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
