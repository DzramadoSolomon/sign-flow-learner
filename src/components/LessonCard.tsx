import { Link } from "react-router-dom";
import { Clock, Target, Tag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LessonMetadata } from "@/types/lesson";

interface LessonCardProps {
  lesson: LessonMetadata;
  progress?: number;
}

export const LessonCard = ({ lesson, progress = 0 }: LessonCardProps) => {
  return (
    <Link to={`/lesson/${lesson.id}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-lesson-bg border-border/50">
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <Badge variant="secondary" className="text-xs">
              {lesson.level}
            </Badge>
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <Clock className="h-3 w-3" />
              <span>{lesson.duration} min</span>
            </div>
          </div>
          <CardTitle className="group-hover:text-primary transition-colors">
            {lesson.title}
          </CardTitle>
          <CardDescription>{lesson.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {progress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-accent">{progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              <span className="font-medium">Objectives:</span>
            </div>
            <ul className="list-disc list-inside text-sm space-y-1 text-foreground/80">
              {lesson.objectives.slice(0, 2).map((obj, i) => (
                <li key={i}>{obj}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-2">
            {lesson.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
