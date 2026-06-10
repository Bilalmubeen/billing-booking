import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/calendar',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken  = account.access_token
        token.refreshToken = account.refresh_token
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken  = token.accessToken as string
      session.refreshToken = token.refreshToken as string
      return session
    },
    async signIn({ user, account }) {
      if (!user.email) return false
      try {
        const { supabaseAdmin } = await import('./supabase')
        const username = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
        await supabaseAdmin.from('users').upsert({
          email: user.email,
          name: user.name,
          avatar: user.image,
          username,
          google_access_token:  account?.access_token,
          google_refresh_token: account?.refresh_token,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' })
      } catch(e) {
        console.error('SignIn error:', e)
      }
      return true
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
})
