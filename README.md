# 🌍 Personalized Travel Destination Recommender

An AI-powered web application that provides personalized travel destination recommendations based on user preferences, travel history, and machine learning algorithms.

## ✨ Features

- 🔐 **User Authentication** - Secure registration and login system
- 🎯 **Personalized Preferences** - Comprehensive travel preference collection
- 🤖 **AI Recommendations** - Machine learning-powered destination suggestions
- 🗺️ **Destination Browsing** - Explore destinations with detailed information
- 📊 **Travel History** - Track and analyze your travel patterns
- 📱 **Responsive Design** - Beautiful UI that works on all devices

## 🚀 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication

### Machine Learning
- **Cosine Similarity** - Preference matching algorithm
- **Hybrid Recommender** - Content-based + collaborative filtering

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- MongoDB 6+
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Personalized-Travel-Destination-Recommender
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd server
   npm install
   
   # Frontend
   cd ../client
   npm install
   ```

3. **Environment setup**
   ```bash
   # Copy environment template
   cp server/.env.example server/.env
   
   # Edit server/.env with your configuration
   ```

4. **Start the application**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev
   
   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
Personalized-Travel-Destination-Recommender/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   └── lib/          # Utility functions
│   └── public/           # Static assets
├── server/               # Express.js backend
│   ├── controllers/      # Route handlers
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   └── ml/             # Machine learning algorithms
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile

### Preferences
- `POST /api/preferences` - Save travel preferences
- `GET /api/preferences` - Get user preferences

### Recommendations
- `POST /api/recommendations` - Get AI recommendations
- `GET /api/destinations` - Browse destinations

## 🤖 Machine Learning

The recommendation system uses a hybrid approach:

1. **Content-Based Filtering** - Matches destinations to user preferences
2. **Collaborative Filtering** - Learns from similar users
3. **Cosine Similarity** - Calculates preference similarity
4. **Weighted Scoring** - Combines multiple factors

## 🎨 UI/UX Features

- Modern, responsive design
- Smooth animations and transitions
- Intuitive user interface
- Mobile-first approach
- Accessibility considerations

## 🚀 Deployment

### Production Build
```bash
# Frontend
cd client
npm run build
npm start

# Backend
cd server
npm start
```

### Environment Variables
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `NODE_ENV` - Environment (development/production)

## 📊 Performance

- Optimized bundle sizes
- Efficient database queries
- Caching strategies
- Lazy loading components

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation
- Secure environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- MongoDB for the database solution
- Tailwind CSS for the styling system
- All open-source contributors

---

**Built with ❤️ for travelers who want personalized recommendations**
