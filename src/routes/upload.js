const express = require('express')
const router = express.Router()
const cloudinary = require('cloudinary').v2
const multer = require('multer')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Seules les images sont acceptées'), false)
  }
})

router.post('/', upload.array('photos', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ erreur: 'Aucune image reçue' })
    }

    const uploads = await Promise.all(
      req.files.map(file => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: 'immo-rdc', transformation: [{ width: 1200, crop: 'limit' }, { quality: 'auto' }] },
            (error, result) => {
              if (error) reject(error)
              else resolve({ url: result.secure_url, public_id: result.public_id })
            }
          ).end(file.buffer)
        })
      })
    )

    res.json({ succes: true, photos: uploads })
  } catch (err) {
    res.status(500).json({ erreur: err.message })
  }
})

module.exports = router
