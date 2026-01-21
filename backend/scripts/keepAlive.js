const https = require('https');

// Replace with your actual Render backend URL
const URL = 'https://online-aptitude-test-platform-1.onrender.com/health';
const INTERVAL = 14 * 60 * 1000; // 14 minutes (Render sleeps after 15 mins)

function ping() {
    const start = Date.now();
    const req = https.get(URL, (res) => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] Ping sent. Status: ${res.statusCode}. Duration: ${duration}ms`);
        
        if (res.statusCode !== 200) {
            console.warn(`Warning: Received status code ${res.statusCode}`);
        }
    });

    req.on('error', (e) => {
        console.error(`[${new Date().toISOString()}] Ping failed: ${e.message}`);
    });
}

console.log(`Starting keep-alive script for ${URL}`);
console.log(`Ping interval: ${INTERVAL / 1000 / 60} minutes`);

// Initial ping
ping();

// Schedule regular pings
setInterval(ping, INTERVAL);
