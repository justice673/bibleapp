// App.tsx
import { useEffect, useState } from 'react';
import { Search, BookOpen, Moon, Sun, ChevronDown } from 'lucide-react';
import { BibleSelector } from './components/BibleSelector';
import { VerseDisplay } from './components/VerseDisplay';
import { Loader } from './components/Loader';
import { bibleApi } from './services/bibleApi';
import { TESTAMENT_GROUPS } from './constants/bibleData';
import {
  Bible,
  Book,
  BibleResponse,
  VersesForChapterResponse,
  BookResponse,
  PassageResponse,
  SearchResult
} from './types/bible';

const App = () => {
  // State Management
  const [darkMode, setDarkMode] = useState(false);
  const [bibles, setBibles] = useState<Bible[]>([]);
  const [selectedBible, setSelectedBible] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [chapterContent, setChapterContent] = useState<string>('');
  const [verseContent, setVerseContent] = useState('');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingVerse, setIsLoadingVerse] = useState(false);
  const [isLoadingChapter, setIsLoadingChapter] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [chapters, setChapters] = useState<number[]>([]);
  const [selectedTestament, setSelectedTestament] = useState<'OLD' | 'NEW' | null>(null);
  const [verses, setVerses] = useState<number[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Bible book IDs mapping
  const bibleBookIds: Record<string, string> = {
    'Genesis': 'GEN', 'Exodus': 'EXO', 'Leviticus': 'LEV',
    'Numbers': 'NUM', 'Deuteronomy': 'DEU', 'Joshua': 'JOS',
    'Judges': 'JDG', 'Ruth': 'RUT', 'Samuel': '1SA',
    'Kings': '1KI', 'Chronicles': '1CH', 'Ezra': 'EZR',
    'Nehemiah': 'NEH', 'Esther': 'EST', 'Job': 'JOB',
    'Matthew': 'MAT', 'Mark': 'MRK', 'Luke': 'LUK',
    'John (Gospel)': 'JHN', 'John': 'JHN', 'Acts': 'ACT', 'Romans': 'ROM',
    'Corinthians': '1CO', 'Galatians': 'GAL', 'Ephesians': 'EPH',
    'Philippians': 'PHP', 'Colossians': 'COL', 'Thessalonians': '1TH',
    'Timothy': '1TI', 'Titus': 'TIT', 'Philemon': 'PHM',
    'Hebrews': 'HEB', 'James': 'JAS', 'Peter': '1PE',
    'John (Epistle)': '1JN', 'Jude': 'JUD', 'Revelation': 'REV'
  };

  // Initial Bible versions fetch
  useEffect(() => {
    const fetchBibles = async () => {
      try {
        const response = await bibleApi.getBibles();
        setBibles((response as BibleResponse).data);
      } catch (error) {
        setError('Failed to load Bible versions. Please try again later.');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBibles();
  }, []);

  // Load books when Bible is selected
  useEffect(() => {
    const fetchBooks = async () => {
      if (!selectedBible) return;

      try {
        setLoadingBooks(true);
        const response = await bibleApi.getBooks(selectedBible);
        const bookData = response as BookResponse;
        if (bookData && bookData.data) {
          setBooks(bookData.data);
        }
      } catch (error) {
        console.error('Error fetching books:', error);
        setError('Failed to load books. Please try again.');
      } finally {
        setLoadingBooks(false);
      }
    };

    fetchBooks();
  }, [selectedBible]);

  const handleBibleSelect = (bibleId: string) => {
    setSelectedBible(bibleId);
    setSelectedBook(null);
    setSelectedChapter(null);
    setSelectedVerse(null);
    setVerseContent('');
    setChapterContent('');
    setReference('');
    setError(null);
    setSearchResults([]);
  };

  const handleSearch = async (searchTerm: string) => {
    if (!selectedBible || !searchTerm.trim()) {
      setError('Please select a Bible version and enter a search term');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await bibleApi.search(selectedBible, searchTerm);
      if (response.data && response.data.verses) {
        interface SearchResult {
          content: string;
          reference: string;
          bookId: string;
          chapter: number;
          verse: number;
        }

        const results: SearchResult[] = response.data.verses.map((verse: { text: string; reference: string }) => ({
          content: verse.text,
          reference: verse.reference,
          bookId: verse.reference.split(' ')[0],
          chapter: parseInt(verse.reference.split(' ')[1].split(':')[0]),
          verse: parseInt(verse.reference.split(' ')[1].split(':')[1])
        }));

        setSearchResults(results);
        if (results.length === 0) {
          setError('No results found');
        }
      } else {
        setSearchResults([]);
        setError('No results found');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to perform search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleBookSelect = async (bookName: string) => {
    if (!selectedBible) {
      setError('Please select a Bible version first.');
      return;
    }

    const bookId = bibleBookIds[bookName];
    if (!bookId) {
      console.error(`Book ID not found for: ${bookName}`);
      setError(`Book ID not found for: ${bookName}`);
      return;
    }

    try {
      setLoadingChapters(true);
      setSelectedBook(bookId);
      setSelectedChapter(null);
      setSelectedVerse(null);
      setChapterContent('');
      setVerseContent('');
      setError(null);
      setSearchResults([]);

      const response = await bibleApi.getChapters(selectedBible, bookId);

      if (response && response.data) {
        const chapterNumbers: number[] = response.data
          .map((chapter: { number: string }): number | null => {
            const match: RegExpMatchArray | null = chapter.number.match(/^(\d+)$/);
            return match ? parseInt(match[1]) : null;
          })
          .filter((num: number | null): num is number => num !== null)
          .sort((a: number, b: number): number => a - b);

        setChapters(chapterNumbers);
      } else {
        throw new Error('No chapters data received');
      }
    } catch (error) {
      console.error('Error fetching chapters:', error);
      setError('Failed to load chapters. Please try again.');
    } finally {
      setLoadingChapters(false);
    }
  };

  const handleChapterSelect = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (!selectedBook || !selectedBible) {
      setError('Please select a book first.');
      return;
    }

    const chapter = Number(event.target.value);
    setSelectedChapter(chapter);
    setSelectedVerse(null);
    setVerseContent('');
    setError(null);
    setSearchResults([]);

    try {
      setIsLoadingChapter(true);
      setLoadingVerses(true);
      const chapterId = `${selectedBook}.${chapter}`;

      const versesResponse = await bibleApi.getVersesInChapter(selectedBible, chapterId);
      const versesData = versesResponse as VersesForChapterResponse;

      if (versesData && versesData.data) {
        const verseNumbers = versesData.data
          .map(verse => {
            const match = verse.id.match(/\.(\d+)$/);
            return match ? parseInt(match[1]) : null;
          })
          .filter((num): num is number => num !== null)
          .sort((a, b) => a - b);

        setVerses(verseNumbers);

        try {
          const chapterResponse = await bibleApi.getPassage(
            selectedBible,
            `${selectedBook}.${chapter}`
          );

          if (chapterResponse && chapterResponse.data && chapterResponse.data.content) {
            setChapterContent(chapterResponse.data.content);
            setReference(`${selectedBook} ${chapter}`);
          } else {
            throw new Error('No chapter content received');
          }
        } catch (error) {
          console.error('Error fetching chapter content:', error);
          setError('Failed to load chapter content. Please try again.');
          setChapterContent('');
        }
      } else {
        throw new Error('No verses data received');
      }
    } catch (error) {
      console.error('Error fetching chapter:', error);
      setError('Failed to load chapter. Please try again.');
      setChapterContent('');
    } finally {
      setLoadingVerses(false);
      setIsLoadingChapter(false);
    }
  };

  const handleVerseSelect = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (!selectedBook || !selectedChapter || !selectedBible) {
      setError('Please select a book and chapter first.');
      return;
    }

    const verse = Number(event.target.value);
    setSelectedVerse(verse);
    setChapterContent('');
    setError(null);
    setSearchResults([]);

    try {
      setIsLoadingVerse(true);
      const response = await bibleApi.getVerseByReference(
        selectedBible,
        selectedBook,
        selectedChapter,
        verse
      ) as PassageResponse;

      if (response && response.data) {
        setVerseContent(response.data.content);
        setReference(response.data.reference);
      } else {
        throw new Error('No verse data received');
      }
    } catch (error) {
      console.error('Error fetching verse:', error);
      setError('Failed to load verse. Please try again.');
      setVerseContent('');
    } finally {
      setIsLoadingVerse(false);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-sky-950' : 'bg-sky-50'}`}>
      {/* Navigation Bar */}
      <nav className={`fixed top-0 w-full ${darkMode ? 'bg-sky-500' : 'bg-white'} shadow-md z-10`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <BookOpen className={`h-6 w-6 ${darkMode ? 'text-white' : 'text-sky-500'}`} />
            <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-sky-500'}`}>
              SkyWord
            </h1>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 ${darkMode ? 'hover:bg-sky-800' : 'hover:bg-sky-50'}`}
          >
            {darkMode ? (
              <Sun className="h-5 w-5 text-white" />
            ) : (
              <Moon className="h-5 w-5 text-sky-500" />
            )}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1504052434569-70ad5836ab65?ixlib=rb-4.0.3")',
            backgroundPosition: 'center',
            filter: 'brightness(0.7)'
          }}
        />

        <div className="relative h-full">
          <div className="mx-auto max-w-7xl px-4 py-20">
            <div className="flex h-full flex-col items-center justify-center text-center">
              <h1 className="mb-6 text-4xl font-bold text-white md:text-6xl">
                Explore the Word of God
              </h1>
              <p className="mb-8 max-w-2xl text-lg text-gray-200">
                Discover, study, and meditate on Scripture through multiple translations
                and easy-to-use search features.
              </p>
              <button
                className="flex items-center gap-2 bg-sky-500 px-6 py-3 
                          font-semibold text-white transition-colors hover:bg-sky-600"
                onClick={() => {
                  const element = document.getElementById('main-content');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Start Reading
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main id="main-content" className="mx-auto max-w-7xl px-4 py-12">
        {loading ? (
          <div className="flex justify-center items-center min-h-[60vh]">
            <Loader darkMode={darkMode} size="large" text="Loading Bible Versions..." />
          </div>
        ) : (
          <>
            {/* Bible Version Selector */}
            <div className={`mb-6 ${darkMode ? 'bg-sky-900' : 'bg-white'} p-6 shadow-lg`}>
              <h2 className={`mb-4 text-lg font-semibold ${darkMode ? 'text-white' : 'text-sky-600'}`}>
                Select Bible Version
              </h2>
              <BibleSelector
                bibles={bibles}
                selectedBible={selectedBible}
                onSelect={handleBibleSelect}
              />
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <div className="relative">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${darkMode ? 'text-sky-400' : 'text-sky-500'
                  }`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(searchQuery);
                    }
                  }}
                  placeholder="Search for verses..."
                  className={`w-full border ${darkMode
                    ? 'border-sky-700 bg-sky-900 text-white placeholder-sky-400'
                    : 'border-sky-200 bg-white text-sky-900 placeholder-sky-400'
                    } p-4 pl-12 pr-24 rounded-lg`}
                />
                <button
                  onClick={() => handleSearch(searchQuery)}
                  disabled={isLoading || !searchQuery.trim()}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded ${isLoading || !searchQuery.trim()
                    ? 'opacity-50 cursor-not-allowed'
                    : darkMode
                      ? 'bg-sky-600 hover:bg-sky-500 text-white'
                      : 'bg-sky-500 hover:bg-sky-400 text-white'
                    }`}
                >
                  {isLoading ? (
                    <Loader darkMode={darkMode} size="small" />
                  ) : (
                    'Search'
                  )}
                </button>
              </div>
            </div>


            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className={`mt-6 ${darkMode ? 'bg-sky-900' : 'bg-white'} p-6 shadow-lg`}>
                <h2 className={`mb-4 text-lg font-semibold ${darkMode ? 'text-white' : 'text-sky-800'}`}>
                  Search Results for "{searchQuery}"
                </h2>
                <div className="space-y-4">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-4 ${darkMode
                        ? 'bg-sky-800 hover:bg-sky-700'
                        : 'bg-sky-50 hover:bg-sky-100'
                        } rounded-lg transition-colors`}
                    >
                      <div className={`flex justify-between items-start mb-2`}>
                        <span className={`font-semibold ${darkMode ? 'text-sky-200' : 'text-sky-600'}`}>
                          {result.reference}
                        </span>
                      </div>
                      <p className={`${darkMode ? 'text-white' : 'text-sky-900'}`}>
                        {result.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bible Navigation */}
            <div className={`mb-6 ${darkMode ? 'bg-sky-900' : 'bg-white'} p-6 shadow-lg`}>
              <h2 className={`mb-4 text-lg font-semibold ${darkMode ? 'text-white' : 'text-sky-600'}`}>
                Navigate Scripture
              </h2>

              {/* Testament Selector */}
              {selectedBible && (
                <div className="mb-6">
                  <label className={`block mb-2 ${darkMode ? 'text-white' : 'text-sky-500'}`}>
                    Select Testament
                  </label>
                  <select
                    className={`w-full border ${darkMode
                      ? 'border-sky-700 bg-sky-900 text-white'
                      : 'border-sky-200 bg-white text-sky-900'
                      } p-2`}
                    onChange={(e) => {
                      const testament = e.target.value as 'OLD' | 'NEW';
                      setSelectedTestament(testament);
                      setSelectedBook(null);
                      setSelectedChapter(null);
                      setSelectedVerse(null);
                      setVerseContent('');
                      setChapterContent('');
                      setReference('');
                    }}
                    value={selectedTestament || ''}
                  >
                    <option value="">-- Select Testament --</option>
                    <option value="OLD">Old Testament</option>
                    <option value="NEW">New Testament</option>
                  </select>
                </div>
              )}

              {/* Books Grid */}
              {selectedTestament && (
                <>
                  <h3 className={`mb-4 text-md font-semibold ${darkMode ? 'text-white' : 'text-sky-800'}`}>
                    Select Book
                  </h3>
                  {loadingBooks ? (
                    <div className="flex justify-center py-4">
                      <Loader darkMode={darkMode} size="small" text="Loading books..." />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                      {books
                        .filter(book => {
                          return TESTAMENT_GROUPS[`${selectedTestament}_TESTAMENT`].books.includes(book.id);
                        })
                        .map((book) => (
                          <button
                            key={book.id}
                            className={`${selectedBook === book.id
                              ? darkMode
                                ? 'bg-sky-600 text-white'
                                : 'bg-sky-300 text-sky-900'
                              : darkMode
                                ? 'bg-sky-800 text-white hover:bg-sky-700'
                                : 'bg-sky-100 text-sky-800 hover:bg-sky-200'
                              } p-3 text-center transition-colors duration-200`}
                            onClick={() => handleBookSelect(book.name)}
                          >
                            {book.name}
                          </button>
                        ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Chapter and Verse Selection */}
            <div className={`mb-6 ${darkMode ? 'bg-sky-900' : 'bg-white'} p-6 shadow-lg flex items-center space-x-4`}>
              <div className="flex-1">
                <label htmlFor="chapter-select" className={`block mb-2 ${darkMode ? 'text-white' : 'text-sky-500'}`}>
                  Select Chapter
                </label>
                {loadingChapters ? (
                  <div className="flex justify-center py-2">
                    <Loader darkMode={darkMode} size="small" text="Loading chapters..." />
                  </div>
                ) : (
                  <select
                    id="chapter-select"
                    value={selectedChapter ?? ''}
                    onChange={handleChapterSelect}
                    disabled={!selectedBook}
                    className={`w-full border ${darkMode
                      ? 'border-sky-700 bg-sky-900 text-white'
                      : 'border-sky-200 bg-white text-sky-900'
                      } p-2 ${!selectedBook ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="">-- Select Chapter --</option>
                    {chapters.map((chapter) => (
                      <option key={chapter} value={chapter}>
                        Chapter {chapter}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex-1">
                <label htmlFor="verse-select" className={`block mb-2 ${darkMode ? 'text-white' : 'text-sky-500'}`}>
                  Select Verse
                </label>
                {loadingVerses ? (
                  <div className="flex justify-center py-2">
                    <Loader darkMode={darkMode} size="small" text="Loading verses..." />
                  </div>
                ) : (
                  <select
                    id="verse-select"
                    value={selectedVerse ?? ''}
                    onChange={handleVerseSelect}
                    disabled={!selectedChapter}
                    className={`w-full border ${darkMode
                      ? 'border-sky-700 bg-sky-900 text-white'
                      : 'border-sky-200 bg-white text-sky-900'
                      } p-2 ${!selectedChapter ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="">-- Select Verse --</option>
                    {verses.map((verse) => (
                      <option key={verse} value={verse}>
                        Verse {verse}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Content Display */}
            {(isLoadingVerse || isLoadingChapter) ? (
              <div className="flex justify-center items-center py-8">
                <Loader
                  darkMode={darkMode}
                  size="small"
                  text={isLoadingChapter ? "Loading chapter..." : "Loading verse..."}
                />
              </div>
            ) : (
              (verseContent || chapterContent) && (
                <div className={`${darkMode ? 'bg-sky-900' : 'bg-white'} p-6 shadow-lg`}>
                  <VerseDisplay
                    content={selectedVerse ? verseContent : chapterContent}
                    reference={reference}
                    darkMode={darkMode}
                  />
                </div>
              )
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                <p>{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="underline mt-2 text-red-600 hover:text-red-800"
                >
                  Dismiss
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
