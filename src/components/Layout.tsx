import { Car, FileText, Users, AlertTriangle, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Car },
  { name: 'Vehicles', href: '/vehicles', icon: Car },
  { name: 'Rentals', href: '/rentals', icon: FileText },
  { name: 'Violations', href: '/violations', icon: AlertTriangle },
  { name: 'Admin', href: '/admin', icon: Users },
];

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { connectedAddress, connectWallet, isLoading } = useBlockchain();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <Car className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  DriveChain
                </span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center space-x-4">
              {connectedAddress ? (
                <div className="flex items-center space-x-2 text-sm">
                  <div className="h-2 w-2 bg-success rounded-full"></div>
                  <span className="hidden sm:inline text-muted-foreground">
                    {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
                  </span>
                </div>
              ) : (
                <Button 
                  onClick={connectWallet} 
                  disabled={isLoading}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden border-t border-border">
          <div className="px-2 py-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}