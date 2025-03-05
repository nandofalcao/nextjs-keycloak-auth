"use client";

import { dateNow } from "@/utils/date";
import { useSession, signIn, signOut } from "next-auth/react";

export function AuthStatus() {
  const { data: session, status, update } = useSession();

  const handleRefreshToken = async () => {
    const shouldRefreshTime =
      dateNow() >= ((session?.tokenExpires as number) || 0);

    console.log("session", session);
    console.log("dateNow", dateNow());
    console.log("tokenExpires", (session?.tokenExpires as number) || 0);
    console.log("shouldRefreshTime", shouldRefreshTime);

    if (shouldRefreshTime) {
      // Atualiza a sessão
      await update();
    }

    await fetch("/api/refresh");
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
  };

  if (status === "loading") {
    return <div>Carregando...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="p-4 bg-gray-900 rounded-lg">
        <p className="mb-4">Você não está autenticado</p>
        <button
          onClick={() => signIn("keycloak")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Entrar com Keycloak
        </button>
      </div>
    );
  }

  return (
    // button space x no in start and and
    <div className="p-4 bg-gray-900 rounded-lg ">
      <div>
        <p className="mb-2 d-block">
          Autenticado como: <strong>{session?.user?.name}</strong>
        </p>
        <p className="mb-4">Email: {session?.user?.email}</p>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => handleRefreshToken()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh Token
        </button>
        <button
          onClick={() => handleSignOut()}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mr-3"
        >
          Sair
        </button>
      </div>
    </div>
  );
}
