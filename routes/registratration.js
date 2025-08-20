const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Registration = require("../models/Registration");

const router = express.Router();

// Create folders if not exist
const imagePath = path.join(__dirname, "../uploads/images");
const videoPath = path.join(__dirname, "../uploads/videos");
if (!fs.existsSync(imagePath)) fs.mkdirSync(imagePath, { recursive: true });
if (!fs.existsSync(videoPath)) fs.mkdirSync(videoPath, { recursive: true });

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, imagePath);
    else if (file.mimetype.startsWith("video/")) cb(null, videoPath);
    else cb(new Error("Invalid file type"), null);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${file.originalname}`;
    cb(null, unique);
  }
});

const upload = multer({ storage });

// ✅ POST /api/register
router.post("/register", upload.fields([
  { name: "uploadImage", maxCount: 10 },
  { name: "uploadVideo", maxCount: 5 },
]), async (req, res) => {
  try {
    const body = req.body;
    const files = req.files;
const uploadImage = files?.uploadImage?.map(file =>
  file.path.replace(/\\/g, "/").replace(/^.*?uploads\//, "uploads/")
) || [];

const uploadVideo = files?.uploadVideo?.map(file =>
  file.path.replace(/\\/g, "/").replace(/^.*?uploads\//, "uploads/")
) || [];

    const newData = {
      ...body,
      uploadImage,
      uploadVideo
    };

    // ✅ Check if a registration already exists with this email
    const existing = await Registration.findOne({ email: body.email });

    if (existing) {
      // ✅ Update the existing document
      await Registration.updateOne({ email: body.email }, { $set: newData });
      return res.status(200).json({ message: "Registration updated successfully" });
    }

    // ✅ Else create new registration
    const saved = new Registration(newData);
    await saved.save();

    res.status(201).json({ message: "Registration created successfully" });

  } catch (err) {
    console.error("Error saving data:", err);
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
});



router.post("/registration", async (req, res) => {
  try {
    const {
      schoolName,
      teacherName,
      teacherContact,
      email,
      emailId,
      schoolType,
      state,
      district,
      address,
      pincode,
      malestudentCount,
      femalestudentCount,
      malestaffCount,
      femalestaffCount,
      isProgram,
      designation
    } = req.body;

    const uploadImages = req.files?.uploadImage || [];
    const uploadVideos = req.files?.uploadVideo || [];
    const uploadLetter = req.files?.uploadLetter?.[0] || null;

    console.log("📁 Files received:", req.files);

    // Compress images
    const compressedImages = [];
    for (const file of uploadImages) {
      await compressImage(file.path, file.path);
      const normalizedPath = file.path.replace(/\\/g, "/").replace(/^.*?uploads\//, "uploads/");
      compressedImages.push(normalizedPath);
    }

    // Compress videos
    const compressedVideos = [];
    for (const file of uploadVideos) {
      await compressVideo(file.path, file.path);
      const normalizedPath = file.path.replace(/\\/g, "/").replace(/^.*?uploads\//, "uploads/");
      compressedVideos.push(normalizedPath);
    }

    // Compress PDF
    let finalLetterPath = '';
    if (uploadLetter) {
      await compressPDF(uploadLetter.path, uploadLetter.path);
      finalLetterPath = uploadLetter.path.replace(/\\/g, "/").replace(/^.*?uploads\//, "uploads/");
    }

    // Find existing registration by email
    let userRegistrations = await Registration.findOne({ email });

    // Utility to safely parse JSON fields
    const parseJSONField = (field) => {
      if (typeof field === 'string') {
        try {
          return JSON.parse(field);
        } catch (e) {
          console.log('JSON parse error for field:', field);
          return field;
        }
      }
      return field || [];
    };

    // Helper function to convert string numbers to actual numbers
    const safeParseNumber = (value) => {
      if (typeof value === 'string' && value.trim() !== '') {
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? 0 : parsed;
      }
      return typeof value === 'number' ? value : 0;
    };

    // Helper function to parse and validate phone numbers
    const validatePhoneNumber = (phone) => {
      if (!phone || phone.trim() === '') return '';
      const cleanPhone = phone.toString().replace(/\D/g, '');
      return cleanPhone.length === 10 ? cleanPhone : '';
    };

    // Helper function to validate email
    const validateEmail = (email) => {
      if (!email || email.trim() === '') return '';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email.trim()) ? email.trim() : '';
    };

    // Helper function to parse date
    const parseDate = (dateString) => {
      if (!dateString || dateString.trim() === '') return null;
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    };

    // Helper function to parse boolean
    const parseBoolean = (value) => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true' || value === '1';
      }
      return false;
    };

    // Build new data object with proper data types
    const newRegistrationData = {
      schoolName: schoolName || "",
      teacherName: teacherName || "",
      teacherContact: validatePhoneNumber(teacherContact),
      emailId: emailId || "",
      schoolType: schoolType || "",
      state: state || "",
      district: district || "",
      address: address || "",
      pincode: pincode || "",
      malestudentCount: safeParseNumber(malestudentCount),
      femalestudentCount: safeParseNumber(femalestudentCount),
      malestaffCount: safeParseNumber(malestaffCount),
      femalestaffCount: safeParseNumber(femalestaffCount),
      isProgram: parseBoolean(isProgram),
      designation: designation || "",
      uploadImage: compressedImages,
      uploadVideo: compressedVideos,
      uploadLetter: finalLetterPath
    };

    // Parse complex fields with proper structure validation
    const parseRolesAndResponsibility = (data) => {
      const parsed = parseJSONField(data);
      if (!Array.isArray(parsed)) return [];
      
      return parsed.map(item => ({
        principalinfo: {
          principalName:(item.principalinfo?.principalName),
          principalPhone: validatePhoneNumber(item.principalinfo?.principalPhone),
          principalEmail: validateEmail(item.principalinfo?.principalEmail)
        },
        vicePrincipalinfo: {
          vicePrincipalName: (item.vicePrincipalinfo?.vicePrincipalName),
          vicePrincipalPhone: validatePhoneNumber(item.vicePrincipalinfo?.vicePrincipalPhone),
          vicePrincipalEmail: validateEmail(item.vicePrincipalinfo?.vicePrincipalEmail)
        },
        seniorCoordinate: {
            seniorCoordinateName: (item.seniorCoordinate?.seniorCoordinateName),
          seniorCoordinatePhone: validatePhoneNumber(item.seniorCoordinate?.seniorCoordinatePhone),
          seniorCoordinateEmail: validateEmail(item.seniorCoordinate?.seniorCoordinateEmail)
        },
        scienceTeachers: {
           scienceTeacherName: (item.scienceTeachers?.scienceTeacherName),
          scienceTeacherPhone: validatePhoneNumber(item.scienceTeachers?.scienceTeacherPhone),
          scienceTeacherEmail: validateEmail(item.scienceTeachers?.scienceTeacherEmail)
        },
        labAsistant: {
          labAsistantName: (item.labAsistant?.labAsistantName),
          labAsistantPhone: validatePhoneNumber(item.labAsistant?.labAsistantPhone),
          labAsistantEmail: validateEmail(item.labAsistant?.labAsistantEmail)
        },
        HeadGirlAndBoy: {
          headBoyAndgirlName: (item.HeadGirlAndBoy?.headBoyAndgirlName),
          headBoyAndgirlPhone: validatePhoneNumber(item.HeadGirlAndBoy?.headBoyAndgirlPhone),
          headBoyAndGirlEmail: validateEmail(item.HeadGirlAndBoy?.headBoyAndGirlEmail)
        },
        CulturalHeadAndLiteraryCaptain: {
           CulturalHeadAndLiteraryCaptainName: (item.CulturalHeadAndLiteraryCaptain?.CulturalHeadAndLiteraryCaptainName),
          CulturalHeadAndLiteraryCaptainPhone: validatePhoneNumber(item.CulturalHeadAndLiteraryCaptain?.CulturalHeadAndLiteraryCaptainPhone),
          CulturalHeadAndLiteraryCaptainEmail: validateEmail(item.CulturalHeadAndLiteraryCaptain?.CulturalHeadAndLiteraryCaptainEmail)
        }
      }));
    };

    const parseSafetyAndEmergencyPlans = (data) => {
      const parsed = parseJSONField(data);
      if (!Array.isArray(parsed)) return [];
      
      return parsed.map(item => ({
        mapOrientation: {
          isPresent: parseBoolean(item.mapOrientation?.isPresent),
          file: item.mapOrientation?.file || '',
          youAreHereIndicator: parseBoolean(item.mapOrientation?.youAreHereIndicator),
          compassArrow: parseBoolean(item.mapOrientation?.compassArrow)
        },
        buildingLayout: {
          isPresent: parseBoolean(item.buildingLayout?.isPresent),
          file: item.buildingLayout?.file || ''
        },
        evacuationRoutes: {
          isPresent: parseBoolean(item.evacuationRoutes?.isPresent),
          file: item.evacuationRoutes?.file || '',
          atLeastTwoRoutes: parseBoolean(item.evacuationRoutes?.atLeastTwoRoutes)
        },
        fireExits: {
          isPresent: parseBoolean(item.fireExits?.isPresent),
          file: item.fireExits?.file || ''
        },
        fireEquipment: {
          isPresent: parseBoolean(item.fireEquipment?.isPresent),
          file: item.fireEquipment?.file || '',
          fireExtinguishers: parseBoolean(item.fireEquipment?.fireExtinguishers),
          fireAlarms: parseBoolean(item.fireEquipment?.fireAlarms),
          hoseReels: parseBoolean(item.fireEquipment?.hoseReels),
          sandBuckets: parseBoolean(item.fireEquipment?.sandBuckets)
        },
        assemblyPoint: {
          isPresent: parseBoolean(item.assemblyPoint?.isPresent),
          file: item.assemblyPoint?.file || '',
          description: item.assemblyPoint?.description || ''
        },
        disabilityRoutes: {
          isPresent: parseBoolean(item.disabilityRoutes?.isPresent),
          file: item.disabilityRoutes?.file || '',
          ramps: parseBoolean(item.disabilityRoutes?.ramps),
          widerExits: parseBoolean(item.disabilityRoutes?.widerExits),
          accessibleSignage: parseBoolean(item.disabilityRoutes?.accessibleSignage)
        },
        emergencyContactInfo: {
          isPresent: parseBoolean(item.emergencyContactInfo?.isPresent),
          file: item.emergencyContactInfo?.file || '',
          fireStationNumber: item.emergencyContactInfo?.fireStationNumber || '',
          ambulanceNumber: item.emergencyContactInfo?.ambulanceNumber || '',
          schoolSafetyOfficerContact: item.emergencyContactInfo?.schoolSafetyOfficerContact || '',
          disasterHelpline: item.emergencyContactInfo?.disasterHelpline || ''
        },
        legend: {
          isPresent: parseBoolean(item.legend?.isPresent),
          file: item.legend?.file || '',
          symbolsAndMeanings: item.legend?.symbolsAndMeanings || ''
        },
        dateVersion: {
          isPresent: parseBoolean(item.dateVersion?.isPresent),
          file: item.dateVersion?.file || '',
          updatedOn: parseDate(item.dateVersion?.updatedOn)
        }
      }));
    };

    const parseFirstAidReferralDirectory = (data) => {
      const parsed = parseJSONField(data);
      if (!Array.isArray(parsed)) return [];
      
      return parsed.map(item => ({
        name: item.name || '',
        designation: item.designation || '',
        phone: validatePhoneNumber(item.phone),
        isFirstAidCertified: parseBoolean(item.isFirstAidCertified),
        locationInSchool: item.locationInSchool || ''
      }));
    };

    const parseLocalHealthEmergencyReferralDirectory = (data) => {
      const parsed = parseJSONField(data);
      if (!Array.isArray(parsed)) return [];
      
      return parsed.map(item => ({
        serviceType: item.serviceType || '',
        facilityName: item.facilityName || '',
        phoneNumber: validatePhoneNumber(item.phoneNumber),
        distanceFromSchool: item.distanceFromSchool || '',
        is24x7: parseBoolean(item.is24x7),
        remarks: item.remarks || ''
      }));
    };

    const parseResourceAndEquipmentLog = (data) => {
      const parsed = parseJSONField(data);
      if (!Array.isArray(parsed)) return [];
      
      return parsed.map(item => ({
        item: item.item || '',
        location: item.location || '',
        typeSpecification: item.typeSpecification || '',
        quantity: safeParseNumber(item.quantity),
        lastInspectionDate: parseDate(item.lastInspectionDate),
        nextDueDate: parseDate(item.nextDueDate),
        condition: ['Good', 'Replace'].includes(item.condition) ? item.condition : '',
        remarks: item.remarks || ''
      }));
    };

    const parseFireSafetyEquipmentInventory = (data) => {
      const parsed = parseJSONField(data);
      if (!Array.isArray(parsed)) return [];
      
      return parsed.map(item => ({
        Name: item.Name || '',
        Location: item.Location || '',
        TypeAndSpecification: item.TypeAndSpecification || '',
        Quantity: item.Quantity || '',
        LastInspectionDate: parseDate(item.LastInspectionDate),
        NextDueDate: item.NextDueDate || '',
        Condition: ['Good', 'Replace'].includes(item.Condition) ? item.Condition : ''
      }));
    };

    const parseFireDrillLog = (data) => {
      const parsed = parseJSONField(data);
      if (!Array.isArray(parsed)) return [];
      
      return parsed.map(item => ({
        dateOfDrill: parseDate(item.dateOfDrill),
        timeOfDrillStart: item.timeOfDrillStart || '',
        timeOfDrillEnd: item.timeOfDrillEnd || '',
        typeOfDrill: item.typeOfDrill || '',
        participants: {
          students: {
            boys: safeParseNumber(item.participants?.students?.boys),
            girls: safeParseNumber(item.participants?.students?.girls)
          },
          staff: {
            teaching: safeParseNumber(item.participants?.staff?.teaching),
            nonTeaching: safeParseNumber(item.participants?.staff?.nonTeaching),
            admin: safeParseNumber(item.participants?.staff?.admin),
            support: safeParseNumber(item.participants?.staff?.support)
          }
        },
        timeTakenToEvacuate: safeParseNumber(item.timeTakenToEvacuate),
        issuesEncountered: item.issuesEncountered || '',
        disabledAssistedStudentsEvacuated: item.disabledAssistedStudentsEvacuated || '',
        comments: item.comments || '',
        fireSafetyEquipment: {
          alarm: parseBoolean(item.fireSafetyEquipment?.alarm),
          fireExtinguisher: parseBoolean(item.fireSafetyEquipment?.fireExtinguisher),
          megaphone: parseBoolean(item.fireSafetyEquipment?.megaphone),
          fireHose: parseBoolean(item.fireSafetyEquipment?.fireHose),
          sprinklerSystem: parseBoolean(item.fireSafetyEquipment?.sprinklerSystem),
          other: parseBoolean(item.fireSafetyEquipment?.other),
          otherDetails: item.fireSafetyEquipment?.otherDetails || ''
        },
        observationsFromSafetyOfficer: item.observationsFromSafetyOfficer || '',
        correctiveActions: item.correctiveActions || '',
        drillConductedBy: item.drillConductedBy || '',
        signatureAndDate: {
          name: item.signatureAndDate?.name || '',
          date: parseDate(item.signatureAndDate?.date)
        }
      }));
    };

    const parseRecoveryAndDamagedDestroyedBuilding = (data) => {
      const parsed = parseJSONField(data);
      if (!Array.isArray(parsed)) return [];
      
      return parsed.map(item => ({
        damagedDestroyedBuilding: item.damagedDestroyedBuilding || '',
        recoveryMeasures: item.recoveryMeasures || '',
        fundingSource: item.fundingSource || '',
        implementingAgency: item.implementingAgency || '',
        tentativeDurationMonths: safeParseNumber(item.tentativeDurationMonths),
        budget: safeParseNumber(item.budget),
        responsibleOfficer: item.responsibleOfficer || ''
      }));
    };

    const parseRecoveryAndEquipmentFurniture = (data) => {
      const parsed = parseJSONField(data);
      if (!Array.isArray(parsed)) return [];
      
      return parsed.map(item => ({
        damagedDestroyedEquipmentFurniture: item.damagedDestroyedEquipmentFurniture || '',
        recoveryMeasures: item.recoveryMeasures || '',
        fundingSource: item.fundingSource || '',
        implementingAgency: item.implementingAgency || '',
        tentativeDurationMonths: safeParseNumber(item.tentativeDurationMonths),
        budget: safeParseNumber(item.budget),
        responsibleOfficer: item.responsibleOfficer || ''
      }));
    };

    const parseFunctioningOfEducation = (data) => {
      const parsed = parseJSONField(data);
      if (!Array.isArray(parsed)) return [];
      
      return parsed.map(item => ({
        alterateSchoolLocation: item.alterateSchoolLocation || '',
        provisionForOnlineEducation: item.provisionForOnlineEducation || '',
        fundingSourceToMeetExpenditure: item.fundingSourceToMeetExpenditure || '',
        responsibility: item.responsibility || ''
      }));
    };

    const parsePlanUpdationCycle = (data) => {
      const parsed = parseJSONField(data);
      if (!Array.isArray(parsed)) return [];
      
      return parsed.map(item => ({
        versionDate: parseDate(item.versionDate),
        updateTrigger: item.updateTrigger || '',
        keyChangesMade: item.keyChangesMade || '',
        reviewedBy: item.reviewedBy || '',
        nextScheduledUpdate: parseDate(item.nextScheduledUpdate)
      }));
    };

    const parseFeedBackMechanismCommunityValidation = (data) => {
      const parsed = parseJSONField(data);
      if (!Array.isArray(parsed)) return [];
      
      return parsed.map(item => ({
        FeedbackSource: item.FeedbackSource || '',
        DateReceived: parseDate(item.DateReceived),
        FeedBackSummary: item.FeedBackSummary || '',
        ActionTaken: item.ActionTaken || '',
        ValidateByCommunity: parseBoolean(item.ValidateByCommunity)
      }));
    };

    const parsePsychologicalRecovery = (data) => {
      const parsed = parseJSONField(data);
      if (!Array.isArray(parsed)) return [];
      
      return parsed.map(item => ({
        noOfStudents: item.noOfStudents || '',
        teacherStaffNeed: item.teacherStaffNeed || '',
        nameOfCounselors: item.nameOfCounselors || '',
        contactNoOfcounselors: validatePhoneNumber(item.contactNoOfcounselors),
        counselorsAddress: item.counselorsAddress || '',
        counselorsResponsibility: item.counselorsResponsibility || ''
      }));
    };

    const parseTeamForStudentsSpecialNeed = (data) => {
      const parsed = parseJSONField(data);
      if (!Array.isArray(parsed)) return [];
      
      return parsed.map(item => ({
        nameOfTeamMember: item.nameOfTeamMember || '',
        memberDesignation: item.memberDesignation || '',
        memberAddress: item.memberAddress || '',
        memberContactno: validatePhoneNumber(item.memberContactno),
        nameOftheStudent: item.nameOftheStudent || '',
        studentContactNo: validatePhoneNumber(item.studentContactNo),
        studentAddress: item.studentAddress || ''
      }));
    };

    const parseDisasterAccidentReporting = (data) => {
      const parsed = parseJSONField(data);
      if (!Array.isArray(parsed)) return [];
      
      return parsed.map(item => ({
        schoolName: item.schoolName || '',
        schoolAddress: item.schoolAddress || '',
        contactNumber: validatePhoneNumber(item.contactNumber),
        incidentDate: parseDate(item.incidentDate),
        incidentTime: item.incidentTime || '',
        disasterType: item.disasterType || '',
        totalAffectedPersons: safeParseNumber(item.totalAffectedPersons),
        deaths: {
          teachingStaff: safeParseNumber(item.deaths?.teachingStaff),
          students: safeParseNumber(item.deaths?.students),
          nonTeachingStaff: safeParseNumber(item.deaths?.nonTeachingStaff)
        },
        totalInjured: safeParseNumber(item.totalInjured),
        lossOfProperty: item.lossOfProperty || '',
        responseAgencies: item.responseAgencies || '',
        eventDescription: item.eventDescription || '',
        responseDescription: item.responseDescription || '',
        reportedBy: item.reportedBy || '',
        reportedDate: parseDate(item.reportedDate) || new Date(),
        status: ['Reported', 'Under Investigation', 'Resolved', 'Closed'].includes(item.status) ? item.status : ''
      }));
    };

    const parseMonthlyQuarterlyReview = (data) => {
      const parsed = parseJSONField(data);
      if (!Array.isArray(parsed)) return [];
      
      return parsed.map(item => ({
        reviewDate: parseDate(item.reviewDate),
        reviewType: ['Monthly', 'Quarterly', 'Annual'].includes(item.reviewType) ? item.reviewType : '',
        checklistName: item.checklistName || '',
        status: ['Completed', 'Pending', 'In Progress'].includes(item.status) ? item.status : '',
        remarks: item.remarks || '',
        reviewedBy: item.reviewedBy || '',
        nextReviewDate: parseDate(item.nextReviewDate)
      }));
    };

    // const parseAdditionalFeedback = (data) => {
    //   const parsed = parseJSONField(data);
    //   if (!Array.isArray(parsed)) return [];
      
    //   return parsed.map(item => ({
    //     feedbackType: ['Community Feedback', 'Student Suggestion', 'Local Fire Department', 'Other'].includes(item.feedbackType) ? item.feedbackType : '',
    //     feedbackDate: parseDate(item.feedbackDate),
    //     feedbackSummary: item.feedbackSummary || '',
    //     actionTaken: item.actionTaken || '',
    //     followUpRequired: parseBoolean(item.followUpRequired),
    //     followUpDate: parseDate(item.followUpDate),
    //     status: ['Open', 'In Progress', 'Resolved', 'Closed'].includes(item.status) ? item.status : ''
    //   }));
    // };

    // Parse and assign all complex fields
    newRegistrationData.RolesAndResponsibility = parseRolesAndResponsibility(req.body.RolesAndResponsibility);
    newRegistrationData.SafetyAndEmergencyPlans = parseSafetyAndEmergencyPlans(req.body.SafetyAndEmergencyPlans);
    newRegistrationData.FirstAidReferralDirectory = parseFirstAidReferralDirectory(req.body.FirstAidReferralDirectory);
    newRegistrationData.LocalHealthEmergencyReferralDirectory = parseLocalHealthEmergencyReferralDirectory(req.body.LocalHealthEmergencyReferralDirectory);
    newRegistrationData.ResourceAndEquipmentLog = parseResourceAndEquipmentLog(req.body.ResourceAndEquipmentLog);
    newRegistrationData.FireSafetyEquipmentInventory = parseFireSafetyEquipmentInventory(req.body.FireSafetyEquipmentInventory);
    newRegistrationData.FireDrillLog = parseFireDrillLog(req.body.FireDrillLog);
    newRegistrationData.RecoveryAndDamagedDestroyedBuilding = parseRecoveryAndDamagedDestroyedBuilding(req.body.RecoveryAndDamagedDestroyedBuilding);
    newRegistrationData.RecoveryAndEquipmentFurniture = parseRecoveryAndEquipmentFurniture(req.body.RecoveryAndEquipmentFurniture);
    newRegistrationData.FunctioningOfEducation = parseFunctioningOfEducation(req.body.FunctioningOfEducation);
    newRegistrationData.PlanUpdationCycle = parsePlanUpdationCycle(req.body.PlanUpdationCycle);
    newRegistrationData.FeedBackMechanismCommunityValidation = parseFeedBackMechanismCommunityValidation(req.body.FeedBackMechanismCommunityValidation);
    newRegistrationData.PsychologicalRecovery = parsePsychologicalRecovery(req.body.PsychologicalRecovery);
    newRegistrationData.TeamForStudentsSpecialNeed = parseTeamForStudentsSpecialNeed(req.body.TeamForStudentsSpecialNeed);
    newRegistrationData.DisasterAccidentReporting = parseDisasterAccidentReporting(req.body.DisasterAccidentReporting);
    newRegistrationData.MonthlyQuarterlyReview = parseMonthlyQuarterlyReview(req.body.MonthlyQuarterlyReview);
    // newRegistrationData.AdditionalFeedback = parseAdditionalFeedback(req.body.AdditionalFeedback);

    if (userRegistrations) {
      // ✅ Update existing registration
      Object.assign(userRegistrations, newRegistrationData);

      // Merge images & videos instead of replacing
      if (compressedImages.length > 0) {
        userRegistrations.uploadImage = [
          ...(userRegistrations.uploadImage || []),
          ...compressedImages
        ];
      }
      if (compressedVideos.length > 0) {
        userRegistrations.uploadVideo = [
          ...(userRegistrations.uploadVideo || []),
          ...compressedVideos
        ];
      }

      // Replace letter if new one uploaded
      if (finalLetterPath) {
        userRegistrations.uploadLetter = finalLetterPath;
      }

      // Use markModified for complex nested objects
      const complexFields = [
        'RolesAndResponsibility', 'SafetyAndEmergencyPlans', 'FirstAidReferralDirectory',
        'LocalHealthEmergencyReferralDirectory', 'ResourceAndEquipmentLog', 'FireSafetyEquipmentInventory',
        'FireDrillLog', 'RecoveryAndDamagedDestroyedBuilding', 'RecoveryAndEquipmentFurniture',
        'FunctioningOfEducation', 'PlanUpdationCycle', 'FeedBackMechanismCommunityValidation',
        'PsychologicalRecovery', 'TeamForStudentsSpecialNeed', 'DisasterAccidentReporting',
        'MonthlyQuarterlyReview',
        //  'AdditionalFeedback'
      ];

      complexFields.forEach(field => {
        userRegistrations.markModified(field);
      });

      await userRegistrations.save();
    } else {
      // ✅ Create new record
      userRegistrations = new Registration({
        email,
        ...newRegistrationData
      });
      await userRegistrations.save();
    }
    console.log(userRegistrations)
    res.status(200).json({ 
      message: "Registration saved successfully!",
      registrationId: userRegistrations
    });

  } catch (error) {
    console.error("Registration error:", error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      console.error("Validation errors:", errors);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors,
        details: error.message 
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field} already exists`,
        error: 'DUPLICATE_KEY'
      });
    }

    // Handle cast errors (wrong data types)
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: `Invalid data type for field: ${error.path}`,
        error: 'CAST_ERROR'
      });
    }

    // Handle mongoose errors
    if (error.name === 'MongoError' || error.name === 'MongooseError') {
      return res.status(500).json({ 
        message: 'Database error occurred',
        error: 'DATABASE_ERROR'
      });
    }

    // Generic server error
    res.status(500).json({ 
      message: "Internal server error",
      error: 'SERVER_ERROR'
    });
  }
});

router.get("/all-registration",async(req,res)=>{
  try{
      const data = await Registration.find()
      console.log(data)
      res.status(200).json({message:"All data",data})
  }catch(error){
    console.log(error)
    res.status(500).json({message:"Internal server error",error})
  }
})

// Get registration by email
router.get("/register/:email", async (req, res) => {
  try {
    const email = req.params.email;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const registration = await Registration.findOne({ email });

    if (!registration) {
      return res.status(404).json({ message: "No data found for this email." });
    }

    res.status(200).json({ success: true, data: registration });
  } catch (err) {
    console.error("Error fetching registration:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


router.get("/fix-program-field", async (req, res) => {
  try {
    const result = await Registration.updateMany(
      { isProgram: { $exists: false } },
      { $set: { isProgram: false } }
    );
    console.log("🔍 Update Result:", result);
    res.json({ message: "Updated successfully", result });
  } catch (error) {
    console.error("❌ Error details:", error); // Log full error
    res.status(500).json({
      error: "Update failed",
      details: error.message || "Unknown error"
    });
  }
});


module.exports = router;




// router.post("/", async (req, res) => {
//   try {
//     const registrations = req.body;

//     // Validate: must be an array of objects
//     if (!Array.isArray(registrations) || registrations.length === 0) {
//       return res.status(400).json({ message: "Invalid or empty data array." });
//     }

//     // Optional: you can validate fields inside each object here
//     // For now, let's trust the client side or use Mongoose validation

//     // ✅ Bulk insert using insertMany
    
//     const result = await Registration.insertMany(registrations, { ordered: false }); // `ordered: false` continues on errors

//     if(result.length>0){

//       return res.status(200).json({
//         sucess:true,
//         message:"Registration sucessfully",
//         result
//       })
//     }
//     // console.log(result);
//     // res.status(200).json({
//     //   message: "Bulk registration successful",
//     //   insertedCount: result.length,
//     // });

//   } 
//   catch (error) {
//     console.log(error)
//     console.error("Bulk insert error:", error);
//     res.status(500).json({
//       message: "Bulk registration failed",
//       error: error.message,
//     });
//   }
// });

// router.post("/", async (req, res) => {
//   try {
//     const registrations = req.body;
//    // console.log(registrations);
//     // 🔍 Validate input
//     if (!Array.isArray(registrations) || registrations.length === 0) {
//       return res.status(400).json({ success: false, message: "Invalid or empty data array." });
//     }

//     // 🚀 Insert data
//     const result = await Registration.insertMany(registrations, { ordered: false });

//     // ✅ Check if any data was inserted
//     if (result && result.length > 0) {
//       return res.status(200).json({
//         success: true,
//         message: "Bulk registration successful",
//         insertedCount: result.length,
//         data: result,
//       });
//     } else {
//       return res.status(500).json({
//         success: false,
//         message: "No documents were inserted. Please check the input data.",
//       });
//     }

//   } catch (error) {
//     console.error("❌ Bulk insert error:", error);

//     res.status(500).json({
//       success: false,
//       message: "Bulk registration failed",
//       error: error.message,
//     });
//   }
// });

