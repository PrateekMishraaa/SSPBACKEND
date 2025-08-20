const Registration = require("../models/Registration");
const sharp = require("sharp");
const { exec, execFile } = require("child_process");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const path = require("path");
const { PDFDocument } = require("pdf-lib");

ffmpeg.setFfmpegPath(ffmpegPath);

async function compressImage(inputPath, outputPath, maxSizeMB = 10) {
  // console.log(inputPath)
  try {
    const originalSize = fs.statSync(inputPath).size / (1024 * 1024);
    if (originalSize <= maxSizeMB) return;

    const tempOutput = path.join(
      path.dirname(outputPath),
      `temp_${Date.now()}.jpg`
    );

    await sharp(inputPath)
      .resize({ width: 1920 })
      .jpeg({ quality: 80 })
      .toFile(tempOutput);

    const compressedSize = fs.statSync(tempOutput).size / (1024 * 1024);
    if (compressedSize > maxSizeMB) {
      await sharp(tempOutput)
        .resize({ width: 1280 })
        .jpeg({ quality: 60 })
        .toFile(tempOutput);
    }

    fs.renameSync(tempOutput, outputPath);
  } catch (error) {
    console.error("Image compression failed:", error);
  }
}

function compressVideo(inputPath, outputPath, maxSizeMB = 50) {
  return new Promise((resolve, reject) => {
    const stats = fs.statSync(inputPath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    if (fileSizeInMB <= maxSizeMB) return resolve();

    const tempPath = path.join(
      path.dirname(outputPath),
      `temp_${Date.now()}.mp4`
    );

    ffmpeg(inputPath)
      .videoCodec("libx264")
      .outputOptions("-crf 28")
      .on("end", () => {
        fs.renameSync(tempPath, outputPath);
        resolve();
      })
      .on("error", (err) => {
        reject(`Video compression failed: ${err.message}`);
      })
      .save(tempPath);
  });
}

async function compressPDF(inputPath, outputPath) {
  let currentPath = inputPath;
  let tempPath = path.join(__dirname, "temp_compressed.pdf");
  let prevSize = fs.statSync(currentPath).size;
  let currentSize = prevSize;
  const maxSize = 10 * 1024 * 1024;

  while (currentSize > maxSize) {
    const inputBytes = fs.readFileSync(currentPath);
    const pdfDoc = await PDFDocument.load(inputBytes);
    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });

    fs.writeFileSync(tempPath, pdfBytes);
    currentSize = fs.statSync(tempPath).size;

    if (currentSize >= prevSize) {
      console.log("No further compression possible.");
      break;
    }

    console.log(
      `Compressed size: ${(currentSize / 1024 / 1024).toFixed(2)} MB`
    );
    prevSize = currentSize;
    currentPath = tempPath;
  }

  fs.copyFileSync(currentPath, outputPath);
  if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

  console.log(`Final file saved to: ${outputPath}`);
}

const uploadFiles = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email)
      return res.status(400).json({ message: "Email is required in params" });

    const uploadImages = req.files?.uploadImage || [];
    const uploadVideos = req.files?.uploadVideo || [];
    const uploadLetterFile = req.files?.uploadLetter?.[0];

    console.log("letter", uploadLetterFile);

    const compressedImages = [];
    for (const file of uploadImages) {
      await compressImage(file.path, file.path);
      compressedImages.push(file.path);
    }

    const compressedVideos = [];
    for (const file of uploadVideos) {
      await compressVideo(file.path, file.path);
      compressedVideos.push(file.path);
    }

    let finalLetterPath = "";
    if (uploadLetterFile) {
      const originalPath = uploadLetterFile.path;
      const tempPath = originalPath + "_temp.pdf";

      await compressPDF(originalPath, tempPath);

      // If the temp file exists and is not empty, replace original
      if (fs.existsSync(tempPath) && fs.statSync(tempPath).size > 0) {
        fs.renameSync(tempPath, originalPath); // overwrite safely
        finalLetterPath = originalPath;
      } else {
        console.warn(
          "Compression failed or resulted in invalid PDF, keeping original."
        );
        finalLetterPath = originalPath;
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath); // cleanup
      }
    }
    console.log("final", finalLetterPath);

    const userRegistration = await Registration.findOne({ email });

    if (!userRegistration) {
      return res
        .status(404)
        .json({ message: "User registration not found for this email" });
    }

    // Append files to existing arrays
    if (compressedImages.length) {
      userRegistration.uploadImage.push(...compressedImages);
    }
    if (compressedVideos.length) {
      userRegistration.uploadVideo.push(...compressedVideos);
    }
    if (finalLetterPath) {
      // Replace letter only if new one uploaded
      userRegistration.uploadLetter = finalLetterPath;
    }

    await userRegistration.save();

    res
      .status(200)
      .json({
        message: "Files uploaded and saved successfully",
        uploadImage: userRegistration.uploadImage,
        uploadVideo: userRegistration.uploadVideo,
        uploadLetter: userRegistration.uploadLetter,
      });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ message: "Server error while uploading files" });
  }
};

const updateFormData = async (req, res) => {
  try {
    const { email } = req.params;
    const {
      schoolName,
      teacherName,
      teacherContact,
      emailId,
      schoolType,
      malestudentCount,
      femalestudentCount,
      malestaffCount,
      femalestaffCount,
      state,
      district,
      address,
      pincode,
    } = req.body;

    if (!email)
      return res.status(400).json({ message: "Email is required in params" });

    const userRegistration = await Registration.findOne({ email });

    if (!userRegistration) {
      return res
        .status(404)
        .json({ message: "User registration not found for this email" });
    }

    // Update fields only, no touching files
    userRegistration.schoolName = schoolName || userRegistration.schoolName;
    userRegistration.teacherName = teacherName || userRegistration.teacherName;
    userRegistration.teacherContact =
      teacherContact || userRegistration.teacherContact;
    userRegistration.emailId = emailId || userRegistration.emailId;
    userRegistration.schoolType = schoolType || userRegistration.schoolType;
    userRegistration.state = state || userRegistration.state;
    userRegistration.district = district || userRegistration.district;
    userRegistration.address = address || userRegistration.address;
    userRegistration.pincode = pincode || userRegistration.pincode;
    userRegistration.malestudentCount =
      malestudentCount || userRegistration.malestudentCount;
    userRegistration.femalestudentCount =
      femalestudentCount || userRegistration.femalestudentCount;
    userRegistration.malestaffCount =
      malestaffCount || userRegistration.malestaffCount;
    userRegistration.femalestaffCount =
      femalestaffCount || userRegistration.femalestaffCount;

    await userRegistration.save();

    res.status(200).json({ message: "Form data updated successfully" });
  } catch (error) {
    console.error("Error updating form data:", error);
    res.status(500).json({ message: "Server error while updating form data" });
  }
};

// const handleRegistration = async (req, res) => {
//   try {
//     const {
//       schoolName,
//       teacherName,
//       teacherContact,
//       emailId,
//       schoolType,
//       state,
//       district,
//       address,
//       pincode
//     } = req.body;

//     const {email}= req.params;

//     const uploadImages = req.files?.uploadImage || [];
//     const uploadVideos = req.files?.uploadVideo || [];
//     const uploadLetter = req.files?.uploadLetter?.[0]?.path || '';
//     console.log(req.files);

//     const compressedImages = [];
//     for (const file of uploadImages) {
//       await compressImage(file.path, file.path);
//       compressedImages.push(file.path);
//     }
//     //console.log("images",uploadImages)

//     // Compress each video
//     const compressedVideos = [];
//     for (const file of uploadVideos) {
//       await compressVideo(file.path, file.path);
//       compressedVideos.push(file.path);
//     }

//     // Compress PDF
//    let finalLetterPath = uploadLetter;
// if (uploadLetter) {
//   await compressPDF(uploadLetter, uploadLetter); // compress in-place
//   finalLetterPath = uploadLetter;
// }

// let userRegistrations = await Registration.findOne({ email });

// // find existing registration by email

// const newRegistrationData = {
//   schoolName,
//   teacherName,
//   teacherContact,
//   emailId,
//   schoolType,
//   state,
//   district,
//   address,
//   pincode,
//   uploadImage: compressedImages,
//   uploadVideo: compressedVideos,
//   uploadLetter: finalLetterPath
// };

// if (userRegistrations) {
//   // Update basic fields
//   userRegistrations.schoolName = schoolName;
//   userRegistrations.teacherName = teacherName;
//   userRegistrations.teacherContact = teacherContact;
//   userRegistrations.emailId = emailId;
//   userRegistrations.schoolType = schoolType;
//   userRegistrations.state = state;
//   userRegistrations.district = district;
//   userRegistrations.address = address;
//   userRegistrations.pincode = pincode;

//   // Append new images/videos to existing ones
//   userRegistrations.uploadImage.push(...compressedImages);
//   userRegistrations.uploadVideo.push(...compressedVideos);

//   // Replace letter only if a new one is uploaded
//   if (finalLetterPath) {
//     userRegistrations.uploadLetter = finalLetterPath;
//   }

//   await userRegistrations.save();
// } else {
//   // create new record
//   userRegistrations = new Registration({
//     email,
//     ...newRegistrationData
//   });
//   await userRegistrations.save();
// }

//     res.status(200).json({ message: "Registration saved under email folder!" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error while registering" });
//   }
// };

const getRegistrationByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const registration = await Registration.findOne({ email });

    if (!registration) {
      return res
        .status(404)
        .json({ message: "Registration not found for this email" });
    }

    res.status(200).json(registration);
  } catch (error) {
    console.error("Error fetching registration:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching registration" });
  }
};

const getDataByDistrict = async (req, res) => {
  try {
    const { state, district } = req.body;

    let query = {};
    if (state) {
      query.state = { $regex: new RegExp(`^${state}$`, "i") };
    }
    if (district) {
      query.district = { $regex: new RegExp(`^${district}$`, "i") };
    }

    const registrations = await Registration.find(query);
    res.status(200).json(registrations);
  } catch (err) {
    console.error("Error fetching registrations:", err);
    res
      .status(500)
      .json({ message: "Server error while fetching registrations." });
  }
};

const getAllRegistrationsData = async (req, res) => {
  try {
    const registrations = await Registration.find();
    res.status(200).json(registrations);
  } catch (error) {
    console.error("Error fetching all registrations:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching all registrations" });
  }
};

const updateEmailAndNumber = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, teacherContact } = req.body;

    console.log(teacherContact);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is required",
      });
    }

    if (!email && !teacherContact) {
      return res.status(400).json({
        success: false,
        message:
          "At least one field (email or contact number) must be provided",
      });
    }

    // Prepare update object
    const updateFields = {};

    // Validate and add email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
        });
      }
      updateFields.email = email;
    }

    if (teacherContact) {
      if (!/^\d{10,15}$/.test(teacherContact)) {
        return res.status(400).json({
          success: false,
          message: "Contact number must be 10-15 digits",
        });
      }
      updateFields.teacherContact = teacherContact;
    }

    // Update the document
    const updatedRegistration = await Registration.findByIdAndUpdate(
      id,
      { $set: updateFields },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedRegistration) {
      return res.status(404).json({
        success: false,
        message: "No registration found with this ID",
      });
    }

    // Success response
    res.status(200).json({
      success: true,
      message: "Registration updated successfully",
      data: updatedRegistration,
    });
  } catch (error) {
    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already exists in system",
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors,
      });
    }

    // Handle other errors
    console.error("Update error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const updatewhatsappstatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { whatsappStatus } = req.body;

    const updated = await Registration.findByIdAndUpdate(
      id,
      { whatsappStatus },
      { new: true }
    );

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  uploadFiles,
  updateFormData,
  getRegistrationByEmail,
  getDataByDistrict,
  getAllRegistrationsData,
  updateEmailAndNumber,
  updatewhatsappstatus
};

































