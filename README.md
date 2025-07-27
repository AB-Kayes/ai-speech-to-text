# AI Speech Studio - Next.js

A modern speech-to-text application built with Next.js 14, featuring real-time transcription, file processing, and multi-language support.

## Features

- **Real-time Speech Recognition** - Live audio transcription using Deepgram API
- **File Processing** - Upload and transcribe audio files
- **Multi-language Support** - English and Bengali language support
- **User Authentication** - Sign up/sign in functionality
- **Credit System** - Pay-per-use credit system for transcriptions
- **History Management** - View, search, and manage transcription history
- **Admin Panel** - Administrative interface for user and payment management
- **Responsive Design** - Mobile-first responsive design

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Speech Recognition**: Deepgram API
- **Icons**: Lucide React
- **State Management**: React Context API

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Deepgram API key

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd ai-speech-studio
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Edit `.env.local` and add your Deepgram API key:
\`\`\`
NEXT_PUBLIC_DEEPGRAM_API_KEY=your_deepgram_api_key_here
\`\`\`

4. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Admin Access

Access the admin panel at `/admin` with these credentials:
- Email: `admin@aaladin.com`
- Password: `admin123`

## Project Structure

\`\`\`
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin panel pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   └── ...               # Other UI components
├── contexts/             # React Context providers
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
└── public/               # Static assets
\`\`\`

## Key Features

### Speech Recognition
- Real-time transcription using Deepgram WebSocket API
- Support for English and Bengali languages
- Automatic punctuation processing
- Audio level visualization

### File Processing
- Upload audio files for transcription
- Support for multiple audio formats (MP3, WAV, M4A, etc.)
- Batch processing capabilities

### User Management
- Authentication system with local storage
- Credit-based usage tracking
- User history and preferences

### Admin Panel
- User management interface
- Payment approval system
- Usage analytics and monitoring

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_DEEPGRAM_API_KEY` | Deepgram API key for speech recognition | Yes |
| `NEXT_PUBLIC_SHOW_DEBUG` | Show debug information in development | No |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@aaladin.com or create an issue in the repository.
