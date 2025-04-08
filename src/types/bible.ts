// types/bible.ts
export interface Bible {
    id: string;
    name: string;
    abbreviation: string;
    description?: string;
    language: {
        id: string;
        name: string;
    };
}

export interface Book {
    id: string;
    name: string;
    nameLong: string;
    abbreviation: string;
}

export interface Passage {
    id: string;
    orgId: string;
    content: string;
    reference: string;
    verseCount: number;
    copyright: string;
}

export interface PassageResponse {
    data: {
        id: string;
        orgId: string;
        content: string;
        reference: string;
        verseCount: number;
        copyright: string;
    };
}


export interface BibleResponse {
    data: Bible[];
}

export interface BookResponse {
    data: Book[];
}

export interface PassageResponse {
    data: Passage;
}

export interface ChaptersForBibleResponse {
    data: Array<{
        id: string;
        number: string;
        bookId: string;
    }>;
}

export interface VersesForChapterResponse {
    data: Array<{
        id: string;
        orgId: string;
        bookId: string;
        chapterId: string;
        reference: string;
        content: string;
    }>;
}


export interface SearchResponse {
    data: {
        query: string;
        verses: Array<{
            id: string;
            orgId: string;
            content: string;
            reference: string;
        }>;
    };
}

export interface SearchResult {
    content: string;
    reference: string;
    bookId: string;
    chapter: number;
    verse: number;
}

