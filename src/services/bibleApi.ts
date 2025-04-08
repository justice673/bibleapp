// src/services/bibleApi.ts


type PassageResponse = {
    data: {
      id: string;
      bibleId: string;
      content: string;
      reference: string;
      copyright: string;
    };
  };

  
const API_BASE_URL = 'https://api.scripture.api.bible/v1';
const API_KEY = 'f38d1c5d0a05d14a1e43f58812a0c0b8'; // Replace with your actual API key

export const bibleApi = {
  async getBibles() {
    try {
      const response = await fetch(`${API_BASE_URL}/bibles`, {
        headers: {
          'api-key': API_KEY,
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching bibles:', error);
      throw error;
    }
  },

  async getVerses(bibleId: string, passageId: string) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/bibles/${bibleId}/passages/${passageId}`,
        {
          headers: {
            'api-key': API_KEY,
          },
        }
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching verses:', error);
      throw error;
    }
  },

  // New function to get verse by reference
  async getVerseByReference(bibleId: string, bookId: string, chapter: number, verse: number) {
    try {
      const passageId = `${bookId}.${chapter}.${verse}`;
      const response = await fetch(
        `${API_BASE_URL}/bibles/${bibleId}/passages/${passageId}`,
        {
          headers: {
            'api-key': API_KEY,
          },
        }
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching verse by reference:', error);
      throw error;
    }
  },

  // New function to get all verses for a chapter
  async getVersesForChapter(bibleId: string, bookId: string, chapter: number) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/bibles/${bibleId}/chapters/${bookId}.${chapter}/verses`,
        {
          headers: {
            'api-key': API_KEY,
          },
        }
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching verses for chapter:', error);
      throw error;
    }
  },

  // New function to search verses
  async searchVerses(bibleId: string, query: string) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/bibles/${bibleId}/search?query=${encodeURIComponent(query)}`,
        {
          headers: {
            'api-key': API_KEY,
          },
        }
      );
      return await response.json();
    } catch (error) {
      console.error('Error searching verses:', error);
      throw error;
    }
  },

  // New function to bookmark a verse
  async bookmarkVerse(verseId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/bookmarks`, {
        method: 'POST',
        headers: {
          'api-key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verseId }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error bookmarking verse:', error);
      throw error;
    }
  },

  // New function to get bookmarks
  async getBookmarks() {
    try {
      const response = await fetch(`${API_BASE_URL}/bookmarks`, {
        headers: {
          'api-key': API_KEY,
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      throw error;
    }
  },

  // Function to get books for a specific Bible
  async getBooks(bibleId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/bibles/${bibleId}/books`, {
        headers: {
          'api-key': API_KEY,
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  },

  // Function to get chapters for a specific book
  async getChapters(bibleId: string, bookId: string) {
    try {
      const url = `${API_BASE_URL}/bibles/${bibleId}/books/${bookId}/chapters`;
      console.log('Fetching chapters from:', url); // Debug log
  
      const response = await fetch(url, {
        headers: {
          'api-key': API_KEY,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(`API returned ${response.status}: ${JSON.stringify(errorData)}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching chapters:', error);
      throw error;
    }
  },
  
   //function to get chapters for a specific bible
  getPassage: async (bibleId: string, passageId: string): Promise<PassageResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/bibles/${bibleId}/passages/${passageId}?content-type=text&include-notes=false&include-titles=true&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false`,
      {
        headers: {
          'api-key': API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch passage');
    }

    return response.json();
  },

  // Function to get verses for a specific chapter
  async getVersesInChapter(bibleId: string, chapterId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/bibles/${bibleId}/chapters/${chapterId}/verses`, {
        headers: {
          'api-key': API_KEY,
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching verses in chapter:', error);
      throw error;
    }
  },

  search: async (bibleId: string, query: string) => {
    const response = await fetch(
      `${API_BASE_URL}/bibles/${bibleId}/search?query=${encodeURIComponent(query)}`,
      {
        headers: {
          'api-key': API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Search failed');
    }

    return response.json();
  },

  // Function to get audio Bibles
  async getAudioBibles() {
    try {
      const response = await fetch(`${API_BASE_URL}/audio-bibles`, {
        headers: {
          'api-key': API_KEY,
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching audio bibles:', error);
      throw error;
    }
  },
};