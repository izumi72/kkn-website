'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Dashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [keuangan, setKeuangan] = useState<any[]>([]);
  
  const [jenis, setJenis] = useState('pemasukan');
  const [nominal, setNominal] = useState('');
  const [keterangan, setKeterangan] = useState('');

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
    } else {
      setUserEmail(user.email || '');
      fetchKeuangan(user.id);
    }
  };

  const fetchKeuangan = async (userId: string) => {
    const { data } = await supabase
      .from('keuangan')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setKeuangan(data);
  };

  const tambahData = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('keuangan').insert([
      { user_id: user.id, jenis, nominal: parseInt(nominal), keterangan }
    ]);
    
    setNominal('');
    setKeterangan('');
    fetchKeuangan(user.id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`Laporan Keuangan KKN - ${userEmail}`, 14, 15);
    
    const tableData = keuangan.map((item, index) => [
      index + 1,
      item.jenis.toUpperCase(),
      `Rp ${item.nominal.toLocaleString('id-ID')}`,
      item.keterangan
    ]);

    autoTable(doc, {
      head: [['No', 'Jenis', 'Nominal', 'Keterangan']],
      body: tableData,
      startY: 20,
    });
    doc.save('Data_Keuangan_KKN.pdf');
  };

  return (
    <div className="p-8 max-w-5xl mx-auto bg-gray-50 min-h-screen text-black">
      <div className="flex justify-between items-center mb-8 bg-white p-4 shadow rounded">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Peserta</h1>
          <p className="text-sm text-gray-500">Login sebagai: {userEmail}</p>
        </div>
        <button onClick={handleLogout} className="bg-gray-800 text-white px-4 py-2 rounded">Logout</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded shadow h-fit">
          <h2 className="font-bold text-lg mb-4">Catat Keuangan</h2>
          <form onSubmit={tambahData} className="space-y-4">
            <select value={jenis} onChange={(e) => setJenis(e.target.value)} className="w-full p-2 border rounded">
              <option value="pemasukan">Pemasukan</option>
              <option value="pengeluaran">Pengeluaran</option>
            </select>
            <input 
              type="number" placeholder="Nominal (Cth: 50000)" required
              className="w-full p-2 border rounded"
              value={nominal} onChange={(e) => setNominal(e.target.value)}
            />
            <input 
              type="text" placeholder="Keterangan (Cth: Beli Galon)" required
              className="w-full p-2 border rounded"
              value={keterangan} onChange={(e) => setKeterangan(e.target.value)}
            />
            <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">Simpan Data</button>
          </form>
        </div>

        <div className="md:col-span-2 bg-white p-6 rounded shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">Catatan Keuangan Anda</h2>
            <button onClick={downloadPDF} className="bg-red-600 text-white px-4 py-2 rounded text-sm">
              Download PDF
            </button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-2">Jenis</th>
                <th className="p-2">Nominal</th>
                <th className="p-2">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {keuangan.map((item) => (
                <tr key={item.id} className="border-b text-sm">
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-white ${item.jenis === 'pemasukan' ? 'bg-green-500' : 'bg-red-500'}`}>
                      {item.jenis}
                    </span>
                  </td>
                  <td className="p-2">Rp {item.nominal.toLocaleString('id-ID')}</td>
                  <td className="p-2">{item.keterangan}</td>
                </tr>
              ))}
              {keuangan.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center p-4 text-gray-500">Belum ada data dicatat.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}