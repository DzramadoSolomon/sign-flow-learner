import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Menu, Plus, Edit, Trash2, Loader2, Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { MobileSidebar } from '@/components/MobileSidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useIsAdmin } from '@/hooks/useUserRole';
import { useLessons } from '@/hooks/useLessons';
import { LessonForm } from '@/components/admin/LessonForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const Admin = () => {
  const isMobile = useIsMobile();
  const { isAdmin, isLoading: roleLoading } = useIsAdmin();
  const { data: lessons = [], isLoading: lessonsLoading } = useLessons();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
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

  const handleCreateLesson = async (data: any) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('lessons').insert({
        lesson_id: data.lesson_id,
        title: data.title,
        description: data.description,
        level: data.level,
        duration: data.duration,
        lesson_order: data.lesson_order,
        objectives: data.objectives,
        tags: data.tags,
        video_url: data.video_url,
        notes: data.notes,
        quiz: data.quiz,
        exercises: data.exercises,
        is_published: data.is_published,
      });

      if (error) throw error;

      toast({ title: 'Success', description: 'Lesson created successfully!' });
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['lesson-metadata'] });
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateLesson = async (data: any) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('lessons')
        .update({
          title: data.title,
          description: data.description,
          level: data.level,
          duration: data.duration,
          lesson_order: data.lesson_order,
          objectives: data.objectives,
          tags: data.tags,
          video_url: data.video_url,
          notes: data.notes,
          quiz: data.quiz,
          exercises: data.exercises,
          is_published: data.is_published,
        })
        .eq('lesson_id', editingLesson.metadata.id);

      if (error) throw error;

      toast({ title: 'Success', description: 'Lesson updated successfully!' });
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['lesson-metadata'] });
      queryClient.invalidateQueries({ queryKey: ['lesson', editingLesson.metadata.id] });
      setEditingLesson(null);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      const { error } = await supabase.from('lessons').delete().eq('lesson_id', lessonId);
      if (error) throw error;

      toast({ title: 'Success', description: 'Lesson deleted successfully!' });
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['lesson-metadata'] });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const adminContent = (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Lesson Management</h1>
            <p className="text-muted-foreground">Create, edit, and manage lessons</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Lesson
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Lesson
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {lessons.map((lesson) => (
              <Card key={lesson.metadata.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{lesson.metadata.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{lesson.metadata.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={editingLesson?.metadata.id === lesson.metadata.id} onOpenChange={(open) => !open && setEditingLesson(null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setEditingLesson(lesson)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{lesson.metadata.level}</Badge>
                    <Badge variant="outline">Order: {lesson.metadata.order}</Badge>
                    <Badge variant="outline">{lesson.metadata.duration} min</Badge>
                    <Badge variant="outline">{lesson.quiz.length} quiz questions</Badge>
                    <Badge variant="outline">{lesson.exercises.length} exercises</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
