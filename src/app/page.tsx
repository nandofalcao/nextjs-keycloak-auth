import { AuthStatus } from "@/components/auth-status";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Next.js com Keycloak Auth</h1>

      <div className="w-full max-w-md">
        <AuthStatus />
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          Este projeto demonstra a integração do Next.js com Keycloak usando
          NextAuth.js
        </p>
      </div>
    </main>
  );
}
