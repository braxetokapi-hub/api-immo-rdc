const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

console.log('SUPABASE_URL:', supabaseUrl ? 'OK' : 'MANQUANT')
console.log('SUPABASE_KEY:', supabaseKey ? 'OK' : 'MANQUANT')

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifierToken(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erreur: 'Token manquant ou invalide' })
  }
  const token = authHeader.split(' ')[1]
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) {
    return res.status(401).json({ erreur: 'Non autorisé' })
  }
  req.user = user
  next()
}

module.exports = { verifierToken, supabase }
