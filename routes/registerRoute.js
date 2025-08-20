const express = require('express');
const upload = require('../middlewares/multer.js');
const {updateEmailAndNumber, getRegistrationByEmail, getDataByDistrict,
   getAllRegistrationsData, uploadFiles, updateFormData,
    updatewhatsappstatus,
     handleWhatsAppWebhook
   } = require('../controllers/registerController');
const uploadExcel = require('../middlewares/ExcelMulter');
const { uploadExcelData } = require('../controllers/uploadExcelController');

const router = express.Router();

router.post(
  "/email/upload-files/:email",
  upload.fields([
    { name: "uploadImage", maxCount: 5 },
    { name: "uploadVideo", maxCount: 3 },
    { name: "uploadLetter", maxCount: 1 },
  ]),
  uploadFiles
);

router.post('/email/:email/update-form', updateFormData);


router.post('/upload-excel',uploadExcel.single('file'), uploadExcelData);





router.get('/email/:email', getRegistrationByEmail);
router.post('/subadmindata', getDataByDistrict);
router.get('/alldata', getAllRegistrationsData);
router.put('/updateemailandnumber/:id', updateEmailAndNumber);
// router.put('/updatewhatsappstatus/:id')

module.exports = router;
