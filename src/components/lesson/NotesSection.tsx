import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface NotesSectionProps {
  notes: string;
}

export const NotesSection = ({ notes }: NotesSectionProps) => {
  const [showFull, setShowFull] = useState(false);
  const previewLength = 500; // characters to show in preview
  const shouldTruncate = notes.length > previewLength;
  const displayText = showFull || !shouldTruncate ? notes : notes.substring(0, previewLength) + "...";

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Lesson Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="prose prose-slate dark:prose-invert max-w-none pt-6">
        <ReactMarkdown
          components={{
            h1: ({ children }) => <h1 className="text-3xl font-bold text-primary mb-4">{children}</h1>,
            h2: ({ children }) => <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">{children}</h2>,
            h3: ({ children }) => <h3 className="text-xl font-medium text-foreground mt-6 mb-2">{children}</h3>,
            ul: ({ children }) => <ul className="list-disc pl-6 space-y-2 my-4">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-6 space-y-2 my-4">{children}</ol>,
            li: ({ children }) => <li className="text-foreground/90">{children}</li>,
            p: ({ children }) => <p className="text-foreground/80 leading-relaxed my-3">{children}</p>,
            strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          }}
        >
          {displayText}
        </ReactMarkdown>
        
        {shouldTruncate && (
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              onClick={() => setShowFull(!showFull)}
              className="gap-2"
            >
              {showFull ? (
                <>
                  Show Less <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Show Full Script <ChevronDown className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
