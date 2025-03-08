import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { verifyToken } from "@/app/api/auth/middleware";
import { JwtPayload } from "jsonwebtoken";

export async function PUT(req: NextRequest) {
  try {
   // Calls verifyToken(req) to extract and verify the JWT token.
    const decoded = await verifyToken(req);
  //If the token is invalid or missing, it returns 401 Unauthorized.
    if (!decoded || typeof decoded === "string" || !(decoded as JwtPayload).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
//Extracts the userId from the decoded JWT payload.
    const userId = (decoded as JwtPayload).id;

//Parses the request body to extract the updated user details (name, address, phone).
    const body = await req.json();
    const { name, address, phone } = body;

//If no fields are provided, it returns a 400 Bad Request.
    if (!name && !address && !phone) {
      return NextResponse.json({ error: "No data to update" }, { status: 400 });
    }

  //Updates the "user" table in Supabase, setting the new values where id matches userId.
    const { data, error } = await supabase
      .from("user")
      .update({ name, address, phone })
      .eq("id", userId)
      .select("*");

//If there is a database error, it returns a 500 Internal Server Error.
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
//If the update is successful, it returns 200 OK with the updated user details.
    return NextResponse.json({ message: "Update successful", data }, { status: 200 });
  } 
//Catches JSON format errors and returns 400 Bad Request.
  catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
