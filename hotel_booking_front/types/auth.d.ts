import '@sidebase/nuxt-auth'

declare module '@sidebase/nuxt-auth' {
  interface Session {
    jwt?: string;
    user?: {
      jwt?: string;
    } & Record<string, any>;
    token?: {
      jwt?: string;
    } & Record<string, any>;
  }
}

// Pour le composable useAuth()
declare module '#imports' {
  interface SessionData {
    jwt?: string;
    user?: {
      jwt?: string;
    } & Record<string, any>;
    token?: {
      jwt?: string;
    } & Record<string, any>;
  }
}