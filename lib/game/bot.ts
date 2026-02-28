import { DominoTile, Player } from '@/types/game';
import { getValidMoves } from './domino';

export type BotDifficulty = 'easy' | 'normal' | 'hard';

export function createBotPlayer(index: number, difficulty: BotDifficulty): Player {
    const botNames = ['Bot Alpha', 'Bot Beta', 'Bot Gamma', 'Bot Delta'];
    return {
        id: 0, // Will be set later
        telegramId: `bot_${index}_${Date.now()}`,
        username: null,
        firstName: botNames[index] || `Bot ${index + 1}`,
        hand: [],
        passCount: 0,
        consecutiveTimeouts: 0,
        isBot: true,
        botDifficulty: difficulty
    };
}

export function getBotMove(
    player: Player,
    board: { tiles: DominoTile[], leftEnd: number, rightEnd: number },
    difficulty: BotDifficulty
): { tile: DominoTile, position: 'left' | 'right' } | null {
    const validMoves = getValidMoves(player.hand, board);

    if (validMoves.length === 0) return null;

    // Convert positions array to single position moves
    const allMoves: Array<{ tile: DominoTile, position: 'left' | 'right' }> = [];
    for (const move of validMoves) {
        for (const position of move.positions) {
            allMoves.push({ tile: move.tile, position });
        }
    }

    switch (difficulty) {
        case 'easy':
            return getEasyMove(allMoves);
        case 'normal':
            return getNormalMove(allMoves, board);
        case 'hard':
            return getHardMove(allMoves, board, player);
        default:
            return getEasyMove(allMoves);
    }
}

function getEasyMove(validMoves: Array<{ tile: DominoTile, position: 'left' | 'right' }>): { tile: DominoTile, position: 'left' | 'right' } {
    // Random move
    return validMoves[Math.floor(Math.random() * validMoves.length)];
}

function getNormalMove(validMoves: Array<{ tile: DominoTile, position: 'left' | 'right' }>,
    board: { tiles: DominoTile[], leftEnd: number, rightEnd: number }
): { tile: DominoTile, position: 'left' | 'right' } {
    // Prefer double tiles or highest value tiles
    const sortedMoves = validMoves.sort((a, b) => {
        const aIsDouble = a.tile.top === a.tile.bottom;
        const bIsDouble = b.tile.top === b.tile.bottom;
        if (aIsDouble && !bIsDouble) return -1;
        if (!aIsDouble && bIsDouble) return 1;

        const aSum = a.tile.top + a.tile.bottom;
        const bSum = b.tile.top + b.tile.bottom;
        return bSum - aSum;
    });

    return sortedMoves[0];
}

function getHardMove(
    validMoves: Array<{ tile: DominoTile, position: 'left' | 'right' }>,
    board: { tiles: DominoTile[], leftEnd: number, rightEnd: number },
    player: Player
): { tile: DominoTile, position: 'left' | 'right' } {
    // Strategic: block opponent, maximize points, keep versatile tiles
    const scoredMoves = validMoves.map(move => {
        let score = 0;

        // Prefer playing high-value tiles first
        const tileSum = move.tile.top + move.tile.bottom;
        score += tileSum * 2;

        // Prefer double tiles (harder to play)
        if (move.tile.top === move.tile.bottom) score += 10;

        // Keep versatile tiles (more connection options)
        const otherTiles = player.hand.filter(t => t !== move.tile);
        const connections = otherTiles.filter(t =>
            t.top === move.tile.top || t.top === move.tile.bottom ||
            t.bottom === move.tile.top || t.bottom === move.tile.bottom
        ).length;
        score -= connections * 3; // Penalty for losing versatile tiles

        return { move, score };
    });

    scoredMoves.sort((a, b) => b.score - a.score);
    return scoredMoves[0].move;
}