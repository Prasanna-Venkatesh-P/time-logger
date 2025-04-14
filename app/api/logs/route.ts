import { NextResponse } from "next/server";
import supabase from "@/lib/db";
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

// UPDATED: Modified getUserId to create a client with the token header and removed setSession
async function getUserId(req: Request): Promise<{ userId: string | null, client: SupabaseClient }> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return { userId: null, client: createClient(supabaseUrl, supabaseAnonKey) };
  const token = authHeader.split(" ")[1];
  if (!token) return { userId: null, client: createClient(supabaseUrl, supabaseAnonKey) };

  // Create a new Supabase client with the token in the global headers so that RLS policies can detect the correct user.
  const supabaseWithAuth = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
    },
  });
  
  // Retrieve the user via the new client instance.
  const { data: { user }, error } = await supabaseWithAuth.auth.getUser();
  if (error || !user) return { userId: null, client: supabaseWithAuth };
  return { userId: user.id, client: supabaseWithAuth };
}

// GET /api/logs - Retrieve logs for the authenticated user
export async function GET(req: Request) {
  // UPDATED: Use the new client from getUserId for RLS
  const { userId, client } = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await client
    .from("logs")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ message: "Error fetching logs", error }, { status: 500 });
  }

  return NextResponse.json({ logs: data });
}

// POST /api/logs - Create a new log for the authenticated user
export async function POST(req: Request) {
  // UPDATED: Use the new client from getUserId for RLS
  const { userId, client } = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { activity } = await req.json();
  if (!activity) {
    return NextResponse.json({ message: "Missing log activity" }, { status: 400 });
  }

  const { data, error } = await client
    .from("logs")
    .insert([{ user_id: userId, activity }])
    .select();

  if (error) {
    return NextResponse.json({ message: "Error saving log", error }, { status: 500 });
  }

  return NextResponse.json({ log: data }, { status: 201 });
}

// DELETE /api/logs - Delete a specific log for the authenticated user
export async function DELETE(req: Request) {
  const { userId, client } = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ message: "Missing log ID" }, { status: 400 });
  }

  const { error } = await client
    .from("logs")
    .delete()
    .match({ id, user_id: userId });

  if (error) {
    return NextResponse.json({ message: "Error deleting log", error }, { status: 500 });
  }

  return NextResponse.json({ message: "Log deleted successfully" });
}

