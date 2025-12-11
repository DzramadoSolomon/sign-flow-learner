import { useState, useMemo, useEffect } from "react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import VocabularyQuiz from "@/components/dictionary/VocabularyQuiz";
import { 
  Menu, 
  Search, 
  BookOpen, 
  User, 
  LogOut, 
  Flame,
  Play,
  X,
  Heart,
  Star,
  Gamepad2
} from "lucide-react";
import { 
  dictionaryWords, 
  getAlphabetLetters, 
  searchWords,
  type DictionaryWord 
} from "@/data/dictionary";

const FAVORITES_KEY = "gsl_dictionary_favorites";

const Dictionary = () => {
  const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<DictionaryWord | null>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "favorites" | "quiz">("all");
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  // Track window width for responsive layout
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  // Load favorites from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  }, []);

  // Save favorites to localStorage
  const saveFavorites = (newFavorites: string[]) => {
    setFavorites(newFavorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
  };

  const toggleFavorite = (word: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (favorites.includes(word)) {
      saveFavorites(favorites.filter(f => f !== word));
    } else {
      saveFavorites([...favorites, word]);
    }
  };

  const isFavorite = (word: string) => favorites.includes(word);

  const alphabetLetters = useMemo(() => getAlphabetLetters(), []);

  const filteredWords = useMemo(() => {
    let words = dictionaryWords;
    
    // Filter by favorites tab
    if (activeTab === "favorites") {
      words = words.filter(w => favorites.includes(w.word));
    }
    
    // Filter by search
    if (searchQuery) {
      const searchResults = searchWords(searchQuery);
      words = words.filter(w => searchResults.some(sr => sr.word === w.word));
    }
    
    // Filter by letter
    if (selectedLetter) {
      words = words.filter(w => w.word[0].toUpperCase() === selectedLetter);
    }
    
    return words;
  }, [searchQuery, selectedLetter, activeTab, favorites]);

  const handleWordClick = (word: DictionaryWord) => {
    setSelectedWord(word);
    setIsVideoOpen(true);
  };

  const handleLetterClick = (letter: string) => {
    setSelectedLetter(selectedLetter === letter ? null : letter);
    setSearchQuery("");
  };

  const DictionaryContent = () => (
    <div className="p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">GSL Dictionary</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Search and learn sign language vocabulary
        </p>
      </div>

      {/* Tabs for All/Favorites/Quiz */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "favorites" | "quiz")} className="mb-4">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="all" className="gap-1 text-xs px-2 py-2">
            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">All</span>
          </TabsTrigger>
          <TabsTrigger value="favorites" className="gap-1 text-xs px-2 py-2">
            <Star className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Favorites</span>
            <span className="text-[10px]">({favorites.length})</span>
          </TabsTrigger>
          <TabsTrigger value="quiz" className="gap-1 text-xs px-2 py-2">
            <Gamepad2 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Quiz</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Quiz Mode */}
      {activeTab === "quiz" ? (
        <VocabularyQuiz 
          favorites={favorites} 
          onBack={() => setActiveTab("all")} 
        />
      ) : (
        <>
          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedLetter(null);
              }}
              className="pl-9 h-9 text-sm"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Alphabet Filter */}
          <div className="mb-3">
            <ScrollArea className="w-full">
              <div className="flex gap-1 pb-2">
                <Button
                  variant={selectedLetter === null && !searchQuery ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedLetter(null);
                    setSearchQuery("");
                  }}
                  className="shrink-0 h-7 text-xs px-2"
                >
                  All
                </Button>
                {alphabetLetters.map((letter) => (
                  <Button
                    key={letter}
                    variant={selectedLetter === letter ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleLetterClick(letter)}
                    className="shrink-0 h-7 w-7 text-xs p-0"
                  >
                    {letter}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Results Count */}
          <p className="text-xs text-muted-foreground mb-3">
            {filteredWords.length} word{filteredWords.length !== 1 ? 's' : ''}
            {activeTab === "favorites" && " in favorites"}
          </p>

          {/* Word List - Simple vertical list for mobile */}
          <div className="space-y-2">
            {filteredWords.map((word) => (
              <Card
                key={word.word}
                className="p-3 cursor-pointer hover:border-primary transition-all active:scale-[0.98]"
                onClick={() => handleWordClick(word)}
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-primary/10 text-primary shrink-0">
                    <Play className="h-3 w-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold truncate">{word.word}</h3>
                    <p className="text-xs text-muted-foreground truncate">{word.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 shrink-0 ${
                      isFavorite(word.word) 
                        ? "text-red-500" 
                        : "text-muted-foreground"
                    }`}
                    onClick={(e) => toggleFavorite(word.word, e)}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite(word.word) ? "fill-current" : ""}`} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {filteredWords.length === 0 && (
            <div className="text-center py-8">
              {activeTab === "favorites" ? (
                <>
                  <Star className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-sm font-semibold mb-1">No favorites yet</h3>
                  <p className="text-xs text-muted-foreground">
                    Tap the heart icon to add favorites
                  </p>
                </>
              ) : (
                <>
                  <BookOpen className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-sm font-semibold mb-1">No words found</h3>
                  <p className="text-xs text-muted-foreground">
                    Try a different search
                  </p>
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* Video Dialog */}
      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="w-[95vw] max-w-md p-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              {selectedWord?.word}
              <Button
                variant="ghost"
                size="icon"
                className={`h-6 w-6 ${
                  selectedWord && isFavorite(selectedWord.word) 
                    ? "text-red-500" 
                    : "text-muted-foreground"
                }`}
                onClick={() => selectedWord && toggleFavorite(selectedWord.word)}
              >
                <Heart className={`h-4 w-4 ${selectedWord && isFavorite(selectedWord.word) ? "fill-current" : ""}`} />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div>
            <p className="text-xs text-muted-foreground mb-2">{selectedWord?.description}</p>
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

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                  <MobileSidebar />
                </SheetContent>
              </Sheet>
              <Link to="/" className="flex items-center gap-1.5">
                <img src="/favicon.ico" alt="GSL Logo" className="h-5 w-5" />
                <span className="font-bold text-sm">Dictionary</span>
              </Link>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="gap-1 text-xs px-2 py-0.5">
                <Flame className="h-3 w-3 text-orange-500" />
                <span>7</span>
              </Badge>
              <Link to="/profile">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <DictionaryContent />
        </main>
      </div>
    );
  }

  // Desktop Layout
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
