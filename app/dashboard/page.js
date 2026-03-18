"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        // 👤 User holen
        const {
          data: { user },
          error: userErr,
        } = await supabase.auth.getUser();
        if (userErr) throw userErr;
        if (!user) throw new Error("Nicht angemeldet.");
        if (!alive) return;
        setUser(user);

        // 🧩 Rolle aus profiles lesen
        const { data: profile, error: profErr } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (profErr) throw profErr;
        if (!profile) throw new Error("Kein Profil gefunden (profiles).");
        if (!alive) return;

        setRole(profile.role);

        // 🚀 Automatische Weiterleitung nach Rolle
        if (profile.role === "admin") {
          router.replace("/admin");
        } else if (profile.role === "teacher") {
          router.replace("/teacher");
        } else if (profile.role === "student") {
          router.replace("/student");
        } else {
          throw new Error("Unbekannte Rolle.");
        }
      } catch (e) {
        if (alive) setErr(e.message || "Unbekannter Fehler.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [router]);

  if (loading)
    return <p className="text-center mt-10 text-white">Lade…</p>;
  if (err)
    return <p className="text-center mt-10 text-red-400">{err}</p>;

  // Fallback falls Redirect kurz verzögert
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1020] text-white">
      <div className="bg-white/10 p-6 rounded-xl shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-2">Weiterleitung…</h1>
        <p>Bitte einen Moment Geduld.</p>
      </div>
    </div>
  );
}
