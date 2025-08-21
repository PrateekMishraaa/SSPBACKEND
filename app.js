const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const registerRoute = require('./routes/registerRoute.js');
const authRoutes = require('./routes/authRoutes.js');
const uploadRoutes = require("./routes/uploads.js");
const registration  = require("./routes/registratration.js")

dotenv.config();

const app = express();
app.use(cors({
 origin: ["https://sspbackend-fcnj.onrender.com/", "https://sspform.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads')); 

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("Mongo error:", err));

app.use('/api/register', registerRoute);
app.use('/api/auth', authRoutes);
app.use("/",registration);
app.use("/api/upload", uploadRoutes);

app.get("/",(req,res)=>{
  console.log("hello world")
  res.send("Hello world")
})

// ✅ Add this for Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
