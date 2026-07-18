'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { Wallet, Package, Backpack, LogOut, PlusCircle, ArrowDownCircle, ArrowUpCircle, Check, Trash2, Utensils, Coffee, Users, Laptop, ShieldAlert } from 'lucide-react';

type DataKeuangan = { id: string; jenis: string; nominal: number; keterangan: string; created_at: string; };
type DataStok = { id: string; nama_bahan: string; jenis: string; jumlah: number; satuan: string; pembawa: string; };
type DataInventaris = { id: string; nama_barang: string; kategori: string; jumlah: number; pemilik: string; kondisi: string; catatan: string; };

export default function Dashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [activeTab, setActiveTab] = useState('finance');
  const [keuangan, setKeuangan] = useState<DataKeuangan[]>([]);
  const [stok, setStok] = useState<DataStok[]>([]);
  const [inventaris, setInventaris] = useState<DataInventaris[]>([]);

  const siapkanData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.replace('/login');
    setUserEmail(user.email || '');

    const [resK, resS, resI] = await Promise.all([
      supabase.from('keuangan').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('stok').select('*').eq('user_id', user.id),
      supabase.from('inventaris').select('*').eq('user_id', user.id)
    ]);
    if (resK.data) setKeuangan(resK.data);
    if (resS.data) setStok(resS.data);
    if (resI.data) setInventaris(resI.data);
  };

  useEffect(() => { siapkanData(); }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#EFE9DC] text-[#1F1B16] p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header Aesthetic */}
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
          <button onClick={() => setActiveTab('finance')} className={`px-6 py-2 rounded-lg font-semibold ${activeTab === 'finance' ? 'bg-[#1F1B16] text-[#FDF9EF]' : 'bg-[#D9CFB8] text-[#1F1B16]'}`}>Keuangan</button>
          <button onClick={() => setActiveTab('stock')} className={`px-6 py-2 rounded-lg font-semibold ${activeTab === 'stock' ? 'bg-[#1F1B16] text-[#FDF9EF]' : 'bg-[#D9CFB8] text-[#1F1B16]'}`}>Stok</button>
          <button onClick={() => setActiveTab('inventory')} className={`px-6 py-2 rounded-lg font-semibold ${activeTab === 'inventory' ? 'bg-[#1F1B16] text-[#FDF9EF]' : 'bg-[#D9CFB8] text-[#1F1B16]'}`}>Inventaris</button>
        </div>

        {/* Konten Tab */}
        <div className="bg-[#FDF9EF] p-6 rounded-xl border border-[#D9CFB8] shadow-lg">
          {activeTab === 'finance' && <h2 className="text-xl font-bold">Modul Keuangan (Data Tersedia)</h2>}
          {activeTab === 'stock' && <h2 className="text-xl font-bold">Modul Stok (Data Tersedia)</h2>}
          {activeTab === 'inventory' && <h2 className="text-xl font-bold">Modul Inventaris (Data Tersedia)</h2>}
        </div>
      </div>
    </div>
  );
}