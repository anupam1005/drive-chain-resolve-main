import { useState } from 'react';
import { Plus, Car, Fuel, Settings, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { Vehicle } from '@/types/blockchain';

export default function Vehicles() {
  const { vehicles, registerVehicle, isLoading } = useBlockchain();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    vin: '',
    pricePerDay: 50,
    location: '',
    features: '',
    fuelType: 'gasoline' as Vehicle['fuelType'],
    transmission: 'automatic' as Vehicle['transmission'],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const featuresArray = formData.features.split(',').map(f => f.trim()).filter(f => f);
    
    await registerVehicle({
      ...formData,
      features: featuresArray,
      isAvailable: true,
      owner: '', // Will be set in the context
    });
    
    setIsDialogOpen(false);
    setFormData({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      licensePlate: '',
      vin: '',
      pricePerDay: 50,
      location: '',
      features: '',
      fuelType: 'gasoline',
      transmission: 'automatic',
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">Vehicle Fleet</h1>
          <p className="text-muted-foreground">Manage your registered vehicles</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Register Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Register New Vehicle</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="make">Make</Label>
                  <Input
                    id="make"
                    value={formData.make}
                    onChange={(e) => handleInputChange('make', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pricePerDay">Price per Day ($)</Label>
                  <Input
                    id="pricePerDay"
                    type="number"
                    value={formData.pricePerDay}
                    onChange={(e) => handleInputChange('pricePerDay', parseInt(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="licensePlate">License Plate</Label>
                <Input
                  id="licensePlate"
                  value={formData.licensePlate}
                  onChange={(e) => handleInputChange('licensePlate', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="vin">VIN</Label>
                <Input
                  id="vin"
                  value={formData.vin}
                  onChange={(e) => handleInputChange('vin', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., San Francisco, CA"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fuelType">Fuel Type</Label>
                  <Select value={formData.fuelType} onValueChange={(value) => handleInputChange('fuelType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gasoline">Gasoline</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="transmission">Transmission</Label>
                  <Select value={formData.transmission} onValueChange={(value) => handleInputChange('transmission', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="automatic">Automatic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="features">Features (comma-separated)</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => handleInputChange('features', e.target.value)}
                  placeholder="e.g., GPS, Bluetooth, Air Conditioning"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Registering...' : 'Register Vehicle'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vehicle Grid */}
      {vehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="shadow-card hover:shadow-automotive transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </CardTitle>
                    <p className="text-muted-foreground">{vehicle.licensePlate}</p>
                  </div>
                  <Badge variant={vehicle.isAvailable ? "default" : "secondary"}>
                    {vehicle.isAvailable ? "Available" : "Rented"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-2xl font-bold text-primary">
                  <span>${vehicle.pricePerDay}</span>
                  <span className="text-sm font-normal text-muted-foreground">per day</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{vehicle.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Fuel className="h-4 w-4" />
                    <span className="capitalize">{vehicle.fuelType}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Settings className="h-4 w-4" />
                    <span className="capitalize">{vehicle.transmission}</span>
                  </div>
                </div>

                {vehicle.features.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Features:</p>
                    <div className="flex flex-wrap gap-1">
                      {vehicle.features.slice(0, 3).map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {vehicle.features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{vehicle.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full" 
                  disabled={!vehicle.isAvailable}
                  variant={vehicle.isAvailable ? "default" : "secondary"}
                >
                  {vehicle.isAvailable ? "Rent Now" : "Currently Rented"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-card">
          <CardContent className="text-center py-12">
            <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No vehicles registered</h3>
            <p className="text-muted-foreground mb-6">
              Start by registering your first vehicle to the platform
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary hover:opacity-90">
                  <Plus className="h-4 w-4 mr-2" />
                  Register First Vehicle
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}