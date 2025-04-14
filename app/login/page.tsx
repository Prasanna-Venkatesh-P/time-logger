"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.status === 401) {
      alert("Your session has expired. Please log in again.");
      router.push("/login");
      return;
    }

    if (!res.ok) {
      setError(data.message);
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("email", email);
    router.push("/"); // Redirect to logs page after login
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="w-full bg-white bg-opacity-95 shadow-sm py-4 px-6 flex justify-between items-center fixed top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-800">TimeLogger</h1>
      </header>

      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white bg-opacity-95 rounded-lg shadow-md p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Login</h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
              className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-gray-800 placeholder-gray-400"
            />
            
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
              className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-gray-800 placeholder-gray-400"
            />
            
            <button 
              type="submit"
              className="w-full bg-slate-600 hover:bg-slate-700 text-white p-3 rounded-lg transition-colors focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              Login
            </button>
          </form>

          {error && <p className="mt-4 text-rose-600 text-center">{error}</p>}
          
          <p className="mt-6 text-center text-gray-800">
            Don't have an account?{' '}
            <a href="/signup" className="text-slate-600 hover:text-slate-700 transition-colors">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}