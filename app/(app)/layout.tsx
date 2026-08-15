import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppNav from "./app-nav";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: rutinas } = await supabase
    .from("user_routines")
    .select("dia")
    .eq("id_usuario", user.id)
    .order("created_at", { ascending: true })
    .limit(1);

  const primerDia = rutinas?.[0]?.dia ?? null;
  const primerDiaSlug = primerDia ? primerDia.toLowerCase().replace(/\s+/g, "-") : null;

  return (
    <div className="flex min-h-full flex-col pb-16">
      <div className="flex-1">{children}</div>
      <AppNav primerDiaSlug={primerDiaSlug} />
    </div>
  );
}
