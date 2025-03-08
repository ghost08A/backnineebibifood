import { NextRequest, NextResponse } from "next/server";
import jwt,{ JwtPayload } from "jsonwebtoken";

//Retrieves the Authorization header from the request.
export async function verifyToken(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");

//Checks if the Authorization header exists.
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null; 
  }

//Extracts the token from the Authorization header.
  const token = authHeader.split(" ")[1];

//Verifies the token using the JWT_SECRET and returns the decoded payload. 
  try {
    const decoded = jwt.verify(token, process.env.BCRYPT_SALT!) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}