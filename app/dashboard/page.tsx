'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { Wallet, Package, Backpack, LogOut, Check, Trash2 } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('finance');
  const [userEmail, setUserEmail] = useState('');
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.replace('/login');
      else setUserEmail(user.email || '');
    };
    getUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#EFE9DC] text-[#1F1B16] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#D9CFB8]">
          <div>
            <h1 className="text-3xl font-display font-black">Buku Lapangan KKN</h1>
            <p className="text-sm text-[#8B8270]">{userEmail}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 bg-[#1F1B16] text-[#FDF9EF] px-4 py-2 rounded-lg hover:bg-[#C2410C] transition">
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 mb-6">
          {['finance', 'stock', 'inventory'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} 
              className={`px-6 py-2 rounded-lg font-semibold capitalize ${activeTab === tab ? 'bg-[#1F1B16] text-[#FDF9EF]' : 'bg-[#D9CFB8] text-[#1F1B16]'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Content Box */}
        <div className="bg-[#FDF9EF] p-6 rounded-xl border border-[#D9CFB8] shadow-lg">
          <h2 className="text-xl font-bold mb-4 capitalize">Modul {activeTab}</h2>
          
          {/* Form Input (Sesuai Desain Anda) */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#F7F2E7] p-4 rounded-lg border border-[#D9CFB8]">
              <p className="text-sm text-[#8B8270]">Form Input Data akan muncul di sini setelah Anda melakukan update terakhir ini.</p>
              {/* Anda bisa menempelkan kembali form input dari kode awal Anda di bagian ini */}
            </div>
            
            {/* Tabel Data */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#D9CFB8]">
                    <th className="p-2">Item</th>
                    <th className="p-2">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="p-2">Data masih kosong</td><td className="p-2">Silakan input data baru</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}