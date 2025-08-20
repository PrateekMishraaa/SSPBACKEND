const express = require("express");
const multer = require("multer");
const path = require("path");
const Media = require("../models/Media");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const sharp = require("sharp");
const fs = require("fs");

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
const router = express.Router();

// 📦 Multer Storage Configuration
const secondstorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, "uploads/pledgeimages/");
    } else if (file.mimetype.startsWith("video/")) {
      cb(null, "uploads/pledgevideos/");
    } else {
      cb(new Error("Unsupported file type"), false);
    }
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueName + ext);
  }
});

// 🛡️ File Type Filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "video/mp4", "video/webm"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images and videos are allowed"));
  }
};

// 🛠️ Multer Middleware
const secondupload = multer({ storage: secondstorage, fileFilter });

// 📥 Accept multiple fields
const multiUpload = secondupload.fields([
  { name: "uploadImage", maxCount: 10 },
  { name: "uploadVideo", maxCount: 10 }
]);

// 🚀 Upload Route with Compression
router.post("/", multiUpload, async (req, res) => {
  try {
    const files = req.files;
    const allSaved = [];

    for (const field in files) {
      for (const file of files[field]) {
        let finalPath = file.path;
        let finalFilename = file.filename;
        let finalSize = file.size;

           console.log(`📥 Original ${file.mimetype.startsWith("image/") ? "image" : "video"} size: ${file.size} bytes`);


        // 📷 Compress Image using Sharp
        if (file.mimetype.startsWith("image/")) {
          const compressedPath = file.path.replace(/(\.\w+)$/, "-compressed.jpg");
          await sharp(file.path)
            .resize({ width: 1024 }) // optional
            .jpeg({ quality: 70 }) // compression level
            .toFile(compressedPath);

          fs.unlinkSync(file.path); // delete original
          finalPath = compressedPath;
          finalFilename = path.basename(compressedPath);
          finalSize = fs.statSync(compressedPath).size;

              console.log(`🗜️ Compressed image size: ${finalSize} bytes`);
        }

        // 🎥 Compress Video using ffmpeg
        if (file.mimetype.startsWith("video/")) {
          const compressedPath = file.path.replace(/(\.\w+)$/, "-compressed.mp4");

          await new Promise((resolve, reject) => {
            ffmpeg(file.path)
              .outputOptions([
                "-vcodec libx264",
                "-crf 28", // lower = better quality, higher = more compression
                "-preset veryfast"
              ])
              .on("end", () => {
                fs.unlinkSync(file.path); // delete original
                finalPath = compressedPath;
                finalFilename = path.basename(compressedPath);
                finalSize = fs.statSync(compressedPath).size;

                  console.log(`🗜️ Compressed video size: ${finalSize} bytes`);
                resolve();
              })
              .on("error", reject)
              .save(compressedPath);
          });
        }

        // 🗃️ Save to MongoDB
        const media = new Media({
          filename: finalFilename,
          path: finalPath,
          mimetype: file.mimetype,
          size: finalSize
        });

        await media.save();
        allSaved.push(media);
      }
    }

    res.status(201).json({ message: "✅ Files uploaded and compressed successfully", files: allSaved });
  } catch (err) {
    console.error("❌ Compression error:", err);
    res.status(500).json({ message: "❌ Upload failed", error: err.message });
  }
});

module.exports = router;
