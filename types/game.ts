// Domino Gaple Game Types

export interface DominoTile {
    top: number;
    bottom: number;
}

export interface Player {
    id: number;
    telegramId: string;
    username: string | null;
    firstName: string;
    hand: DominoTile[];
    passCount: number;
    consecutiveTimeouts: number;
}

export interface GameBoard {
    tiles: DominoTile[];
    leftEnd: number;
    rightEnd: number;
}

export type GameStatus = 'waiting' | 'in_progress' | 'completed' | 'cancelled';

export interface GameRoom {
    id: string;
    creatorId: string;
    status: GameStatus;
    players: Player[];
    currentPlayerIndex: number;
    board: GameBoard;
    deck: DominoTile[];
    createdAt: Date;
    startedAt: Date | null;
    completedAt: Date | null;
    winnerId: string | null;
}

export interface PlayerStats {
    userId: string;
    gamesPlayed: number;
    wins: number;
    losses: number;
    totalPoints: number;
    winStreak: number;
    highestWinStreak: number;
}
