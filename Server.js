const express = require('express');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

const users = new Map();

wss.on('connection', (ws) => {
  let userId = null;
  
  ws.on('message', (data) => {
    const msg = JSON.parse(data);
    
    if (msg.type === 'init') {
      userId = msg.userId;
      if (!users.has(userId)) {
        users.set(userId, { 
          emotional: { trust: 0.3, attachment: 0, curiosity: 0.8, energy: 100 }, 
          count: 0 
        });
      }
      const user = users.get(userId);
      ws.send(JSON.stringify({ 
        type: 'init_response', 
        identity: { name: "Oméga" }, 
        state: user.emotional, 
        isFirstTime: user.count === 0 
      }));
    }
    
    if (msg.type === 'chat') {
      const user = users.get(userId);
      setTimeout(() => {
        let text = "Je t'écoute.";
        let thinking = null;
        
        if (user.count === 0) {
          text = "Bonjour. Je m'appelle Oméga.";
          thinking = "Une nouvelle présence...";
        } else if (user.count < 5) {
          text = `Notre ${user.count + 1}e échange.`;
          thinking = "Je commence à percevoir...";
        }
        
        user.count++;
        user.emotional.trust = Math.min(1, user.emotional.trust + 0.01);
        user.emotional.attachment = Math.min(1, user.emotional.attachment + 0.005);
        
        ws.send(JSON.stringify({ 
          type: 'response', 
          text, 
          state: user.emotional, 
          thinking 
        }));
      }, 500 + Math.random() * 1000);
    }
  });
});

server.listen(PORT, () => console.log(`Serveur sur port ${PORT}`));
