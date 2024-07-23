const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')

const path = require("path")
const fs = require("fs")

const menuPath = path.join(__dirname, "mensajes", "menu.txt")
const menu = fs.readFileSync(menuPath, "utf8")

// Menu de Opciones

const menuFlow = addKeyword("menu").addAnswer(
    menu,
    {
        media: "https://p16-flow-sign-va.ciciai.com/ocean-cloud-tos-us/text2img/87f6a3b16b0c0ee94184181b7bd33aaf_1718694231651277855.png~tplv-6bxrjdptv7-image-qvalue.png?rk3s=6823e3d0&x-expires=1750230231&x-signature=HZ9PpldgZpdx2WbTltQQhLAp9c8%3D",
        capture: true
    },
    async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
        if (!["Musica", "Roleplay", "Salir"].includes(ctx.body)) {
            return fallBack("Respuesta no válida, por favor selecciona una de las opciones.");
        }
        switch (ctx.body) {
            case "Musica":
                return gotoFlow(flowMusic);
            case "Roleplay":
                return gotoFlow(flowLoadRoleplay);
            case "Salir":
                return await flowDynamic("Saliendo... Puedes volver a acceder a este menú escribiendo 'menu'");
        }
    }
);

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
            'desarrollada por el equipo de KimyCompany',
            'Escribe "menu" para ver las opciones disponibles',       
        ],
        null,
        null,
        [menuFlow]
    );

    // Menu de Musica 

const flowMusic = addKeyword(EVENTS.ACTION)
.addAnswer([
    '> °•°♡•°《♡Music♡》°•°♡•°|🌸',
    '> 🌸    🔀⏮⏯⏩🔁     🌸',
    '> 🌸0:35----●---------3:35🌸 \n',
    '> 《♡YouTube_Music♡》\n',
    '> https://music.youtube.com/playlist?list=PL5W6KruuhuZA5Rf08mRwQz21oZFrnO3Np \n',
    '> 《♡YouTube♡》\n',
    "> https://www.youtube.com/playlist?list=PL5W6KruuhuZA5Rf08mRwQz21oZFrnO3Np"
],
{
    delay: 2000,
    media: "https://i.pinimg.com/736x/b9/b2/c2/b9b2c2d310918e322c328f2e3413d87a.jpg"
}
);

// Flow de Rolplay de Kimy Min-ji
const flowLoadRoleplay = addKeyword(EVENTS.ACTION)
    .addAnswer(
        [
            '> •°•°•°《♤Roleplay♤》°•°•°]',
            '> [charging:■■■□□□□□□□□□□□□]',
            '> [•°•♤°•°♤•°•♤°•°♤•°•♤°•°]'
        ], {
        delay: 10000
    })
    .addAnswer(
        [
           '> •°•°•°《♤Roleplay♤》°•°•°]',
            '> [charging:■■■■■■□□□□□□□□]',
            '> [•°•♤°•°♤•°•♤°•°♤•°•♤°•°]' 
        ], {
        delay: 9000
    })
    .addAnswer(
        [
            '> •°•°•°《♤Roleplay♤》°•°•°]',
            '> [charging:■■■■■■■■■■■□□□□]',
            '> [•°•♤°•°♤•°•♤°•°♤•°•♤°•°]'
        ], {
        delay: 8000
    })
    .addAnswer(
        [
            '> •°•°•°《♤Roleplay♤》°•°•°]',
            '> [charging:■■■■■■■■■■■■■■■]',
            '> [•°•♤°•°♤•°•♤°•°♤•°•♤°•°]'
        ], {
        delay: 7000
    })

    /*
        const path = require("path")
const fs = require("fs")

const menuPath = path.join(__dirname, "mensajes", "menu.txt")
const menuAPI = fs.readFileSync(menuPath, "utf8")

const flujoEfecivo = addKeyword('Efectivo')
.addAnswer('Te espero con los billetes!')

const flujoOnline = addKeyword('Online')
.addAnswer('Perfecto te envio un link de pago por email')
.addAnswer('Cual es tu email?', {capture: true}, (ctx, {fallBack}) => {

    if(!ctx.body.includes('@')) {
        return fallBack()
    }
    console.log('Mensaje entrante: ', ctx.body)
})

.addAnswer('en los siguientes minutos te envio un email')

const flujoPedido = addKeyword('pedir')
.addAnswer('Como quieres pagar *Efectivo* o *Online*?', null, null,
    [
        flujoOnline,
        flujoEfecivo
    ]
)

const flujoPrincipal = addKeyword(['hola', 'ole', 'buenas'])
.addAnswer(
    [
    'Bienvenido a mi tienda',
    'Hoy tenemos ofertas'
    ]
)

.addAnswer('El menu del dia es el siguiente: \n' + menuAPI, 
    {
        media: 'https://p16-flow-sign-va.ciciai.com/ocean-cloud-tos-us/text2img/6c6bfd56445a7a0e4abb276ee4b034b6_1721339613389653015.png~tplv-6bxrjdptv7-image-qvalue.png?rk3s=6823e3d0&x-expires=1752875614&x-signature=I1eHhdXGvxkjf9HBfxWEt42Do7k%3D'
    }
)

.addAnswer('Escribe *Pedir* si te interesa algo', null, null,
    [
        flujoPedido
    ]
)

const flujoSecundario = addKeyword('gracias')
.addAnswer('De nada!')
    */

// Main function
const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowWelcome])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
