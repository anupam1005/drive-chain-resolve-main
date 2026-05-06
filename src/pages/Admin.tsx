import { Users, FileText, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBlockchain } from '@/contexts/BlockchainContext';

export default function Admin() {
  const { vehicles, rentals, violations, disputes } = useBlockchain();

  const pendingDisputes = disputes.filter(d => d.status === 'pending');
  const underReviewDisputes = disputes.filter(d => d.status === 'under_review');
  const resolvedDisputes = disputes.filter(d => d.status === 'resolved');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'under_review':
        return 'bg-primary text-primary-foreground';
      case 'resolved':
        return 'bg-success text-success-foreground';
      case 'rejected':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const stats = [
    {
      title: 'Total Vehicles',
      value: vehicles.length,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Active Rentals',
      value: rentals.filter(r => r.status === 'active').length,
      icon: FileText,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Pending Disputes',
      value: pendingDisputes.length,
      icon: AlertTriangle,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Total Violations',
      value: violations.length,
      icon: XCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage disputes and monitor platform activity</p>
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
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dispute Management */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Dispute Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">Pending ({pendingDisputes.length})</TabsTrigger>
              <TabsTrigger value="review">Under Review ({underReviewDisputes.length})</TabsTrigger>
              <TabsTrigger value="resolved">Resolved ({resolvedDisputes.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              {pendingDisputes.length > 0 ? (
                <div className="space-y-4">
                  {pendingDisputes.map((dispute) => {
                    const violation = violations.find(v => v.id === dispute.violationId);
                    const rental = rentals.find(r => r.id === dispute.rentalId);
                    const vehicle = vehicles.find(v => v.id === violation?.vehicleId);

                    return (
                      <div key={dispute.id} className="border border-border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-semibold">Dispute #{dispute.id.slice(0, 8)}</h4>
                            <p className="text-sm text-muted-foreground">
                              Filed on {new Date(dispute.submissionTime).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={getStatusColor(dispute.status)}>
                            {dispute.status}
                          </Badge>
                        </div>

                        {violation && vehicle && rental && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm font-medium mb-1">Vehicle</p>
                              <p className="text-sm text-muted-foreground">
                                {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">Violation</p>
                              <p className="text-sm text-muted-foreground capitalize">
                                {violation.type.replace('_', ' ')} - ${violation.fineAmount}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">Driver</p>
                              <p className="text-sm text-muted-foreground">{rental.driverName}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">Date</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(violation.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="mb-4">
                          <p className="text-sm font-medium mb-2">Dispute Reason</p>
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm">{dispute.reason}</p>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button size="sm" className="flex-1">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Accept Dispute
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Clock className="h-4 w-4 mr-2" />
                            Review Later
                          </Button>
                          <Button size="sm" variant="destructive" className="flex-1">
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject Dispute
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No pending disputes</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="review" className="mt-6">
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No disputes under review</p>
              </div>
            </TabsContent>

            <TabsContent value="resolved" className="mt-6">
              {resolvedDisputes.length > 0 ? (
                <div className="space-y-4">
                  {resolvedDisputes.map((dispute) => {
                    const violation = violations.find(v => v.id === dispute.violationId);
                    const rental = rentals.find(r => r.id === dispute.rentalId);
                    const vehicle = vehicles.find(v => v.id === violation?.vehicleId);

                    return (
                      <div key={dispute.id} className="border border-border rounded-lg p-4 opacity-75">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">Dispute #{dispute.id.slice(0, 8)}</h4>
                            <p className="text-sm text-muted-foreground">
                              Resolved on {dispute.resolutionTime ? new Date(dispute.resolutionTime).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <Badge className={getStatusColor(dispute.status)}>
                            {dispute.status}
                          </Badge>
                        </div>

                        {dispute.resolution && (
                          <div className="mt-2">
                            <p className="text-sm font-medium mb-1">Resolution</p>
                            <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                              <p className="text-sm">{dispute.resolution}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No resolved disputes</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Recent Platform Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...rentals, ...violations].sort((a, b) => {
              const aTime = 'startTime' in a ? a.startTime : a.timestamp;
              const bTime = 'startTime' in b ? b.startTime : b.timestamp;
              return bTime - aTime;
            }).slice(0, 5).map((item) => {
              const isRental = 'startTime' in item;
              const time = isRental ? item.startTime : item.timestamp;
              const vehicle = vehicles.find(v => v.id === item.vehicleId);
              
              return (
                <div key={item.id} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                  <div className={`rounded-full p-2 ${isRental ? 'bg-success/10' : 'bg-warning/10'}`}>
                    {isRental ? (
                      <FileText className={`h-4 w-4 text-success`} />
                    ) : (
                      <AlertTriangle className={`h-4 w-4 text-warning`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {isRental ? `New rental by ${item.driverName}` : `${item.type.replace('_', ' ')} violation`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown vehicle'} • {new Date(time).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}