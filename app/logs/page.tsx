"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { exportToCSV } from "@/utils/exportToCsv";
import { toast } from "react-toastify";

export default function LogsPage() {
  const [logs, setLogs] = useState<{ id: string; activity: string; created_at:Date }[]>([]);
  const [newLog, setNewLog] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchLogs(token);
  }, []);

  const fetchLogs = async (token: string) => {
    const res = await fetch("/api/logs", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    if (res.status === 401) {
      alert("Your session has expired. Please log in again.");
      router.push("/login");
      return;
    }

    if (!res.ok) {
      setError("Failed to fetch logs.");
      return;
    }

    const data = await res.json();
    setLogs(data.logs);
  };

  const handleAddLog = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ activity: newLog }),
    });

    if (res.status === 401) {
      alert("Your session has expired. Please log in again.");
      router.push("/login");
      return;
    }

    if (!res.ok) {
      setError("Failed to add log.");
      return;
    }

    setNewLog("");
    fetchLogs(token); // Refresh logs
  };

  const handleDelete = async (logId: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/logs", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id: logId }),
    });
  
    if (res.ok) {
      setLogs((prev) => prev.filter((log) => log.id !== logId));
    }
  };
  

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50">
      {/* Header */}
      <header className="w-full bg-white bg-opacity-95 shadow-sm py-4 px-6 flex justify-between items-center fixed top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-800">TimeLogger</h1>
        
        <div className="flex space-x-4">
          <button
            onClick={() => router.push('/')}
            className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-md shadow-lg transition-colors focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Back to Home
          </button>
          <button 
            onClick={() => { 
              localStorage.removeItem("token"); 
              router.push("/login"); 
            }}
            className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-md shadow-lg transition-colors focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Logout
          </button>
        </div>
      </header>
  
      {/* Main Content */}
      <div className="pt-24 px-34">  {/* Increased from pt-16 to pt-24 */}
        {/* Heading */}
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8 mt-4">Your Logs</h2>
        {/* Input */}
        <div className="flex gap-4 mb-6">
          <input 
            type="text" 
            placeholder="New log..." 
            value={newLog} 
            onChange={(e) => setNewLog(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddLog()}  
            className="flex-1 p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-gray-800 placeholder-gray-400"
          />
          <button 
            onClick={handleAddLog}
            disabled={!newLog.trim()} 
            className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
            Add Log
          </button>
          <button
            onClick={() => exportToCSV(logs, "my-logs.csv")}
            className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Download Logs
          </button>
        </div>
  
        {/* Log Items */}
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="flex flex-wrap items-center justify-between p-4 bg-white bg-opacity-95 rounded-lg shadow-md gap-2">
              {/* Activity Column */}
              <div className="min-w-[50%] flex-1 break-words">
                <span className="text-gray-800">
                  {log.activity}
                </span>
              </div>
            
              {/* DateTime + Delete Container */}
              <div className="flex items-center gap-3">
                {/* DateTime Column */}
                <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                  <span>
                    {new Date(log.created_at + "Z").toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  <span>•</span>
                  <span>
                    {new Date(log.created_at + "Z").toLocaleDateString([], { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
            
                {/* Delete Button */}
                <button 
                  onClick={() => handleDelete(log.id)}
                  className="text-rose-600 hover:text-rose-700 text-sm whitespace-nowrap transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
  
        {/* Error */}
        {error && <p className="mt-6 text-rose-600 text-center">{error}</p>}
      </div>
    </div>
  );
}