import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://pqylacpnxwavdvqeklgu.supabase.co"
const supabaseKey = "sb_publishable_ueSh3gC5nKy_49JWGz3m4A_uNLphier"

export const supabase = createClient(supabaseUrl, supabaseKey)