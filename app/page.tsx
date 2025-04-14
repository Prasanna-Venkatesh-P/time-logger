'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();
  // ADDED: State to store user email from localStorage.
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [newLog, setNewLog] = useState<string>("");
  const [error, setError] = useState("");
  // ADDED: On mount, check for token and email in localStorage.
  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    if (token && email) {
      setUserEmail(email);
    }
  }, []);

  // Added the handleAddLog function 
  const handleAddLog = async () => {
    const token = localStorage.getItem("token");
    if (!token || !newLog.trim()) return;
    const res = await fetch("/api/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ activity: newLog }),
    });
  
    if (res.ok) {
      setNewLog(""); // clear input on success
      // alert("Log added successfully!");
    } else {
      setError("Failed to add log.");
    }
  };

  // ADDED: Logout handler removes token & email, and then routes to login.
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setUserEmail(null);
    router.push("/login");
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50">
      {/* Header */}
      <header className="w-full bg-white bg-opacity-95 shadow-sm py-4 px-6 flex justify-between items-center fixed top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-800">TimeLogger</h1>
        {userEmail && (
          <div className="flex space-x-4">
            <Button 
              onClick={() => router.push('/logs')}
              className="bg-slate-600 hover:bg-slate-700 text-white"
            >
              View Your Logs
            </Button>
            <Button 
              onClick={handleLogout}
              className="bg-slate-600 hover:bg-slate-700 text-white"
            >
              Logout
            </Button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="w-full max-w-md px-4 pb-8 mt-48 md:mt-42">
        {userEmail ? (
          // ADDED: Logged-in view: welcome message + logout button.
          <div className="flex flex-col items-center bg-white bg-opacity-95 rounded-lg shadow-md p-8 w-full">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Welcome {userEmail.split('@')[0]}</h1>
            <div className="space-y-4 w-full">
              <input
                type="text"
                value={newLog}
                onChange={(e) => setNewLog(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddLog()} 
                placeholder="Enter your log..."
                className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-gray-800 placeholder-gray-400"
              />
              <Button 
                onClick={handleAddLog} 
                disabled={!newLog.trim()}
                className={`w-full bg-slate-600 hover:bg-slate-700 text-white px-4 py-3 rounded-lg shadow focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors ${
                  !newLog.trim() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Add Log
              </Button>
              {error && <p className="text-rose-600 text-center">{error}</p>}
            </div>
          </div>
        ) : (
          // Original view for users not logged in.
          <div className="flex flex-col items-center bg-white bg-opacity-95 rounded-lg shadow-md p-8 w-full">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Welcome</h1>
            <div className="space-y-4 w-full">
              <Button 
                onClick={() => router.push('/login')}
                className="w-full bg-slate-600 hover:bg-slate-700 text-white py-3 rounded-lg focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                Login/Signup
              </Button>
              <Button 
                onClick={() => router.push('/logs')}
                className="w-full bg-slate-600 hover:bg-slate-700 text-white py-3 rounded-lg focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                View Your Logs
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}