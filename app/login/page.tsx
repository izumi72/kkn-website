'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      alert('Email atau Password salah!');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Login KKN</h2>
        <input 
          type="email" placeholder="Email" required
          className="w-full mb-4 p-2 border rounded text-black"
          value={email} onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password" placeholder="Password" required
          className="w-full mb-6 p-2 border rounded text-black"
          value={password} onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Masuk
        </button>
        <p className="mt-4 text-center text-sm text-black">
          Belum punya akun? <Link href="/register" className="text-green-600">Daftar di sini</Link>
        </p>
      </form>
    </div>
  );
}