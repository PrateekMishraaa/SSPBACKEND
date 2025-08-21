const mongoose = require("mongoose");

// Facility schema is now defined inline within LocalHealthEmergencyReferralDirectory

const registrationSchema = new mongoose.Schema({
  // Basic school information - moved to top and made required
  // email: { type: String,  unique: true },
  // emailId: { type: String },
  // schoolName: { type: String, },
  // teacherName: { type: String },
  // teacherContact: { type: String },
  // schoolType: { type: String },
  // state: { type: String},
  // district: { type: String },
  // address: { type: String },
  // pincode: { type: String },
  // malestudentCount: { type: Number, default: 0 }, // Changed to Number
  // femalestudentCount: { type: Number, default: 0 }, // Changed to Number
  // malestaffCount: { type: Number, default: 0 }, // Changed to Number
  // femalestaffCount: { type: Number, default: 0 }, // Changed to Number
  // isProgram: { type: Boolean, default: false },
  // designation: { type: String },
  
  // File uploads
  // uploadImage: [String],
  // uploadVideo: [String],
  // uploadLetter: String, // Added this field

  RolesAndResponsibility: [
    {
      principalinfo: {
        principalName:{
          type:String,
        },
        principalPhone: { 
          type: String, 
          // default: "",
          validate: {
            validator: function(v) {
              return !v || /^\d{10}$/.test(v); // Either empty or 10 digits
            },
            message: "Principal phone must be 10 digits"
          }
        },
        principalEmail: { 
          type: String, 
          unique:true,
          // default: "",
          validate: {
            validator: function(v) {
              return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); // Either empty or valid email
            },
            message: "Please enter a valid email address"
          }
          
        },
      },
      vicePrincipalinfo: {
        vicePrincipalName:{
            type:String,
        },
        vicePrincipalPhone: { 
          type: String, 
          default: "",
          validate: {
            validator: function(v) {
              return !v || /^\d{10}$/.test(v);
            },
            message: "Vice Principal phone must be 10 digits"
          }
        },
        vicePrincipalEmail: { 
          unique:true,
          type: String, 
          default: "",
          validate: {
            validator: function(v) {
              return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: "Please enter a valid email address"
          }
        },
      },
      
      seniorCoordinate: {
          seniorCoordinateName:{
            type:String
          },
        seniorCoordinatePhone: { 
          type: String, 
          default: "",
          validate: {
            validator: function(v) {
              return !v || /^\d{10}$/.test(v);
            },
            message: "Senior Coordinator phone must be 10 digits"
          }
        },
        seniorCoordinateEmail: { 
          type: String, 
          unique:true,
          default: "",
          validate: {
            validator: function(v) {
              return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: "Please enter a valid email address"
          }
        }
      },
      scienceTeachers: {
        scienceTeacherName:{
          type:String
        },
        scienceTeacherPhone: { 
          type: String, 
          default: "",
          validate: {
            validator: function(v) {
              return !v || /^\d{10}$/.test(v);
            },
            message: "Science Teacher phone must be 10 digits"
          }
        },
        scienceTeacherEmail: { 
          type: String, 
          unique:true,
          default: "",
          validate: {
            validator: function(v) {
              return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: "Please enter a valid email address"
          }
        },
      },
      labAsistant: {
        labAsistantName:{
          type:String
        },
        labAsistantPhone: { 
          type: String, 
          default: "",
          validate: {
            validator: function(v) {
              return !v || /^\d{10}$/.test(v);
            },
            message: "Lab Assistant phone must be 10 digits"
          }
        },
        labAsistantEmail: { 
          type: String, 
          unique:true,
          default: "",
          validate: {
            validator: function(v) {
              return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: "Please enter a valid email address"
          }
        },
      },
      HeadGirlAndBoy: {
          headBoyAndgirlName: { 
            type:String
          },
        headBoyAndgirlPhone: { 
          type: String, 
          default: "",
          validate: {
            validator: function(v) {
              return !v || /^\d{10}$/.test(v);
            },
            message: "Head Boy/Girl phone must be 10 digits"
          }
        },
        headBoyAndGirlEmail: { 
          type: String, 
          unique:true,
          default: "",
          validate: {
            validator: function(v) {
              return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: "Please enter a valid email address"
          }
        }
      },
      CulturalHeadAndLiteraryCaptain: {
         CulturalHeadAndLiteraryCaptainName:{
          type:String
         },
        CulturalHeadAndLiteraryCaptainPhone: { 
          type: String, 
          default: "",
          validate: {
            validator: function(v) {
              return !v || /^\d{10}$/.test(v);
            },
            message: "Cultural Head phone must be 10 digits"
          }
        },
        CulturalHeadAndLiteraryCaptainEmail: { 
          type: String, 
          default: "",
          validate: {
            validator: function(v) {
              return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: "Please enter a valid email address"
          }
        }
      }
    },
  ],

  SafetyAndEmergencyPlans: [
    {
      mapOrientation: {
        isPresent: { type: Boolean, default: false }, // Removed required
        file: { type: String },
        youAreHereIndicator: { type: Boolean, default: false },
        compassArrow: { type: Boolean, default: false }
      },

      buildingLayout: {
        isPresent: { type: Boolean, default: false }, // Removed required
        file: { type: String }
      },

      evacuationRoutes: {
        isPresent: { type: Boolean, default: false }, // Removed required
        file: { type: String },
        atLeastTwoRoutes: { type: Boolean, default: false }
      },

      fireExits: {
        isPresent: { type: Boolean, default: false }, // Removed required
        file: { type: String }
      },

      fireEquipment: {
        isPresent: { type: Boolean, default: false }, // Removed required
        file: { type: String },
        fireExtinguishers: { type: Boolean, default: false },
        fireAlarms: { type: Boolean, default: false },
        hoseReels: { type: Boolean, default: false },
        sandBuckets: { type: Boolean, default: false }
      },

      assemblyPoint: {
        isPresent: { type: Boolean, default: false }, // Removed required
        file: { type: String },
        description: { type: String }
      },

      disabilityRoutes: {
        isPresent: { type: Boolean, default: false }, // Removed required
        file: { type: String },
        ramps: { type: Boolean, default: false },
        widerExits: { type: Boolean, default: false },
        accessibleSignage: { type: Boolean, default: false }
      },

      emergencyContactInfo: {
        isPresent: { type: Boolean, default: false }, // Removed required
        file: { type: String },
        fireStationNumber: { type: String },
        ambulanceNumber: { type: String },
        schoolSafetyOfficerContact: { type: String },
        disasterHelpline: { type: String }
      },

      legend: {
        isPresent: { type: Boolean, default: false }, // Removed required
        file: { type: String },
        symbolsAndMeanings: { type: String }
      },

      dateVersion: {
        isPresent: { type: Boolean, default: false }, // Removed required
        file: { type: String },
        updatedOn: { type: Date }
      }
    }
  ],

  FirstAidReferralDirectory: [
    {
      name: { type: String, default: "" }, // Removed required
      designation: { type: String, default: "" }, // Removed required
      phone: { 
        type: String, 
        default: "",
        validate: {
          validator: function(v) {
            return !v || /^\d{10}$/.test(v);
          },
          message: "Phone number must be 10 digits"
        }
      },
      isFirstAidCertified: { type: Boolean, default: false }, // Fixed typo: details -> default
      locationInSchool: { type: String }
    }
  ],

  LocalHealthEmergencyReferralDirectory
: {
    primaryHealthCentre: [{
      facilityName: { type: String, default: "" },
      phoneNumber: { 
        type: String, 
        default: "",
        validate: {
          validator: function(v) {
            return !v || /^\d{10}$/.test(v);
          },
          message: "Phone number must be 10 digits"
        }
      },
      distanceFromSchool: { type: String, default: "" },
      is24x7: { type: Boolean, default: false },
      remarks: { type: String, default: "" }
    }],
    governmentHospital: [{
      facilityName: { type: String, default: "" },
      phoneNumber: { 
        type: String, 
        default: "",
        validate: {
          validator: function(v) {
            return !v || /^\d{10}$/.test(v);
          },
          message: "Phone number must be 10 digits"
        }
      },
      distanceFromSchool: { type: String, default: "" },
      is24x7: { type: Boolean, default: false },
      remarks: { type: String, default: "" }
    }],
    privateHospital: [{
      facilityName: { type: String, default: "" },
      phoneNumber: { 
        type: String, 
        default: "",
        validate: {
          validator: function(v) {
            return !v || /^\d{10}$/.test(v);
          },
          message: "Phone number must be 10 digits"
        }
      },
      distanceFromSchool: { type: String, default: "" },
      is24x7: { type: Boolean, default: false },
      remarks: { type: String, default: "" }
    }],
    fireDepartment: [{
      facilityName: { type: String, default: "" },
      phoneNumber: { 
        type: String, 
        default: "",
        validate: {
          validator: function(v) {
            return !v || /^\d{10}$/.test(v);
          },
          message: "Phone number must be 10 digits"
        }
      },
      distanceFromSchool: { type: String, default: "" },
      is24x7: { type: Boolean, default: false },
      remarks: { type: String, default: "" }
    }],
    ambulanceService: [{
      facilityName: { type: String, default: "" },
      phoneNumber: { 
        type: String, 
        default: "",
        validate: {
          validator: function(v) {
            return !v || /^\d{10}$/.test(v);
          },
          message: "Phone number must be 10 digits"
        }
      },
      distanceFromSchool: { type: String, default: "" },
      is24x7: { type: Boolean, default: false },
      remarks: { type: String, default: "" }
    }],
    ngoHelpline: [{
      facilityName: { type: String, default: "" },
      phoneNumber: { 
        type: String, 
        default: "",
        validate: {
          validator: function(v) {
            return !v || /^\d{10}$/.test(v);
          },
          message: "Phone number must be 10 digits"
        }
      },
      distanceFromSchool: { type: String, default: "" },
      is24x7: { type: Boolean, default: false },
      remarks: { type: String, default: "" }
    }]
  },

  ResourceAndEquipmentLog: [
    {
      item: { type: String, default: "" }, // Removed required
      location: { type: String, default: "" }, // Removed required
      typeSpecification: { type: String },
      quantity: { type: Number, default: 0, min: 0 }, // Changed min to 0
      lastInspectionDate: { type: Date },
      nextDueDate: { type: Date },
      condition: {
        type: String,
        enum: ["Good", "Replace", ""], // Added empty string option
        default: ""
      },
      remarks: { type: String }
    }
  ],

  FireSafetyEquipmentInventory: [
    {
      Name: { type: String, default: "" }, // Removed required
      Location: { type: String, default: "" }, // Removed required
      TypeAndSpecification: { type: String, default: "" }, // Removed required
      Quantity: { type: Number, default: 0}, // Removed required
      LastInspectionDate: { type: Date },
      NextDueDate: { type: String, default: "" }, // Removed required
      Condition: {
        type: String,
        enum: ["Good", "Replace", ""], // Added empty string option
        default: ""
      }
    }
  ],

  FireDrillLog: [
    {
      dateOfDrill: { type: Date }, // Removed required
      timeOfDrillStart: { type: String }, // Removed required
      timeOfDrillEnd: { type: String }, // Removed required
      typeOfDrill: { type: String },

      participants: {
        students: {
          boys: { type: Number, default: 0 },
          girls: { type: Number, default: 0 }
        },
        staff: {
          teaching: { type: Number, default: 0 },
          nonTeaching: { type: Number, default: 0 },
          admin: { type: Number, default: 0 },
          support: { type: Number, default: 0 }
        }
      },

      timeTakenToEvacuate: { type: Number, default: 0 },
      issuesEncountered: { type: String },
      disabledAssistedStudentsEvacuated: { type: String },

      comments: { type: String },

      fireSafetyEquipment: {
        alarm: { type: Boolean, default: false },
        fireExtinguisher: { type: Boolean, default: false },
        megaphone: { type: Boolean, default: false },
        fireHose: { type: Boolean, default: false },
        sprinklerSystem: { type: Boolean, default: false },
        other: { type: Boolean, default: false },
        otherDetails: { type: String }
      },

      observationsFromSafetyOfficer: { type: String },
      correctiveActions: { type: String },

      drillConductedBy: { type: String },
      signatureAndDate: {
        name: { type: String },
        date: { type: Date }
      },
    }
  ],

  RecoveryAndDamagedDestroyedBuilding: [
    {
      damagedDestroyedBuilding: { type: String, default: "" }, // Removed required
      recoveryMeasures: { type: String },
      fundingSource: { type: String },
      implementingAgency: { type: String },
      tentativeDurationMonths: { type: Number },
      budget: { type: Number },
      responsibleOfficer: { type: String }
    }
  ],

  RecoveryAndEquipmentFurniture: [
    {
      damagedDestroyedEquipmentFurniture: { type: String, default: "" }, 
      recoveryMeasures: { type: String },
      fundingSource: { type: String },
      implementingAgency: { type: String },
      tentativeDurationMonths: { type: Number },
      budget: { type: Number },
      responsibleOfficer: { type: String }
    },
  ],

  FunctioningOfEducation: [
    {
      alterateSchoolLocation: { type: String, default: "" }, // Removed required
      provisionForOnlineEducation: { type: String, default: "" }, // Removed required
      fundingSourceToMeetExpenditure: { type: String, default: "" }, // Removed required
      responsibility: { type: String, default: "" } // Removed required
    }
  ],

  PlanUpdationCycle: [
    {
      versionDate: { type: Date }, // Removed required
      updateTrigger: { type: String },
      keyChangesMade: { type: String },
      reviewedBy: { type: String },
      nextScheduledUpdate: { type: Date }
    }
  ],

  FeedBackMechanismCommunityValidation: [
    {
      FeedbackSource: { type: String },
      DateReceived: { type: Date },
      FeedBackSummary: { type: String, default: "" }, // Removed required
      ActionTaken: { type: String },
      ValidateByCommunity: { type: Boolean, default: false } // Fixed typo: defalut -> default
    }
  ],

  PsychologicalRecovery: [
    {
      noOfStudents: { type: String, default: "" }, // Removed required
      teacherStaffNeed: { type: String, default: "" }, // Removed required
      nameOfCounselors: { type: String, default: "" }, // Removed required
      contactNoOfcounselors: { 
        type: String, 
        default: "",
        validate: {
          validator: function(v) {
            return !v || /^\d{10}$/.test(v);
          },
          message: "Counselor contact must be 10 digits"
        }
      }, // Removed required
      counselorsAddress: { type: String, default: "" }, // Removed required
      counselorsResponsibility: { type: String, default: "" } // Removed required
    }
  ],

  TeamForStudentsSpecialNeed: [
    {
      nameOfTeamMember: { type: String, default: "" }, // Removed required
      memberDesignation: { type: String, default: "" }, // Removed required
      memberAddress: { type: String },
      memberContactno: { 
        type: String, 
        default: "",
        validate: {
          validator: function(v) {
            return !v || /^\d{10}$/.test(v);
          },
          message: "Member contact must be 10 digits"
        }
      }, // Removed required
      nameOftheStudent: { type: String },
      studentContactNo: { 
        type: String,
        validate: {
          validator: function(v) {
            return !v || /^\d{10}$/.test(v);
          },
          message: "Student contact must be 10 digits"
        }
      },
      studentAddress: { type: String } // Fixed typo: string -> String
    }
  ],

  DisasterAccidentReporting: [
    {
      schoolName: { type: String, default: "" }, // Removed required
      schoolAddress: { type: String, default: "" }, // Removed required
      contactNumber: { 
        type: String, 
        default: "",
        validate: {
          validator: function(v) {
            return !v || /^\d{10}$/.test(v);
          },
          message: "Contact number must be 10 digits"
        }
      }, // Removed required
      incidentDate: { type: Date }, // Removed required
      incidentTime: { type: String }, // Removed required
      disasterType: { type: String, default: "" }, // Removed required

      // Affected Persons
      totalAffectedPersons: { type: Number, default: 0 },

      // Deaths breakdown
      deaths: {
        teachingStaff: { type: Number, default: 0 },
        students: { type: Number, default: 0 },
        nonTeachingStaff: { type: Number, default: 0 }
      },

      // Injured persons
      totalInjured: { type: Number, default: 0 },

      // Property loss
      lossOfProperty: { type: String },

      // Response agencies involved
      responseAgencies: { type: String },

      // Detailed descriptions
      eventDescription: { type: String, default: "" }, // Removed required
      responseDescription: { type: String, default: "" }, // Removed required

      // Additional fields for tracking
      reportedBy: { type: String },
      reportedDate: { type: Date, default: Date.now },
      status: {
        type: String,
        enum: ["Reported", "Under Investigation", "Resolved", "Closed", ""],
        default: ""
      }
    }
  ],

  MonthlyQuarterlyReview: [
    {
      reviewDate: { type: Date }, // Removed required
      reviewType: {
        type: String,
        enum: ["Monthly", "Quarterly", "Annual", ""],
        default: ""
      }, // Removed required
      checklistName: { type: String },
      status: {
        type: String,
        enum: ["Completed", "Pending", "In Progress", ""],
        default: ""
      },
      remarks: { type: String },
      reviewedBy: { type: String },
      nextReviewDate: { type: Date }
    }
  ],

  // AdditionalFeedback: [
  //   {
  //     feedbackType: {
  //       type: String,
  //       enum: ["Community Feedback", "Student Suggestion", "Local Fire Department", "Other", ""],
  //       default: ""
  //     }, // Removed required
  //     feedbackDate: { type: Date }, // Removed required
  //     feedbackSummary: { type: String, default: "" }, // Removed required
  //     actionTaken: { type: String },
  //     followUpRequired: { type: Boolean, default: false },
  //     followUpDate: { type: Date },
  //     status: {
  //       type: String,
  //       enum: ["Open", "In Progress", "Resolved", "Closed", ""],
  //       default: ""
  //     }
  //   }
  // ]

}, {
  timestamps: true
});

// Add validation for email uniqueness only when email is provided and not empty
registrationSchema.index(
  { email: 1 }, 
  { 
    unique: true,
    partialFilterExpression: { email: { $type: "string", $ne: "" } }
  }
);

module.exports = mongoose.model("registrations", registrationSchema);