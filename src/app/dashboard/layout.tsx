"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`bg-slate-800 text-white transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-16"
        } flex-shrink-0`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900/50">
          {isSidebarOpen ? (
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="p-1 bg-white rounded-lg shadow-lg">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-white leading-tight">LMS Admin</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">គ្រប់គ្រងបណ្ណាល័យ</span>
              </div>
            </div>
          ) : (
            <div className="p-1 bg-white rounded-md shadow-md mx-auto">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-md hover:bg-slate-700 text-slate-400 transition-colors focus:outline-none"
          >
            {isSidebarOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>

        <nav className="mt-6 flex flex-col space-y-1">
          <NavItem
            href="/dashboard"
            label="ផ្ទាំងគ្រប់គ្រង"
            isOpen={isSidebarOpen}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
          />
          <NavItem 
            href="/dashboard/books" 
            label="សៀវភៅ" 
            isOpen={isSidebarOpen} 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.247 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
          />
          <NavItem 
            href="/dashboard/borrows" 
            label="ការខ្ចីសៀវភៅ" 
            isOpen={isSidebarOpen} 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
          />
          <NavItem 
            href="/dashboard/categories" 
            label="ប្រភេទនៃសៀវភៅ" 
            isOpen={isSidebarOpen} 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>}
          />
        </nav>

        <div className="absolute bottom-4 left-0 w-32 px-4">
          <button
            onClick={handleLogout}
            className={`flex items-center w-32 px-4 py-2 text-sm font-medium text-red-300 bg-red-900/20 rounded-md hover:bg-red-900/40 ${
              !isSidebarOpen && "justify-center"
            }`}
          >
            <span className={!isSidebarOpen ? "hidden" : "inline"}>ចេញពីប្រព័ន្ធ</span>
            <span className={isSidebarOpen ? "hidden" : "inline"}>⏻</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto h-screen">{children}</main>
    </div>
  );
}

function NavItem({
  href,
  label,
  isOpen,
  icon,
}: {
  href: string;
  label: string;
  isOpen: boolean;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center px-6 py-3 text-white hover:bg-slate-700 transition-colors ${
        !isOpen && "justify-center"
      }`}
    >
      <div className="flex-shrink-0">{icon}</div>
      <span className={!isOpen ? "hidden" : "ml-4 font-medium"}>{label}</span>
    </Link>
  );
}
