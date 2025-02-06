// pages/api/generate-hamster-image.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { description } = req.body;

    if (!description) {
        return res.status(400).json({ message: 'Description is required' });
    }

    // **IMPORTANT: REPLACE THIS MOCK WITH YOUR ACTUAL AI IMAGE GENERATION API CALL**

    // Example of how you MIGHT call an AI API (this is just illustrative - API details vary greatly):
    // try {
    //     const response = await fetch('YOUR_AI_IMAGE_API_ENDPOINT', {
    //         method: 'POST',
    //         headers: {
    //             'Authorization': `Bearer YOUR_API_KEY`,
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({ prompt: `hamster ${description}, cartoon style` }), // Adjust prompt
    //     });
    //     const data = await response.json();
    //     const imageUrl = data.image_url; // Or however the API returns the image URL
    //     return res.status(200).json({ imageUrl });
    // } catch (error) {
    //     console.error("AI Image generation error:", error);
    //     return res.status(500).json({ message: 'Error generating image' });
    // }


    // **MOCK RESPONSE - FOR DEMO PURPOSES ONLY - REPLACE WITH REAL API CALL**
    const mockImage = `/images/hamster-${Math.ceil(Math.random() * 3)}.png`; // Serve a random mock image
    return res.status(200).json({ imageUrl: mockImage });
}