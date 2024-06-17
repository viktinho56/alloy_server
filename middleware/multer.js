const multer = require("multer");

const storage = multer.diskStorage({
 destination: function (req, file, cb) {
    cb(null, './uploads')      //you tell where to upload the files,
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.png')
  }
});

// const fileFilter = (req, file, cb) => {
//   if (
//     file.mimetype === "image/jpeg" ||
//     file.mimetype === "image/jpg" ||
//     file.mimetype === "image/png" ||
//     file.mimetype === "image/webp" ||
//     file.mimetype === "video/mp4"
//   ) {
//     cb(null, true);
//   } else {
//     cb({ message: "Unsupported File format" }, false);
//   }
// };

const upload = multer({
  storage,
  onFileUploadStart: function (file) {
      console.log(file.originalname + ' is starting ...')
    },
});
module.exports = upload;
