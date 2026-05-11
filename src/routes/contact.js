const express = require('express')
const router = express.Router()
const { envoyerEmailAdmin } = require('./email')
const { Resend } = require('resend')
const resend = new Resend(process.env.RESEND_API_KEY)

router.post('/', async (req, res) => {
  try {
    const { nom, email, telephone, sujet, message } = req.body

    if (!nom || !email || !sujet || !message) {
      return res.status(400).json({
        erreur: 'Champs requis manquants',
        requis: ['nom', 'email', 'sujet', 'message']
      })
    }

    await resend.emails.send({
      from: 'ImmoRDC Contact <onboarding@resend.dev>',
      to: process.env.ADMIN_EMAIL,
      subject: `📩 Nouveau message — ${sujet}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h2 style="color:#00c853">Nouveau message de contact</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#888;width:120px">Nom</td><td style="padding:8px;border-bottom:1px solid #eee"><strong>${nom}</strong></td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#888">Email</td><td style="padding:8px;border-bottom:1px solid #eee"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#888">Téléphone</td><td style="padding:8px;border-bottom:1px solid #eee">${telephone || 'Non renseigné'}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#888">Sujet</td><td style="padding:8px;border-bottom:1px solid #eee"><strong>${sujet}</strong></td></tr>
            <tr><td style="padding:8px;color:#888;vertical-align:top">Message</td><td style="padding:8px">${message}</td></tr>
          </table>
          <div style="margin-top:20px">
            <a href="mailto:${email}" style="background:#00c853;color:#000;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">Répondre à ${nom}</a>
          </div>
        </div>
      `
    })

    await resend.emails.send({
      from: 'ImmoRDC <onboarding@resend.dev>',
      to: email,
      subject: `✅ Message reçu — ImmoRDC`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h2 style="color:#00c853">Votre message a bien été reçu !</h2>
          <p style="color:#666">Bonjour ${nom},</p>
          <p style="color:#666">Nous avons bien reçu votre message concernant <strong>${sujet}</strong>. Notre équipe vous répondra dans les <strong>24 heures</strong>.</p>
          <div style="margin:24px 0;padding:16px;background:#f0fff4;border-left:4px solid #00c853;border-radius:4px">
            <p style="margin:0;color:#085041;font-size:14px">"${message}"</p>
          </div>
          <p style="color:#888;font-size:12px;margin-top:32px">— L'équipe ImmoRDC · <a href="https://api-immo-rdc.onrender.com" style="color:#00c853">api-immo-rdc.onrender.com</a></p>
        </div>
      `
    })

    res.json({ succes: true, message: 'Message envoyé avec succès' })
  } catch(err) {
    res.status(500).json({ erreur: err.message })
  }
})

module.exports = router
