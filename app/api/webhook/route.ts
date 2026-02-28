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
/newgame - Buat game baru (vs Bot atau Teman)
/join [kode] - Gabung game teman
/stats - Lihat statistik
/leaderboard - Top players
/help - Bantuan

🤖 Bisa main vs Bot (Easy/Normal/Hard)!
📞 Admin: @FoodzVillain
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

**Mode:**
🤖 Main vs Bot: Pilih difficulty di bawah
👥 Main vs Teman: Share kode \`/join ${game.id}\`
  `, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🤖 1 Bot (Easy)', callback_data: `addbot_${game.id}_1_easy` }, { text: '🤖 1 Bot (Normal)', callback_data: `addbot_${game.id}_1_normal` }],
                    [{ text: '🤖 1 Bot (Hard)', callback_data: `addbot_${game.id}_1_hard` }],
                    [{ text: '🤖 2 Bots (Normal)', callback_data: `addbot_${game.id}_2_normal` }, { text: '🤖 3 Bots (Normal)', callback_data: `addbot_${game.id}_3_normal` }],
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

**Mode Bermain:**
🤖 **VS Bot:** Pilih difficulty saat buat game
   • Easy - Bot main random
   • Normal - Bot prioritaskan kartu tinggi
   • Hard - Bot strategi maksimal

👥 **VS Teman:** Share kode game ke teman

**Cara Bermain:**
1. Buat game dengan /newgame
2. Pilih mode: Bot atau share kode ke teman
3. Minimal 2 pemain untuk mulai
4. Paskan kartu domino bergantian
5. Habiskan kartu untuk menang!

📞 Butuh bantuan? Hubungi: @FoodzVillain
  `);
    });

    // Handle button callbacks
    bot.on('callback_query', async (ctx) => {
        if (!('data' in ctx.callbackQuery)) return;

        const data = ctx.callbackQuery.data;

        if (data?.startsWith('addbot_')) {
            const parts = data.replace('addbot_', '').split('_');
            const gameId = parts[0];
            const botCount = parseInt(parts[1]);
            const difficulty = parts[2] as 'easy' | 'normal' | 'hard';

            const game = await gameState.addBotsToGame(gameId, botCount, difficulty);

            if (!game) {
                return ctx.answerCbQuery('❌ Gagal menambahkan bot');
            }

            await ctx.editMessageText(`
🎮 **Game Berhasil Dibuat!**

🆔 Kode Game: \`${game.id}\`
👥 Pemain: ${game.players.length}/4
${game.players.map((p, i) => `${i + 1}. ${p.firstName}${p.isBot ? ' 🤖' : ''}`).join('\n')}

✅ Bot ditambahkan! Siap untuk dimulai.
`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '▶️ Mulai Game', callback_data: `start_${game.id}` }],
                        [{ text: '❌ Batalkan', callback_data: `cancel_${game.id}` }]
                    ]
                }
            });

            await ctx.answerCbQuery('✅ Bot ditambahkan!');
        }

        if (data?.startsWith('start_')) {
            const gameId = data.replace('start_', '');
            const game = await gameState.startGame(gameId);

            if (!game) {
                return ctx.answerCbQuery('❌ Gagal memulai game');
            }

            await ctx.reply(`
🎲 **Game Dimulai!**

👥 Pemain:
${game.players.map((p, i) => `${i + 1}. ${p.firstName}${p.isBot ? ' 🤖' : ''}`).join('\n')}

🎯 Giliran: **${game.players[game.currentPlayerIndex].firstName}**
    `);

            // Send cards to each player (skip bots)
            for (const player of game.players) {
                if (player.isBot) continue;

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
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com').replace(/\/$/, '');
    return NextResponse.json({
        status: 'Bot is running',
        webhook_url: `${appUrl}/api/webhook`
    });
}