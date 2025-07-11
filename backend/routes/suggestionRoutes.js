const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

router.post('/suggest', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt || prompt.trim() === '') {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 150,
        });

        const suggestion = response.data.choices[0].text.trim();
        res.status(200).json({ suggestion });
    } catch (error) {
        console.error('Error generating suggestion:', error);
        res.status(500).json({ error: 'Failed to generate suggestion' });
    }
});

module.exports = router;
