'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [simulatedLink, setSimulatedLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.errors?.[0] || result.message || 'Verification check failed.');
      }

      setSuccess(true);
      // Simulate/output link for local review
      setSimulatedLink(`/auth/reset-password?email=${encodeURIComponent(email)}`);
      toast.success('Reset link generated!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-md border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Forgot <span className="text-orange-600">Password?</span>
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Enter your email to receive a password reset simulation link.
          </p>
        </div>

        {success ? (
          <div className="space-y-4">
            <div className="bg-green-50 text-green-600 text-sm p-4 rounded-xl border border-green-200 font-medium">
              <ShieldCheck className="inline-block mr-1.5 w-4 h-4" /> Reset link generated for locally running server.
            </div>
            <Link
              href={simulatedLink}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors shadow-md"
            >
              Go to Reset Password Screen <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase">Registered Email Address</label>
              <div className="mt-1.5 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-orange-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors shadow-md disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : 'Get Simulation Link'}
            </button>
          </form>
        )}

        <div className="text-center text-sm text-gray-600">
          Back to{' '}
          <Link href="/auth/login" className="text-orange-600 font-semibold hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
