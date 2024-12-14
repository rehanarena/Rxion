"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongodb_1 = __importDefault(require("./config/mongodb"));
const cloudinary_1 = __importDefault(require("./config/cloudinary"));
const adminRoute_1 = __importDefault(require("./routes/adminRoute"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
// Load environment variables
dotenv_1.default.config();
// App configuration
const app = (0, express_1.default)();
const port = parseInt(process.env.PORT || '4000', 10);
// Configure session middleware
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'default-secret', // Use an environment variable for better security
    resave: false, // Prevent unnecessary session saves
    saveUninitialized: false, // Do not save empty sessions
    store: connect_mongo_1.default.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database',
        ttl: 24 * 60 * 60, // Time-to-live in seconds (1 day)
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // Cookie expiry: 1 day
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        httpOnly: true, // Prevent client-side JavaScript from accessing cookies
    },
}));
// Connect to the database
(0, mongodb_1.default)();
// Connect to Cloudinary
(0, cloudinary_1.default)();
// Middlewares
app.use(express_1.default.json()); // Parse JSON request bodies
app.use((0, cors_1.default)()); // Enable Cross-Origin Resource Sharing
// API endpoints
app.use('/api/admin', adminRoute_1.default);
app.use('/api/user', userRoute_1.default);
// Root endpoint
app.get("/", (req, res) => {
    res.send("API Working");
});
// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
