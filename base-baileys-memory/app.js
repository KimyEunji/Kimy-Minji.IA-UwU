const express = require('express');
const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const BaileysProvider = require('@bot-whatsapp/provider/baileys');
const MockAdapter = require('@bot-whatsapp/database/mock');
const fs = require('fs');

const app = express();
const port = 3000;

const path = require("path");
const menuPath = path.join(__dirname, "mensajes", "menu.txt");
const menu = fs.readFileSync(menuPath, "utf8");

// Mensaje de Bienvenida
const flowWelcome = addKeyword(EVENTS.WELCOME)
    .addAnswer("🙌 Hola bienvenido!!", {
        delay: 2000,
        media: "https://p16-flow-sign-va.ciciai.com/ocean-cloud-tos-us/text2img/0e06951f5c0d596ce93b68e7fb4bd93c_1718613356943212212.png~tplv-6bxrjdptv7-image-qvalue.png?rk3s=6823e3d0&x-expires=1750149356&x-signature=Xugr8mBn7T%2FpdqEp8LUAFj4fr48%3D"
    })
    .addAnswer(
        [
            'Hola, soy Kimy Minji.IA',
            'tu asistente personal de Whatsapp',
            'desarrollada por el equipo de KimyCompany'       
        ]
    );

// Crear el bot de WhatsApp y configurar los flujos
const createWhatsAppBot = async () => {
    const adapterDB = new MockAdapter();
    const adapterFlow = createFlow([flowWelcome]); // Definir los flujos de conversación aquí
    const adapterProvider = createProvider(BaileysProvider);

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });
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
    </style>
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
app.listen(port, () => {
    console.log(`Servidor Express escuchando en http://localhost:${port}`);
    createWhatsAppBot(); // Iniciar el bot de WhatsApp
});