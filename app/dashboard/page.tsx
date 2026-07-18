'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Wallet, Package, Backpack, LogOut, PlusCircle, ArrowDownCircle, ArrowUpCircle, 
  Check, Trash2, Utensils, Coffee, Users, Laptop, ShieldAlert 
} from 'lucide-react';

type DataKeuangan = { id: string; jenis: string; nominal: number; keterangan: string; };
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

  // FUNGSI LOGOUT YANG DIPERBAIKI
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login'); // Menggunakan replace agar tidak bisa "back" setelah logout
    router.refresh();
  };

  return (
    <div className="bg-orange-50 min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Peserta</h1>
            <p className="text-sm text-gray-600">Login sebagai: {userEmail}</p>
          </div>
          <button onClick={handleLogout} className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900">
            Logout
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <button onClick={() => setActiveTab('finance')} className={`px-4 py-2 rounded ${activeTab === 'finance' ? 'bg-green-600 text-white' : 'bg-white'}`}>Keuangan</button>
          <button onClick={() => setActiveTab('stock')} className={`px-4 py-2 rounded ${activeTab === 'stock' ? 'bg-green-600 text-white' : 'bg-white'}`}>Stok</button>
        </div>

        {/* Konten Dashboard (tetap sama) */}
        <div className="bg-white p-6 rounded-lg shadow">
            {activeTab === 'finance' ? <h2>Fitur Keuangan Aktif</h2> : <h2>Fitur Stok Aktif</h2>}
        </div>
      </div>
    </div>
  );
}