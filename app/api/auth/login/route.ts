import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyToken } from "@/app/api/auth/middleware";
import { JwtPayload } from "jsonwebtoken";


//The function extracts the token from the request and verifies it using verifyToken(req).
export async function GET(req: NextRequest) {
  const decoded = await verifyToken(req); 
  console.log("✅ Decoded Token:", decoded);

//If the token is invalid or missing, it returns a 401 Unauthorized response. 
  if (!decoded || typeof decoded === "string" || !(decoded as JwtPayload).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  //Extracts userId from the decoded JWT token.
  const userId = (decoded as JwtPayload).id;

  //Queries the "user" table in Supabase to fetch user details using userId.
  const { data, error } = await supabase
    .from("user")
    .select("*")
    .eq("id", userId)
    .single();

  //If there’s an error, it returns a 500 Internal Server Error
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}

//Reads the JSON body from the request, extracting email and password
export async function POST(req: NextRequest) {
  try {
    const body = await req.json(); 
    const { email, password } = body;

   
// Ensures that both email and password are provided. If missing, returns 400 Bad Request.
    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing 'email' or 'password'" },
        { status: 400 }
      );
    }

//Queries the "user" table to find a user matching the given email.
    const { data: users, error } = await supabase
      .from("user")
      .select("id, name, email, password")
      .eq("email", email)
      .limit(1);

//If no user is found or there's an error, it returns 401 Unauthorized.
    if (error || !users || users.length === 0) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

//Compares the entered password with the hashed password stored in the database using bcrypt.compare().
    const user = users[0]; 
    const passwordMatch = await bcrypt.compare(password, user.password);
//If the password is incorrect, it returns 401 Unauthorized.
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

//Creates a JWT token containing user information (id, email, name).
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.BCRYPT_SALT!,
      { expiresIn: "7d" } // Token 7 day
    );
//If login is successful, it returns a JSON response with the token and user data.
    return NextResponse.json({ message: "Login successful", token, user }, { status: 200 });
  } 
//If the request body has an invalid JSON format, it returns a 400 Bad Request.
  catch (error) {
    return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
  }
}
