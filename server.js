require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { Client } = require('@line/bot-sdk');

const app = express();
const port = process.env.PORT || 3000;

const lineConfig = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

const azureConfig = {
  endpoint: process.env.AZURE_ENDPOINT,
  apiKey: process.env.AZURE_API_KEY
};

const lineClient = new Client(lineConfig);

app.post('/webhook', express.json(), (req, res) => {
  const events = req.body.events;

  events.forEach(event => {
    if (event.type === 'message' && event.message.type === 'text') {
      const userMessage = event.message.text;

      // 將消息發送到 Azure AI
      axios.post(azureConfig.endpoint, { message: userMessage }, {
        headers: { 'Ocp-Apim-Subscription-Key': azureConfig.apiKey }
      })
      .then(response => {
        const aiReply = response.data;

        // 將 AI 回覆發送回 Line
        lineClient.replyMessage(event.replyToken, {
          type: 'text',
          text: aiReply
        });
      })
      .catch(error => {
        console.error('Azure AI error:', error);
      });
    }
  });

  res.status(200).send('OK');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
