'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { LogOut, PlusCircle, Check, Trash2 } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('finance');
  const [userEmail, setUserEmail] = useState('');
  const [keuangan, setKeuangan] = useState<any[]>([]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.replace('/login');
      else {
        setUserEmail(user.email || '');
        loadData(user.id);
      }
    };
    checkUser();
  }, [router]);

  const loadData = async (userId: string) => {
    const { data } = await supabase.from('keuangan').select('*').eq('user_id', userId);
    if (data) setKeuangan(data);
  };

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

        {/* Tab Nav */}
        <div className="flex gap-2 mb-6">
          {['finance', 'stock', 'inventory'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} 
              className={`px-6 py-2 rounded-lg font-semibold capitalize transition ${activeTab === tab ? 'bg-[#1F1B16] text-[#FDF9EF]' : 'bg-[#D9CFB8] text-[#1F1B16]'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Content Box */}
        <div className="bg-[#FDF9EF] p-6 rounded-xl border border-[#D9CFB8] shadow-lg">
          <h2 className="text-xl font-bold mb-6 capitalize">Modul {activeTab}</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Form Area */}
            <div className="bg-[#F7F2E7] p-5 rounded-lg border border-[#D9CFB8]">
              <h3 className="font-bold mb-4 flex items-center gap-2"><PlusCircle size={18} /> Tambah Data {activeTab}</h3>
              <div className="text-sm text-[#5B5347] italic">
                {activeTab === 'finance' ? "Gunakan form input keuangan Anda di sini." : "Fitur " + activeTab + " akan segera terintegrasi penuh."}
              </div>
            </div>
            
            {/* Table Area */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#D9CFB8]">
                    <th className="p-2">Deskripsi</th>
                    <th className="p-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {keuangan.length === 0 ? (
                    <tr><td className="p-2 text-gray-500">Belum ada data tersedia.</td></tr>
                  ) : (
                    keuangan.map((item: any) => (
                      <tr key={item.id} className="border-b border-[#D9CFB8]">
                        <td className="p-2">{item.keterangan}</td>
                        <td className="p-2"><Trash2 size={16} className="text-red-500 cursor-pointer" /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}