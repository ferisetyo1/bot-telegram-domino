import { GameRoom, Player } from '@/types/game';
import { distributeTiles, placeTile, getValidMoves, calculatePoints } from './domino';
import { createBotPlayer, BotDifficulty } from './bot';
import * as db from '@/lib/db';

const gameCache = new Map<string, GameRoom>();

export function generateGameId(): string {
    return `game_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

export async function createGameRoom(
    creatorId: string,
    creatorUsername: string | null,
    creatorFirstName: string
): Promise<GameRoom> {
    const gameId = generateGameId();
    await db.createGame(gameId, creatorId);
    await db.addPlayerToGame(gameId, creatorId, 0);

    const gameRoom: GameRoom = {
        id: gameId,
        creatorId,
        status: 'waiting',
        players: [{
            id: 0,
            telegramId: creatorId,
            username: creatorUsername,
            firstName: creatorFirstName,
            hand: [],
            passCount: 0,
            consecutiveTimeouts: 0,
        }],
        currentPlayerIndex: 0,
        board: { tiles: [], leftEnd: 0, rightEnd: 0 },
        deck: [],
        createdAt: new Date(),
        startedAt: null,
        completedAt: null,
        winnerId: null,
    };

    gameCache.set(gameId, gameRoom);
    return gameRoom;
}

export async function addBotsToGame(
    gameId: string,
    botCount: number,
    difficulty: BotDifficulty
): Promise<GameRoom | null> {
    const game = await getGameRoom(gameId);
    if (!game || game.status !== 'waiting') return null;

    const availableSlots = 4 - game.players.length;
    const botsToAdd = Math.min(botCount, availableSlots);

    for (let i = 0; i < botsToAdd; i++) {
        const playerIndex = game.players.length;
        const botPlayer = createBotPlayer(i, difficulty);
        botPlayer.id = playerIndex;

        game.players.push(botPlayer);
        await db.addPlayerToGame(gameId, botPlayer.telegramId, playerIndex);
    }

    gameCache.set(gameId, game);
    return game;
}

export async function joinGameRoom(
    gameId: string,
    playerId: string,
    username: string | null,
    firstName: string
): Promise<GameRoom | null> {
    const game = await getGameRoom(gameId);
    if (!game || game.status !== 'waiting' || game.players.length >= 4) return null;
    if (game.players.some(p => p.telegramId === playerId)) return game;

    const playerIndex = game.players.length;
    await db.addPlayerToGame(gameId, playerId, playerIndex);

    game.players.push({
        id: playerIndex,
        telegramId: playerId,
        username,
        firstName,
        hand: [],
        passCount: 0,
        consecutiveTimeouts: 0,
    });

    gameCache.set(gameId, game);
    return game;
}

export async function startGame(gameId: string): Promise<GameRoom | null> {
    const game = await getGameRoom(gameId);
    if (!game || game.status !== 'waiting' || game.players.length < 2) return null;

    const { hands } = distributeTiles(game.players.length);
    game.players.forEach((player, index) => { player.hand = hands[index]; });

    game.status = 'in_progress';
    game.startedAt = new Date();
    game.currentPlayerIndex = Math.floor(Math.random() * game.players.length);

    gameCache.set(gameId, game);
    return game;
}

export async function cancelGame(gameId: string, userId: string): Promise<boolean> {
    const game = await getGameRoom(gameId);
    if (!game || game.status !== 'waiting' || game.creatorId !== userId) return false;

    game.status = 'cancelled';
    gameCache.delete(gameId);
    return true;
}

export async function getGameRoom(gameId: string): Promise<GameRoom | null> {
    if (gameCache.has(gameId)) return gameCache.get(gameId)!;

    const gameData = await db.getGame(gameId);
    if (!gameData) return null;

    const players = await db.getGamePlayers(gameId);

    const game: GameRoom = {
        id: gameData.id,
        creatorId: gameData.creator_id,
        status: gameData.status,
        players: players.map((p: any) => ({
            id: p.player_index,
            telegramId: p.player_id,
            username: p.username,
            firstName: p.first_name,
            hand: p.hand_state || [],
            passCount: p.pass_count || 0,
            consecutiveTimeouts: 0,
        })),
        currentPlayerIndex: 0,
        board: gameData.board_state || { tiles: [], leftEnd: 0, rightEnd: 0 },
        deck: [],
        createdAt: new Date(gameData.created_at),
        startedAt: null,
        completedAt: null,
        winnerId: null,
    };

    gameCache.set(gameId, game);
    return game;
}