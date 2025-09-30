# Resume Generator

An AI-powered resume generator built with Next.js, TypeScript, Tailwind CSS, and MongoDB. Generate tailored, professional resumes for specific job applications using OpenAI's GPT models.

## Features

- 🤖 **AI-Powered Generation**: Uses OpenAI GPT to create personalized resumes
- 📄 **Multiple Formats**: Download resumes in PDF and DOCX formats
- 🎯 **Job-Specific**: Tailor resumes for specific job applications
- 👤 **User Management**: Manage multiple user profiles
- 🌙 **Dark/Light Theme**: Toggle between light and dark themes
- 🔐 **JWT Authentication**: Secure user authentication
- 📱 **Responsive Design**: Works on all devices
- ⚡ **Real-time Status**: Track resume generation progress

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens
- **AI**: OpenAI GPT-3.5-turbo
- **File Generation**: Puppeteer (PDF), docx (DOCX)
- **UI Components**: Custom components with Lucide React icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd resume-generator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Update `.env.local` with your configuration:
```env
MONGODB_URI=mongodb://localhost:27017/resume-generator
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=your-openai-api-key
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### 1. Create Account
- Register with your personal information
- Add work experience and education details
- Complete your profile

### 2. Generate Resume
- Navigate to "Generate Resume" page
- Enter job details (company, title, description)
- Select users to generate resumes for
- Click "Generate Resumes" button

### 3. Download Resumes
- Go to "My Resumes" page
- Select a job group
- Download resumes in PDF or DOCX format

## Project Structure

```
resume-generator/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   ├── resume-generator/  # Resume generation page
│   ├── resumes/           # Resumes management page
│   └── account/           # Account settings page
├── components/            # Reusable components
│   ├── ui/               # UI components
│   └── layout/           # Layout components
├── contexts/             # React contexts
├── lib/                  # Utility functions
├── models/               # MongoDB models
└── public/               # Static assets
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify` - Verify JWT token

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/update` - Update user profile

### Resumes
- `POST /api/resumes/generate` - Generate resumes
- `GET /api/resumes/list` - List all resumes
- `GET /api/resumes/download` - Download resume
- `DELETE /api/resumes/delete` - Delete resume

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/resume-generator` |
| `JWT_SECRET` | JWT signing secret | `your-super-secret-jwt-key` |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `NEXTAUTH_URL` | NextAuth URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | NextAuth secret | `your-nextauth-secret-key` |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@resumegenerator.com or create an issue in the repository.
