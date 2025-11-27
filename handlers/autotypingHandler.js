const fs = require('fs-extra');
const path = require('path');

class AutoTypingHandler {
    constructor() {
        this.name = 'autotypingHandler';
        this.enabled = true; // Enable by default
        this.typingSessions = new Map();
        console.log(`🎯 AutoTyping Handler INITIALIZED - Enabled: ${this.enabled}`);
    }

    async execute(sock, m, state, commands) {
        try {
            const msg = m.messages[0];
            
            // Basic checks
            if (!msg) {
                console.log('❌ AutoTyping: No message');
                return;
            }

            if (!this.enabled) {
                console.log('❌ AutoTyping: Handler disabled');
                return;
            }

            // Skip if message is from the bot itself
            if (msg.key.fromMe) {
                console.log('⏩ AutoTyping: Skipping bot own message');
                return;
            }

            const from = msg.key.remoteJid;
            const sender = msg.pushName || 'Unknown';
            const isGroup = from.endsWith('@g.us');
            
            console.log(`👤 AutoTyping: From ${sender} in ${isGroup ? 'GROUP' : 'PRIVATE'}`);

            // Show typing for EVERY message regardless of content
            console.log('🎯 AutoTyping: Starting typing for ANY message');
            await this.startTyping(sock, from);

        } catch (error) {
            console.log('❌ AutoTyping execute error:', error.message);
        }
    }

    async startTyping(sock, jid) {
        try {
            console.log(`⌨️ AutoTyping: Starting typing for ${jid}`);
            
            // Stop any existing typing first
            if (this.typingSessions.has(jid)) {
                console.log('🔄 AutoTyping: Stopping existing session first');
                await this.stopTyping(sock, jid);
            }
            
            // Start typing indicator
            console.log('▶️ AutoTyping: Sending composing presence...');
            await sock.sendPresenceUpdate('composing', jid);
            console.log('✅ AutoTyping: Typing indicator STARTED');

            // Store session and set timeout to stop after 50 seconds
            const timeout = setTimeout(async () => {
                console.log('⏰ AutoTyping: 50 seconds reached, stopping typing');
                await this.stopTyping(sock, jid);
            }, 50000); // 50 seconds

            this.typingSessions.set(jid, { 
                timeout: timeout, 
                jid: jid,
                startTime: Date.now()
            });

            console.log(`💾 AutoTyping: Session stored for ${jid}`);

        } catch (error) {
            console.log('❌ AutoTyping startTyping error:', error.message);
        }
    }

    async stopTyping(sock, jid) {
        try {
            const session = this.typingSessions.get(jid);
            if (session) {
                clearTimeout(session.timeout);
                this.typingSessions.delete(jid);
                console.log(`🗑️ AutoTyping: Cleared session for ${jid}`);
            }
            
            console.log('⏸️ AutoTyping: Sending paused presence...');
            await sock.sendPresenceUpdate('paused', jid);
            console.log(`🛑 AutoTyping: Typing stopped for ${jid}`);
            
        } catch (error) {
            console.log('❌ AutoTyping stopTyping error:', error.message);
        }
    }

    async stopAllTyping(sock) {
        console.log('🛑 AutoTyping: Stopping ALL typing sessions');
        for (const [jid, session] of this.typingSessions) {
            if (session.timeout) {
                clearTimeout(session.timeout);
            }
            if (sock) {
                await sock.sendPresenceUpdate('paused', jid);
            }
            this.typingSessions.delete(jid);
        }
    }

    // Control methods
    enable() {
        this.enabled = true;
        console.log('🟢 AutoTyping: ENABLED');
        return '🟢 AutoTyping ENABLED';
    }

    disable() {
        this.enabled = false;
        console.log('🔴 AutoTyping: DISABLED');
        this.stopAllTyping();
        return '🔴 AutoTyping DISABLED';
    }

    status() {
        return this.enabled ? '🟢 ENABLED' : '🔴 DISABLED';
    }

    getStats() {
        return {
            enabled: this.enabled,
            activeSessions: this.typingSessions.size,
            sessions: Array.from(this.typingSessions.keys())
        };
    }
}

module.exports = new AutoTypingHandler();
