const TelegramApi = require('node-telegram-bot-api')
const axios = require('axios');

const bot = new TelegramApi(process.env.TELEGRAM_BOT_TOKEN, { polling: true })

const chats = {};

// Функція для логування у Fluentd
async function sendLog(level, message, data = {}) {
    try {
        const logData = {
            level: level,
            message: message,
            timestamp: new Date().toISOString(),
            bot_name: "telegram_bot",
            ...data
        };

        await axios.post('http://localhost:8080/bot', logData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error sending log:', error.message);
    }
}

const gameOptions = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{ text: "1", callback_data: "1" }, { text: "2", callback_data: "2" }, { text: "3", callback_data: "3" }],
            [{ text: "4", callback_data: "4" }, { text: "5", callback_data: "5" }, { text: "6", callback_data: "6" }],
            [{ text: "7", callback_data: "7" }, { text: "8", callback_data: "8" }, { text: "9", callback_data: "9" }],
            [{ text: "0", callback_data: "0" }]
        ]
    })
}

const start = () => {
    bot.setMyCommands([
        { command: '/start', description: "Start command" },
        { command: '/game', description: "Guess the number" }
    ])

    sendLog('info', 'Bot started');

    bot.on('message', async message => {
        const text = message.text;
        const chatId = message.chat.id;

        sendLog('info', 'Received message', {
            chatId: chatId,
            text: text,
            username: message.from.username || 'Unknown'
        });

        try {
            if (text === '/start') {
                sendLog('info', 'Start command received', { chatId: chatId });
                return bot.sendSticker(chatId, 'https://cdn2.combot.org/pepe_mypl4ylist/webp/0xe29898.webp')
            }

            if (text === '/info') {
                sendLog('info', 'Info command received', { chatId: chatId });
                return bot.sendMessage(chatId, `Your name is ${message.from.first_name} ${message.from.last_name}`)
            }

            if (text === '/game') {
                await bot.sendMessage(chatId, "Now I will think of a number from 0 to 9, and you have to guess it.")
                const randomNumber = Math.floor(Math.random() * 10)
                chats[chatId] = randomNumber;
                sendLog('info', 'Game started', {
                    chatId: chatId,
                    randomNumber: randomNumber
                });
                return bot.sendMessage(chatId, 'Guess', gameOptions)
            }

            sendLog('info', 'Unknown command', { chatId: chatId, text: text });
            return bot.sendMessage(chatId, "I don't understand you")

        } catch (error) {
            sendLog('error', 'Error processing message', { chatId: chatId, error: error.message });
        }
    });

    bot.on('callback_query', async message => {
        const data = message.data
        const chatId = message.message.chat.id;

        sendLog('info', 'Guess attempt', {
            chatId: chatId,
            guess: data,
            correctNumber: chats[chatId],
            result: data == chats[chatId] ? 'won' : 'lost'
        });

        try {
            if (data == chats[chatId]) {
                return bot.sendMessage(chatId, `Congrats, you won!  ${chats[chatId]}`)
            } else {
                return bot.sendMessage(chatId, `Sorry, you lost ${chats[chatId]}`)
            }
        } catch (error) {
            sendLog('error', 'Error processing callback query', { chatId: chatId, error: error.message });
        }
    });
}

start();
