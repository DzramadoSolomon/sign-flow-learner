import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileSidebar } from "@/components/MobileSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Menu, 
  Search, 
  BookOpen, 
  User, 
  LogOut, 
  Flame,
  Play,
  X
} from "lucide-react";
import { 
  dictionaryWords, 
  getAlphabetLetters, 
  searchWords,
  type DictionaryWord 
} from "@/data/dictionary";

const Dictionary = () => {
  const isMobile = useIsMobile();
  const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<DictionaryWord | null>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const alphabetLetters = useMemo(() => getAlphabetLetters(), []);

  const filteredWords = useMemo(() => {
    if (searchQuery) {
      return searchWords(searchQuery);
    }
    if (selectedLetter) {
      return dictionaryWords.filter(w => w.word[0].toUpperCase() === selectedLetter);
    }
    return dictionaryWords;
  }, [searchQuery, selectedLetter]);

  const handleWordClick = (word: DictionaryWord) => {
    setSelectedWord(word);
    setIsVideoOpen(true);
  };

  const handleLetterClick = (letter: string) => {
    setSelectedLetter(selectedLetter === letter ? null : letter);
    setSearchQuery("");
  };

  const DictionaryContent = () => (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">GSL Dictionary</h1>
        <p className="text-muted-foreground">
          Search and learn sign language vocabulary with video demonstrations
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for a word..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSelectedLetter(null);
          }}
          className="pl-10 h-12 text-base"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={() => setSearchQuery("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Alphabet Filter */}
      <div className="mb-6">
        <ScrollArea className="w-full">
          <div className="flex gap-1 pb-2">
            <Button
              variant={selectedLetter === null && !searchQuery ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedLetter(null);
                setSearchQuery("");
              }}
              className="shrink-0"
            >
              All
            </Button>
            {alphabetLetters.map((letter) => (
              <Button
                key={letter}
                variant={selectedLetter === letter ? "default" : "outline"}
                size="sm"
                onClick={() => handleLetterClick(letter)}
                className="shrink-0 w-9"
              >
                {letter}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredWords.length} word{filteredWords.length !== 1 ? 's' : ''}
          {selectedLetter && ` starting with "${selectedLetter}"`}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      </div>

      {/* Word Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
        {filteredWords.map((word) => (
          <Card
            key={word.word}
            className="p-3 sm:p-4 cursor-pointer hover:border-primary hover:shadow-md transition-all group"
            onClick={() => handleWordClick(word)}
          >
            <div className="flex items-start justify-between mb-1 sm:mb-2">
              <h3 className="text-sm sm:text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">
                {word.word}
              </h3>
              <div className="p-1.5 sm:p-2 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                <Play className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2">{word.description}</p>
            <Badge variant="secondary" className="text-[10px] sm:text-xs">
              {word.category}
            </Badge>
          </Card>
        ))}
      </div>

      {filteredWords.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No words found</h3>
          <p className="text-muted-foreground">
            Try a different search term or browse by letter
          </p>
        </div>
      )}

      {/* Video Dialog */}
      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl">{selectedWord?.word}</span>
              <Badge variant="secondary" className="w-fit">{selectedWord?.category}</Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2 sm:mt-4">
            <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">{selectedWord?.description}</p>
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              {selectedWord && (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${selectedWord.videoId}?autoplay=1`}
                  title={`GSL sign for ${selectedWord.word}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {/* Mobile Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
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
                <span className="font-bold">GSL Dictionary</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Flame className="h-3 w-3 text-orange-500" />
                <span>7</span>
              </Badge>
              <Link to="/profile">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1">
          <DictionaryContent />
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <Link to="/" className="flex items-center gap-2">
                  <img src="/favicon.ico" alt="GSL Logo" className="h-6 w-6" />
                  <span className="font-bold text-lg">GSL Dictionary</span>
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="gap-1">
                  <Flame className="h-3 w-3 text-orange-500" />
                  <span>7</span>
                </Badge>
                <Link to="/profile">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={logout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>
          <main className="flex-1">
            <DictionaryContent />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dictionary;
