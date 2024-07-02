import express from "express"
import postRoutes from "./routes/posts.js"
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js"
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import fs from "fs"
import path from "path"
import { fileURLToPath } from 'url';


const app = express();

const corsOptions = {
    origin: "http://localhost:3001",
    credentials: true, 
    optionSuccessStatus: 200,
  };
  
app.use(cors(corsOptions)); 
app.use(cookieParser())

app.use(express.json())

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../client/blog/public/upload");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination:function(req,file,cb){
    cb(null,uploadDir)
  },
  filename:function(req,file,cb){
    cb(null, Date.now() + path.extname(file.originalname));
  }
})


const upload = multer({storage})

app.post('/api/upload',upload.single('file'),function(req,res){
  try {
    const file = req.file
    if (!file) {
      console.error("No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }
    console.log("File uploaded successfully:", file);
    res.status(200).json(file.filename);
  } catch (err) {
    console.error("Error handling file upload:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
})

app.use("/api/posts",postRoutes)
app.use("/api/auth",authRoutes)
app.use("/api/users",userRoutes)

app.listen(8800,()=>{
    console.log("Connected")
})