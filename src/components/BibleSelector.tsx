// components/BibleSelector.tsx
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Bible } from '../types/bible';

interface Props {
  bibles: Bible[];
  selectedBible: string;
  onSelect: (bibleId: string) => void;
}

export const BibleSelector: React.FC<Props> = ({ bibles, selectedBible, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBibles = bibles.filter((bible) =>
    bible.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bible.language.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search Bible versions..."
          className="w-full border border-sky-300 p-2 pl-8 dark:border-sky-500 dark:bg-gray-700 dark:text-white dark:placeholder-sky-400"
        />
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-sky-500 dark:text-sky-400" />
      </div>

      <select
        className="w-full border border-sky-300 p-2 dark:border-sky-500 dark:bg-gray-700 dark:text-white"
        value={selectedBible}
        onChange={(e) => onSelect(e.target.value)}
      >
        <option value="">Select a Bible version</option>
        {filteredBibles.map((bible) => (
          <option key={bible.id} value={bible.id}>
            {bible.name} ({bible.language.name})
          </option>
        ))}
      </select>
    </div>
  );
};
