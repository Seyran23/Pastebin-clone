const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3_BUCKET_NAME } = require("../utils/enviromentVariables");
const randomFileName = require("../utils/randomFileName");
const {s3} = require("../services/cloud.service")

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: S3_BUCKET_NAME,
    key: (req, file, cb) => {
      const randomName = randomFileName("avatar")
      cb(null, randomName)
    },
    contentType: multerS3.AUTO_CONTENT_TYPE
  }),
  limits: {fileSize: 2 * 1024 * 1024},
  fileFilter: (req, file, cb) => {
    const mimetypes = ["image/jpeg", "image/jpg", "image/png"]
    const isAllowedImage = mimetypes.includes(file.mimetype)
    if (isAllowedImage) {
      cb(null, true)
    } else {
      cb(new Error("Only .jpeg, .jpg, .png file formats allowed!"), false)
    }
  }
})

module.exports = upload;
