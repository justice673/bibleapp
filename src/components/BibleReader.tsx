import React, { useState } from 'react';
import { VerseDisplay } from './VerseDisplay';
import { bibleApi } from '../services/bibleApi'; // Adjust the import path if necessary

interface BibleReaderProps {
  reference: string;
  content: string;
  onBookmark: (reference: string) => void;
}

const BibleReader: React.FC<BibleReaderProps> = ({ reference, content, onBookmark }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmark = async () => {
    try {
      await bibleApi.bookmarkVerse(reference); // Assuming reference is the verseId
      onBookmark(reference);
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Error bookmarking verse:', error);
    }
  };

  return (
    <div className="p-6 shadow-lg bg-white dark:bg-gray-800">
      <h2 className="text-lg font-semibold">Verse Reference: {reference}</h2>
      <VerseDisplay content={content} reference={reference} />
      <button
        onClick={handleBookmark}
        className={`mt-4 p-2 ${isBookmarked ? 'bg-red-500' : 'bg-blue-500'} text-white rounded`}
      >
        {isBookmarked ? 'Remove Bookmark' : 'Bookmark Verse'}
      </button>
    </div>
  );
};

export default BibleReader;
