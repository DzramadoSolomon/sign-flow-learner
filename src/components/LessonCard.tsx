import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clock, Target, Tag, Lock, Calendar, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LessonMetadata } from "@/types/lesson";
import PaymentDialog from "@/components/PaymentDialog";
import { usePurchasedLevels, getLevelPrice } from "@/hooks/usePurchasedLevels";

interface LessonCardProps {
  lesson: LessonMetadata;
  progress?: number;
}

export const LessonCard = ({ lesson, progress = 0 }: LessonCardProps) => {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { hasLevelAccess, refetch } = usePurchasedLevels();

  const isPremium = lesson.level !== "beginner";
  const hasAccess = hasLevelAccess(lesson.level);
  const price = getLevelPrice(lesson.level);

  const handleClick = (e?: React.MouseEvent) => {
    if (!isPremium || hasAccess) {
      navigate(`/lesson/${lesson.id}`);
      return;
    }

    e?.preventDefault();
    setDialogOpen(true);
  };

  const onPaymentSuccess = (reference: string) => {
    refetch();
    setDialogOpen(false);
    // navigate to lesson after short delay
    setTimeout(() => navigate(`/lesson/${lesson.id}`), 300);
  };

  const tagIcon = (tag: string) => {
    const t = tag.toLowerCase();
    if (t.includes("convers") || t.includes("phrase")) return <MessageSquare className="h-3 w-3 mr-1" />;
    if (t.includes("time")) return <Clock className="h-3 w-3 mr-1" />;
    if (t.includes("date")) return <Calendar className="h-3 w-3 mr-1" />;
    return <Tag className="h-3 w-3 mr-1" />;
  };

  const CardInner = (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-lesson-bg border-border/50">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <Badge variant="secondary" className="text-xs">
            {lesson.level}
          </Badge>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <Clock className="h-3 w-3" />
              <span>{lesson.duration} min</span>
            </div>

            {/* Premium indicator */}
            {isPremium && !hasAccess && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Lock className="h-3 w-3 text-amber-600" />
                <span className="text-amber-600">GH₵{price}</span>
              </Badge>
            )}
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
            <Badge key={tag} variant="outline" className="text-xs flex items-center">
              {tagIcon(tag)}
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      {(!isPremium || hasAccess) ? (
        <Link to={`/lesson/${lesson.id}`} className="block" onClick={handleClick}>
          {CardInner}
        </Link>
      ) : (
        // Non-purchased premium - intercept click and open dialog
        <div role="button" tabIndex={0} onClick={handleClick} onKeyDown={(e) => e.key === 'Enter' && handleClick()} className="block cursor-pointer">
          {CardInner}
        </div>
      )}

      <PaymentDialog
        open={dialogOpen}
        onOpenChange={(o) => setDialogOpen(o)}
        lessonId={lesson.id}
        lessonTitle={lesson.title}
        amountGhs={price}
        onSuccess={onPaymentSuccess}
      />
    </>
  );
};
