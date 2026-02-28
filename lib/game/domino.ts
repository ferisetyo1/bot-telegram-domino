import { DominoTile, GameBoard } from '@/types/game';

export function generateDeck(): DominoTile[] {
    const deck: DominoTile[] = [];
    for (let i = 0; i <= 6; i++) {
        for (let j = i; j <= 6; j++) {
            deck.push({ top: i, bottom: j });
        }
    }
    return deck;
}

export function shuffleDeck(deck: DominoTile[]): DominoTile[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export function distributeTiles(numPlayers: number) {
    const deck = shuffleDeck(generateDeck());
    const tilesPerPlayer = numPlayers <= 3 ? 7 : 5;
    const hands: DominoTile[][] = [];

    for (let i = 0; i < numPlayers; i++) {
        hands.push(deck.splice(0, tilesPerPlayer));
    }

    return { hands, remainingDeck: deck };
}

export function canPlaceTile(tile: DominoTile, board: GameBoard, position: 'left' | 'right'): boolean {
    if (board.tiles.length === 0) return true;

    const targetValue = position === 'left' ? board.leftEnd : board.rightEnd;
    return tile.top === targetValue || tile.bottom === targetValue;
}

export function placeTile(tile: DominoTile, board: GameBoard, position: 'left' | 'right'): GameBoard {
    const newBoard = { ...board, tiles: [...board.tiles] };

    if (newBoard.tiles.length === 0) {
        newBoard.tiles.push(tile);
        newBoard.leftEnd = tile.top;
        newBoard.rightEnd = tile.bottom;
    } else {
        const targetValue = position === 'left' ? newBoard.leftEnd : newBoard.rightEnd;
        let placedTile = { ...tile };

        if (position === 'left') {
            if (tile.bottom === targetValue) {
                placedTile = { top: tile.bottom, bottom: tile.top };
            }
            newBoard.tiles.unshift(placedTile);
            newBoard.leftEnd = placedTile.top;
        } else {
            if (tile.top === targetValue) {
                placedTile = { top: tile.bottom, bottom: tile.top };
            }
            newBoard.tiles.push(placedTile);
            newBoard.rightEnd = placedTile.bottom;
        }
    }

    return newBoard;
}

export function getValidMoves(hand: DominoTile[], board: GameBoard) {
    const validMoves: { tile: DominoTile; positions: ('left' | 'right')[] }[] = [];

    for (const tile of hand) {
        const positions: ('left' | 'right')[] = [];
        if (canPlaceTile(tile, board, 'left')) positions.push('left');
        if (canPlaceTile(tile, board, 'right')) positions.push('right');
        if (positions.length > 0) validMoves.push({ tile, positions });
    }

    return validMoves;
}

export function formatTile(tile: DominoTile): string {
    return `[${tile.top}|${tile.bottom}]`;
}

export function formatBoard(board: GameBoard): string {
    if (board.tiles.length === 0) return '🎲 Papan kosong';
    return `🎲 ${board.tiles.map(formatTile).join(' ')}`;
}

export function calculatePoints(tiles: DominoTile[]): number {
    return tiles.reduce((sum, tile) => sum + tile.top + tile.bottom, 0);
}