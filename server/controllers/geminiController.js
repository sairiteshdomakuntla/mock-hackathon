const dotenv = require('dotenv');
dotenv.config();

const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log("key",process.env.GEMINI_API_KEY)
// Add debugging to check if API key is being loaded properly
console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('GEMINI_API_KEY first 5 chars:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 5) + '...' : 'not available');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getSuggestion = async (req, res) => {
  const { literacyScores, selScores, name, reflections } = req.body;

  try {
    // Build a detailed context about the student based on available data
    let promptParts = [`I need personalized teaching strategies for a student named ${name}.`];
    
    // Log the request data
    console.log('Gemini request received for student:', name);
    console.log('Has literacy scores:', !!literacyScores && literacyScores.length > 0);
    console.log('Has SEL scores:', !!selScores && Object.keys(selScores).length > 0);
    console.log('Has reflections:', !!reflections && reflections.length > 0);
    
    // Add literacy score information if available
    if (literacyScores && literacyScores.length > 0) {
      // Calculate average and trend
      const sortedScores = [...literacyScores].sort((a, b) => new Date(a.date) - new Date(b.date));
      const avgScore = sortedScores.reduce((sum, item) => sum + item.score, 0) / sortedScores.length;
      const latestScore = sortedScores[sortedScores.length - 1].score;
      const oldestScore = sortedScores[0].score;
      const trend = latestScore > oldestScore ? "improving" : latestScore < oldestScore ? "declining" : "stable";
      
      promptParts.push(`
Literacy Assessment:
- Average score: ${avgScore.toFixed(1)} out of 100
- Latest score: ${latestScore} (${new Date(sortedScores[sortedScores.length - 1].date).toLocaleDateString()})
- Trend: ${trend} (${oldestScore} → ${latestScore})
- Total assessments: ${literacyScores.length}`);
    } else {
      promptParts.push("No literacy assessment data is available for this student yet.");
    }
    
    // Add SEL score information if available
    if (selScores && (selScores.empathy || selScores.regulation || selScores.cooperation)) {
      promptParts.push(`
Social-Emotional Learning (SEL) Competencies (rated 1-5):
- Empathy: ${selScores.empathy || 'Not assessed'} 
- Self-Regulation: ${selScores.regulation || 'Not assessed'}
- Cooperation: ${selScores.cooperation || 'Not assessed'}`);
    } else {
      promptParts.push("No SEL assessment data is available for this student yet.");
    }
    
    // Add teacher reflections if available
    if (reflections && reflections.length > 0) {
      // Use only the 3 most recent reflections to keep context manageable
      const recentReflections = [...reflections]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);
      
      promptParts.push(`
Recent Teacher Observations:
${recentReflections.map(r => `- ${new Date(r.date).toLocaleDateString()}: "${r.note}"`).join('\n')}`);
    }
    
    // Add instructions for the AI
    promptParts.push(`
Based on this information, please provide:
1. 2-3 specific teaching strategies to support this student's literacy development (2-3 sentences each)
2. 1-2 approaches to strengthen their SEL skills, particularly focusing on any areas scoring below 3 (2-3 sentences each)
3. One focused learning activity that would engage this student based on their profile (3-4 sentences)
4. One brief suggestion for ongoing assessment to track their progress (2-3 sentences)

Keep your response concise and actionable. Use clear section headings and bullet points. Use simple formatting and avoid complex structures. Total response should be under 300 words.`);

    const prompt = promptParts.join('\n');
    
    // Call Gemini API
    try {
      console.log('Attempting to call Gemini API with model: gemini-2.0-flash');
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      res.json({ suggestion: text });
    } catch (err) {
      console.error('Gemini API call failed:', err);
      console.error('Error message:', err.message);
      console.error('Error status:', err.status);
      
      // Provide a more specific error message based on the error type
      if (err.message && err.message.includes('quota')) {
        return res.status(429).json({ message: 'API quota exceeded. Please try again later.' });
      } else if (err.message && err.message.includes('API key not valid')) {
        return res.status(401).json({ message: 'Invalid API key. Please check your configuration.' });
      } else {
        res.status(500).json({ 
          message: 'Failed to generate content with Gemini API', 
          error: err.message 
        });
      }
    }
  } catch (err) {
    console.error('Gemini controller error:', err);
    res.status(500).json({ message: 'Gemini API error', error: err.message });
  }
};

// Add this function to the controller
const getStatus = async (req, res) => {
  try {
    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ 
        available: false, 
        message: 'Gemini API key not configured' 
      });
    }
    
    // Attempt to validate the API key with a simple request
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent('Hello');
      
      // If we get here, the API key is valid
      return res.status(200).json({
        available: true,
        message: 'Gemini API is available and configured correctly'
      });
    } catch (err) {
      // API key exists but is invalid
      return res.status(503).json({
        available: false,
        message: 'Gemini API key is invalid or expired'
      });
    }
    
  } catch (err) {
    res.status(500).json({ message: 'Error checking API status', error: err.message });
  }
};

// Update the exports
module.exports = { getSuggestion, getStatus };
