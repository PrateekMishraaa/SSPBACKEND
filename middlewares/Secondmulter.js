const fs = require("fs");
const multer = require("multer");

const secondstorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "";

    if (file.mimetype.startsWith("image/")) {
      uploadPath = "uploads/pledgeimages";
    } else if (file.mimetype.startsWith("video/")) {
      uploadPath = "uploads/pledgevideos";
    } else if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/msword" ||
      file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      uploadPath = "uploads/letters";
    } else {
      return cb(new Error("Invalid file type"), null);
    }

    // Ensure directory exists
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "-");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

// ✅ Fix applied here
const secondupload = multer({ storage: secondstorage });

module.exports = secondupload;
