import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

//The function queries the "shop" table in Supabase to fetch all shops.
export async function GET() {
  const { data, error } = await supabase.from("shop").select("*");
//If there's a database error, it returns 500 Internal Server Error with the error message.
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
//If successful, it returns all shops in 200.
  return NextResponse.json(data, { status: 200 });
}
