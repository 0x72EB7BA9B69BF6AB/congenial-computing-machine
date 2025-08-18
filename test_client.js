/**
 * Test WebSocket client to verify JavaScript execution
 */
const WebSocket = require('ws');

const SERVER_URL = 'ws://localhost:3000';

console.log('Connecting to', SERVER_URL);

const ws = new WebSocket(SERVER_URL, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Test Browser)'
  }
});

ws.on('open', () => {
  console.log('✅ Connected to WebSocket server');
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());
    console.log('📨 Received message:', message);
    
    if (message.type === 'welcome') {
      console.log('🎉 Welcome message received, UUID:', message.uuid);
    }
    
    if (message.type === 'execute_js') {
      console.log('🔧 JavaScript execution request:', message.code);
      
      // Simulate JavaScript execution
      try {
        const result = eval(message.code);
        const response = {
          type: 'js_executed',
          success: true,
          result: result !== undefined ? String(result) : 'Code exécuté avec succès',
          timestamp: new Date().toISOString(),
        };
        console.log('✅ Sending execution result:', response);
        ws.send(JSON.stringify(response));
      } catch (executeError) {
        const response = {
          type: 'js_executed',
          success: false,
          error: executeError.message,
          timestamp: new Date().toISOString(),
        };
        console.log('❌ Sending execution error:', response);
        ws.send(JSON.stringify(response));
      }
    }
  } catch (err) {
    console.log('❌ Failed to parse message:', err.message);
  }
});

ws.on('close', (code) => {
  console.log('🔌 Connection closed with code:', code);
});

ws.on('error', (error) => {
  console.log('❌ WebSocket error:', error.message);
});

// Keep the script running for 30 seconds
setTimeout(() => {
  console.log('🏁 Test completed, closing connection');
  ws.close();
  process.exit(0);
}, 30000);