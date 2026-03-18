"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();

  const emailRef = useRef(null);
  const pwRef = useRef(null);
  const formRef = useRef(null);

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [capsOn, setCapsOn] = useState(false);

  const ALLOWED_DOMAIN = "@gy-cfg.de";

  useEffect(() => {
  let unsub = null;

  (async () => {
    const { data } = await supabase.auth.getSession();
    if (data?.session) router.replace("/dashboard");

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace("/dashboard");
    });

    unsub = listener?.subscription;
  })();

  return () => {
    unsub?.unsubscribe?.();
  };
}, [router]);


  useEffect(() => {
    function checkCapsLock(e) {
      if (e?.getModifierState) {
        setCapsOn(e.getModifierState("CapsLock"));
      }
    }

    window.addEventListener("keydown", checkCapsLock);
    window.addEventListener("keyup", checkCapsLock);

    const pwEl = pwRef?.current || document.getElementById("password");
    if (pwEl) pwEl.addEventListener("focus", checkCapsLock);

    return () => {
      window.removeEventListener("keydown", checkCapsLock);
      window.removeEventListener("keyup", checkCapsLock);
      if (pwEl) pwEl.removeEventListener("focus", checkCapsLock);
    };
  }, []);

  const handlePwKey = (e) => {
    const caps = e.getModifierState && e.getModifierState("CapsLock");
    setCapsOn(!!caps);
  };

  const mapAuthError = (msg = "") => {
    const m = msg.toLowerCase();
    if (m.includes("invalid login") || m.includes("invalid credentials"))
      return "E-Mail oder Passwort ist falsch.";
    if (m.includes("email not confirmed"))
      return "E-Mail ist noch nicht bestätigt. Bitte Postfach prüfen.";
    if (m.includes("over quota") || m.includes("rate limit"))
      return "Zu viele Versuche. Bitte kurz warten und erneut probieren.";
    return "Anmeldung fehlgeschlagen. Bitte Eingaben prüfen.";
  };

  const validate = () => {
    const eLower = email.trim().toLowerCase();
    if (!eLower) {
      setErr("Bitte E-Mail eingeben.");
      emailRef.current?.focus();
      return false;
    }
    if (!eLower.endsWith(ALLOWED_DOMAIN)) {
      setErr(`Nur E-Mails mit ${ALLOWED_DOMAIN} erlaubt.`);
      emailRef.current?.focus();
      return false;
    }
    if (!pw) {
      setErr("Bitte Passwort eingeben.");
      pwRef.current?.focus();
      return false;
    }
    setErr("");
    return true;
  };

  async function onSubmit(e) {
    e.preventDefault();
    if (loading) return;
    if (!validate()) {
      formRef.current?.classList.remove("shake");
      formRef.current?.offsetWidth;
      formRef.current?.classList.add("shake");
      return;
    }

    setLoading(true);
    const eLower = email.trim().toLowerCase();

    const { error } = await supabase.auth.signInWithPassword({
      email: eLower,
      password: pw,
    });

    setLoading(false);

    if (error) {
      const nice = mapAuthError(error.message);
      setErr(nice);
      formRef.current?.classList.remove("shake");
      formRef.current?.offsetWidth;
      formRef.current?.classList.add("shake");

      if (nice.toLowerCase().includes("passwort")) pwRef.current?.focus();
      else emailRef.current?.focus();
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="fixed inset-0 bg-[var(--bg)] text-slate-100 overflow-hidden">
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-[var(--primary-2)] via-teal-500 to-[var(--primary)] opacity-20 orb orb2" />

      <div className="h-full grid md:grid-cols-2 rounded-none overflow-hidden border border-white/10 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)]">
{/* Linke Spalte */}
<div className="relative hidden md:flex items-center justify-center bg-gradient-to-r from-[#0b1020] to-[#0b1020]/80 overflow-hidden">
  {/* Orb jetzt innerhalb der linken Spalte → sichtbar */}
<div className="pointer-events-none absolute -top-64 -left-64 h-[32rem] w-[32rem]
                rounded-full bg-gradient-to-br from-[var(--brand-primary)]/85 to-[var(--brand-accent)]/25
                opacity-35 blur-[130px] z-0" />



  {/* Logo-Bild + Overlay liegen über dem Orb */}
  <img
    src="/login.png"
    alt="Login Visual"
    className="relative z-10 max-h-[334px] w-auto filter brightness-[1.15] contrast-[1.2]"
  />
  <div className="absolute inset-0 bg-black/10 z-10" />

  <div className="absolute bottom-8 left-8 text-white z-20">
    <h2 className="text-2xl font-bold tracking-tight">Workshopwahl {new Date().getFullYear()}</h2>
    <p className="text-sm opacity-80">Gymnasium CFG</p>
  </div>
</div>


        <div className="relative bg-white/5 backdrop-blur-xl flex items-center justify-center px-4 py-10">
          <form
            ref={formRef}
            onSubmit={onSubmit}
            aria-busy={loading}
            aria-live="polite"
            className="w-full max-w-[420px] rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl 
            shadow-[0_8px_40px_-10px_rgba(0,0,0,0.6)] transition-transform duration-300 p-6 sm:p-8 space-y-6"
            noValidate
            aria-describedby={err ? "form-error" : undefined}
          >
            <header className="space-y-2">
              <h1 className="text-[26px] leading-7 font-bold text-white tracking-[0.04em]">
                Anmeldung
              </h1>
              <p className="text-slate-300 text-sm">
                Melde dich mit deiner Schul-E-Mail{" "}
                <span className="font-medium text-white/95">@gy-cfg.de</span> an.
              </p>
            </header>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-200"
              >
                E-Mail
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 6h16v12H4z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="m4 7 8 6 8-6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </span>

                <input
                  id="email"
                  name="fakeemail"
                  ref={emailRef}
                  type="text"
                  inputMode="email"
                  placeholder="name@gy-cfg.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="new-email"
                  className="w-full text-base rounded-lg bg-white/5 text-white placeholder:text-slate-400
                     border border-white/10 pl-10 pr-3 py-2 shadow-inner
                     focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb40]
                     transition"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-200"
              >
                Passwort
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <rect
                      x="5"
                      y="10"
                      width="14"
                      height="10"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M8 10V8a4 4 0 1 1 8 0v2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </span>

                <input
                  id="password"
                  name="password"
                  ref={pwRef}
                  type={showPw ? "text" : "password"}
                  placeholder="Passwort"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  onKeyDown={handlePwKey}
                  onKeyUp={handlePwKey}
                  onFocus={handlePwKey}
                  required
                  autoComplete="current-password"
                  aria-invalid={Boolean(err)}
                  className="w-full text-base rounded-lg bg-white/5 text-white placeholder:text-slate-400
                     border border-white/10 pl-10 pr-10 py-2 shadow-inner
                     outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--ring)]
                     transition"
                />

                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 
                     text-slate-300 hover:text-white hover:bg-white/10 transition"
                  aria-label={showPw ? "Passwort verbergen" : "Passwort anzeigen"}
                  title={showPw ? "Passwort verbergen" : "Passwort anzeigen"}
                >
                  {showPw ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 3l18 18"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 3-3c0-.5-.12-.98-.34-1.4M21 12s-3.5-6-9-6-9 6-9 6a16.8 16.8 0 0 0 4.18 4.26"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M21 12s-3.5-6-9-6-9 6-9 6 3.5 6 9 6 9-6 9-6Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {capsOn && (
                <p className="text-xs text-[var(--primary-2)] mt-1">
                  Hinweis: Feststelltaste ist aktiviert.
                </p>
              )}
            </div>

            {err && (
              <p
                id="form-error"
                role="alert"
                aria-live="assertive"
                className="text-red-300 text-sm bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2"
              >
                {err}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-2)]
                 text-white font-semibold py-3 shadow-lg transition
                 hover:from-[#1f4fd8] hover:to-[#19bfd6] disabled:opacity-60 disabled:cursor-not-allowed
                 cursor-pointer"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading && (
                  <span
                    className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent"
                    aria-hidden="true"
                  />
                )}
                {loading ? "Anmelden…" : "Anmelden"}
              </span>

              <span className="pointer-events-none absolute inset-0 translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </button>

            <div className="pt-2 text-center text-xs text-slate-400">
              © {new Date().getFullYear()} gy-cfg.de
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
