const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Create logs directory if it doesn't exist
const logsDir = '/app/logs';
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Simple logging function
function logRequest(req) {
    const logEntry = `${new Date().toISOString()} - ${req.method} ${req.url} - ${req.ip}\n`;
    fs.appendFileSync(path.join(logsDir, 'access.log'), logEntry);
}

app.use((req, res, next) => {
    logRequest(req);
    next();
});

app.get('/', (req, res) => {
    res.send(`
        <h1>Hello from Docker!</h1>
        <p>This is a simple Node.js web application running in a container.</p>
        <p>Server time: ${new Date().toISOString()}</p>
        <p><a href="/logs">View Logs</a> | <a href="/health">Health Check</a></p>
    `);
});

app.get('/logs', (req, res) => {
    try {
        const logFile = path.join(logsDir, 'access.log');
        if (fs.existsSync(logFile)) {
            const logs = fs.readFileSync(logFile, 'utf8');
            res.send(`<h2>Access Logs</h2><pre>${logs}</pre><p><a href="/">Back Home</a></p>`);
        } else {
            res.send('<h2>No logs found</h2><p><a href="/">Back Home</a></p>');
        }
    } catch (error) {
        res.status(500).send('Error reading logs');
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

const port = process.env.PORT || 3456;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Logs will be written to ${logsDir}/access.log`);
});
