# Iymra Accounts

A full-stack centralized user identity system that powers authentication and user management for the Iymra ecosystem.

## Features

- Secure user registration and login via email/password
- Email verification with Nodemailer using cPanel SMTP
- JWT authentication (access & refresh tokens) for sessions
- Extended user profiles with flexible schema
- Modern, responsive, branded React frontend UI
- Scalable backend architecture with Node.js + Express
- Appwrite as the backend database for all user data
- Future-ready for OAuth 2.0 + OIDC implementation, MFA, and client app management

## Technology Stack

### Frontend
- React 18 with TypeScript
- React Router for navigation
- React Hook Form for form handling
- Tailwind CSS for styling
- Lucide React for icons

### Backend
- Node.js with Express
- JWT for authentication
- Bcrypt for password hashing
- Nodemailer for email sending
- Appwrite SDK for database operations

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Appwrite account and project
- cPanel hosting with email (for SMTP)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/iymra-accounts.git
cd iymra-accounts
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory by copying `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your Appwrite and SMTP credentials.

5. Start the development server:
```bash
# Start frontend
npm run dev

# Start backend in a separate terminal
npm run dev:server
```

## Project Structure

```
├── public/                  # Static files
├── server/                  # Backend server code
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Express middleware
│   ├── routes/              # API routes
│   ├── services/            # Business logic services
│   └── index.js             # Server entry point
├── src/                     # Frontend source code
│   ├── components/          # React components
│   ├── contexts/            # React context providers
│   ├── pages/               # Page components
│   ├── types/               # TypeScript type definitions
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── .env                     # Environment variables
└── package.json             # Project configuration
```

## Appwrite Database Setup

This project requires the following collections in Appwrite:

1. **Users Collection**: Stores user accounts and profile data
2. **Verification Tokens Collection**: Stores email verification tokens
3. **Refresh Tokens Collection**: Stores JWT refresh tokens

Refer to the schema in the codebase for the required fields in each collection.

## License

This project is licensed under the MIT License - see the LICENSE file for details.