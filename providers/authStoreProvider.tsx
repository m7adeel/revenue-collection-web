import { create } from 'zustand'
import { supabase, User } from '@/utils/supabase'

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUser: (data: Partial<User>) => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null })
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      set({ user: data.user as User, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  signUp: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null })
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
      set({ user: data.user as User, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true, error: null })
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      set({ user: null, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  resetPassword: async (email: string) => {
    try {
      set({ isLoading: true, error: null })
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
      set({ isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  updateUser: async (data: Partial<User>) => {
    try {
      set({ isLoading: true, error: null })
      const { error } = await supabase.auth.updateUser({
        data: data.user_metadata,
      })
      if (error) throw error
      set((state) => ({
        user: state.user ? { ...state.user, ...data } : null,
        isLoading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
}))

// Initialize auth state
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    useAuthStore.setState({ user: session.user as User, isLoading: false })
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ user: null, isLoading: false })
  }
})
