# Course Flow - Learning Management System (LMS) Backend Repo

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Payments**: Razorpay & Stripe
- **Email**: Resend
- **Logging**: Winston
- **Validation**: Zod
- **Security**: Helmet, express-rate-limit, hpp, xss-clean

## 📁 Project Structure

```
├── configs/           # Configuration files
├── controllers/       # Request handlers
├── email-templates/   # Email templates
├── middlewares/       # Custom middleware
├── models/            # Database models
├── routes/            # Route definitions
├── types/             # TypeScript type definitions
├── uploads/           # Temporary file uploads
├── utils/             # Utility functions
├── validations/       # Request validation schemas
└── index.ts           # Application entry point
```

## 🔄 API Flow

1. **Request Entry** → `index.ts` (app setup & middleware)
2. **Routing** → `routes/*.route.ts` (route definitions)
3. **Validation** → `validations/*.validation.ts` (request validation)
4. **Controller** → `controllers/*.controller.ts` (business logic)
5. **Service** → `services/*.service.ts` (business logic)
6. **Model** → `models/*.model.ts` (database operations)
7. **Response** → Client

## 🛡️ Security Best Practices

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Helmet**: Sets secure HTTP headers
- **HPP**: Protects against HTTP Parameter Pollution
- **CORS**: Enabled with secure defaults
- **Input Sanitization**: Using express-mongo-sanitize and xss-clean
- **Secure Cookies**: HTTP-only cookies for authentication
- **Environment Variables**: Using dotenv for configuration
- **Request Validation**: Zod for request validation

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- Cloudinary account (for file storage)
- Razorpay/Stripe account (for payments)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`
4. Start the development server:
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm run dev`: Start development server with hot-reload
- `npm run build`: Compile TypeScript to JavaScript
- `npm start`: Start production server
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier
- `npm test`: Run tests

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.
