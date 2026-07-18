'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { LogOut, PlusCircle, Trash2, Wallet, Package, Backpack } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('finance');
  const [data, setData] = useState<any[]>([]);
  const [input, setInput] = useState('');

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.replace('/login');
    const { data } = await supabase.from(activeTab).select('*').eq('user_id', user.id);
    setData(data || []);
  }, [activeTab, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from(activeTab).insert([{ user_id: user?.id, deskripsi: input }]);
    setInput(''); fetchData();
  };

  const deleteData = async (id: string) => {
    await supabase.from(activeTab).delete().eq('id', id);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-[#EFE9DC] text-[#1F1B16] p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#D9CFB8]">
          <h1 className="text-3xl font-display font-black">Buku Lapangan KKN</h1>
          <button onClick={async () => { await supabase.auth.signOut(); router.replace('/login'); }} 
            className="flex items-center gap-2 bg-[#1F1B16] text-[#FDF9EF] px-4 py-2 rounded-lg hover:bg-[#C2410C] transition">
            <LogOut size={16} /> Logout
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {['finance', 'stock', 'inventory'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} 
              className={`px-6 py-2 rounded-lg font-semibold capitalize ${activeTab === tab ? 'bg-[#1F1B16] text-[#FDF9EF]' : 'bg-[#D9CFB8] text-[#1F1B16]'}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-[#FDF9EF] p-6 rounded-xl border border-[#D9CFB8] shadow-lg">
          <h2 className="text-xl font-bold mb-6 capitalize">Modul {activeTab}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <input className="input-paper p-3 border border-[#D9CFB8] rounded" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Masukkan deskripsi..." />
              <button onClick={addData} className="bg-[#1F1B16] text-white p-3 rounded flex items-center justify-center gap-2"><PlusCircle size={18}/> Simpan Data</button>
            </div>
            <table className="w-full">
              <tbody>
                {data.map(item => (
                  <tr key={item.id} className="border-b border-[#D9CFB8]">
                    <td className="p-2">{item.deskripsi}</td>
                    <td className="p-2 text-right"><Trash2 size={16} className="text-red-500 cursor-pointer" onClick={() => deleteData(item.id)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}