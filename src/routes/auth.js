const express = require('express')
const router = express.Router()
const { supabase } = require('../middleware/auth')

router.post('/inscription', async (req, res) => {
  try {
    const { email, mot_de_passe, nom, telephone } = req.body
    if (!email || !mot_de_passe || !nom) {
      return res.status(400).json({
        erreur: 'Champs requis manquants',
        requis: ['email', 'mot_de_passe', 'nom']
      })
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password: mot_de_passe,
      options: { data: { nom, telephone: telephone || null } }
    })
    if (error) throw error
    res.status(201).json({
      succes: true,
      message: 'Compte créé. Vérifie ton email pour confirmer.',
      utilisateur: { id: data.user?.id, email: data.user?.email }
    })
  } catch (err) {
    res.status(400).json({ erreur: err.message })
  }
})

router.post('/connexion', async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body
    if (!email || !mot_de_passe) {
      return res.status(400).json({ erreur: 'Email et mot de passe requis' })
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: mot_de_passe
    })
    if (error) throw error
    res.json({
      succes: true,
      token: data.session.access_token,
      utilisateur: {
        id: data.user.id,
        email: data.user.email,
        nom: data.user.user_metadata?.nom
      }
    })
  } catch (err) {
    res.status(401).json({ erreur: 'Email ou mot de passe incorrect' })
  }
})

module.exports = router
