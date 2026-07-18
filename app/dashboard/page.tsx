'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Wallet, Package, Backpack, LogOut, TrendingUp, TrendingDown, Scale, List, PlusCircle, ArrowDownCircle, ArrowUpCircle, Check, Trash2, FileText, RotateCcw } from 'lucide-react';

type DataKeuangan = {
  id: string;
  jenis: string;
  nominal: number;
  keterangan: string;
  user_id: string;
  created_at: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [keuangan, setKeuangan] = useState<DataKeuangan[]>([]);
  const [activeTab, setActiveTab] = useState('finance');
  
  // State Form Keuangan
  const [jenis, setJenis] = useState('pemasukan');
  const [keterangan, setKeterangan] = useState('');
  const [nominal, setNominal] = useState('');

  // Menghitung Saldo
  const totalPemasukan = keuangan.filter(k => k.jenis === 'pemasukan').reduce((acc, curr) => acc + curr.nominal, 0);
  const totalPengeluaran = keuangan.filter(k => k.jenis === 'pengeluaran').reduce((acc, curr) => acc + curr.nominal, 0);
  const saldoAkhir = totalPemasukan - totalPengeluaran;

  const siapkanData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
    } else {
      setUserEmail(user.email || '');
      const { data } = await supabase
        .from('keuangan')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setKeuangan(data as DataKeuangan[]);
    }
  };

  useEffect(() => {
    siapkanData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatRp = (angka: number) => {
    return 'Rp' + angka.toLocaleString('id-ID');
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
    siapkanData();
  };

  const hapusData = async (id: string) => {
    await supabase.from('keuangan').delete().eq('id', id);
    siapkanData();
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
      formatRp(item.nominal),
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
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,800;9..144,900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        :root {
          --paper: #EFE9DC; --paper-light: #F7F2E7; --paper-warm: #FDF9EF;
          --ink: #1F1B16; --ink-soft: #5B5347; --ink-muted: #8B8270;
          --terracotta: #C2410C; --terracotta-soft: #FED7AA;
          --forest: #166534; --forest-soft: #BBF7D0;
          --ochre: #B45309; --ochre-soft: #FDE68A;
          --border: #D9CFB8; --border-strong: #B8AB8E;
        }
        .bg-paper { background-color: var(--paper); color: var(--ink); font-family: 'Plus Jakarta Sans', sans-serif; min-height: 100vh; background-image: radial-gradient(circle at 1px 1px, rgba(31,27,22,0.07) 1px, transparent 0); background-size: 22px 22px; }
        .font-display { font-family: 'Fraunces', serif; }
        .paper-card { background: var(--paper-warm); border: 1px solid var(--border); box-shadow: 0 1px 0 var(--border-strong), 0 12px 28px -16px rgba(31,27,22,0.18); border-radius: 14px; }
        .btn-primary { background: var(--ink); color: var(--paper-warm); transition: all 0.2s ease; }
        .btn-primary:hover { background: var(--terracotta); }
        .btn-ghost { background: transparent; border: 1px solid var(--border-strong); color: var(--ink); transition: all 0.2s ease; }
        .btn-ghost:hover { background: var(--ink); color: var(--paper-warm); }
        .input-paper { background: var(--paper-light); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; font-size: 14px; color: var(--ink); width: 100%; }
        .input-paper:focus { outline: none; border-color: var(--ink); background: var(--paper-warm); box-shadow: 0 0 0 3px rgba(31,27,22,0.08); }
        .label-paper { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-soft); margin-bottom: 6px; display: block; }
        .tab-btn { transition: all 0.25s ease; cursor: pointer; }
        .tab-btn.active { background: var(--ink); color: var(--paper-warm); }
        .chip { padding: 8px 12px; border-radius: 999px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid var(--border); background: var(--paper-warm); color: var(--ink-soft); }
        .chip.active { background: var(--ink); color: var(--paper-warm); border-color: var(--ink); }
        .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; font-size: 11px; font-weight: 700; border-radius: 999px; }
        .tbl th { font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-muted); text-align: left; padding: 10px 12px; border-bottom: 2px solid var(--border-strong); }
        .tbl td { padding: 12px; border-bottom: 1px solid var(--border); font-size: 14px; }
        .btn-del { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 6px; color: var(--ink-muted); transition: all 0.15s; }
        .btn-del:hover { background: var(--terracotta-soft); color: var(--terracotta); }
      `}} />

      <div className="bg-paper">
        {/* HEADER */}
        <header className="sticky top-0 z-40 backdrop-blur-md border-b" style={{ borderColor: 'var(--border)', background: 'rgba(239,233,220,0.88)' }}>
          <div className="max-w-7xl mx-auto px-5 md:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{ background: 'var(--ink)', color: 'var(--paper-warm)' }}>
                <span className="font-display font-black text-xl">K</span>
              </div>
              <div>
                <div className="font-display font-black text-lg leading-none">Buku Lapangan KKN</div>
                <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>{userEmail}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={handleLogout} className="btn-ghost px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          </div>
        </header>

        {/* HERO */}
        <section className="border-b" style={{ borderColor: 'var(--border)', background: 'radial-gradient(ellipse at top right, rgba(194,65,12,0.12), transparent 50%), linear-gradient(180deg, var(--paper-warm) 0%, var(--paper) 100%)' }}>
          <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
            <h1 className="font-display font-black leading-tight mb-4" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}>
              Catatan tiga pilar <br />
              <span style={{ color: 'var(--terracotta)', fontStyle: 'italic' }}>logistik</span> desa.
            </h1>
            
            <div className="grid grid-cols-3 gap-4 max-w-2xl mt-8">
              <div className="paper-card p-4" style={{ borderLeft: '4px solid var(--forest)' }}>
                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>Saldo Kas</div>
                <div className="font-display font-black text-2xl mt-2">{formatRp(saldoAkhir)}</div>
              </div>
              <div className="paper-card p-4 opacity-50" style={{ borderLeft: '4px solid var(--ochre)' }}>
                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>Item Stok</div>
                <div className="font-display font-black text-2xl mt-2">Segera</div>
              </div>
              <div className="paper-card p-4 opacity-50" style={{ borderLeft: '4px solid var(--terracotta)' }}>
                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>Barang</div>
                <div className="font-display font-black text-2xl mt-2">Segera</div>
              </div>
            </div>
          </div>
        </section>

        {/* TAB NAV */}
        <nav className="sticky top-[68px] z-30 backdrop-blur-md border-b" style={{ borderColor: 'var(--border)', background: 'rgba(239,233,220,0.92)' }}>
          <div className="max-w-7xl mx-auto px-5 md:px-8 py-3 flex items-center gap-2">
            <button onClick={() => setActiveTab('finance')} className={`tab-btn flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold ${activeTab === 'finance' ? 'active' : ''}`}>
              <Wallet className="w-4 h-4" /> 01 · Keuangan
            </button>
            <button onClick={() => setActiveTab('stock')} className={`tab-btn flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold ${activeTab === 'stock' ? 'active' : ''}`}>
              <Package className="w-4 h-4" /> 02 · Stok Konsumsi
            </button>
            <div className="ml-auto hidden md:flex items-center gap-2 pl-4">
              <button onClick={downloadPDF} className="btn-ghost px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Ekspor PDF
              </button>
            </div>
          </div>
        </nav>

        {/* MAIN CONTENT */}
        <main className="max-w-7xl mx-auto px-5 md:px-8 py-8 md:py-10">
          
          {/* TAB: KEUANGAN */}
          {activeTab === 'finance' && (
            <div className="animate-fadeUp">
              <div className="mb-8">
                <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--terracotta)' }}>Pilar 01 — Arus Kas</div>
                <h2 className="font-display font-black text-3xl mt-1">Buku Kas Kelompok</h2>
              </div>

              <div className="grid lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2">
                  <div className="paper-card p-5">
                    <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                      <PlusCircle className="w-5 h-5" style={{ color: 'var(--terracotta)' }} /> Catat Transaksi
                    </h3>
                    <form onSubmit={tambahData} className="space-y-4">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setJenis('pemasukan')} className={`chip flex-1 flex justify-center items-center gap-2 ${jenis === 'pemasukan' ? 'active' : ''}`}>
                          <ArrowDownCircle className="w-4 h-4" /> Pemasukan
                        </button>
                        <button type="button" onClick={() => setJenis('pengeluaran')} className={`chip flex-1 flex justify-center items-center gap-2 ${jenis === 'pengeluaran' ? 'active' : ''}`}>
                          <ArrowUpCircle className="w-4 h-4" /> Pengeluaran
                        </button>
                      </div>
                      <div>
                        <label className="label-paper">Deskripsi</label>
                        <input type="text" className="input-paper" placeholder="Cth: Beli beras 10kg / Iuran Andi" required value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
                      </div>
                      <div>
                        <label className="label-paper">Nominal (Rp)</label>
                        <input type="number" className="input-paper" placeholder="50000" required value={nominal} onChange={(e) => setNominal(e.target.value)} />
                      </div>
                      <button type="submit" className="btn-primary w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" /> Simpan ke Buku Kas
                      </button>
                    </form>
                  </div>
                </div>

                <div className="lg:col-span-3">
                  <div className="paper-card p-5">
                    <h3 className="font-display font-bold text-lg mb-4">Riwayat Transaksi</h3>
                    <div className="overflow-x-auto">
                      <table className="tbl w-full text-left">
                        <thead>
                          <tr>
                            <th>Kategori</th>
                            <th>Deskripsi</th>
                            <th className="text-right">Nominal</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {keuangan.map((item) => (
                            <tr key={item.id} className="hover:bg-black/5">
                              <td>
                                <span className="badge" style={{ 
                                  background: item.jenis === 'pemasukan' ? 'var(--forest-soft)' : 'var(--terracotta-soft)', 
                                  color: item.jenis === 'pemasukan' ? 'var(--forest)' : 'var(--terracotta)' 
                                }}>
                                  {item.jenis}
                                </span>
                              </td>
                              <td className="font-medium">{item.keterangan}</td>
                              <td className="text-right font-bold" style={{ color: item.jenis === 'pemasukan' ? 'var(--forest)' : 'var(--terracotta)' }}>
                                {item.jenis === 'pemasukan' ? '+' : '-'} {formatRp(item.nominal)}
                              </td>
                              <td className="text-right">
                                <button onClick={() => hapusData(item.id)} className="btn-del">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {keuangan.length === 0 && (
                            <tr><td colSpan={4} className="text-center py-8 opacity-50">Belum ada transaksi dicatat.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: STOK (Tampilan Sementara) */}
          {activeTab === 'stock' && (
            <div className="animate-fadeUp text-center py-20">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <h2 className="font-display font-bold text-2xl text-gray-500">Fitur Stok Dapur Sedang Disiapkan</h2>
              <p className="text-gray-500 mt-2">Nantinya Anda bisa mencatat bahan makanan di sini.</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}