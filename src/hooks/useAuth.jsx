import { useState, useEffect, useRef, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const initialSessionHandled = useRef(false)

  useEffect(() => {
    // Get initial session from localStorage (fast)
    supabase.auth.getSession().then(({ data: { session } }) => {
      initialSessionHandled.current = true
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // FIX: Skip INITIAL_SESSION — we already handle it via getSession() above.
        // Without this, both fire on mount with the same session, causing:
        //   - two setUser calls (different object refs = re-renders)
        //   - two fetchProfile calls (wasted network)
        //   - useOrganizations triggers twice
        if (event === 'INITIAL_SESSION') return

        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

const fetchProfile = async (userId) => {
  try {
    // Safety timeout - don't hang forever
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
    );
    
    const fetchPromise = supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error)
    }
    
    if (data) {
      setProfile({
        ...data,
        profileMethod: data.profile_method,
        companyName: data.company_name,
        companyWebsite: data.company_website,
        companyStage: data.company_stage,
        teamSize: data.team_size
      })
    } else {
      setProfile(null)
    }
  } catch (error) {
    console.error('Error fetching profile:', error)
  } finally {
    setLoading(false)
  }
}

  const signInWithEmail = async (email) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
      setProfile(null)
    }
    return { error }
  }

  const updateProfile = async (updates) => {
    if (!user) return { error: { message: 'Not authenticated' } }

    const dbUpdates = {
      updated_at: new Date().toISOString()
    }
    
    if (updates.profileMethod) dbUpdates.profile_method = updates.profileMethod
    if (updates.companyName !== undefined) dbUpdates.company_name = updates.companyName
    if (updates.companyWebsite !== undefined) dbUpdates.company_website = updates.companyWebsite
    if (updates.role !== undefined) dbUpdates.role = updates.role
    if (updates.seniority !== undefined) dbUpdates.seniority = updates.seniority
    if (updates.companyStage !== undefined) dbUpdates.company_stage = updates.companyStage
    if (updates.teamSize !== undefined) dbUpdates.team_size = updates.teamSize
    if (updates.industry !== undefined) dbUpdates.industry = updates.industry

    const { data, error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', user.id)
      .select()
      .single()

    if (!error && data) {
      setProfile({
        ...data,
        profileMethod: data.profile_method,
        companyName: data.company_name,
        companyWebsite: data.company_website,
        companyStage: data.company_stage,
        teamSize: data.team_size
      })
    }
    return { data, error }
  }

  const value = {
    user,
    profile,
    loading,
    signInWithEmail,
    signOut,
    updateProfile,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
