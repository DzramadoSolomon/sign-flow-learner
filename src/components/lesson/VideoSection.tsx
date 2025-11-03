import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayCircle } from "lucide-react";

interface VideoSectionProps {
  videoUrl?: string;
  title: string;
}

export const VideoSection = ({ videoUrl, title }: VideoSectionProps) => {
  if (!videoUrl) {
    return (
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-primary" />
            Lesson Video
          </CardTitle>
          <CardDescription>Video content coming soon</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-md">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
        <CardTitle className="flex items-center gap-2">
          <PlayCircle className="h-5 w-5 text-primary" />
          Lesson Video: {title}
        </CardTitle>
        <CardDescription>
          Watch the video demonstration carefully and practice along
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={videoUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </CardContent>
    </Card>
  );
};
