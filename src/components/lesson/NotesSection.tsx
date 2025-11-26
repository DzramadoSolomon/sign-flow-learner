import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronDown, ChevronUp, Play, Pause, Volume2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useLearningMode } from "@/contexts/LearningModeContext";

interface NotesSectionProps {
  notes: string;
}

export const NotesSection = ({ notes }: NotesSectionProps) => {
  const { mode } = useLearningMode();
  const [showFull, setShowFull] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const previewLength = 500;
  const shouldTruncate = notes.length > previewLength;
  const displayText = showFull || !shouldTruncate ? notes : notes.substring(0, previewLength) + "...";
  
  // Clean markdown text for TTS (remove markdown symbols)
  const cleanTextForSpeech = (text: string): string => {
    return text
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\*\*/g, '') // Remove bold
      .replace(/\*/g, '') // Remove italic
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links but keep text
      .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '') // Remove images
      .replace(/`/g, '') // Remove code markers
      .replace(/[-•]/g, '') // Remove bullet points
      .trim();
  };

  // Text-to-Speech controls
  const handlePlayPause = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const textToSpeak = cleanTextForSpeech(displayText);
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.9; // Slightly slower for better comprehension
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onend = () => {
        setIsPlaying(false);
      };
      
      utterance.onerror = () => {
        setIsPlaying(false);
      };
      
      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (isPlaying) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isPlaying]);

  // Stop speech when text changes
  useEffect(() => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  }, [displayText]);

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Lesson Notes
          </CardTitle>
          
          {/* Audio playback button - only for hearing mode */}
          {mode === 'hearing' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayPause}
              className="gap-2"
              aria-label={isPlaying ? "Pause lesson notes" : "Play lesson notes"}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <Volume2 className="h-4 w-4" />
                  Listen
                </>
              )}
            </Button>
          )}
        </div>
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
            img: ({ src, alt }) => (
              <img 
                src={src} 
                alt={alt || 'Lesson image'} 
                className="rounded-lg shadow-md my-6 max-w-full h-auto border border-border" 
              />
            ),
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
