/**
 * Supabase Client
 * 
 * Client-side Supabase initialization and auth helpers.
 * Used for authenticated (paid) users only. Free tier users managed server-side.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Sign in with magic link (email OTP)
 * Called only from UpsellScreen during payment flow
 */
export async function signInWithMagicLink(email) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin
    }
  })
  
  if (error) throw error
  return data
}

/**
 * Get current auth session
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

/**
 * Listen for auth state changes
 */
export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange(callback)
}

/**
 * Sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
