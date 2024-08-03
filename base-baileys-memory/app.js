const express = require('express');
const bodyParser = require('body-parser');
const { createBot, createProvider, createFlow, addKeyword, EVENTS, addAnswer } = require('@bot-whatsapp/bot');
const BaileysProvider = require('@bot-whatsapp/provider/baileys');
const MockAdapter = require('@bot-whatsapp/database/mock');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const moment = require('moment');

const xdata = require('./xdata');

// Configuración de la localización para 'moment'
moment.locale('es');

const app = express();
const port = 3000;
let botConnected = false;

// Middleware para procesar datos POST
app.use(bodyParser.json());

// Crear WebSocket Server
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    ws.send(JSON.stringify({ connected: botConnected }));
    // Enviar el QR code si no está conectado
    if (!botConnected) {
        const qrPath = path.join(__dirname, 'bot.qr.png');
        if (fs.existsSync(qrPath)) {
            const qrImage = fs.readFileSync(qrPath).toString('base64');
            ws.send(JSON.stringify({ connected: botConnected, qr: qrImage }));
        }
    }
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

    const userContext = {};

    const flowCitas = addKeyword('hacer una cita')
        .addAnswer('Claro, en un momento agendaremos tu cita. Para empezar, ¿puedes decirme tu nombre?', { capture: true }, async (ctx, { flowDynamic }) => {
            const nombre = ctx.body;
            userContext[ctx.from] = { nombre };
            await flowDynamic([
                `Gracias, ${nombre}.`
            ]);
        })
        .addAnswer('¿Cuál es la fecha para la cita? (por ejemplo, 2024-08-15)?', { capture: true }, async (ctx, { flowDynamic }) => {
            const fecha = ctx.body;
            userContext[ctx.from].fecha = fecha;
            const diaSemana = moment(fecha).format('dddd').toLowerCase();
            if (xdata.horario[diaSemana].inicio === 'cerrado') {
                await flowDynamic([
                    'Lo siento, no atendemos ese día. Por favor elige otra fecha.'
                ]);
                return;
            }
            await flowDynamic([
                `Perfecto, el ${fecha}.`
            ]);
        })
        .addAnswer('¿Y a qué hora? (por ejemplo, 14:30)?', { capture: true }, async (ctx, { flowDynamic }) => {
            const hora = ctx.body;
            const { fecha } = userContext[ctx.from];
            const diaSemana = moment(fecha).format('dddd').toLowerCase();
            const horaInicio = moment(xdata.horario[diaSemana].inicio, 'HH:mm');
            const horaFin = moment(xdata.horario[diaSemana].fin, 'HH:mm');
            const horaCita = moment(hora, 'HH:mm');
    
            if (!horaCita.isBetween(horaInicio, horaFin)) {
                await flowDynamic([
                    `Lo siento, nuestro horario de atención el ${diaSemana} es de ${xdata.horario[diaSemana].inicio} a ${xdata.horario[diaSemana].fin}. Por favor elige otra hora.`
                ]);
                return;
            }
    
            const citaExistente = xdata.citas.find(cita => cita.fecha === fecha && cita.hora === hora);
            if (citaExistente) {
                await flowDynamic([
                    'Lo siento, ya tenemos una cita agendada para esa fecha y hora. Por favor elige otra hora.'
                ]);
                return;
            }
    
            userContext[ctx.from].hora = hora;
            const { nombre } = userContext[ctx.from];
            xdata.citas.push({ nombre, fecha, hora });
    
            await flowDynamic([
                `¡Listo! He anotado tu cita para ${nombre} el ${fecha} a las ${hora}.`
            ]);
        });
    
            const flowConsulta = addKeyword('consultar')
    .addAnswer('Por favor, dime tu pregunta:', { capture: true }, async (ctx, { flowDynamic }) => {
        const pregunta = ctx.body.toLowerCase();
        const entry = xdata.find(item => item.pregunta.toLowerCase() === pregunta);
        
        if (entry) {
            await flowDynamic([
                entry.respuesta
            ]);
        } else {
            await flowDynamic([
                'Lo siento pero no cuento con esa información. ¿En qué más te puedo ayudar?'
            ]);
        }
    });
    
// Crear el bot de WhatsApp y configurar los flujos
const createWhatsAppBot = async () => {
    const adapterDB = new MockAdapter();
    const adapterFlow = createFlow([flowWelcome, flowCitas, flowConsulta]);
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
        const qrPath = path.join(__dirname, 'bot.qr.png');
        fs.writeFileSync(qrPath, Buffer.from(qr, 'base64'));
        const qrImage = fs.readFileSync(qrPath).toString('base64');
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ connected: botConnected, qr: qrImage }));
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

// Servir la página de inicio de sesión
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Servir la página del QR después de iniciar sesión
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Manejar la autenticación
app.post('/login', (req, res) => {
    const { user, password } = req.body;
    // Validar las credenciales (esto es solo un ejemplo, en un entorno real deberías usar una base de datos)
    if (user === 'KimyMin-ji' && password === 'MinjiOwO1234') {
        res.status(200).send();
    } else {
        res.status(401).send();
    }
});

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

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
