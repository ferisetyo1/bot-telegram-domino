import { NextRequest, NextResponse } from "next/server";
import { distributeTiles, placeTile, getValidMoves } from "@/lib/game/domino";
import { BotDifficulty, getBotMove, createBotPlayer } from "@/lib/game/bot";
import { DominoTile, Player, GameBoard } from "@/types/game";

// Helper to create players (human + bots)
function createPlayers(playerCount: number, botCount: number, botDifficulty: BotDifficulty): Player[] {
    const players: Player[] = [];
    for (let i = 0; i < playerCount; i++) {
        players.push({
            id: i,
            telegramId: `human${i + 1}`,
            username: null,
            firstName: `Human ${i + 1}`,
            hand: [],
            passCount: 0,
            consecutiveTimeouts: 0,
            isBot: false,
            botDifficulty: undefined,
        });
    }
    for (let i = 0; i < botCount; i++) {
        const bot = createBotPlayer(i, botDifficulty);
        bot.id = playerCount + i;
        players.push(bot);
    }
    return players;
}

function isGameOver(players: Player[], board: GameBoard, deck: DominoTile[]): boolean {
    // Game over if any player has no tiles, or all players have passed
    if (players.some(p => p.hand.length === 0)) return true;
    if (deck.length === 0 && players.every(p => getValidMoves(p.hand, board).length === 0)) return true;
    return false;
}

function getWinner(players: Player[]): Player | null {
    // Winner is player with no tiles, or lowest total points if blocked
    const emptyHand = players.find(p => p.hand.length === 0);
    if (emptyHand) return emptyHand;
    // Blocked: lowest points
    let minPoints = Infinity;
    let winner: Player | null = null;
    for (const p of players) {
        const points = p.hand.reduce((sum, t) => sum + t.top + t.bottom, 0);
        if (points < minPoints) {
            minPoints = points;
            winner = p;
        }
    }
    return winner;
}

export async function GET(request: NextRequest) {
    // Parse query params
    const { searchParams } = request.nextUrl;
    const playerCount = parseInt(searchParams.get("players") || "1", 10); // human players
    const botCount = parseInt(searchParams.get("bots") || "3", 10); // bot players
    const botDifficulty = (searchParams.get("difficulty") as BotDifficulty) || "easy";

    // Validate
    if (playerCount + botCount < 2 || playerCount + botCount > 4) {
        return NextResponse.json({ error: "Total players must be 2-4" }, { status: 400 });
    }
    if (!["easy", "normal", "hard"].includes(botDifficulty)) {
        return NextResponse.json({ error: "Invalid bot difficulty" }, { status: 400 });
    }

    // Create players
    const players = createPlayers(playerCount, botCount, botDifficulty as BotDifficulty);

    // Distribute tiles
    const { hands, remainingDeck } = distributeTiles(players.length);
    players.forEach((p, i) => { p.hand = hands[i]; });

    // Initialize board
    let board: GameBoard = { tiles: [], leftEnd: 0, rightEnd: 0 };
    let currentPlayerIndex = 0;
    let moves: any[] = [];
    let drawPile = [...remainingDeck];

    // Game loop
    while (!isGameOver(players, board, drawPile)) {
        const player = players[currentPlayerIndex];
        const validMoves = getValidMoves(player.hand, board);
        let move = null;
        if (player.isBot) {
            move = getBotMove(player, board, player.botDifficulty || "easy");
        } else {
            // Simulate human: always pass if no moves, else play first move
            move = validMoves.length > 0 ? { tile: validMoves[0].tile, position: validMoves[0].positions[0] } : null;
        }
        if (move) {
            // Play tile
            player.hand = player.hand.filter(t => t !== move.tile);
            board = placeTile(move.tile, board, move.position);
            moves.push({ player: player.firstName, move: { tile: move.tile, position: move.position } });
            player.passCount = 0;
        } else if (drawPile.length > 0) {
            // Draw tile
            const drawn = drawPile.pop()!;
            player.hand.push(drawn);
            moves.push({ player: player.firstName, move: { type: "draw", tile: drawn } });
            player.passCount++;
        } else {
            // Pass
            moves.push({ player: player.firstName, move: { type: "pass" } });
            player.passCount++;
        }
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    }

    // Get winner
    const winner = getWinner(players);

    return NextResponse.json({
        players,
        moves,
        winner,
        finalBoard: board,
    });
}
