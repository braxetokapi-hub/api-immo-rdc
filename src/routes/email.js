const { Resend } = require('resend')
const resend = new Resend(process.env.RESEND_API_KEY)

async function envoyerEmailAdmin(bien) {
  try {
    await resend.emails.send({
      from: 'ImmoRDC <onboarding@resend.dev>',
      to: process.env.ADMIN_EMAIL,
      subject: `🏠 Nouvelle annonce soumise — ${bien.titre}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h2 style="color:#00c853">Nouvelle annonce soumise sur ImmoRDC</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#888">Titre</td><td style="padding:8px;border-bottom:1px solid #eee"><strong>${bien.titre}</strong></td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#888">Type</td><td style="padding:8px;border-bottom:1px solid #eee">${bien.type_bien}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#888">Commune</td><td style="padding:8px;border-bottom:1px solid #eee">${bien.commune}${bien.quartier ? ' · ' + bien.quartier : ''}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#888">Loyer</td><td style="padding:8px;border-bottom:1px solid #eee"><strong style="color:#00c853">$${bien.loyer_usd}/mois</strong></td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#888">Chambres</td><td style="padding:8px;border-bottom:1px solid #eee">${bien.chambres || 'Non précisé'}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#888">Meublé</td><td style="padding:8px;border-bottom:1px solid #eee">${bien.meuble ? 'Oui' : 'Non'}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#888">Téléphone</td><td style="padding:8px;border-bottom:1px solid #eee">${bien.telephone}</td></tr>
            <tr><td style="padding:8px;color:#888">Description</td><td style="padding:8px">${bien.description || 'Aucune'}</td></tr>
          </table>
          <div style="margin-top:24px;padding:16px;background:#f5f5f5;border-radius:8px">
            <p style="margin:0;color:#666;font-size:14px">Pour publier cette annonce, connectez-vous à <a href="https://supabase.com" style="color:#00c853">Supabase</a> et changez le statut en <strong>disponible</strong>.</p>
          </div>
        </div>
      `
    })
  } catch(e) {
    console.error('Erreur email admin:', e.message)
  }
}

async function envoyerEmailConfirmation(bien, emailClient) {
  try {
    await resend.emails.send({
      from: 'ImmoRDC <onboarding@resend.dev>',
      to: emailClient,
      subject: `✅ Annonce reçue — ${bien.titre}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h2 style="color:#00c853">Votre annonce a bien été reçue !</h2>
          <p style="color:#666">Bonjour,</p>
          <p style="color:#666">Nous avons bien reçu votre annonce <strong>${bien.titre}</strong> pour un loyer de <strong style="color:#00c853">$${bien.loyer_usd}/mois</strong>.</p>
          <p style="color:#666">Notre équipe va la vérifier et la publier dans les <strong>2 heures</strong>. Vous recevrez une confirmation dès qu'elle sera en ligne.</p>
          <div style="margin:24px 0;padding:16px;background:#f0fff4;border-left:4px solid #00c853;border-radius:4px">
            <p style="margin:0;color:#085041;font-size:14px">📍 <strong>${bien.commune}${bien.quartier ? ' · ' + bien.quartier : ''}</strong> · ${bien.type_bien} · $${bien.loyer_usd}/mois</p>
          </div>
          <p style="color:#666">Pour toute question, contactez-nous sur WhatsApp.</p>
          <p style="color:#888;font-size:12px;margin-top:32px">— L'équipe ImmoRDC · <a href="https://api-immo-rdc.onrender.com" style="color:#00c853">api-immo-rdc.onrender.com</a></p>
        </div>
      `
    })
  } catch(e) {
    console.error('Erreur email confirmation:', e.message)
  }
}

module.exports = { envoyerEmailAdmin, envoyerEmailConfirmation }
