const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'mode',
  description: 'Change bot mode between public and private',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    
    const mode = args[0]?.toLowerCase();
    
    if (mode === 'public' || mode === 'private') {
      // Update config.json
      const configPath = path.join(__dirname, '..', 'config.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      config.mode = mode;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      
      await sock.sendMessage(from, { 
        text: `✅ Bot mode changed to *${mode}* mode!\n\n${mode === 'private' ? '🔒 Only allowed users can use commands' : '🔓 Everyone can use commands'}\n\n⚡ Changes applied immediately!` 
      });
    } else {
      await sock.sendMessage(from, { 
        text: '❌ Please specify: .mode public OR .mode private\n\n🔒 private - Only allowed users\n🔓 public - Everyone can use' 
      });
    }
  }
}