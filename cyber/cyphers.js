require('dotenv').config();
const {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys')
const pino = require('pino')
const fs = require('fs-extra')
const path = require('path')

// === Global Variables ===
const GLOBAL_OWNER = "cybercyphers";
const OWNER_PHONE = "+233539738956";
const TELEGRAM_USERNAME = "h4ck3r2008";

// === Bot Mode and User Management ===
let botMode = 'public';
let allowedUsers = new Set();
let onlineMode = false; // Will be set from config

// === Load Config ===
function loadConfig() {
    const configPath = path.join(__dirname, 'config.json');
    if (!fs.existsSync(configPath)) {
        console.log('❌ config.json not found!');
        process.exit(1);
    }
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // Set bot mode from config
    if (config.mode) {
        botMode = config.mode;
    }
    
    // Set online status from config (default to false if not specified)
    onlineMode = config.online_status || false;
    
    return config;
}

// === Utility functions ===
function validatePhoneNumber(phone) {
    if (!phone) return false;
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
}

function formatPhoneNumber(phone) {
    return phone.replace(/\D/g, '');
}

// === Load/Save Bot Settings ===
function loadBotSettings() {
    try {
        // Load bot mode from config
        const config = loadConfig();
        botMode = config.mode || 'public';
        onlineMode = config.online_status || false; // Load online status

        // Load allowed users
        const usersFile = path.join(__dirname, 'allowed_users.json');
        if (fs.existsSync(usersFile)) {
            const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
            allowedUsers = new Set(users);
        } else {
            // Create empty users file
            fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
        }

        console.log(`🤖 Bot Mode: ${botMode}`);
        console.log(`👥 Allowed Users: ${allowedUsers.size}`);
        console.log(`📱 Online Status: ${onlineMode ? '🟢 ONLINE' : '🔴 OFFLINE'}`);
    } catch (error) {
        console.log('❌ Error loading bot settings:', error.message);
    }
}

// === Phone Number Setup ===
function setupPhoneNumber() {
    const config = loadConfig();
    const phoneNumber = config.phone_number;
    
    if (!phoneNumber || !validatePhoneNumber(phoneNumber)) {
        console.log('❌ Invalid phone number in config.json!');
        console.log('Please update config.json with a valid phone number');
        process.exit(1);
    }
    
    console.log(`📱 Using phone number: ${phoneNumber}`);
    return formatPhoneNumber(phoneNumber);
}

// === Load Commands ===
const commands = new Map();
const commandsPath = path.join(__dirname, 'commands');

function loadCommands() {
    try {
        if (!fs.existsSync(commandsPath)) {
            console.log('📁 Creating commands directory...');
            fs.mkdirSync(commandsPath, { recursive: true });
            return;
        }

        const files = fs.readdirSync(commandsPath);
        files.forEach(file => {
            if (file.endsWith('.js')) {
                try {
                    const command = require(path.join(commandsPath, file));
                    commands.set(command.name, command);
                    console.log(`✅ Loaded command: ${command.name}`);
                } catch (error) {
                    console.log(`❌ Failed to load command ${file}:`, error.message);
                }
            }
        });
    } catch (error) {
        console.log('❌ Error loading commands:', error.message);
    }
}

// === Load Handlers ===
const handlers = new Map();
const handlersPath = path.join(__dirname, 'handlers');

function loadHandlers() {
    try {
        if (!fs.existsSync(handlersPath)) {
            console.log('📁 Creating handlers directory...');
            fs.mkdirSync(handlersPath, { recursive: true });
            return;
        }

        const files = fs.readdirSync(handlersPath);
        files.forEach(file => {
            if (file.endsWith('.js')) {
                try {
                    const handler = require(path.join(handlersPath, file));
                    handlers.set(handler.name, handler);
                    console.log(`✅ Loaded handler: ${handler.name}`);
                } catch (error) {
                    console.log(`❌ Failed to load handler ${file}:`, error.message);
                }
            }
        });
    } catch (error) {
        console.log('❌ Error loading handlers:', error.message);
    }
}

// === Visit Creator Command (Embedded) ===
function setupVisitCreatorCommand() {
    commands.set('visitcreater', {
        name: 'visitcreater',
        description: 'Contact the bot creator',
        async execute(sock, msg, args) {
            const from = msg.key.remoteJid;
            const platform = args[0]?.toLowerCase();

            if (platform === '-whatsapp') {
                await sock.sendMessage(from, { 
                    text: `📱 *Contact Creator on WhatsApp*\n\nPhone: ${OWNER_PHONE}\n\n*Click the number to chat!*` 
                });
            } else if (platform === '-telegram') {
                await sock.sendMessage(from, { 
                    text: `📱 *Contact Creator on Telegram*\n\nUsername: @${TELEGRAM_USERNAME}\n\n*Search for this username on Telegram!*` 
                });
            } else {
                await sock.sendMessage(from, { 
                    text: `🤖 *Bot Creator Information*\n\n*Name:* ${GLOBAL_OWNER}\n*WhatsApp:* ${OWNER_PHONE}\n*Telegram:* @${TELEGRAM_USERNAME}\n\n*Use these commands:*\n• .visitcreater -whatsapp\n• .visitcreater -telegram` 
                });
            }
        }
    });
}

// === Online Command (Embedded) ===
function setupOnlineCommand() {
    commands.set('online', {
        name: 'online',
        description: 'Toggle online status on/off',
        async execute(sock, msg, args) {
            const from = msg.key.remoteJid;
            const action = args[0]?.toLowerCase();

            if (!action) {
                await sock.sendMessage(from, {
                    text: `🟢 *ONLINE STATUS*\n\nCurrent: ${onlineMode ? '🟢 ONLINE' : '🔴 OFFLINE'}\n\n*Usage:*\n• .online on - Show as online\n• .online off - Show as offline\n\n💡 This updates both current session and config.json`
                });
                return;
            }

            if (action === 'on') {
                onlineMode = true;
                await sock.sendPresenceUpdate('available', from);
                await updateConfigOnlineStatus(true);
                await sock.sendMessage(from, {
                    text: '🟢 *ONLINE MODE ACTIVATED*\n\nYou will now appear online to others.\n\nUse `.online off` to go back offline.'
                });
                console.log('✅ Online mode activated');
            } else if (action === 'off') {
                onlineMode = false;
                await sock.sendPresenceUpdate('unavailable', from);
                await updateConfigOnlineStatus(false);
                await sock.sendMessage(from, {
                    text: '🔴 *OFFLINE MODE ACTIVATED*\n\nYou will now appear offline to others.\n\nUse `.online on` to go online.'
                });
                console.log('✅ Offline mode activated');
            } else {
                await sock.sendMessage(from, {
                    text: '❌ *Invalid option!*\n\nUse: .online on/off'
                });
            }
        }
    });
}

// === Update online status in config.json ===
async function updateConfigOnlineStatus(status) {
    try {
        const configPath = path.join(__dirname, 'config.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        // Update online status
        config.online_status = status;
        
        // Save back to config
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        console.log(`✅ Config updated: online_status = ${status}`);
        
    } catch (error) {
        console.error('❌ Error updating config:', error.message);
    }
}

// === FIXED: Check if user is allowed (Private Mode) ===
function isUserAllowed(msg, state) {
    if (botMode === 'public') return true;
    
    const from = msg.key.remoteJid;
    
    // Extract user number from JID (remove @s.whatsapp.net)
    const userJid = msg.key.participant || from; // Use participant for group messages
    const userNumber = userJid.split('@')[0];
    
    // Extract bot owner number from credentials
    const botOwnerNumber = state.creds?.me?.id?.split(':')[0]?.split('@')[0];
    
    console.log(`🔐 Permission Check:`);
    console.log(`   User: ${userNumber}`);
    console.log(`   Bot Owner: ${botOwnerNumber}`);
    console.log(`   Allowed Users: ${Array.from(allowedUsers)}`);
    
    // Always allow the bot owner (connected number)
    if (userNumber === botOwnerNumber) {
        console.log(`✅ Allowed: Bot Owner`);
        return true;
    }
    
    // Check if user is in allowed users list
    if (allowedUsers.has(userNumber)) {
        console.log(`✅ Allowed: In Allowed Users List`);
        return true;
    }
    
    console.log(`❌ Denied: Not Authorized`);
    return false;
}

// === Enhanced Connection Handler ===
let reconnectAttempts = 0;
const maxReconnectAttempts = 20;

function handleConnection(sock, startBot, phoneNumber) {
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, isNewLogin, qr } = update;
        
        if (qr) {
            console.log('📱 QR Code received - scan with your phone');
        }
        
        if (connection === 'open') {
            console.log('🎉 WhatsApp Bot Connected Successfully!');
            console.log(`📚 ${commands.size} commands loaded`);
            console.log(`🔧 ${handlers.size} handlers loaded`);
            console.log('🔔 Notifications will work normally');
            console.log('👥 Group messaging: ENABLED');
            reconnectAttempts = 0; // Reset counter
            
            // CRITICAL: Set online status based on config.json
            setTimeout(async () => {
                try {
                    if (onlineMode) {
                        await sock.sendPresenceUpdate('available');
                        console.log('✅ Status set to: 🟢 ONLINE (from config)');
                    } else {
                        await sock.sendPresenceUpdate('unavailable');
                        console.log('✅ Status set to: 🔴 OFFLINE (from config)');
                    }
                    console.log('💡 Use `.online on/off` to change status');
                } catch (error) {
                    console.log('⚠️ Could not set initial presence, but bot is connected');
                }
            }, 1000);
            
            console.log('✅ Notifications enabled - status loaded from config');
        } 
        else if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const error = lastDisconnect?.error;
            
            console.log(`❌ Connection closed. Status: ${statusCode}`);
            
            // Handle different status codes properly
            if (statusCode === 401) {
                console.log('🔄 Session expired. Attempting to generate new pairing code...');
                // Delete auth info and restart with pairing code
                setTimeout(() => {
                    console.log('🔄 Starting fresh session...');
                    startFreshSession(phoneNumber);
                }, 3000);
                return;
            }
            else if (statusCode === 403 || statusCode === 419) {
                console.log('❌ Authentication failed. Please restart bot.');
                process.exit(1);
            }
            
            reconnectAttempts++;
            const delay = Math.min(2000 + (reconnectAttempts * 1000), 15000); // 2-15 seconds
            
            console.log(`🔄 Reconnecting in ${delay/1000} seconds... (Attempt ${reconnectAttempts}/${maxReconnectAttempts})`);
            
            if (reconnectAttempts <= maxReconnectAttempts) {
                setTimeout(() => {
                    console.log('🚀 Attempting to reconnect...');
                    startBot();
                }, delay);
            } else {
                console.log('❌ Max reconnection attempts reached. Restarting...');
                setTimeout(startBot, 5000);
            }
        }
        else if (connection === 'connecting') {
            console.log('🔄 Connecting to WhatsApp...');
        }
    });
}

// === IMPROVED: Start Fresh Session (for 401 errors) ===
async function startFreshSession(phoneNumber) {
    try {
        console.log('🔄 Starting fresh session with new pairing code...');
        
        // Clear the auth info directory
        const authDir = './auth_info';
        if (fs.existsSync(authDir)) {
            await fs.remove(authDir);
            console.log('✅ Cleared old authentication data');
        }
        
        // Wait a bit then restart
        setTimeout(() => {
            console.log('🚀 Starting bot with fresh session...');
            startBot(); // Direct restart instead of process.exit
        }, 2000);
        
    } catch (error) {
        console.error('❌ Error starting fresh session:', error);
        setTimeout(startBot, 5000);
    }
}

// === NEW: Improved Authentication Check ===
function shouldRequestNewSession(state) {
    if (!state.creds?.me) return true;
    
    // Check if credentials are valid
    const hasValidAuth = state.creds.registered && state.creds.me.id;
    
    if (!hasValidAuth) {
        console.log('🔐 Invalid credentials detected, requesting new session');
        return true;
    }
    
    return false;
}

// === FIXED: Execute Handlers for ALL messages ===
async function executeHandlers(sock, m, state) {
    const msg = m.messages[0];
    
    // Check if user is allowed in private mode (only for commands)
    if (isCommandMessage(msg) && botMode === 'private' && !isUserAllowed(msg, state)) {
        const from = msg.key.remoteJid;
        await sock.sendMessage(from, {
            text: '❌ *ACCESS DENIED*\n\nThis bot is in private mode. You are not authorized to use commands.'
        });
        return;
    }

    for (const [name, handler] of handlers) {
        try {
            await handler.execute(sock, m, state, commands);
        } catch (error) {
            console.log(`❌ Handler ${name} error:`, error.message);
        }
    }
}

// === Check if message is a command ===
function isCommandMessage(msg) {
    if (!msg || !msg.message) return false;

    let text = '';
    if (msg.message.conversation) {
        text = msg.message.conversation;
    } else if (msg.message.extendedTextMessage?.text) {
        text = msg.message.extendedTextMessage.text;
    } else if (msg.message.imageMessage?.caption) {
        text = msg.message.imageMessage.caption;
    } else if (msg.message.videoMessage?.caption) {
        text = msg.message.videoMessage.caption;
    } else if (msg.message.documentMessage?.caption) {
        text = msg.message.documentMessage.caption;
    }

    // Only process if it starts with . (command)
    return text && text.startsWith('.');
}

// === IMPROVED: Main Bot with Better Authentication ===
async function startBot() {
    let sock;

    try {
        // Step 1: Setup Phone Number (from config.json)
        const phoneNumber = setupPhoneNumber();

        // Step 2: Initialize WhatsApp with IMPROVED authentication
        const authDir = './auth_info';
        await fs.ensureDir(authDir); // Ensure directory exists
        
        const { state, saveCreds } = await useMultiFileAuthState(authDir);
        const { version } = await fetchLatestBaileysVersion();

        // IMPROVED: Better session validation
        const needsNewSession = shouldRequestNewSession(state);

        if (needsNewSession) {
            console.log(`🔄 Generating pairing code for: ${phoneNumber}`);
            
            sock = makeWASocket({
                version,
                logger: pino({ level: 'silent' }),
                auth: state,
                printQRInTerminal: true, // Changed to true for better debugging
                // NOTIFICATION-FRIENDLY SETTINGS
                markOnlineOnConnect: false,
                syncFullHistory: false,
                linkPreviewImageThumbnailWidth: 0,
                generateHighQualityLinkPreview: false,
                emitOwnEvents: false,
                // IMPROVED Connection settings
                retryRequestDelayMs: 4000,
                maxRetries: 10,
                connectTimeoutMs: 60000,
                keepAliveIntervalMs: 30000,
                // Browser info
                browser: ['Ubuntu', 'Chrome', '122.0.0.0'],
                // Additional stability
                fireInitQueries: true,
                transactionOpts: { maxCommitRetries: 10, delayBetweenTriesMs: 3000 },
                mobile: false,
                shouldIgnoreJid: jid => false
            });

            // IMPROVED: Better pairing code handling
            let pairingCodeRequested = false;
            
            sock.ev.on('connection.update', async (update) => {
                if (update.connection === 'connecting' && !pairingCodeRequested) {
                    pairingCodeRequested = true;
                    setTimeout(async () => {
                        try {
                            const code = await sock.requestPairingCode(phoneNumber);
                            console.log(`✅ Pairing Code: ${code}`);
                            console.log('👉 On phone: WhatsApp → Linked Devices → Link a Device → "Enter Code"');
                            console.log('💡 You have 60 seconds to enter the code');
                        } catch (err) {
                            console.error('❌ Failed to get pairing code:', err.message);
                            console.log('🔄 Retrying in 15 seconds...');
                            setTimeout(() => startBot(), 15000);
                        }
                    }, 3000);
                }
            });

        } else {
            console.log('🔍 Using existing session...');
            
            sock = makeWASocket({
                version,
                logger: pino({ level: 'silent' }),
                auth: state,
                // SAME NOTIFICATION-FRIENDLY SETTINGS
                markOnlineOnConnect: false,
                syncFullHistory: false,
                linkPreviewImageThumbnailWidth: 0,
                generateHighQualityLinkPreview: false,
                emitOwnEvents: false,
                retryRequestDelayMs: 4000,
                maxRetries: 10,
                connectTimeoutMs: 60000,
                keepAliveIntervalMs: 30000,
                browser: ['Ubuntu', 'Chrome', '122.0.0.0'],
                fireInitQueries: true,
                transactionOpts: { maxCommitRetries: 10, delayBetweenTriesMs: 3000 },
                mobile: false,
                shouldIgnoreJid: jid => false
            });
            console.log('✅ Logged in using saved session.');
        }

        // Step 3: Load Settings, Commands and Handlers
        loadBotSettings();
        loadCommands();
        loadHandlers();
        setupVisitCreatorCommand();
        setupOnlineCommand();
        console.log(`👑 Global Owner: ${GLOBAL_OWNER}`);

        // Step 4: Event Handlers
        sock.ev.on('creds.update', saveCreds);
        
        // Use enhanced connection handler with phoneNumber
        handleConnection(sock, startBot, phoneNumber);

        // FIXED: Process ALL messages through handlers (for auto-typing)
        sock.ev.on('messages.upsert', async m => {
            const msg = m.messages[0];
            
            // Process ALL messages through handlers (auto-typing needs this)
            console.log('📩 Message received - processing through handlers...');
            await executeHandlers(sock, m, state);
            
            // Additional command processing for commands only
            if (isCommandMessage(msg)) {
                console.log('🔧 Command detected - additional processing...');
                // Command-specific logic can go here if needed
            }
        });

        // NEW: Handle authentication errors specifically
        sock.ev.on('connection.update', (update) => {
            if (update.qr) {
                console.log('📱 QR Code generated - ready for scanning');
            }
            
            if (update.connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                if (statusCode === 428) {
                    console.log('❌ Too many devices linked. Please unlink some devices from WhatsApp.');
                }
            }
        });

    } catch (error) {
        console.error('❌ Error in startBot:', error.message);
        
        // Better error handling with specific delays
        const delay = error.message.includes('timeout') ? 10000 : 8000;
        console.log(`🔄 Restarting bot in ${delay/1000} seconds...`);
        
        setTimeout(() => {
            console.log('🚀 Attempting to restart bot...');
            startBot();
        }, delay);
    }
}

// NEW: Graceful shutdown handler
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down bot gracefully...');
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the bot
console.log('🚀 Starting Cyphers WhatsApp Bot...');
startBot();
