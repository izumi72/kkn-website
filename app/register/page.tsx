'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });
    
    if (error) {
      alert('Gagal mendaftar: ' + error.message);
    } else {
      alert('Pendaftaran berhasil! Silakan login.');
      router.push('/login');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-700">Daftar Akun KKN</h2>
        <input 
          type="email" placeholder="Email" required
          className="w-full mb-4 p-2 border rounded text-black"
          value={email} onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password" placeholder="Password (min. 6 karakter)" required
          className="w-full mb-6 p-2 border rounded text-black"
          value={password} onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
          Daftar
        </button>
        <p className="mt-4 text-center text-sm text-black">
          Sudah punya akun? <Link href="/login" className="text-blue-600">Login di sini</Link>
        </p>
      </form>
    </div>
  );
}