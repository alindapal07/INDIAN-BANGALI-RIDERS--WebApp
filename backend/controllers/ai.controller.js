const { GoogleGenAI, Modality } = require('@google/genai');

exports.askRIA = async (req, res) => {
  try {
    const { prompt, context, language } = req.body;
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `Context: ${JSON.stringify(context)}. User: ${prompt}. Answer in ${language === 'bn' ? 'Bengali' : 'English'}.`,
    });
    const text = response.text || "Communication relay failure.";
    
    let audio;
    try {
      const audioResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: language === 'bn' ? 'Kore' : 'Zephyr' },
            },
          },
        },
      });
      audio = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (e) { /* audio optional */ }
    
    res.json({ text, audio });
  } catch (err) {
    res.json({ text: "Neural link disrupted. Please try again.", audio: null });
  }
};

exports.getMissionVisuals = async (req, res) => {
  try {
    const { placeName } = req.body;
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const searchPrompt = `As a tactical recon scout for a motorcycle pack, identify exactly 3 visually stunning landmarks or specific scenic spots in "${placeName}" that are essential for riders to visit. For each spot, provide a clear name and a 1-sentence description.`;
    
    const searchResponse = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: searchPrompt,
    });
    
    const intelText = searchResponse.text || "";
    const landmarks = intelText.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 3 && (l.includes('**') || /^[*\d\-]/.test(l)))
      .map(l => l.replace(/[*#\d\-\.]/g, '').split(':')[0].trim())
      .filter(l => l.length > 3)
      .slice(0, 3);
    
    if (landmarks.length === 0) landmarks.push(placeName);
    
    const images = landmarks.map(l =>
      `https://loremflickr.com/1280/720/${encodeURIComponent(l + ' ' + placeName)},scenic/all`
    );
    
    res.json({ intel: intelText, images, landmarks, sources: [] });
  } catch (err) {
    const { placeName } = req.body;
    res.json({
      intel: "Tactical data link disrupted. Proceeding with fallback mission intel.",
      images: [`https://loremflickr.com/1280/720/${encodeURIComponent(placeName)},scenic/all`],
      landmarks: [],
      sources: []
    });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const Rider = require('../models/Rider');
    const Journey = require('../models/Journey');
    const RidePost = require('../models/RidePost');
    const Booking = require('../models/Booking');
    const Story = require('../models/Story');
    
    const [riders, journeys, posts, bookings, stories] = await Promise.all([
      Rider.countDocuments(),
      Journey.countDocuments(),
      RidePost.countDocuments(),
      Booking.countDocuments(),
      Story.countDocuments()
    ]);
    
    res.json({ riders, journeys, posts, bookings, stories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
