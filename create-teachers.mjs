import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://amipfuzkyxvtedxgnuru.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtaXBmdXpreXh2dGVkeGdudXJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzk1Nzk0OSwiZXhwIjoyMDczNTMzOTQ5fQ.s1q8KT84JkXVlakj62PPH-T4HAFY7ovDFbScUXFNUx8";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

function parseCSV(path) {
  const raw = fs.readFileSync(path, "utf8");

  const lines = raw
    .replace(/^\uFEFF/, "") // BOM am Dateianfang entfernen
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  const headers = lines[0].split(",").map(h => h.trim().toLowerCase());

  const nameIndex = headers.indexOf("name");
  const emailIndex = headers.indexOf("email");

  if (nameIndex === -1 || emailIndex === -1) {
    console.log("Gelesene Header:", headers);
    throw new Error("CSV muss exakt die Header name,email enthalten.");
  }

  return lines.slice(1).map((line, i) => {
    const cols = line.split(",").map(c => c.trim());

    if (!cols[nameIndex] || !cols[emailIndex]) {
      throw new Error(`Fehler in CSV-Zeile ${i + 2}: ${line}`);
    }

    return {
      name: cols[nameIndex],
      email: cols[emailIndex].toLowerCase(),
    };
  });
}

async function run() {
  const teachers = parseCSV("./teachers-test.csv");

  for (const teacher of teachers) {
    console.log("Verarbeite:", teacher.email);

    const { data: teacherRow } = await supabase
      .from("teachers")
      .select("*")
      .eq("email", teacher.email)
      .single();

    if (!teacherRow) {
      console.log("Nicht gefunden:", teacher.email);
      continue;
    }

    let userId;

    const { data, error } = await supabase.auth.admin.createUser({
      email: teacher.email,
      password: "Start123!",
      email_confirm: true,
      user_metadata: {
        role: "teacher",
        full_name: teacher.name
      }
    });

    if (error) {
      console.log("User existiert wahrscheinlich schon:", teacher.email);

      // bestehenden User holen
      const { data: usersData } = await supabase.auth.admin.listUsers();

      const existingUser = usersData.users.find(
        (u) => u.email === teacher.email
      );

      if (!existingUser) {
        console.log("User nicht gefunden trotz Fehler:", teacher.email);
        continue;
      }

      userId = existingUser.id;
    } else {
      userId = data.user.id;
    }

    // teachers Tabelle verknüpfen
    await supabase
      .from("teachers")
      .update({ auth_id: userId })
      .eq("email", teacher.email);

    // 🔥 Rolle setzen
const { error: profileError } = await supabase
  .from("profiles")
  .upsert(
    {
      id: userId,
      role: "teacher",
      full_name: teacher.name
    },
    { onConflict: "id" }
  );

if (profileError) {
  console.log("PROFILE ERROR:", profileError.message);
  continue;
}

    console.log("OK:", teacher.email);
  }

  console.log("Fertig");
}

run();