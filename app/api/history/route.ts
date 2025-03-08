import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { verifyToken } from "@/app/api/auth/middleware";
import { JwtPayload } from "jsonwebtoken";

export async function GET(req: NextRequest) {
//verifyToken(req): Extracts and verifies the JWT token from the request headers.
    const decoded = await verifyToken(req);
    console.log("✅ Decoded Token:", decoded);

//If the token is invalid or missing, it returns a 401 Unauthorized response.
    if (!decoded || typeof decoded === "string" || !("id" in decoded)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

//Extracts userId from the decoded JWT token.
    const userId = (decoded as JwtPayload).id;
    console.log("🔹 User ID:", userId);

//Queries the "receipt" table in Supabase to fetch user's order history.
    const { data, error } = await supabase
        .from("receipt")
        .select("*")
        .eq("id_user", userId);  
//If there’s an error, it returns a 500 Internal Server Error.
    if (error) {
        console.error("Supabase Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

//If successful, it returns all order history in 200.
    return NextResponse.json(data, { status: 200 });
}


export async function POST(req: NextRequest) {
    try {
        //Verifies the JWT token.
        const decoded = await verifyToken(req);
        if (!decoded || typeof decoded === "string" || !("id" in decoded)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = (decoded as JwtPayload).id;
        console.log(" User ID:", userId);

        //Extracts order details from the request body
        const { shop_name, detail, option, eco_option } = await req.json();

      //If required fields are missing, returns 400 Bad Request.
        if (!shop_name || !detail || !Array.isArray(detail)) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        //Inserts a new order into the receipt table.
        const { data, error } = await supabase
            .from("receipt")
            .insert([
                {
                    id_user: userId,
                    shop_name: shop_name,
                    detail: detail,  // JSON
                    option: option || 0,  
                    eco_option: eco_option ?? false, 
                }
            ])
            .select("*");

//If a database error occurs, it returns 500 Internal Server Error.
        if (error) {
            console.error("Supabase Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
//If successful, it returns 201 Created with order details.
        return NextResponse.json({ message: "Order created successfully", data }, { status: 201 });
    } 
//Catches invalid JSON format errors and returns 400 Bad Request.
    catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
    }
}
