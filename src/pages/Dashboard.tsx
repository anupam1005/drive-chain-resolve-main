import { Car, FileText, AlertTriangle, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { IoTSimulation } from '@/components/IoTSimulation';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { vehicles, rentals, violations, disputes } = useBlockchain();

  const activeRentals = rentals.filter(r => r.status === 'active');
  const pendingViolations = violations.filter(v => v.status === 'pending');
  const pendingDisputes = disputes.filter(d => d.status === 'pending');
  const availableVehicles = vehicles.filter(v => v.isAvailable);

  const stats = [
    {
      title: 'Available Vehicles',
      value: availableVehicles.length,
      total: vehicles.length,
      icon: Car,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Active Rentals',
      value: activeRentals.length,
      total: rentals.length,
      icon: FileText,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Pending Violations',
      value: pendingViolations.length,
      total: violations.length,
      icon: AlertTriangle,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Open Disputes',
      value: pendingDisputes.length,
      total: disputes.length,
      icon: Users,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-hero rounded-xl p-8 text-white">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to DriveChain
          </h1>
          <p className="text-xl opacity-90 mb-6">
            Decentralized car rental platform with smart contract-powered dispute resolution
          </p>
          <div className="flex space-x-4">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link to="/vehicles">Browse Vehicles</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-white text-primary border-white hover:bg-white/90">
              <Link to="/rentals">View Rentals</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-full p-2 ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  of {stat.total} total
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Rentals */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Recent Rentals</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rentals.slice(0, 3).length > 0 ? (
              <div className="space-y-4">
                {rentals.slice(0, 3).map((rental) => {
                  const vehicle = vehicles.find(v => v.id === rental.vehicleId);
                  return (
                    <div key={rental.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{rental.driverName}</p>
                        <p className="text-sm text-muted-foreground">
                          {vehicle ? `${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          rental.status === 'active' ? 'text-success' : 
                          rental.status === 'disputed' ? 'text-destructive' : 'text-muted-foreground'
                        }`}>
                          {rental.status}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(rental.startTime).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <Button asChild variant="outline" className="w-full">
                  <Link to="/rentals">View All Rentals</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No rentals yet</p>
                <Button asChild className="mt-4">
                  <Link to="/vehicles">Start First Rental</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Violations */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Recent Violations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {violations.slice(0, 3).length > 0 ? (
              <div className="space-y-4">
                {violations.slice(0, 3).map((violation) => (
                  <div key={violation.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium capitalize">{violation.type.replace('_', ' ')}</p>
                      <p className="text-sm text-muted-foreground">{violation.driverName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${violation.fineAmount}</p>
                      <p className={`text-xs ${
                        violation.status === 'disputed' ? 'text-destructive' : 'text-warning'
                      }`}>
                        {violation.status}
                      </p>
                    </div>
                  </div>
                ))}
                <Button asChild variant="outline" className="w-full">
                  <Link to="/violations">View All Violations</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No violations recorded</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* IoT Simulation */}
      <IoTSimulation />
    </div>
  );
}