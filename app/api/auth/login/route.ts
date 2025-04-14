import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import supabase from "@/lib/db";

const SECRET_KEY = process.env.JWT_SECRET || "your_jwt_secret";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // Check for errors or missing user information
  if (error || (!data.user && !data.session?.user)) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  // Extract the user from either data.user or data.session.user
  const user = data.user || data.session?.user;
  const token = data.session.access_token;
  
  return NextResponse.json({ token }, { status: 200 });
}
