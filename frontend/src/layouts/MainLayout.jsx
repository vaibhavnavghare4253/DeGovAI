import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { 
  LayoutDashboard, 
  FileText, 
  Wallet, 
  Bot, 
  Menu,
  X 
} from 'lucide-react';
import { useState } from 'react';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Proposals', href: '/proposals', icon: FileText },
    { name: 'Treasury', href: '/treasury', icon: Wallet },
    { name: 'AI Analytics', href: '/ai-analytics', icon: Bot },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen">
      {/* Animated Grid Background */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 217, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 217, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite'
        }}></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/70 border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center relative overflow-hidden animate-float">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent animate-shimmer"></div>
                <Bot className="w-7 h-7 text-white relative z-10 animate-pulse-slow" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
                  AI-DAO Governance
                </h1>
                <p className="text-xs text-cyan-400/70 font-medium">Powered by AI Agents</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden group ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 shadow-lg shadow-cyan-500/20'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive(item.href) ? 'animate-pulse' : ''}`} />
                    <span>{item.name}</span>
                    {isActive(item.href) && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500"></div>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Connect Wallet Button */}
            <div className="flex items-center space-x-4">
              <div className="[&_button]:!bg-gradient-to-r [&_button]:!from-cyan-500 [&_button]:!via-blue-500 [&_button]:!to-purple-600 [&_button]:!border-0 [&_button]:!shadow-lg [&_button]:!shadow-cyan-500/30 [&_button]:hover:!shadow-cyan-500/50 [&_button]:hover:!scale-105 [&_button]:!transition-all [&_button]:!duration-300">
                <ConnectButton />
              </div>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 transition-all duration-300 text-white"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-cyan-500/20 bg-slate-900/90 backdrop-blur-xl animate-slide-down">
            <nav className="px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="animate-slide-up">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-20 backdrop-blur-xl bg-slate-900/60 border-t border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-bold text-cyan-400 mb-4 uppercase tracking-wider">About</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                AI-powered DAO governance system combining blockchain transparency
                with artificial intelligence for better decision-making.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-cyan-400 mb-4 uppercase tracking-wider">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors duration-200 flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                  <span>Documentation</span>
                </a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors duration-200 flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                  <span>Whitepaper</span>
                </a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors duration-200 flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                  <span>GitHub</span>
                </a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-cyan-400 mb-4 uppercase tracking-wider">Community</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors duration-200 flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                  <span>Discord</span>
                </a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors duration-200 flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                  <span>Twitter</span>
                </a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors duration-200 flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                  <span>Forum</span>
                </a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-cyan-500/10 text-center">
            <p className="text-sm text-gray-500 font-medium">
              &copy; 2024 <span className="text-cyan-400">AI-DAO Governance</span>. Created by <span className="text-purple-400">Vaibhav Navghare</span>. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes gridMove {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }
      `}</style>
    </div>
  );
};

export default MainLayout;

