import { useState } from 'react';
import { Plus, AlertTriangle, Car, Calendar, MapPin, DollarSign, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { Violation } from '@/types/blockchain';

export default function Violations() {
  const { vehicles, rentals, violations, createViolation, createDispute, isLoading } = useBlockchain();
  const [isViolationDialogOpen, setIsViolationDialogOpen] = useState(false);
  const [isDisputeDialogOpen, setIsDisputeDialogOpen] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [violationFormData, setViolationFormData] = useState({
    vehicleId: '',
    type: 'speeding' as Violation['type'],
    description: '',
    fineAmount: 100,
    location: '',
  });
  const [disputeReason, setDisputeReason] = useState('');

  // Get vehicles that are currently rented
  const rentedVehicles = vehicles.filter(v => !v.isAvailable);

  const handleViolationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createViolation(
      violationFormData.vehicleId,
      violationFormData.type,
      violationFormData.description,
      violationFormData.fineAmount,
      violationFormData.location
    );
    
    setIsViolationDialogOpen(false);
    setViolationFormData({
      vehicleId: '',
      type: 'speeding',
      description: '',
      fineAmount: 100,
      location: '',
    });
  };

  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedViolation) {
      const rental = rentals.find(r => r.id === selectedViolation.rentalId);
      if (rental) {
        await createDispute(rental.id, selectedViolation.id, disputeReason);
      }
    }
    
    setIsDisputeDialogOpen(false);
    setDisputeReason('');
    setSelectedViolation(null);
  };

  const handleViolationInputChange = (field: string, value: any) => {
    setViolationFormData(prev => ({ ...prev, [field]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'paid':
        return 'bg-success text-success-foreground';
      case 'disputed':
        return 'bg-destructive text-destructive-foreground';
      case 'resolved':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'speeding':
        return '🚗💨';
      case 'parking':
        return '🅿️';
      case 'red_light':
        return '🚦';
      default:
        return '⚠️';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">Violations & Fines</h1>
          <p className="text-muted-foreground">Manage traffic violations and disputes</p>
        </div>
        
        <Dialog open={isViolationDialogOpen} onOpenChange={setIsViolationDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-primary hover:opacity-90"
              disabled={rentedVehicles.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Record Violation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Record New Violation</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleViolationSubmit} className="space-y-4">
              <div>
                <Label htmlFor="vehicleId">Select Vehicle</Label>
                <Select value={violationFormData.vehicleId} onValueChange={(value) => handleViolationInputChange('vehicleId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a rented vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {rentedVehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type">Violation Type</Label>
                <Select value={violationFormData.type} onValueChange={(value) => handleViolationInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="speeding">Speeding</SelectItem>
                    <SelectItem value="parking">Parking Violation</SelectItem>
                    <SelectItem value="red_light">Red Light</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={violationFormData.description}
                  onChange={(e) => handleViolationInputChange('description', e.target.value)}
                  placeholder="Describe the violation..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="fineAmount">Fine Amount ($)</Label>
                <Input
                  id="fineAmount"
                  type="number"
                  value={violationFormData.fineAmount}
                  onChange={(e) => handleViolationInputChange('fineAmount', parseInt(e.target.value))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={violationFormData.location}
                  onChange={(e) => handleViolationInputChange('location', e.target.value)}
                  placeholder="e.g., Main St & 1st Ave"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Recording...' : 'Record Violation'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Violations Grid */}
      {violations.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {violations.map((violation) => {
            const vehicle = vehicles.find(v => v.id === violation.vehicleId);
            
            return (
              <Card key={violation.id} className="shadow-card">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span className="text-2xl">{getTypeIcon(violation.type)}</span>
                        <span className="capitalize">{violation.type.replace('_', ' ')}</span>
                      </CardTitle>
                      <p className="text-muted-foreground">{violation.driverName}</p>
                    </div>
                    <Badge className={getStatusColor(violation.status)}>
                      {violation.status}
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

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(violation.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{violation.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-bold text-destructive">${violation.fineAmount}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm">{violation.description}</p>
                  </div>

                  {violation.status === 'pending' && !violation.isDisputed && (
                    <div className="flex space-x-2">
                      <Button variant="outline" className="flex-1">
                        Pay Fine
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedViolation(violation);
                          setIsDisputeDialogOpen(true);
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Dispute
                      </Button>
                    </div>
                  )}

                  {violation.isDisputed && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm text-destructive font-medium">
                        This violation is currently under dispute
                      </p>
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
            <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No violations recorded</h3>
            <p className="text-muted-foreground mb-6">
              {rentedVehicles.length === 0 
                ? "No vehicles are currently rented" 
                : "Record violations for active rentals"
              }
            </p>
            {rentedVehicles.length > 0 && (
              <Dialog open={isViolationDialogOpen} onOpenChange={setIsViolationDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary hover:opacity-90">
                    <Plus className="h-4 w-4 mr-2" />
                    Record First Violation
                  </Button>
                </DialogTrigger>
              </Dialog>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dispute Dialog */}
      <Dialog open={isDisputeDialogOpen} onOpenChange={setIsDisputeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>File Dispute</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDisputeSubmit} className="space-y-4">
            <div>
              <Label htmlFor="disputeReason">Reason for Dispute</Label>
              <Textarea
                id="disputeReason"
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Explain why you believe this violation is incorrect..."
                required
              />
            </div>

            <div className="flex space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setIsDisputeDialogOpen(false);
                  setDisputeReason('');
                  setSelectedViolation(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? 'Filing...' : 'File Dispute'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}