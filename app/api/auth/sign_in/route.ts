import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs";

// The function extracts user input (name, email, address, phone, password) from the request body.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json(); // อ่าน JSON จาก Request
    const { name, email, address, phone, password } = body;

//Ensures that all required fields are present.
    if (!name || !email || !address || !phone || !password) {
      return NextResponse.json(
        { error: "Missing required fields: id, name, email, address, phone, password" },
        { status: 400 }
      );
    }

//bcrypt.hash() is used to hash the password before storing it in the database.
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS!));
     
    //Inserts the new user data into the "user" table in Supabase.
    const { data, error } = await supabase.from("user").insert([
      {  name, email, address, phone, password: hashedPassword },
    ]).select("*"); 

//If there's a database error, it returns 500 Internal Server Error with the error message.
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
//If the user is successfully created, the response includes a success message and user data.
    return NextResponse.json({ message: "User created successfully", data }, { status: 201 });
  } 
//If the request body is not in a valid JSON format, it returns 400 Bad Request.
  catch (error) {
    return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
  }
}


