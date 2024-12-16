const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const { Configuration, OpenAIApi } = require("openai");

// Replace with your OpenAI API key
const configuration = new Configuration({
  apiKey: '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',
});
const openai = new OpenAIApi(configuration);

app.use(express.static('public')); // Serve static files from 'public' directory

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('user-message', async (msg) => {
        try {
            const completion = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: [
                    {role: "system", content: "You are a pickup line generator. Respond with creative and nice pickup lines."},
                    {role: "user", content: msg}
                ]
            });
            io.to(socket.id).emit('bot-message', completion.data.choices[0].message.content);
        } catch (error) {
            console.error('Error with OpenAI:', error);
            io.to(socket.id).emit('bot-message', 'Oops! I couldn\'t generate a pickup line right now.');
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});