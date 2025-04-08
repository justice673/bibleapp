// components/VerseDisplay.tsx
import React from 'react';
import { Share2, Bookmark } from 'lucide-react';

interface Props {
  content: string;
  reference: string;
  isSearchResult?: boolean;
  darkMode?: boolean;
}

export const VerseDisplay: React.FC<Props> = ({ content, reference, isSearchResult }) => {
  const shareVerse = async () => {
    // Clean up the content by removing HTML tags if present
    const cleanContent = content.replace(/<[^>]*>/g, '');
    const verseToShare = `${reference}: ${cleanContent}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Bible Verse',
          text: verseToShare,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(verseToShare);
        alert('Verse copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(verseToShare);
        alert('Verse copied to clipboard!');
      } catch (clipboardError) {
        console.error('Error copying to clipboard:', clipboardError);
        alert('Unable to share or copy verse. Please try again.');
      }
    }
  };

  return (
    <div className={`relative min-h-[180px] pb-10 ${isSearchResult ? 'border-b border-sky-200 dark:border-sky-700' : ''}`}>
      <div 
        className="text-lg dark:text-sky-500"
        dangerouslySetInnerHTML={{ __html: content }}
      />
      <p className="mt-4 text-right text-sm text-gray-700 dark:text-gray-400">
        {reference}
      </p>
      <div className="absolute bottom-2 right-2 flex space-x-2">
        <Share2 
          onClick={shareVerse} 
          className="cursor-pointer text-sky-500 hover:text-sky-600 dark:hover:text-sky-400" 
        />
        <Bookmark 
          className="cursor-pointer text-sky-500 hover:text-sky-600 dark:hover:text-sky-400"
          onClick={() => alert('Bookmark feature coming soon!')} 
        />
      </div>
    </div>
  );
};
