import { useState } from 'react';
import { Plus, Calendar, User, Car, Clock, DollarSign, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBlockchain } from '@/contexts/BlockchainContext';
import GPSTracker from '@/components/GPSTracker';

export default function Rentals() {
  const { vehicles, rentals, createRental, endRental, isLoading } = useBlockchain();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRentalForTracking, setSelectedRentalForTracking] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    vehicleId: '',
    driverName: '',
    driverLicense: '',
    depositAmount: 200,
  });

  const availableVehicles = vehicles.filter(v => v.isAvailable);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRental(
      formData.vehicleId,
      formData.driverName,
      formData.driverLicense,
      formData.depositAmount
    );
    
    setIsDialogOpen(false);
    setFormData({
      vehicleId: '',
      driverName: '',
      driverLicense: '',
      depositAmount: 200,
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEndRental = async (rentalId: string) => {
    await endRental(rentalId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success text-success-foreground';
      case 'completed':
        return 'bg-muted text-muted-foreground';
      case 'disputed':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">Rental Management</h1>
          <p className="text-muted-foreground">Track and manage vehicle rentals</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-primary hover:opacity-90"
              disabled={availableVehicles.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Rental
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Rental</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="vehicleId">Select Vehicle</Label>
                <Select value={formData.vehicleId} onValueChange={(value) => handleInputChange('vehicleId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="driverName">Driver Name</Label>
                <Input
                  id="driverName"
                  value={formData.driverName}
                  onChange={(e) => handleInputChange('driverName', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="driverLicense">Driver License Number</Label>
                <Input
                  id="driverLicense"
                  value={formData.driverLicense}
                  onChange={(e) => handleInputChange('driverLicense', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="depositAmount">Security Deposit ($)</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  value={formData.depositAmount}
                  onChange={(e) => handleInputChange('depositAmount', parseInt(e.target.value))}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Start Rental'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rentals Grid */}
      {rentals.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {rentals.map((rental) => {
            const vehicle = vehicles.find(v => v.id === rental.vehicleId);
            const duration = rental.endTime 
              ? (rental.endTime - rental.startTime) / (1000 * 60 * 60 * 24)
              : (Date.now() - rental.startTime) / (1000 * 60 * 60 * 24);

            return (
              <Card key={rental.id} className="shadow-card">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="h-5 w-5" />
                        <span>{rental.driverName}</span>
                      </CardTitle>
                      <p className="text-muted-foreground">License: {rental.driverLicense}</p>
                    </div>
                    <Badge className={getStatusColor(rental.status)}>
                      {rental.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {vehicle && (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Car className="h-4 w-4" />
                      <span>{vehicle.year} {vehicle.make} {vehicle.model}</span>
                      <span>({vehicle.licensePlate})</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Start</p>
                        <p className="text-muted-foreground">
                          {new Date(rental.startTime).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {rental.endTime && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">End</p>
                          <p className="text-muted-foreground">
                            {new Date(rental.endTime).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Duration</p>
                        <p className="text-muted-foreground">
                          {Math.ceil(duration)} day{Math.ceil(duration) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {rental.totalCost ? 'Total Cost' : 'Deposit'}
                        </p>
                        <p className="text-muted-foreground">
                          ${rental.totalCost || rental.depositAmount}
                        </p>
                      </div>
                    </div>
                  </div>

                  {rental.status === 'active' && (
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => setSelectedRentalForTracking(
                          selectedRentalForTracking === rental.id ? null : rental.id
                        )}
                        variant="outline"
                        className="flex-1"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        {selectedRentalForTracking === rental.id ? 'Hide GPS' : 'Track GPS'}
                      </Button>
                      <Button 
                        onClick={() => handleEndRental(rental.id)}
                        className="flex-1"
                        disabled={isLoading}
                      >
                        End Rental
                      </Button>
                    </div>
                  )}
                  
                  {/* GPS Tracker */}
                  {rental.status === 'active' && selectedRentalForTracking === rental.id && (
                    <div className="mt-4">
                      <GPSTracker rental={rental} vehicle={vehicle} />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="shadow-card">
          <CardContent className="text-center py-12">
            <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No rentals yet</h3>
            <p className="text-muted-foreground mb-6">
              {availableVehicles.length === 0 
                ? "Register some vehicles first to start renting" 
                : "Create your first rental to get started"
              }
            </p>
            {availableVehicles.length > 0 && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary hover:opacity-90">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Rental
                  </Button>
                </DialogTrigger>
              </Dialog>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}