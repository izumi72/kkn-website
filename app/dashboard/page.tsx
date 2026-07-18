'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { LogOut, Wallet, Package, Backpack, PlusCircle, Trash2 } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('finance');
  const [userEmail, setUserEmail] = useState('');
  const [data, setData] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.replace('/login');
    setUserEmail(user.email || '');
    const { data } = await supabase.from(activeTab).select('*').eq('user_id', user.id);
    setData(data || []);
  }, [activeTab, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="min-h-screen bg-[#EFE9DC] text-[#1F1B16] font-sans" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(31,27,22,0.07) 1px, transparent 0)', backgroundSize: '22px 22px'}}>
      {/* HEADER & HERO SECTION AESTHETIC */}
      <header className="border-b border-[#D9CFB8] bg-[#F7F2E7]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1F1B16] text-[#FDF9EF] flex items-center justify-center font-black rounded-lg">K</div>
            <div>
              <h1 className="font-display font-black text-lg leading-none">Buku Lapangan KKN</h1>
              <p className="text-xs text-[#8B8270]">{userEmail}</p>
            </div>
          </div>
          <button onClick={async () => { await supabase.auth.signOut(); router.replace('/login'); }} className="text-xs font-semibold border border-[#B8AB8E] px-3 py-2 rounded-lg hover:bg-[#1F1B16] hover:text-[#FDF9EF] transition">
            <LogOut size={14} className="inline mr-1"/> Logout
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-8 py-12">
        <h1 className="font-display font-black text-6xl mb-6">Catatan tiga pilar <br/><span className="text-[#C2410C] italic">logistik</span> desa.</h1>
        <div className="grid grid-cols-3 gap-4">
          {['Saldo Kas', 'Item Stok', 'Barang'].map(item => (
            <div key={item} className="bg-[#FDF9EF] border border-[#D9CFB8] p-5 rounded-xl shadow-sm">
              <p className="text-[10px] font-bold uppercase text-[#8B8270]">{item}</p>
              <p className="font-display font-black text-3xl mt-2">0</p>
            </div>
          ))}
        </div>
      </section>

      {/* TABS & CONTENT */}
      <main className="max-w-7xl mx-auto px-8 pb-12">
        <div className="flex gap-2 mb-8">
          {['finance', 'stock', 'inventory'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} 
              className={`px-5 py-2.5 rounded-lg font-semibold capitalize ${activeTab === tab ? 'bg-[#1F1B16] text-[#FDF9EF]' : 'bg-[#D9CFB8] text-[#1F1B16]'}`}>
              {tab === 'finance' ? '01 · Keuangan' : tab === 'stock' ? '02 · Stok' : '03 · Inventaris'}
            </button>
          ))}
        </div>

        <div className="bg-[#FDF9EF] border border-[#D9CFB8] p-8 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-display font-black mb-6 capitalize">Modul {activeTab}</h2>
          {/* Sini area isi data Anda */}
          <div className="text-center py-10 border-2 border-dashed border-[#D9CFB8] rounded-xl text-[#8B8270]">
            Modul {activeTab} siap digunakan. Silakan tambahkan data Anda.
          </div>
        </div>
      </main>
    </div>
  );
}