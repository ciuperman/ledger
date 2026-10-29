import { useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res =
      mode === "in"
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ email, password, name: name || email });
    setBusy(false);
    if (res.error) {
      setError(res.error.message ?? "Eroare la autentificare");
      return;
    }
    window.location.href = "/";
  }

  const input =
    "w-full rounded-md border border-white/20 bg-transparent px-3 py-2 outline-none focus:border-white/50";
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-3">
        <h1 className="text-xl font-semibold">{mode === "in" ? "Autentificare" : "Cont nou"}</h1>
        {mode === "up" && (
          <input className={input} placeholder="Nume" value={name} onChange={(e) => setName(e.target.value)} />
        )}
        <input className={input} type="email" required placeholder="Email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className={input} type="password" required minLength={8} placeholder="Parolă (min. 8)" autoComplete={mode === "in" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={busy} className="w-full cursor-pointer rounded-md bg-white px-4 py-2 font-medium text-black disabled:opacity-60">
          {busy ? "…" : mode === "in" ? "Intră" : "Creează cont"}
        </button>
        <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="w-full cursor-pointer text-sm opacity-70 hover:underline">
          {mode === "in" ? "Cont nou (doar cu invitație)" : "Ai deja cont? Intră"}
        </button>
      </form>
    </main>
  );
}
