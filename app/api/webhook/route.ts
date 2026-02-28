import { NextRequest, NextResponse } from 'next/server';
import { Telegraf } from 'telegraf';
import * as db from '@/lib/db';
import * as gameState from '@/lib/game/state';
import { formatBoard, formatTile } from '@/lib/game/domino';

// Inisialisasi bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');

// Flag to ensure commands are only registered once
let commandsRegistered = false;

function setupBotCommands() {
    if (commandsRegistered) return;
    commandsRegistered = true;

    // Setup bot commands
    bot.command('start', async (ctx) => {
        const user = ctx.from;
        await db.createUser(user.id.toString(), user.username || null, user.first_name);

        await ctx.reply(`
👋 Halo ${user.first_name}!

Selamat datang di Bot Domino Gaple! 🎲

**Perintah:**
/newgame - Buat game baru
/join [kode] - Gabung game
/stats - Lihat statistik
/leaderboard - Top players
/help - Bantuan
  `);
    });

    bot.command('newgame', async (ctx) => {
        const user = ctx.from;
        const game = await gameState.createGameRoom(
            user.id.toString(),
            user.username || null,
            user.first_name
        );

        await ctx.reply(`
🎮 **Game Berhasil Dibuat!**

🆔 Kode Game: \`${game.id}\`
👥 Pemain: ${game.players.length}/4

Share kode ini ke teman:
\`/join ${game.id}\`
  `, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '▶️ Mulai Game', callback_data: `start_${game.id}` }],
                    [{ text: '❌ Batalkan', callback_data: `cancel_${game.id}` }]
                ]
            }
        });
    });

    bot.command('join', async (ctx) => {
        const args = ctx.message.text.split(' ');
        if (args.length < 2) {
            return ctx.reply('❌ Gunakan: /join [kode_game]');
        }

        const gameId = args[1];
        const user = ctx.from;

        const game = await gameState.joinGameRoom(
            gameId,
            user.id.toString(),
            user.username || null,
            user.first_name
        );

        if (!game) {
            return ctx.reply('❌ Game tidak ditemukan atau sudah penuh');
        }

        await ctx.reply(`
✅ ${user.first_name} bergabung!

👥 Pemain (${game.players.length}/4):
${game.players.map((p, i) => `${i + 1}. ${p.firstName}`).join('\n')}

${game.players.length >= 2 ? '✨ Bisa dimulai!' : '⏳ Menunggu minimal 2 pemain...'}
  `);
    });

    bot.command('stats', async (ctx) => {
        const stats = await db.getPlayerStats(ctx.from.id.toString());
        const winRate = stats.games_played > 0
            ? ((stats.wins / stats.games_played) * 100).toFixed(1)
            : 0;

        await ctx.reply(`
📊 **Statistik ${ctx.from.first_name}**

🎮 Total Game: ${stats.games_played}
✅ Menang: ${stats.wins}
❌ Kalah: ${stats.losses}
📈 Win Rate: ${winRate}%
🔥 Win Streak: ${stats.win_streak}
🏆 Best Streak: ${stats.highest_win_streak}
  `);
    });

    bot.command('leaderboard', async (ctx) => {
        const leaders = await db.getLeaderboard(10);

        if (leaders.length === 0) {
            return ctx.reply('📊 Belum ada data leaderboard');
        }

        const medals = ['🥇', '🥈', '🥉'];
        const board = leaders.map((entry: any, i: number) => {
            const medal = i < 3 ? medals[i] : `${i + 1}.`;
            const name = entry.username || entry.first_name;
            return `${medal} ${name} - ${entry.wins} wins`;
        }).join('\n');

        await ctx.reply(`
🏆 **Leaderboard - Top 10**

${board}
  `);
    });

    bot.command('help', async (ctx) => {
        await ctx.reply(`
📚 **Bantuan Lengkap**

**Perintah Game:**
/newgame - Buat game room baru
/join [kode] - Gabung ke game
/stats - Statistik pribadi
/leaderboard - Top 10 pemain
/help - Bantuan ini

**Cara Bermain:**
1. Buat game dengan /newgame
2. Share kode ke teman
3. Minimal 2 pemain untuk mulai
4. Paskan kartu domino bergantian
5. Habiskan kartu untuk menang!
  `);
    });

    // Handle button callbacks
    bot.on('callback_query', async (ctx) => {
        if (!('data' in ctx.callbackQuery)) return;

        const data = ctx.callbackQuery.data;

        if (data?.startsWith('start_')) {
            const gameId = data.replace('start_', '');
            const game = await gameState.startGame(gameId);

            if (!game) {
                return ctx.answerCbQuery('❌ Gagal memulai game');
            }

            await ctx.reply(`
🎲 **Game Dimulai!**

👥 Pemain:
${game.players.map((p, i) => `${i + 1}. ${p.firstName}`).join('\n')}

🎯 Giliran: **${game.players[game.currentPlayerIndex].firstName}**
    `);

            // Send cards to each player
            for (const player of game.players) {
                await bot.telegram.sendMessage(player.telegramId, `
🃏 **Kartu Anda:**
${player.hand.map((tile, i) => `${i + 1}. ${formatTile(tile)}`).join('\n')}
      `);
            }

            await ctx.answerCbQuery('✅ Game dimulai!');
        }

        if (data?.startsWith('cancel_')) {
            const gameId = data.replace('cancel_', '');
            await gameState.cancelGame(gameId, ctx.from.id.toString());
            await ctx.reply('❌ Game dibatalkan');
            await ctx.answerCbQuery();
        }
    });
}

// Webhook endpoint
export async function POST(req: NextRequest) {
    try {
        // Setup commands on first call
        setupBotCommands();

        // Verify secret token from header
        const secretToken = req.headers.get('x-telegram-bot-api-secret-token');
        if (secretToken !== process.env.TELEGRAM_WEBHOOK_SECRET) {
            console.error('Invalid secret token');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        console.log('Received update:', JSON.stringify(body, null, 2));

        await bot.handleUpdate(body);
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        status: 'Bot is running',
        webhook_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'}/api/webhook`
    });
}