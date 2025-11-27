module.exports = {
    name: 'commandHandler',
    description: 'Handle bot commands',
    
    async execute(sock, m, state, commands) {
        const msg = m.messages[0];
        if (!msg.message) return;

        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        if (!text) return;

        // Check private mode restrictions
        const botMode = 'public'; // You might want to make this global
        let allowedUsers = new Set();
        
        if (botMode !== 'public') {
            const userJid = msg.key.participant || from;
            const userNumber = userJid.split('@')[0];
            const botOwnerNumber = state.creds?.me?.id?.split(':')[0]?.split('@')[0];
            
            if (userNumber !== botOwnerNumber && !allowedUsers.has(userNumber)) {
                await sock.sendMessage(from, { 
                    text: "😠 Fuck u you are not my God damn boss so piss off 🖕\n\n🔒 Bot is in private mode. Only allowed users can use commands." 
                });
                return;
            }
        }

        if (text.startsWith('.')) {
            const args = text.slice(1).trim().split(/ +/);
            const cmdName = args.shift().toLowerCase();

            if (commands.has(cmdName)) {
                const cmd = commands.get(cmdName);
                const startTime = Date.now();
                await cmd.execute(sock, msg, args);
                const endTime = Date.now();
                console.log(`⚡ Command "${cmdName}" executed in ${endTime - startTime}ms`);
            }
        }
    }
};