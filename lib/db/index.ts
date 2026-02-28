import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || '');

export async function createUser(telegramId: string, username: string | null, firstName: string) {
    const result = await sql`
    INSERT INTO users (telegram_id, username, first_name)
    VALUES (${telegramId}, ${username}, ${firstName})
    ON CONFLICT (telegram_id) DO UPDATE SET username = EXCLUDED.username
    RETURNING *
  `;
    return result[0];
}

export async function createGame(gameId: string, creatorId: string) {
    await sql`INSERT INTO games (id, creator_id) VALUES (${gameId}, ${creatorId})`;
}

export async function getGame(gameId: string) {
    const result = await sql`SELECT * FROM games WHERE id = ${gameId}`;
    return result[0] || null;
}

export async function addPlayerToGame(gameId: string, playerId: string, playerIndex: number) {
    await sql`INSERT INTO game_players (game_id, player_id, player_index) VALUES (${gameId}, ${playerId}, ${playerIndex})`;
}

export async function getGamePlayers(gameId: string) {
    return await sql`
    SELECT gp.*, u.username, u.first_name
    FROM game_players gp
    JOIN users u ON gp.player_id = u.telegram_id
    WHERE gp.game_id = ${gameId}
    ORDER BY gp.player_index
  `;
}

export async function updatePlayerStats(userId: string, isWin: boolean) {
    if (isWin) {
        await sql`
      INSERT INTO player_stats (user_id, games_played, wins, win_streak, highest_win_streak)
      VALUES (${userId}, 1, 1, 1, 1)
      ON CONFLICT (user_id) DO UPDATE SET
        games_played = player_stats.games_played + 1,
        wins = player_stats.wins + 1,
        win_streak = player_stats.win_streak + 1,
        highest_win_streak = GREATEST(player_stats.highest_win_streak, player_stats.win_streak + 1)
    `;
    } else {
        await sql`
      INSERT INTO player_stats (user_id, games_played, losses, win_streak)
      VALUES (${userId}, 1, 1, 0)
      ON CONFLICT (user_id) DO UPDATE SET
        games_played = player_stats.games_played + 1,
        losses = player_stats.losses + 1,
        win_streak = 0
    `;
    }
}

export async function getPlayerStats(userId: string) {
    const result = await sql`SELECT * FROM player_stats WHERE user_id = ${userId}`;
    return result[0] || { games_played: 0, wins: 0, losses: 0, win_streak: 0 };
}

export async function getLeaderboard(limit: number = 10) {
    return await sql`
    SELECT u.username, u.first_name, ps.*
    FROM player_stats ps
    JOIN users u ON ps.user_id = u.telegram_id
    ORDER BY ps.wins DESC
    LIMIT ${limit}
  `;
}