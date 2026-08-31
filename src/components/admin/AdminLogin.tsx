import React from 'react';

interface AdminLoginProps {
  username: string;
  setUsername: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  loginError: string;
  onSubmit: (e: React.FormEvent) => void;
  onBackToSite: () => void;
}

export default function AdminLogin({
  username,
  setUsername,
  password,
  setPassword,
  loginError,
  onSubmit,
  onBackToSite
}: AdminLoginProps) {
  return (
    <div className="min-h-screen w-screen bg-white flex overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] w-full h-screen overflow-hidden font-sans">
        
        {/* Left Column: Business Branding Themed Panel */}
        <div className="bg-slate-950 bg-gradient-to-br from-slate-900 to-slate-950 text-white p-12 md:p-20 flex flex-col justify-center h-full relative">
          <img src="/assets/logo.png" alt="B.B.K. Logo" className="w-24 h-24 object-contain rounded-full bg-white/10 p-1 mb-6 align-self-start shadow-lg" />
          <div className="text-sm text-blue-500 font-bold uppercase tracking-widest mb-2">
            DIY Korean Ramyeon
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight m-0 text-white">
            B.B.K. Ramyeon Hauz
          </h1>
          <div className="w-20 h-1 bg-blue-500 my-8 rounded-full"></div>
          <p className="text-base font-bold tracking-[0.25em] opacity-80 m-0">
            MAKE • EAT • ENJOY
          </p>
          
          <div className="flex flex-col gap-4 mt-auto border-t border-white/10 pt-8">
            <div className="text-sm font-semibold opacity-75">Open Daily: 9am - 9pm</div>
            <div className="text-sm font-semibold opacity-75">Location: San Pablo City, Philippines</div>
          </div>
        </div>

        {/* Right Column: Clean White input form */}
        <div className="bg-white p-12 md:p-20 flex flex-col justify-center h-full overflow-y-auto">
          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-slate-950 m-0 mb-2">
              Welcome Back
            </h2>
            <p className="text-sm text-slate-500 m-0 leading-relaxed">
              Access the store administration dashboard portal
            </p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            {loginError && (
              <div className="bg-red-50 text-red-600 border border-red-100 p-3.5 rounded-xl text-sm font-bold text-center">
                Error: {loginError}
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <label htmlFor="login-username" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Email Address
              </label>
              <input
                type="email"
                id="login-username"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-sm font-semibold focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all box-sizing-border"
                placeholder="Enter email address"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="login-password" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Password
              </label>
              <input
                type="password"
                id="login-password"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-sm font-semibold focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all box-sizing-border"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-slate-950 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/15 hover:shadow-xl hover:shadow-slate-950/10 transition-all cursor-pointer border-none text-center"
            >
              Sign In to Dashboard
            </button>
          </form>

          <div className="text-center mt-8 pt-6 border-t border-slate-100">
            <button 
              type="button" 
              className="bg-none border-none text-blue-600 hover:text-blue-700 hover:underline font-bold text-sm cursor-pointer mb-2"
              onClick={onBackToSite}
            >
              Back to Customer Site
            </button>
            <p className="text-xs text-slate-400 m-0">
              Demo credentials: <strong>admin@bbk.com</strong> | <strong>admin123</strong>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
