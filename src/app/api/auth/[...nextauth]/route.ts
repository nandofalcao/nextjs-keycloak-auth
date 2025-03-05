import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { dateNow } from "@/utils/date";

/**
 * Função para atualizar o token usando o refreshToken
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    // Preparando os parâmetros para a requisição de refresh
    const params = new URLSearchParams({
      client_id: process.env.KEYCLOAK_CLIENT_ID || "",
      client_secret: process.env.KEYCLOAK_CLIENT_SECRET || "",
      grant_type: "refresh_token",
      refresh_token: token.refreshToken as string,
    });

    console.log("fetch refresh token");
    // Faz a requisição para o endpoint de token do Keycloak
    const response = await fetch(
      `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
        body: params.toString(),
      }
    );

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    // Calcula quando o token expirará
    const nowInSeconds = dateNow();
    const expiresAt = nowInSeconds + Number(refreshedTokens.expires_in);

    console.log("retornou token novo");

    // Retorna o token atualizado
    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: expiresAt,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    // Em caso de erro, retorna o token anterior, mas marca como expirado
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID || "",
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "",
      issuer: process.env.KEYCLOAK_ISSUER || "",
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Atualização inicial do token quando o usuário faz login
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at ? account.expires_at : 0,
          user,
        };
      }

      // Verifica se o token está próximo de expirar
      const offsetSeconds = Number(
        process.env.NEXT_REFRESH_TOKEN_OFFSET_SECONDS || "60"
      );
      const shouldRefreshTime =
        dateNow() >=
        ((token.accessTokenExpires as number) || 0) - offsetSeconds;

      // Se não tiver expirado, retorna o token sem alterações
      if (!shouldRefreshTime) {
        console.log("retornou token antigo");
        return token;
      }

      // Caso contrário, atualiza o token
      console.log("chamando refreshAccessToken");
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      // Não compartilha o accessToken na sessão
      // Apenas passa informações do usuário e status de autenticação

      // Podemos adicionar informações necessárias sobre o usuário
      if (token.user) {
        session.user = token.user;
      }

      // Adiciona informação se houver erro no refresh
      if (token.error) {
        session.error = token?.error;
      }

      // Opcional: adicionar quando o token expira para facilitar verificações no cliente
      session.tokenExpires = token?.accessTokenExpires;

      return session;
    },
  },
  pages: {
    signIn: "/auth/signin", // Página personalizada de login
    signOut: "/auth/signout", // Página personalizada de logout
    error: "/auth/error", // Página de erro
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
