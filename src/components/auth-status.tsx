"use client";

import { useSession, signIn } from "next-auth/react";

export function AuthStatus() {
  const { data: session, status, update } = useSession();

  const handleSignOut = async () => {
    console.log("session", session);
    console.log("status", status);

    const shouldRefreshTime =
      Math.floor(Math.floor(Date.now() / 1000)) >=
      ((session?.tokenExpires as number) || 0);

    console.log("shouldRefreshTime", shouldRefreshTime);

    if (shouldRefreshTime) {
      await update();
    }
    // Primeiro, desloga do NextAuth sem redirecionamento automático
    await fetch("/api/sair");
    // signOut({ redirect: false }).then(async () => {

    // });
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
    <div className="p-4 bg-gray-900 rounded-lg">
      <p className="mb-2">
        Autenticado como: <strong>{session?.user?.name}</strong>
      </p>
      <p className="mb-4">Email: {session?.user?.email}</p>
      <button
        onClick={() => handleSignOut()}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Sair
      </button>
    </div>
  );
}
