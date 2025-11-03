import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Video, CheckSquare } from "lucide-react";
import { Exercise } from "@/types/lesson";

interface ExerciseSectionProps {
  exercises: Exercise[];
}

export const ExerciseSection = ({ exercises }: ExerciseSectionProps) => {
  const getIcon = (type: Exercise['type']) => {
    switch (type) {
      case 'practice':
        return <Dumbbell className="h-5 w-5" />;
      case 'video-response':
        return <Video className="h-5 w-5" />;
      case 'matching':
        return <CheckSquare className="h-5 w-5" />;
      default:
        return <Dumbbell className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: Exercise['type']) => {
    switch (type) {
      case 'practice':
        return 'Practice';
      case 'video-response':
        return 'Video Response';
      case 'matching':
        return 'Matching';
      default:
        return 'Exercise';
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gradient-to-r from-secondary/10 to-primary/10">
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-secondary" />
          Practice Exercises
        </CardTitle>
        <CardDescription>
          Complete these exercises to reinforce your learning
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {exercises.map((exercise, index) => (
            <div
              key={exercise.id}
              className="p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {getIcon(exercise.type)}
                      <span className="ml-1">{getTypeLabel(exercise.type)}</span>
                    </Badge>
                  </div>
                  <p className="text-foreground font-medium">{exercise.instruction}</p>
                  
                  {exercise.type === 'practice' && exercise.content.words && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {exercise.content.words.map((word: string) => (
                        <Badge key={word} variant="outline" className="text-sm font-mono">
                          {word}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {exercise.content.repetitions && (
                    <p className="text-sm text-muted-foreground">
                      Repeat {exercise.content.repetitions} times for best results
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-accent/5 rounded-lg border border-accent/20">
          <p className="text-sm text-foreground/80">
            <strong className="text-accent">💡 Tip:</strong> Practice these exercises daily
            for at least 10 minutes. Consistency is key to mastering sign language!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
