const TelegramApi = require('node-telegram-bot-api')

const bot = new TelegramApi(process.env.TELEGRAM_BOT_TOKEN, {polling: true})

const chats = {};

const gameOptions = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{ text: "1", callback_data: "1" }, { text: "2", callback_data: "2" }, { text: "3", callback_data: "3" }],
            [{ text: "4", callback_data: "4" }, { text: "5", callback_data: "5" }, { text: "6", callback_data: "6" }],
            [{ text: "7", callback_data: "7" }, { text: "8", callback_data: "8" }, { text: "9", callback_data: "9" }],
            [{text: "0", callback_data: "0"}]
    ]
    })
}

const start = () => {

    bot.setMyCommands([
        { command: '/start', description: "Start command" },
        {command: '/game', description: "Guess the number"}
    ])



    bot.on('message', async message => {
        const text = message.text;
        const chatId = message.chat.id;

        if (text === '/start') {
            return bot.sendSticker(chatId, 'https://cdn2.combot.org/pepe_mypl4ylist/webp/0xe29898.webp')
        }

        if (text === '/info') {
            return bot.sendMessage(chatId, `Your name is ${message.from.first_name} ${message.from.last_name}`)
        }

        if (text === '/game') {
            await bot.sendMessage(chatId, "Сейчас я загадаю число от 0 до 9 и ты должен его одгадать")
            const randomNumber = Math.floor(Math.random() * 10)
            chats[chatId] = randomNumber;
            return bot.sendMessage(chatId, 'Guess', gameOptions)
        }
        return bot.sendMessage(chatId, "Не розумію")
    }) 

    bot.on('callback_query', async message => {
        const data = message.data
        const chatId = message.message.chat.id;
        if (data == chats[chatId]){
            return bot.sendMessage(chatId, `Congrats, you won!  ${chats[chatId]}`)
        }else{
            return bot.sendMessage(chatId, `Sorry, you lost ${chats[chatId]}`)
        }
        
    })
}

start()