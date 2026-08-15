import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OnboardingForm from "./onboarding-form";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("users_profile")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  const { data: rutina } = await supabase
    .from("user_routines")
    .select("id")
    .eq("id_usuario", user.id)
    .limit(1)
    .maybeSingle();

  if (perfil && rutina) redirect("/dashboard");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <OnboardingForm />
      </div>
    </main>
  );
}