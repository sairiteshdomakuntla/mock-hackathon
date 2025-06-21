const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getSuggestion = async (req, res) => {
  const { literacyScores, selScores, name } = req.body;

  try {
    const prompt = `Suggest teaching strategies for ${name}, a student with the following data:
Literacy Score: ${JSON.stringify(literacyScores)}
SEL Score: Empathy - ${selScores.empathy}, Regulation - ${selScores.regulation}, Cooperation - ${selScores.cooperation}.
Give actionable, simple advice for a teacher.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ suggestion: text });
  } catch (err) {
    res.status(500).json({ message: 'Gemini API error', error: err.message });
  }
};

module.exports = { getSuggestion };
