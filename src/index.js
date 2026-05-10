const express = require('express')
const cors = require('cors')
const path = require('path')

try { require('dotenv').config() } catch(e) {}

const listingsRouter = require('./routes/listings')
const authRouter = require('./routes/auth')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, '..')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'))
})

app.get('/api', (req, res) => {
  res.json({
    nom: 'API Immobilière RDC',
    version: '1.0.0',
    status: 'en ligne',
    endpoints: {
      listings: '/v1/listings',
      auth: '/v1/auth'
    }
  })
})

app.use('/v1/listings', listingsRouter)
app.use('/v1/auth', authRouter)

app.use((req, res) => {
  res.status(404).json({ erreur: 'Endpoint introuvable' })
})

app.listen(PORT, () => {
  console.log(`✅ API en ligne sur http://localhost:${PORT}`)
})
