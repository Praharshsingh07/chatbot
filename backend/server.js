const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['POST', 'GET'],
    credentials: true
}));
app.use(express.json());
app.use(express.static('public'));
const HF_API_TOKEN = process.env.HF_API_TOKEN;
const HF_API_URL = 'https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-1B'; // Replace <model-name> with the LLaMA 3 model name

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log('Sending request to Hugging Face API...');

        const response = await fetch(HF_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: message,
                parameters: {
                    max_length: 150,
                    temperature: 0.7
                }
            })
        });

        console.log('Response status:', response.status);

        const data = await response.json();

        if (!response.ok) {
            console.error('Hugging Face API error:', data);
            throw new Error(data.error || `Error: ${response.status}`);
        }

        console.log('Successfully got response from Hugging Face');
        console.log('API Response:', data);

        if (Array.isArray(data) && data[0] && data[0].generated_text) {
            const generatedText = data[0].generated_text;
            res.json([{ generated_text: generatedText }]);
        } else {
            throw new Error('Invalid response format from Hugging Face API');
        }

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access the chatbot at http://localhost:${PORT}`);
});
