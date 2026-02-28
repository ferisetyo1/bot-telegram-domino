# PRD: Telegram Domino Gaple Bot

## 1. Product overview

### 1.1 Document title and version

- PRD: Telegram Domino Gaple Bot
- Version: 1.0.0

### 1.2 Product summary

This project is a Telegram bot that enables users to play Domino Gaple, one of Indonesia's most popular domino variants. The bot allows 2-4 players to compete in private chats or group settings, providing an engaging and social gaming experience directly within Telegram.

Built with Next.js and deployed on Vercel, the bot leverages Telegram's Bot API for seamless interaction through inline keyboards and rich messaging. Players can create or join game rooms, play turns using intuitive button interfaces, and track their statistics over time. The system handles game logic, validates moves, determines winners, and maintains persistent game states to support interruption-free gameplay.

This bot aims to bring the traditional Indonesian domino experience into the digital realm, making it accessible for friends and communities to play together anytime, anywhere.

## 2. Goals

### 2.1 Business goals

- Create an engaging social gaming experience within Telegram to build an active user community
- Establish a scalable and maintainable codebase that can be extended with additional game modes or features
- Demonstrate technical capability in building real-time multiplayer games using serverless architecture
- Gather user engagement metrics to inform future feature development and monetization strategies

### 2.2 User goals

- Play Domino Gaple with friends in private chats or groups without needing to download a separate app
- Easily create or join game rooms with minimal setup or learning curve
- Experience smooth, bug-free gameplay with clear visual feedback and intuitive controls
- Track personal statistics and compete with friends on leaderboards
- Resume games after disconnections without losing progress

### 2.3 Non-goals

- Building a web or mobile app interface outside of Telegram
- Implementing real-money gambling or betting features
- Supporting other domino variants beyond Gaple in the initial release
- Creating AI opponents or single-player mode in version 1.0
- Providing voice or video chat functionality

## 3. User personas

### 3.1 Key user types

- Casual gamers who enjoy playing Domino Gaple with friends
- Telegram group administrators looking to add entertainment for their communities
- Mobile-first users who prefer quick, accessible games without app installations

### 3.2 Basic persona details

- **Casual player (Budi)**: A 25-year-old office worker who plays Domino Gaple during breaks with colleagues. Prefers quick games and easy-to-use interfaces. Uses Telegram daily for communication and wants entertainment without switching apps.

- **Group admin (Siti)**: A 30-year-old community manager who runs a Telegram group of 50+ members. Wants to keep members engaged with interactive activities. Values features that are easy to moderate and don't disrupt group conversations.

- **Competitive player (Andi)**: A 28-year-old gaming enthusiast who enjoys tracking stats and competing on leaderboards. Wants detailed game history and performance metrics.

### 3.3 Role-based access

- **Player**: Can start games, join rooms, make moves, view personal statistics
- **Room creator**: Can start a new game room, invite players, start the game when ready
- **Admin (future)**: Can view system analytics, manage reported users, access game logs

## 4. Functional requirements

- **Game room management** (Priority: High)
  - Players can create a new game room with /newgame command
  - Room creator can set room to private (invite only) or public (anyone can join)
  - Support for 2-4 players per room
  - Room creator can start the game once 2+ players have joined
  - Display waiting room status showing joined players
  - Auto-close rooms after 10 minutes of inactivity in waiting state

- **Gameplay mechanics** (Priority: High)
  - Implement standard Domino Gaple rules (28 tiles, 7 tiles per player initially)
  - Random tile distribution at game start
  - Players take turns placing matching tiles
  - First player determined randomly
  - Validate all moves according to Gaple rules
  - Handle "pass" when player cannot make a move
  - Detect game end conditions (player runs out of tiles or all players pass)
  - Calculate and display final scores based on remaining tile points

- **User interface** (Priority: High)
  - Display current game board state with visual tile representation using Unicode or emoji
  - Show player's hand with clickable inline buttons for each tile
  - Indicate current turn with clear messaging
  - Provide game status updates (player joined, player passed, tile placed, game ended)
  - Show remaining tile count for each player
  - Display winner announcement with final scores

- **User registration and authentication** (Priority: Medium)
  - Auto-register users on first interaction with bot
  - Store user Telegram ID, username, and display name
  - Support /start command for new users with welcome message
  - No password required (Telegram auth is sufficient)

- **Statistics and leaderboard** (Priority: Medium)
  - Track wins, losses, total games played per user
  - Track total points scored across all games
  - Provide /stats command to view personal statistics
  - Provide /leaderboard command to view top 10 players globally
  - Track win streak (consecutive wins)

- **Persistence and recovery** (Priority: Medium)
  - Save game state to database after each move
  - Allow players to resume if bot restarts or connection drops
  - Provide /mygames command to see active games
  - Auto-delete completed games after 24 hours

- **Help and onboarding** (Priority: Low)
  - Provide /help command with comprehensive game rules and bot commands
  - Provide /rules command specifically for Gaple game rules
  - Include tutorial images or GIFs showing how to play
  - First-time user flow with quick start guide

## 5. User experience

### 5.1 Entry points & first-time user flow

- User discovers bot via bot username or invitation link
- User sends /start command to bot
- Bot responds with welcome message, brief introduction, and primary commands (/newgame, /join, /help)
- User can immediately create a game or explore help documentation
- Optional: Brief interactive tutorial for first-time users

### 5.2 Core experience

- **Creating a game**: User sends /newgame, bot creates room and provides room ID, displays waiting status with inline button to start game once minimum players join

  - Ensures players can quickly set up games without complex configuration

- **Joining a game**: User sends /join [room_id] or clicks inline "Join Game" button shared in group, bot adds player to room and updates waiting list

  - Makes joining frictionless for friends who want to play together

- **Playing turns**: On player's turn, bot displays current board and player's hand with tile buttons, player clicks a tile to place it or clicks "Pass" button, bot validates move and updates game state

  - Provides intuitive touch-based interaction without typing commands mid-game

- **Game completion**: When game ends, bot announces winner, shows final scores, displays point breakdown, and offers "Play Again" button to create a new game with same players

  - Creates satisfying closure and encourages repeat engagement

### 5.3 Advanced features & edge cases

- Handle player disconnection gracefully with timeout (auto-pass after 60 seconds)
- Allow room creator to cancel game before it starts with /cancelgame
- Prevent players from joining multiple active games simultaneously
- Handle simultaneous button clicks with proper locking mechanisms
- Support game spectators in group chats (view only, no interaction)
- Provide /leave command to exit game room before game starts

### 5.4 UI/UX highlights

- Use emoji or Unicode characters to represent domino tiles visually (e.g., 🀸 🀹 🀺)
- Color-code or highlight valid playable tiles for current player
- Display board in a readable horizontal or vertical chain format
- Use inline keyboards for all interactive elements to minimize typing
- Provide clear visual separation between board state, current hand, and game messages
- Support both English and Indonesian language options

## 6. Narrative

Imagine you're on a lunch break with colleagues, and someone suggests playing Domino Gaple. Instead of needing physical tiles or downloading yet another app, you simply open your Telegram group chat. One person starts a game with /newgame, shares the room link, and within seconds, everyone has joined. The bot deals the tiles, and you see your hand displayed as clickable buttons. You tap a tile, it appears on the board, and the next player's turn begins. The game flows naturally, with clear visuals and instant feedback. When someone wins, scores appear immediately, and you can start another round with one tap. No app downloads, no separate accounts, just seamless fun integrated into a tool you already use every day.

## 7. Success metrics

### 7.1 User-centric metrics

- Daily active users (DAU) and monthly active users (MAU)
- Average games played per user per session
- Player retention rate (7-day and 30-day)
- Average session duration
- User satisfaction score from /feedback command

### 7.2 Business metrics

- Total number of registered users
- Total games completed
- User growth rate (week-over-week)
- Viral coefficient (new users from existing user invitations)
- Bot command usage distribution to identify popular features

### 7.3 Technical metrics

- API response time (target: <500ms for game moves)
- Error rate (target: <0.1% of requests)
- Database query performance
- Vercel function execution time
- Uptime percentage (target: 99.5%+)

## 8. Technical considerations

### 8.1 Integration points

- Telegram Bot API for sending/receiving messages and handling inline keyboards
- Webhook integration from Telegram to Next.js API routes hosted on Vercel
- Database (PostgreSQL on Vercel Postgres or Supabase) for storing users, games, and statistics
- Redis or in-memory cache for active game states to minimize database reads
- Telegram user authentication via Telegram ID (no separate auth system needed)

### 8.2 Data storage & privacy

- Store only necessary user data: Telegram ID, username, first name, statistics
- No collection of phone numbers or personal information beyond what Telegram provides
- Game data stored for 24 hours after completion, then archived or deleted
- Comply with Telegram's Bot Platform policies and terms of service
- Provide /deletemydata command for GDPR compliance
- Use environment variables for sensitive credentials (bot token, database URLs)

### 8.3 Scalability & performance

- Serverless architecture with Vercel Edge Functions for automatic scaling
- Database connection pooling to handle concurrent requests efficiently
- Rate limiting on bot commands to prevent spam (max 10 commands per user per minute)
- Optimize database queries with proper indexing on user_id, game_id, created_at fields
- Consider implementing game state caching to reduce database load during active gameplay
- Pagination for leaderboard queries to handle large user bases

### 8.4 Potential challenges

- Managing concurrent move submissions in multiplayer games (requires transaction locking)
- Handling Telegram API rate limits (30 messages per second per chat)
- Representing domino tiles clearly in text-based interface with limited formatting
- Ensuring game state consistency if Vercel function timeout occurs (15-second limit on hobby plan)
- Debugging webhook issues between Telegram and Vercel (consider ngrok for local testing)
- Managing database costs as user base grows (optimize queries and implement archival strategy)

## 9. Milestones & sequencing

### 9.1 Project estimate

- Medium: 6-8 weeks for MVP with core gameplay and basic features

### 9.2 Team size & composition

- Small team: 1-2 developers (full-stack with Next.js and Telegram Bot API experience), 1 designer (optional, for tile graphics and UI)

### 9.3 Suggested phases

- **Phase 1: Foundation setup** (1 week)
  - Set up Next.js project structure and development environment
  - Create Telegram bot via BotFather and configure webhook
  - Set up database schema (users, games, game_players, moves tables)
  - Implement basic bot commands (/start, /help)
  - Deploy to Vercel and test webhook integration

- **Phase 2: Core game mechanics** (2-3 weeks)
  - Implement Domino Gaple game logic (tile distribution, move validation, scoring)
  - Build game state management system
  - Create room creation and joining functionality
  - Develop turn-based gameplay flow
  - Implement game end detection and winner calculation

- **Phase 3: User interface and interaction** (1-2 weeks)
  - Design and implement tile representation (emoji/Unicode)
  - Build inline keyboard interfaces for tile selection
  - Create board state visualization
  - Implement game status messages and notifications
  - Add player hand display with clickable tiles

- **Phase 4: Statistics and persistence** (1 week)
  - Implement user statistics tracking
  - Build leaderboard functionality
  - Add game state persistence and recovery
  - Create /stats and /leaderboard commands

- **Phase 5: Testing, polish, and launch** (1 week)
  - Comprehensive testing with 2, 3, and 4 player games
  - Fix bugs and edge cases
  - Performance optimization
  - Write documentation for users and developers
  - Soft launch with limited user group for feedback
  - Public launch and monitoring

## 10. User stories

### 10.1. User registration and onboarding

- **ID**: GH-001
- **Description**: As a new user, I want to start using the bot immediately by sending /start, so that I can quickly understand what the bot does and begin playing.
- **Acceptance criteria**:
  - User sends /start command to bot
  - Bot creates user record in database if not exists
  - Bot responds with welcome message explaining the bot's purpose
  - Welcome message includes primary commands: /newgame, /join, /help, /rules
  - Response includes an inline button to create a new game
  - User can proceed to create or join a game without additional steps

### 10.2. Creating a new game room

- **ID**: GH-002
- **Description**: As a player, I want to create a new game room by sending /newgame, so that I can invite friends to play with me.
- **Acceptance criteria**:
  - User sends /newgame command
  - Bot creates a new game room with unique ID
  - Bot sets user as room creator
  - Bot responds with room details (room ID, created by, players joined 1/4)
  - Message includes shareable join link or room code
  - Message includes inline buttons: "Start Game" (disabled until 2+ players), "Cancel Game"
  - Room status shows "Waiting for players"
  - Room automatically closes if inactive for 10 minutes

### 10.3. Joining an existing game room

- **ID**: GH-003
- **Description**: As a player, I want to join an existing game room using a room ID, so that I can play with my friends.
- **Acceptance criteria**:
  - User sends /join [room_id] command or clicks inline "Join" button
  - Bot validates room exists and is in waiting state
  - Bot checks room is not full (max 4 players)
  - Bot verifies user is not already in another active game
  - Bot adds user to game room
  - Bot sends confirmation message to user
  - Bot updates room status message for all players showing new player count
  - All players in room receive notification that new player joined

### 10.4. Starting a game

- **ID**: GH-004
- **Description**: As a room creator, I want to start the game when enough players have joined, so that we can begin playing.
- **Acceptance criteria**:
  - At least 2 players are in the room
  - Room creator clicks "Start Game" inline button
  - Bot validates minimum player count
  - Bot shuffles and distributes 7 tiles to each player (or 5 tiles if 4 players)
  - Bot randomly selects first player
  - Bot places middle tile on board (if using that variant) or shows empty board
  - Bot sends game board state to all players
  - Bot sends private message to each player showing their hand
  - Bot notifies whose turn it is
  - Room status changes to "In Progress"

### 10.5. Viewing hand and making a move

- **ID**: GH-005
- **Description**: As a player, I want to see my current tiles and place a valid tile on my turn, so that I can progress the game.
- **Acceptance criteria**:
  - On player's turn, bot sends message showing current board state
  - Bot sends player's hand as inline keyboard with one button per tile
  - Playable tiles are marked or highlighted (e.g., with ✅ emoji)
  - Player clicks a tile button
  - Bot validates the move is legal according to Gaple rules
  - If valid, bot places tile on board and updates game state
  - Bot saves move to database
  - Bot notifies all players of the move made
  - Bot displays updated board to all players
  - Bot moves to next player's turn
  - If invalid, bot shows error message and allows player to try again

### 10.6. Passing a turn

- **ID**: GH-006
- **Description**: As a player, I want to pass my turn when I have no valid moves, so that the game can continue.
- **Acceptance criteria**:
  - Player has no valid tiles to play
  - "Pass" button appears in inline keyboard
  - Player clicks "Pass" button
  - Bot records pass action
  - Bot notifies all players that player passed
  - Bot moves to next player's turn
  - If all players pass consecutively, game ends

### 10.7. Game completion and scoring

- **ID**: GH-007
- **Description**: As a player, I want to see the final scores and winner when the game ends, so that I know who won and by how much.
- **Acceptance criteria**:
  - Game ends when a player runs out of tiles OR all players pass
  - Bot calculates points for each player based on remaining tiles
  - Bot determines winner (player with 0 tiles or lowest points)
  - Bot sends game completion message to all players
  - Message shows final scores for all players ranked
  - Message shows winner with celebration emoji
  - Message includes "Play Again" button to create new room with same players
  - Bot updates player statistics (wins, losses, games played, points)
  - Game state changes to "Completed"

### 10.8. Viewing personal statistics

- **ID**: GH-008
- **Description**: As a player, I want to view my game statistics by sending /stats, so that I can track my performance over time.
- **Acceptance criteria**:
  - User sends /stats command
  - Bot retrieves user statistics from database
  - Bot displays total games played
  - Bot displays wins and losses with win rate percentage
  - Bot displays total points scored across all games
  - Bot displays current win streak
  - Bot displays highest win streak achieved
  - Message formatted clearly with emojis for readability

### 10.9. Viewing leaderboard

- **ID**: GH-009
- **Description**: As a player, I want to view the global leaderboard by sending /leaderboard, so that I can see how I rank compared to others.
- **Acceptance criteria**:
  - User sends /leaderboard command
  - Bot queries database for top 10 players by wins
  - Bot displays ranked list with player names and win counts
  - Bot highlights current user's rank if in top 10
  - Bot shows current user's rank below top 10 if not included
  - Leaderboard updates in real-time based on latest game results

### 10.10. Getting help and game rules

- **ID**: GH-010
- **Description**: As a new player, I want to access help documentation and game rules, so that I can learn how to play without external resources.
- **Acceptance criteria**:
  - User sends /help command
  - Bot displays list of all available commands with brief descriptions
  - Bot includes /rules command in help list
  - User sends /rules command
  - Bot displays comprehensive Domino Gaple rules including:
    - Number of tiles and distribution
    - How to match tiles
    - Passing rules
    - Winning conditions
    - Scoring system
  - Rules formatted with examples for clarity

### 10.11. Resuming a game after disconnection

- **ID**: GH-011
- **Description**: As a player, I want to resume my active game if the bot restarts or I lose connection, so that my game progress is not lost.
- **Acceptance criteria**:
  - User sends /mygames command
  - Bot queries database for user's active games
  - Bot displays list of active games with room IDs and current status
  - User can click inline button to "Resume Game"
  - Bot sends current game state to user
  - If it's user's turn, bot displays hand and prompts for move
  - If not user's turn, bot shows waiting message
  - Game continues seamlessly from last saved state

### 10.12. Canceling a game before it starts

- **ID**: GH-012
- **Description**: As a room creator, I want to cancel a game before it starts, so that I can remove an accidental or unwanted game room.
- **Acceptance criteria**:
  - Room creator clicks "Cancel Game" button or sends /cancelgame command
  - Bot verifies user is room creator
  - Bot verifies game has not started yet
  - Bot notifies all joined players that game was canceled
  - Bot removes game room from active rooms
  - Bot updates database to mark game as cancelled

### 10.13. Handling turn timeout

- **ID**: GH-013
- **Description**: As a player waiting for my turn, I want inactive players to be auto-passed after a timeout, so that the game doesn't stall indefinitely.
- **Acceptance criteria**:
  - Player's turn begins, timer starts (60 seconds)
  - Bot sends reminder message at 30 seconds remaining
  - If player doesn't act within 60 seconds, bot automatically passes for them
  - Bot notifies all players of auto-pass with reason (timeout)
  - Game continues to next player
  - After 3 consecutive auto-passes, bot warns player
  - After 5 consecutive auto-passes, bot removes player from game for inactivity

### 10.14. Authentication and security

- **ID**: GH-014
- **Description**: As a system, I want to ensure all interactions are from authenticated Telegram users, so that the bot is protected from unauthorized access.
- **Acceptance criteria**:
  - Bot validates all incoming requests contain valid Telegram user ID
  - Bot verifies webhook requests come from Telegram servers using secret token
  - Bot rejects any requests without proper authentication headers
  - Bot rate-limits commands to prevent spam (max 10 commands per user per minute)
  - Bot logs all critical actions for security auditing
  - Environment variables protect sensitive credentials (bot token, database credentials)

### 10.15. Data deletion for privacy compliance

- **ID**: GH-015
- **Description**: As a user concerned about privacy, I want to delete all my data from the system, so that my information is not retained if I stop using the bot.
- **Acceptance criteria**:
  - User sends /deletemydata command
  - Bot asks for confirmation with inline "Confirm" and "Cancel" buttons
  - User clicks "Confirm"
  - Bot removes all user data including profile, statistics, and game history
  - Bot keeps anonymized aggregate data for analytics (no personally identifiable info)
  - Bot confirms deletion to user
  - Bot removes user from active games if applicable
  - User can re-register by sending /start again later

---

Apakah PRD ini sudah sesuai dengan harapan Anda? Jika sudah, apakah Anda ingin saya membuat GitHub issues untuk setiap user story yang terdokumentasi?