"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { getBooks } from "@/lib/firestore";
import { getBorrowHistory } from "@/lib/borrowService";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalStock: 0,
    lowStock: 0,
    totalDamaged: 0,
  });
  const [borrowData, setBorrowData] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Fetch Books Stats
        const books = await getBooks();
        const totalBooks = books.length;
        const totalStock = books.reduce((acc, book) => acc + book.availableStock, 0);
        const lowStock = books.filter((book) => book.availableStock < 5).length;
        const totalDamaged = books.reduce((acc, book) => acc + (book.damagedStock || 0), 0);
        setStats({ totalBooks, totalStock, lowStock, totalDamaged });

        // 2. Fetch Borrow History for Graph
        const history = await getBorrowHistory();
        
        // Group by date (last 7 days)
        const last7Days: { [key: string]: number } = {};
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          last7Days[dateStr] = 0;
        }

        history.forEach(record => {
          const dateStr = record.borrowDate.split('T')[0];
          if (last7Days[dateStr] !== undefined) {
            last7Days[dateStr] += record.qty;
          }
        });

        const formattedGraphData = Object.entries(last7Days).map(([date, count]) => ({
          date: new Date(date).toLocaleDateString('km-KH', { day: '2-digit', month: 'short' }),
          count
        }));

        setBorrowData(formattedGraphData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col space-y-1">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">ផ្ទាំងគ្រប់គ្រង</h1>
        <p className="text-slate-500 font-medium">ស្ថិតិបច្ចុប្បន្ននៃបណ្ណាល័យរបស់អ្នក</p>
      </header>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="ចំនួនសៀវភៅសរុប" 
          value={stats.totalBooks} 
          loading={loading}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.247 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard 
          label="សៀវភៅក្នុងស្តុក" 
          value={stats.totalStock} 
          loading={loading}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard 
          label="សល់ស្តុកតិច" 
          value={stats.lowStock} 
          loading={loading}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
          color="bg-amber-50 text-amber-600"
        />
        <StatCard 
          label="សៀវភៅខូច" 
          value={stats.totalDamaged} 
          loading={loading}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
          color="bg-rose-50 text-rose-600"
        />
      </div>

      {/* Borrow History Graph Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-none mb-1">និន្នាការនៃការខ្ចីសៀវភៅ</h2>
            <p className="text-sm text-slate-500">ចំនួនសៀវភៅដែលបានខ្ចីក្នុងរយៈពេល ៧ ថ្ងៃចុងក្រោយ</p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>ចំនួនខ្ចី</span>
          </div>
        </div>

        {/* Custom Bar Graph */}
        <div className="flex items-end justify-between h-64 px-4 border-b border-slate-100 pb-2">
          {borrowData.map((item, idx) => {
            const maxVal = Math.max(...borrowData.map(d => d.count), 1);
            const heightPerc = (item.count / maxVal) * 100;
            return (
              <div key={idx} className="flex flex-col items-center group w-full max-w-[60px]">
                <div 
                  className="w-full bg-blue-600/10 group-hover:bg-blue-600 rounded-t-xl transition-all duration-300 relative flex justify-center"
                  style={{ height: `${heightPerc}%`, minHeight: '4px' }}
                >
                  <span className="absolute -top-8 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item.count} នាក់
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-tighter truncate w-full text-center">
                  {item.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, loading, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-start justify-between group hover:shadow-md transition-all duration-300">
      <div>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">
          {label}
        </h3>
        <p className="text-4xl font-black text-slate-900">
          {loading ? "..." : value}
        </p>
      </div>
      <div className={`p-4 rounded-2xl ${color} transition-transform group-hover:scale-110 duration-300`}>
        {icon}
      </div>
    </div>
  );
}
