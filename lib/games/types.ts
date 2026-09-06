export interface NormalizedGame {
    externalId: string;
    title: string;
    slug: string;
    coverUrl: string | null;
    releaseDate: string | null;
    releaseYear: number | null;
    description: string | null;
    platforms: string[];
}

export interface GameSearchResult {
    games: NormalizedGame[];
    total: number;
}
