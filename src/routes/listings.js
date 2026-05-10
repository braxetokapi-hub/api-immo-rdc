const { envoyerEmailAdmin, envoyerEmailConfirmation } = require('./email')
const express = require('express')
const router = express.Router()
const { supabase, verifierToken } = require('../middleware/auth')

router.get('/stats/marche', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('commune, loyer_usd, type_bien')
      .eq('statut', 'disponible')
    if (error) throw error
    const stats = {}
    data.forEach(({ commune, loyer_usd, type_bien }) => {
      if (!stats[commune]) stats[commune] = { total: 0, count: 0, types: {} }
      stats[commune].total += loyer_usd
      stats[commune].count += 1
      if (!stats[commune].types[type_bien]) stats[commune].types[type_bien] = []
      stats[commune].types[type_bien].push(loyer_usd)
    })
    const result = Object.entries(stats).map(([commune, s]) => ({
      commune,
      loyer_moyen_usd: Math.round(s.total / s.count),
      nb_annonces: s.count
    }))
    res.json({ succes: true, marche: result })
  } catch (err) {
    res.status(500).json({ erreur: err.message })
  }
})

router.get('/', async (req, res) => {
  try {
    const { commune, type_bien, chambres, loyer_max, loyer_min, page = 1 } = req.query
    const limit = 10
    const offset = (page - 1) * limit
    let query = supabase
      .from('listings')
      .select('*')
      .eq('statut', 'disponible')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (commune)   query = query.ilike('commune', '%' + commune + '%')
    if (type_bien) query = query.eq('type_bien', type_bien)
    if (chambres)  query = query.eq('chambres', parseInt(chambres))
    if (loyer_max) query = query.lte('loyer_usd', parseInt(loyer_max))
    if (loyer_min) query = query.gte('loyer_usd', parseInt(loyer_min))
    const { data, error } = await query
    if (error) throw error
    res.json({ succes: true, page: parseInt(page), resultats: data.length, biens: data })
  } catch (err) {
    res.status(500).json({ erreur: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', req.params.id)
      .single()
    if (error || !data) return res.status(404).json({ erreur: 'Bien introuvable' })
    await supabase.from('listings').update({ vues: (data.vues || 0) + 1 }).eq('id', req.params.id)
    res.json({ succes: true, bien: data })
  } catch (err) {
    res.status(500).json({ erreur: err.message })
  }
})

router.post('/', verifierToken, async (req, res) => {
  try {
    const { titre, type_bien, commune, quartier, loyer_usd, chambres, surface_m2, meuble, description, telephone } = req.body
    if (!titre || !type_bien || !commune || !loyer_usd || !telephone) {
      return res.status(400).json({ erreur: 'Champs requis manquants', requis: ['titre', 'type_bien', 'commune', 'loyer_usd', 'telephone'] })
    }
    const { data, error } = await supabase.from('listings').insert([{
      titre, type_bien, commune,
      quartier: quartier || null,
      loyer_usd: parseInt(loyer_usd),
      chambres: chambres ? parseInt(chambres) : null,
      surface_m2: surface_m2 ? parseInt(surface_m2) : null,
      meuble: meuble || false,
      description: description || null,
      telephone, statut: 'disponible', vues: 0,
      proprietaire_id: req.user.id
    }]).select().single()
    if (error) throw error
    // Envoyer emails en arrière-plan
    const emailClient = req.user.email
    envoyerEmailAdmin(data).catch(console.error)
    if (emailClient) envoyerEmailConfirmation(data, emailClient).catch(console.error)
    res.status(201).json({ succes: true, message: 'Bien publié avec succès', bien: data })
  } catch (err) {
    res.status(500).json({ erreur: err.message })
  }
})

router.put('/:id/statut', verifierToken, async (req, res) => {
  try {
    const { statut } = req.body
    const statuts_valides = ['disponible', 'loue', 'suspendu']
    if (!statuts_valides.includes(statut)) {
      return res.status(400).json({ erreur: 'Statut invalide', valides: statuts_valides })
    }
    const { data, error } = await supabase.from('listings')
      .update({ statut })
      .eq('id', req.params.id)
      .eq('proprietaire_id', req.user.id)
      .select().single()
    if (error || !data) return res.status(404).json({ erreur: 'Bien introuvable ou non autorisé' })
    res.json({ succes: true, message: 'Statut mis à jour : ' + statut, bien: data })
  } catch (err) {
    res.status(500).json({ erreur: err.message })
  }
})

module.exports = router
