import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-[#FAFAFA]">
      <div className="w-full max-w-[400px] p-8 sm:p-10 bg-white rounded-2xl shadow-xl shadow-gray-200/40 border border-gray-200/60">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shadow-inner mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0-6l-9-5m9 5l9-5"></path></svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Sign in to CampusFlow</h2>
          <p className="text-sm text-gray-500 mt-2">Enter your credentials to access the ERP.</p>
        </div>
        {error && <div className="p-3 mb-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg text-center font-medium">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Email</label>
            <input className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none sm:text-sm" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Password</label>
            <input className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none sm:text-sm" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="w-full bg-black text-white font-medium py-2.5 px-4 rounded-lg shadow-sm hover:bg-gray-800 transition-colors" type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
