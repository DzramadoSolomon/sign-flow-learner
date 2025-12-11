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
  X,
  Heart,
  Star
} from "lucide-react";
import { 
  dictionaryWords, 
  getAlphabetLetters, 
  searchWords,
  type DictionaryWord 
} from "@/data/dictionary";

const FAVORITES_KEY = "gsl_dictionary_favorites";

const Dictionary = () => {
  const isMobile = useIsMobile();
  const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<DictionaryWord | null>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");

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
    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">GSL Dictionary</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Search and learn sign language vocabulary with video demonstrations
        </p>
      </div>

      {/* Tabs for All/Favorites */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "favorites")} className="mb-4 sm:mb-6">
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="all" className="gap-1.5 text-xs sm:text-sm">
            <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            All Words
          </TabsTrigger>
          <TabsTrigger value="favorites" className="gap-1.5 text-xs sm:text-sm">
            <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Favorites ({favorites.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search Bar */}
      <div className="relative mb-4 sm:mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for a word..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSelectedLetter(null);
          }}
          className="pl-10 h-10 sm:h-12 text-sm sm:text-base"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 sm:h-8 sm:w-8"
            onClick={() => setSearchQuery("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Alphabet Filter */}
      <div className="mb-4 sm:mb-6">
        <ScrollArea className="w-full">
          <div className="flex gap-1 pb-2">
            <Button
              variant={selectedLetter === null && !searchQuery ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedLetter(null);
                setSearchQuery("");
              }}
              className="shrink-0 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3"
            >
              All
            </Button>
            {alphabetLetters.map((letter) => (
              <Button
                key={letter}
                variant={selectedLetter === letter ? "default" : "outline"}
                size="sm"
                onClick={() => handleLetterClick(letter)}
                className="shrink-0 h-7 sm:h-8 w-7 sm:w-9 text-xs sm:text-sm p-0"
              >
                {letter}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Results Count */}
      <div className="mb-3 sm:mb-4">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Showing {filteredWords.length} word{filteredWords.length !== 1 ? 's' : ''}
          {activeTab === "favorites" && " in favorites"}
          {selectedLetter && ` starting with "${selectedLetter}"`}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      </div>

      {/* Word Grid - Single column on mobile, grid on larger screens */}
      <div className="flex flex-col gap-2 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-4">
        {filteredWords.map((word) => (
          <Card
            key={word.word}
            className="p-2.5 sm:p-4 cursor-pointer hover:border-primary hover:shadow-md transition-all group"
            onClick={() => handleWordClick(word)}
          >
            <div className="flex items-center gap-3">
              {/* Play Icon */}
              <div className="p-2 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                <Play className="h-4 w-4" />
              </div>
              
              {/* Word Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold group-hover:text-primary transition-colors truncate">
                    {word.word}
                  </h3>
                  <Badge variant="secondary" className="text-[10px] shrink-0 hidden sm:inline-flex">
                    {word.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">{word.description}</p>
              </div>
              
              {/* Favorite Button */}
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 shrink-0 ${
                  isFavorite(word.word) 
                    ? "text-red-500 hover:text-red-600" 
                    : "text-muted-foreground hover:text-red-500"
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
        <div className="text-center py-8 sm:py-12">
          {activeTab === "favorites" ? (
            <>
              <Star className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">No favorites yet</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Tap the heart icon on any word to add it to your favorites
              </p>
            </>
          ) : (
            <>
              <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">No words found</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Try a different search term or browse by letter
              </p>
            </>
          )}
        </div>
      )}

      {/* Video Dialog */}
      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="w-[92vw] max-w-lg sm:max-w-2xl p-3 sm:p-6 mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 pr-6">
              <span className="text-base sm:text-xl">{selectedWord?.word}</span>
              <Button
                variant="ghost"
                size="icon"
                className={`h-7 w-7 ${
                  selectedWord && isFavorite(selectedWord.word) 
                    ? "text-red-500 hover:text-red-600" 
                    : "text-muted-foreground hover:text-red-500"
                }`}
                onClick={() => selectedWord && toggleFavorite(selectedWord.word)}
              >
                <Heart className={`h-4 w-4 ${selectedWord && isFavorite(selectedWord.word) ? "fill-current" : ""}`} />
              </Button>
              <Badge variant="secondary" className="text-[10px] sm:text-xs">{selectedWord?.category}</Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">{selectedWord?.description}</p>
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
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                  <MobileSidebar />
                </SheetContent>
              </Sheet>
              <Link to="/" className="flex items-center gap-1.5">
                <img src="/favicon.ico" alt="GSL Logo" className="h-5 w-5" />
                <span className="font-bold text-sm">GSL Dictionary</span>
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
