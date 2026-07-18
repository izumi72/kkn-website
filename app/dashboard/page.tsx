'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Wallet, Package, Backpack, LogOut, TrendingUp, TrendingDown, Scale, List, 
  PlusCircle, ArrowDownCircle, ArrowUpCircle, Check, Trash2, FileText, 
  Utensils, Coffee, AlertTriangle, Users, Laptop, ShieldAlert 
} from 'lucide-react';

// --- TIPE DATA ---
type DataKeuangan = { id: string; jenis: string; nominal: number; keterangan: string; created_at: string; };
type DataStok = { id: string; nama_bahan: string; jenis: string; jumlah: number; satuan: string; pembawa: string; tanggal_masuk: string; };
type DataInventaris = { id: string; nama_barang: string; kategori: string; jumlah: number; pemilik: string; kondisi: string; catatan: string; };

export default function Dashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [activeTab, setActiveTab] = useState('finance');
  
  // --- STATE DATA ---
  const [keuangan, setKeuangan] = useState<DataKeuangan[]>([]);
  const [stok, setStok] = useState<DataStok[]>([]);
  const [inventaris, setInventaris] = useState<DataInventaris[]>([]);

  // --- STATE FORM KEUANGAN ---
  const [jenisKeuangan, setJenisKeuangan] = useState('pemasukan');
  const [ketKeuangan, setKetKeuangan] = useState('');
  const [nomKeuangan, setNomKeuangan] = useState('');

  // --- STATE FORM STOK ---
  const [namaBahan, setNamaBahan] = useState('');
  const [jenisStok, setJenisStok] = useState('Makanan');
  const [jumlahStok, setJumlahStok] = useState('');
  const [satuanStok, setSatuanStok] = useState('kg');
  const [pembawaStok, setPembawaStok] = useState('');

  // --- STATE FORM INVENTARIS ---
  const [namaBarang, setNamaBarang] = useState('');
  const [kategoriInv, setKategoriInv] = useState('Elektronik');
  const [jumlahInv, setJumlahInv] = useState('1');
  const [pemilikInv, setPemilikInv] = useState('');
  const [kondisiInv, setKondisiInv] = useState('Baik');
  const [catatanInv, setCatatanInv] = useState('');

  // --- PERHITUNGAN STATISTIK ---
  const saldoAkhir = keuangan.reduce((acc, curr) => curr.jenis === 'pemasukan' ? acc + curr.nominal : acc - curr.nominal, 0);
  const stokMakanan = stok.filter(s => s.jenis === 'Makanan').length;
  const stokMinuman = stok.filter(s => s.jenis === 'Minuman').length;
  const invMahasiswa = new Set(inventaris.map(i => i.pemilik)).size;
  const invElektronik = inventaris.filter(i => i.kategori === 'Elektronik').length;
  const invPerluPerhatian = inventaris.filter(i => i.kondisi === 'Perlu Perhatian' || i.kondisi === 'Rusak').length;

  const siapkanData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push('/login');
    setUserEmail(user.email || '');

    const [resKeuangan, resStok, resInv] = await Promise.all([
      supabase.from('keuangan').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('stok').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('inventaris').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    ]);

    if (resKeuangan.data) setKeuangan(resKeuangan.data as DataKeuangan[]);
    if (resStok.data) setStok(resStok.data as DataStok[]);
    if (resInv.data) setInventaris(resInv.data as DataInventaris[]);
  };

  useEffect(() => { siapkanData(); }, []);
  const formatRp = (angka: number) => 'Rp ' + angka.toLocaleString('id-ID');

  // --- FUNGSI TAMBAH DATA ---
  const tambahKeuangan = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('keuangan').insert([{ user_id: user?.id, jenis: jenisKeuangan, nominal: parseInt(nomKeuangan), keterangan: ketKeuangan }]);
    setKetKeuangan(''); setNomKeuangan(''); siapkanData();
  };

  const tambahStok = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('stok').insert([{ 
      user_id: user?.id, nama_bahan: namaBahan, jenis: jenisStok, 
      jumlah: parseFloat(jumlahStok), satuan: satuanStok, pembawa: pembawaStok, 
      tanggal_masuk: new Date().toISOString().split('T')[0] 
    }]);
    setNamaBahan(''); setJumlahStok(''); setPembawaStok(''); siapkanData();
  };

  const tambahInventaris = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('inventaris').insert([{ 
      user_id: user?.id, nama_barang: namaBarang, kategori: kategoriInv, 
      jumlah: parseInt(jumlahInv), pemilik: pemilikInv, kondisi: kondisiInv, catatan: catatanInv 
    }]);
    setNamaBarang(''); setPemilikInv(''); setCatatanInv(''); setJumlahInv('1'); siapkanData();
  };

  const hapusData = async (tabel: string, id: string) => {
    await supabase.from(tabel).delete().eq('id', id);
    siapkanData();
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/'); };

  // --- TAMPILAN (UI) ---
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

      <div className="bg-paper pb-20">
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
            <button onClick={handleLogout} className="btn-ghost px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </header>

        {/* HERO */}
        <section className="border-b" style={{ borderColor: 'var(--border)', background: 'radial-gradient(ellipse at top right, rgba(194,65,12,0.12), transparent 50%), linear-gradient(180deg, var(--paper-warm) 0%, var(--paper) 100%)' }}>
          <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
            <h1 className="font-display font-black leading-tight mb-4" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}>
              Catatan tiga pilar <br />
              <span style={{ color: 'var(--terracotta)', fontStyle: 'italic' }}>logistik</span> desa.
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mt-8">
              <div className="paper-card p-4" style={{ borderLeft: '4px solid var(--forest)' }}>
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Saldo Kas</div>
                <div className="font-display font-black text-2xl md:text-3xl mt-2">{formatRp(saldoAkhir)}</div>
              </div>
              <div className="paper-card p-4" style={{ borderLeft: '4px solid var(--ochre)' }}>
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Item Stok</div>
                <div className="font-display font-black text-2xl md:text-3xl mt-2">{stok.length}</div>
              </div>
              <div className="paper-card p-4" style={{ borderLeft: '4px solid var(--terracotta)' }}>
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Barang Pribadi</div>
                <div className="font-display font-black text-2xl md:text-3xl mt-2">{inventaris.length}</div>
              </div>
            </div>
          </div>
        </section>

        {/* TAB NAV */}
        <nav className="sticky top-[68px] z-30 backdrop-blur-md border-b overflow-x-auto" style={{ borderColor: 'var(--border)', background: 'rgba(239,233,220,0.92)' }}>
          <div className="max-w-7xl mx-auto px-5 md:px-8 py-3 flex items-center gap-2">
            <button onClick={() => setActiveTab('finance')} className={`tab-btn whitespace-nowrap flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold ${activeTab === 'finance' ? 'active' : ''}`}><Wallet className="w-4 h-4" /> 01 · Keuangan</button>
            <button onClick={() => setActiveTab('stock')} className={`tab-btn whitespace-nowrap flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold ${activeTab === 'stock' ? 'active' : ''}`}><Package className="w-4 h-4" /> 02 · Stok Konsumsi</button>
            <button onClick={() => setActiveTab('inventory')} className={`tab-btn whitespace-nowrap flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold ${activeTab === 'inventory' ? 'active' : ''}`}><Backpack className="w-4 h-4" /> 03 · Inventaris Pribadi</button>
          </div>
        </nav>

        {/* MAIN CONTENT */}
        <main className="max-w-7xl mx-auto px-5 md:px-8 py-8 md:py-10">
          
          {/* TAB 1: KEUANGAN */}
          {activeTab === 'finance' && (
            <div className="animate-fadeUp">
              <div className="mb-6"><div className="text-xs font-bold uppercase tracking-widest text-orange-700">Pilar 01 — Arus Kas</div><h2 className="font-display font-black text-3xl mt-1">Buku Kas Kelompok</h2></div>
              <div className="grid lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2">
                  <div className="paper-card p-5">
                    <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><PlusCircle className="w-5 h-5 text-orange-700" /> Catat Transaksi</h3>
                    <form onSubmit={tambahKeuangan} className="space-y-4">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setJenisKeuangan('pemasukan')} className={`chip flex-1 flex justify-center items-center gap-2 ${jenisKeuangan === 'pemasukan' ? 'active' : ''}`}><ArrowDownCircle className="w-4 h-4" /> Pemasukan</button>
                        <button type="button" onClick={() => setJenisKeuangan('pengeluaran')} className={`chip flex-1 flex justify-center items-center gap-2 ${jenisKeuangan === 'pengeluaran' ? 'active' : ''}`}><ArrowUpCircle className="w-4 h-4" /> Pengeluaran</button>
                      </div>
                      <div><label className="label-paper">Deskripsi</label><input type="text" className="input-paper" placeholder="Cth: Beli beras 10kg" required value={ketKeuangan} onChange={(e) => setKetKeuangan(e.target.value)} /></div>
                      <div><label className="label-paper">Nominal (Rp)</label><input type="number" className="input-paper" placeholder="50000" required value={nomKeuangan} onChange={(e) => setNomKeuangan(e.target.value)} /></div>
                      <button type="submit" className="btn-primary w-full py-2.5 rounded-lg text-sm font-semibold flex justify-center gap-2"><Check className="w-4 h-4" /> Simpan Transaksi</button>
                    </form>
                  </div>
                </div>
                <div className="lg:col-span-3">
                  <div className="paper-card p-5">
                    <h3 className="font-display font-bold text-lg mb-4">Riwayat Transaksi</h3>
                    <div className="overflow-x-auto"><table className="tbl w-full"><thead><tr><th>Kategori</th><th>Deskripsi</th><th className="text-right">Nominal</th><th></th></tr></thead><tbody>
                      {keuangan.map((item) => (
                        <tr key={item.id}>
                          <td><span className="badge" style={{ background: item.jenis === 'pemasukan' ? 'var(--forest-soft)' : 'var(--terracotta-soft)', color: item.jenis === 'pemasukan' ? 'var(--forest)' : 'var(--terracotta)' }}>{item.jenis}</span></td>
                          <td className="font-medium">{item.keterangan}</td>
                          <td className="text-right font-bold" style={{ color: item.jenis === 'pemasukan' ? 'var(--forest)' : 'var(--terracotta)' }}>{item.jenis === 'pemasukan' ? '+' : '-'} {formatRp(item.nominal)}</td>
                          <td className="text-right"><button onClick={() => hapusData('keuangan', item.id)} className="btn-del"><Trash2 className="w-4 h-4" /></button></td>
                        </tr>
                      ))}
                      {keuangan.length === 0 && <tr><td colSpan={4} className="text-center py-8 opacity-50">Belum ada transaksi</td></tr>}
                    </tbody></table></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STOK KONSUMSI */}
          {activeTab === 'stock' && (
            <div className="animate-fadeUp">
              <div className="mb-6"><div className="text-xs font-bold uppercase tracking-widest text-amber-700">Pilar 02 — Dapur Komunal</div><h2 className="font-display font-black text-3xl mt-1">Stok Bahan & Minuman</h2></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="paper-card p-4"><div className="flex justify-between text-gray-500 text-[10px] font-bold">TOTAL ITEM <Package className="w-4 h-4 text-amber-700"/></div><div className="font-display text-2xl mt-2">{stok.length}</div></div>
                <div className="paper-card p-4"><div className="flex justify-between text-gray-500 text-[10px] font-bold">MAKANAN <Utensils className="w-4 h-4 text-orange-700"/></div><div className="font-display text-2xl mt-2">{stokMakanan}</div></div>
                <div className="paper-card p-4"><div className="flex justify-between text-gray-500 text-[10px] font-bold">MINUMAN <Coffee className="w-4 h-4 text-teal-700"/></div><div className="font-display text-2xl mt-2">{stokMinuman}</div></div>
              </div>
              <div className="grid lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2">
                  <div className="paper-card p-5">
                    <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><PlusCircle className="w-5 h-5 text-amber-700" /> Tambah Stok</h3>
                    <form onSubmit={tambahStok} className="space-y-4">
                      <div><label className="label-paper">Nama Bahan</label><input type="text" className="input-paper" placeholder="Cth: Beras premium" required value={namaBahan} onChange={(e) => setNamaBahan(e.target.value)} /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="label-paper">Jenis</label><select className="input-paper" value={jenisStok} onChange={(e) => setJenisStok(e.target.value)}><option>Makanan</option><option>Minuman</option></select></div>
                        <div><label className="label-paper">Jumlah</label><input type="number" step="0.1" className="input-paper" placeholder="0" required value={jumlahStok} onChange={(e) => setJumlahStok(e.target.value)} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="label-paper">Satuan</label><select className="input-paper" value={satuanStok} onChange={(e) => setSatuanStok(e.target.value)}><option>kg</option><option>liter</option><option>pcs</option><option>pack</option><option>botol</option></select></div>
                        <div><label className="label-paper">Pembawa</label><input type="text" className="input-paper" placeholder="Cth: Andi" required value={pembawaStok} onChange={(e) => setPembawaStok(e.target.value)} /></div>
                      </div>
                      <button type="submit" className="btn-primary w-full py-2.5 rounded-lg text-sm font-semibold flex justify-center gap-2"><Check className="w-4 h-4" /> Catat Stok</button>
                    </form>
                  </div>
                </div>
                <div className="lg:col-span-3">
                  <div className="paper-card p-5">
                    <h3 className="font-display font-bold text-lg mb-4">Daftar Stok</h3>
                    <div className="overflow-x-auto"><table className="tbl w-full"><thead><tr><th>Bahan</th><th>Jenis</th><th>Jumlah</th><th>Pembawa</th><th></th></tr></thead><tbody>
                      {stok.map((s) => (
                        <tr key={s.id}>
                          <td className="font-medium">{s.nama_bahan}</td>
                          <td><span className="badge bg-orange-100 text-orange-800">{s.jenis}</span></td>
                          <td className="font-bold">{s.jumlah} <span className="font-normal text-xs text-gray-500">{s.satuan}</span></td>
                          <td>{s.pembawa}</td>
                          <td className="text-right"><button onClick={() => hapusData('stok', s.id)} className="btn-del"><Trash2 className="w-4 h-4" /></button></td>
                        </tr>
                      ))}
                      {stok.length === 0 && <tr><td colSpan={5} className="text-center py-8 opacity-50">Belum ada stok</td></tr>}
                    </tbody></table></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INVENTARIS */}
          {activeTab === 'inventory' && (
            <div className="animate-fadeUp">
              <div className="mb-6"><div className="text-xs font-bold uppercase tracking-widest text-orange-800">Pilar 03 — Barang Pribadi</div><h2 className="font-display font-black text-3xl mt-1">Inventaris Mahasiswa</h2></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="paper-card p-4"><div className="flex justify-between text-gray-500 text-[10px] font-bold">TOTAL BARANG <Backpack className="w-4 h-4 text-orange-800"/></div><div className="font-display text-2xl mt-2">{inventaris.length}</div></div>
                <div className="paper-card p-4"><div className="flex justify-between text-gray-500 text-[10px] font-bold">MAHASISWA <Users className="w-4 h-4 text-green-700"/></div><div className="font-display text-2xl mt-2">{invMahasiswa}</div></div>
                <div className="paper-card p-4"><div className="flex justify-between text-gray-500 text-[10px] font-bold">ELEKTRONIK <Laptop className="w-4 h-4 text-teal-700"/></div><div className="font-display text-2xl mt-2">{invElektronik}</div></div>
                <div className="paper-card p-4"><div className="flex justify-between text-gray-500 text-[10px] font-bold">PERHATIAN <ShieldAlert className="w-4 h-4 text-red-600"/></div><div className="font-display text-2xl mt-2">{invPerluPerhatian}</div></div>
              </div>
              <div className="grid lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2">
                  <div className="paper-card p-5">
                    <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><PlusCircle className="w-5 h-5 text-orange-800" /> Tambah Barang</h3>
                    <form onSubmit={tambahInventaris} className="space-y-4">
                      <div><label className="label-paper">Nama Barang</label><input type="text" className="input-paper" placeholder="Cth: Laptop Acer" required value={namaBarang} onChange={(e) => setNamaBarang(e.target.value)} /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="label-paper">Kategori</label><select className="input-paper" value={kategoriInv} onChange={(e) => setKategoriInv(e.target.value)}><option>Elektronik</option><option>Pakaian</option><option>Alat Mandi</option><option>Obat-obatan</option><option>Dokumen</option><option>Lainnya</option></select></div>
                        <div><label className="label-paper">Jumlah</label><input type="number" className="input-paper" min="1" required value={jumlahInv} onChange={(e) => setJumlahInv(e.target.value)} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="label-paper">Pemilik</label><input type="text" className="input-paper" placeholder="Nama mahasiswa" required value={pemilikInv} onChange={(e) => setPemilikInv(e.target.value)} /></div>
                        <div><label className="label-paper">Kondisi</label><select className="input-paper" value={kondisiInv} onChange={(e) => setKondisiInv(e.target.value)}><option>Baik</option><option>Layak</option><option>Perlu Perhatian</option><option>Rusak</option></select></div>
                      </div>
                      <div><label className="label-paper">Catatan (Opsional)</label><input type="text" className="input-paper" placeholder="Cth: Bawa charger" value={catatanInv} onChange={(e) => setCatatanInv(e.target.value)} /></div>
                      <button type="submit" className="btn-primary w-full py-2.5 rounded-lg text-sm font-semibold flex justify-center gap-2"><Check className="w-4 h-4" /> Catat Barang</button>
                    </form>
                  </div>
                </div>
                <div className="lg:col-span-3">
                  <div className="paper-card p-5">
                    <h3 className="font-display font-bold text-lg mb-4">Daftar Inventaris</h3>
                    <div className="overflow-x-auto"><table className="tbl w-full"><thead><tr><th>Barang</th><th>Pemilik</th><th>Kondisi</th><th>Catatan</th><th></th></tr></thead><tbody>
                      {inventaris.map((i) => (
                        <tr key={i.id}>
                          <td><div className="font-medium">{i.nama_barang}</div><div className="text-[11px] text-gray-500">{i.kategori} &times;{i.jumlah}</div></td>
                          <td>{i.pemilik}</td>
                          <td><span className="badge bg-gray-200 text-gray-800">{i.kondisi}</span></td>
                          <td className="text-xs text-gray-500">{i.catatan || '-'}</td>
                          <td className="text-right"><button onClick={() => hapusData('inventaris', i.id)} className="btn-del"><Trash2 className="w-4 h-4" /></button></td>
                        </tr>
                      ))}
                      {inventaris.length === 0 && <tr><td colSpan={5} className="text-center py-8 opacity-50">Belum ada barang</td></tr>}
                    </tbody></table></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}