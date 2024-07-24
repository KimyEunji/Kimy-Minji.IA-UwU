const express = require('express');
const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const BaileysProvider = require('@bot-whatsapp/provider/baileys');
const MockAdapter = require('@bot-whatsapp/database/mock');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const app = express();
const port = 3000;
let botConnected = false;

// Crear WebSocket Server
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    ws.send(JSON.stringify({ connected: botConnected }));
});

const menuPath = path.join(__dirname, 'mensajes', 'menu.txt');
const menu = fs.readFileSync(menuPath, 'utf8');

// Mensaje de Bienvenida
const flowWelcome = addKeyword(EVENTS.WELCOME)
    .addAnswer("🙌 Hola bienvenido!!", {
        delay: 2000,
        media: "https://p16-flow-sign-va.ciciai.com/ocean-cloud-tos-us/text2img/0e06951f5c0d596ce93b68e7fb4bd93c_1718613356943212212.png~tplv-6bxrjdptv7-image-qvalue.png?rk3s=6823e3d0&x-expires=1750149356&x-signature=Xugr8mBn7T%2FpdqEp8LUAFj4fr48%3D"
    })
    .addAnswer([
        'Hola, soy Kimy Minji.IA',
        'tu asistente personal de Whatsapp',
        'desarrollada por el equipo de KimyCompany'
    ]);

// Crear el bot de WhatsApp y configurar los flujos
const createWhatsAppBot = async () => {
    const adapterDB = new MockAdapter();
    const adapterFlow = createFlow([flowWelcome]);
    const adapterProvider = createProvider(BaileysProvider);

    const bot = createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });

    // Verificar el estado de conexión del proveedor
    adapterProvider.on('qr', (qr) => {
        botConnected = false;
        console.log('QR code received, bot not connected');
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ connected: botConnected, qr }));
            }
        });
    });

    adapterProvider.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') {
            botConnected = true;
            console.log('Bot connected');
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ connected: botConnected }));
                }
            });
        }
    });

    return bot;
};

// Servir la imagen del código QR almacenada
app.get('/', (req, res) => {
    const imagePath = path.join(__dirname, 'bot.qr.png');
    const image = fs.readFileSync(imagePath);
    const imageData = image.toString('base64');
    const encodedImage = `data:image/png;base64,${imageData}`;

    const pageContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bot de WhatsApp - Kimy Min-ji.IA</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f0f0f0;
                color: #333;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                text-align: center;
            }
            h1 {
                color: #4285f4;
            }
            .qr-code {
                border: 5px solid #4285f4;
                padding: 10px;
                border-radius: 10px;
                margin-bottom: 20px;
                text-align: center;
            }
            img {
                width: 200px;
                border-radius: 10px;
            }
            p {
                font-size: 18px;
                font-weight: bold;
            }
            .checkmark {
                width: 100px;
                height: 100px;
                border-radius: 50%;
                display: inline-block;
                border: 5px solid #4CAF50;
                position: relative;
                animation: pop-in 0.3s ease-out forwards;
            }
            .checkmark::before {
                content: '';
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: #4CAF50;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                animation: grow 0.3s ease-out forwards;
            }
            .checkmark::after {
                content: '';
                width: 60px;
                height: 30px;
                border-left: 10px solid #4CAF50;
                border-bottom: 10px solid #4CAF50;
                position: absolute;
                top: 30%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                animation: draw 0.3s ease-out forwards 0.3s;
            }
            @keyframes pop-in {
                0% { transform: scale(0); }
                80% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }
            @keyframes grow {
                0% { transform: translate(-50%, -50%) scale(0); }
                100% { transform: translate(-50%, -50%) scale(1); }
            }
            @keyframes draw {
                0% { width: 0; height: 0; }
                100% { width: 60px; height: 30px; }
            }
        </style>
        <script>
            let ws;
            function connectWebSocket() {
                ws = new WebSocket('ws://' + window.location.host);
                ws.onopen = function() {
                    console.log('WebSocket connection established');
                };
                ws.onmessage = function(event) {
                    console.log('WebSocket message received:', event.data);
                    const data = JSON.parse(event.data);
                    if (data.connected) {
                        document.querySelector('.qr-code').innerHTML = '<div class="checkmark"></div>';
                        document.querySelector('p').textContent = 'Listo estoy conectada ahora puedes hablar conmigo en Whatsapp';
                    } else if (data.qr) {
                        document.querySelector('.qr-code').innerHTML = '<img src="data:image/png;base64,' + data.qr + '" alt="Código QR del Bot">';
                    }
                };
                ws.onerror = function(error) {
                    console.log('WebSocket error:', error);
                };
                ws.onclose = function() {
                    console.log('WebSocket connection closed');
                };
            }
            window.onload = connectWebSocket;
        </script>
    </head>
    <body>
        <div class="container">
            <h1>Bot de WhatsApp - Kimy Min-ji.IA</h1>
            <div class="qr-code">
                <img src="${encodedImage}" alt="Código QR del Bot">
            </div>
            <p>Escanea el código en WhatsApp para empezar una conversación conmigo.</p>
        </div>
    </body>
    </html>
    `;

    res.send(pageContent);
});

// Iniciar el servidor Express y el bot de WhatsApp
const server = app.listen(port, () => {
    console.log(`Servidor Express escuchando en http://localhost:${port}`);
    createWhatsAppBot(); // Iniciar el bot de WhatsApp
});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});
