import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";



//The function extracts the shop ID from the request URL.
export async function GET(req: NextRequest, {params}: {params: Promise<{id: string}>}) {
  
//Uses context.params to get the id parameter.
  const id = (await params).id;

//Checks if the shop ID exists in the request parameters.
  if (!params || !id) {
    return NextResponse.json({ error: "Missing shop ID" }, { status: 400 });
  }

  //Parses the shop ID as an integer using parseInt().
  const shopId = parseInt(id, 10);

  console.log("ID ร้านค้า:", shopId);

//If the shop ID is not a valid number, it returns 400 Bad Request.
  if (isNaN(shopId)) {
    return NextResponse.json({ error: "Invalid shop ID" }, { status: 400 });
  }

  //Queries the "product" table in Supabase.
  const { data, error } = await supabase
    .from("product")
    .select("*")
    .eq("id_shop", shopId);

  //If there's a database error, return 500 Internal Server Error.
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
//If no products are found in the shop, return 404 Not Found.
  if (!data || data.length === 0) {
    return NextResponse.json({ error: "No products found in this shop" }, { status: 404 });
  }
//If successful, returns the list of products for the specified shop with a 200 OK response.
  return NextResponse.json(data, { status: 200 });
}



