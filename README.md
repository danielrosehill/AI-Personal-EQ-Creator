# AI Personal EQ Creator

![Google AI Studio](https://img.shields.io/badge/Google%20AI%20Studio-4285F4?style=for-the-badge&logo=google&logoColor=white)
![POC](https://img.shields.io/badge/POC-Proof%20of%20Concept-orange?style=for-the-badge)
![Starter](https://img.shields.io/badge/Starter-Project-green?style=for-the-badge)

[![Index: AI Studio POCs](https://img.shields.io/badge/Index-AI%20Studio%20POCs-blue?style=flat-square)](https://github.com/danielrosehill/Gemini-Vibe-Coding-Projects)
[![Master Index](https://img.shields.io/badge/Master-Index-purple?style=flat-square)](https://github.com/danielrosehill/Github-Master-Index)

An AI-powered audio analysis tool that acts as your personal audio engineer. Upload a voice recording and receive customized EQ recommendations tailored to your unique vocal characteristics.

## Overview

This React application leverages Google's Gemini AI to analyze voice recordings and generate personalized audio equalization settings. It provides a comprehensive vocal profile analysis and exports ready-to-use EQ presets for Audacity.

## Features

- **Audio Recording/Upload**: Record directly in-browser or upload existing audio files
- **AI-Powered Vocal Analysis**: Uses Google Gemini to analyze vocal characteristics including:
  - Fundamental frequency range
  - Vocal timbre and tone
  - Key vocal characteristics
- **Personalized EQ Recommendations**: Generates custom EQ settings optimized for your voice
- **Audacity Export**: Automatically creates Audacity-compatible EQ curve XML files
- **Modern UI**: Clean, responsive interface with real-time processing feedback

## Screenshots

### Main Interface
![Main interface showing audio input options](screenshots/1)

### Analysis Results
![Vocal profile analysis results](screenshots/2)

### EQ Settings Display
![Detailed EQ settings and recommendations](screenshots/4)

### Export Options
![Export interface for Audacity XML](screenshots/3)

## Technology Stack

- **Frontend**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 6.2.0
- **AI Model**: Google Gemini API (@google/genai)
- **Styling**: Tailwind CSS (custom gradient themes)

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- A Gemini API key from [Google AI Studio](https://ai.google.dev/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/danielrosehill/AI-Personal-EQ-Creator.git
   cd AI-Personal-EQ-Creator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your API key:
   - Create a `.env.local` file in the root directory
   - Add your Gemini API key:
     ```
     GEMINI_API_KEY=your_api_key_here
     ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:5173`

## How It Works

1. **Record or Upload**: Use the built-in recorder or upload an audio file (WAV, MP3, etc.)
2. **AI Analysis**: Gemini analyzes the audio to identify vocal characteristics
3. **Get Results**: Receive a detailed vocal profile and custom EQ settings
4. **Export**: Download the Audacity XML file to apply the EQ curve in your DAW

## Project Structure

```
AI-Personal-EQ-Creator/
├── App.tsx                      # Main application component
├── components/
│   ├── AudioInput.tsx          # Audio recording/upload interface
│   └── ResultsView.tsx         # Analysis results display
├── services/
│   └── geminiService.ts        # Gemini API integration
├── types.ts                     # TypeScript interfaces
└── screenshots/                 # Application screenshots
```

## Use Cases

- **Content Creators**: Optimize your voice for podcasts, YouTube videos, or streaming
- **Musicians**: Get professional EQ recommendations for vocal recordings
- **Audio Engineers**: Quick starting point for vocal EQ before fine-tuning
- **Learning Tool**: Understand how different vocal characteristics map to EQ settings

## Limitations

- This is a proof of concept for demonstration purposes
- EQ recommendations are AI-generated and may require manual adjustment
- Best results with clear, isolated vocal recordings
- Requires active internet connection for Gemini API calls

## AI Studio POC

This project contains a proof of concept (POC) that was autopopulated by Google AI Studio. It is intended as a code starter and may not yet have been manually reviewed and/or taken further. I create some Gemini POCs, in particular, to experiment with/test the capabilities of multimodal AI.

## Related Projects

- [Index of AI Studio POCs](https://github.com/danielrosehill/Gemini-Vibe-Coding-Projects) - Collection of Google AI Studio experiments
- [GitHub Master Index](https://github.com/danielrosehill/Github-Master-Index) - Complete index of all my projects

## License

This project is provided as-is for educational and experimental purposes.

## Author

**Daniel Rosehill**
- Website: [danielrosehill.com](https://danielrosehill.com)
- Email: public@danielrosehill.com
- Business: [DSR Holdings](https://dsrholdings.cloud)

---

View the original AI Studio project: https://ai.studio/apps/drive/1jTDF2pV4CJjz__M0JNLOsCOuuU5Wg3-b
