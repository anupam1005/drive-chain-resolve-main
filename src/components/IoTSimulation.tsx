import { useState, useEffect } from 'react';
import { Activity, MapPin, Gauge, AlertTriangle, Car } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useBlockchain } from '@/contexts/BlockchainContext';

interface IoTEvent {
  id: string;
  vehicleId: string;
  type: 'speed_violation' | 'location_update' | 'engine_status' | 'fuel_level';
  data: any;
  timestamp: number;
}

export function IoTSimulation() {
  const { vehicles, createViolation } = useBlockchain();
  const [events, setEvents] = useState<IoTEvent[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Simulate IoT events
  useEffect(() => {
    if (!isSimulating || vehicles.length === 0) return;

    const interval = setInterval(() => {
      const rentedVehicles = vehicles.filter(v => !v.isAvailable);
      if (rentedVehicles.length === 0) return;

      const randomVehicle = rentedVehicles[Math.floor(Math.random() * rentedVehicles.length)];
      const eventTypes = ['speed_violation', 'location_update', 'engine_status', 'fuel_level'];
      const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)] as IoTEvent['type'];

      let eventData;
      switch (randomType) {
        case 'speed_violation':
          eventData = {
            speed: Math.floor(Math.random() * 40) + 80, // 80-120 mph
            speedLimit: 65,
            location: 'Highway 101, Mile ' + Math.floor(Math.random() * 100),
          };
          break;
        case 'location_update':
          eventData = {
            lat: 37.7749 + (Math.random() - 0.5) * 0.1,
            lng: -122.4194 + (Math.random() - 0.5) * 0.1,
            address: 'San Francisco, CA',
          };
          break;
        case 'engine_status':
          eventData = {
            temperature: Math.floor(Math.random() * 40) + 160,
            oil_pressure: Math.floor(Math.random() * 20) + 30,
            rpm: Math.floor(Math.random() * 2000) + 1000,
          };
          break;
        case 'fuel_level':
          eventData = {
            level: Math.floor(Math.random() * 100),
            range: Math.floor(Math.random() * 300) + 50,
          };
          break;
      }

      const newEvent: IoTEvent = {
        id: Date.now().toString(),
        vehicleId: randomVehicle.id,
        type: randomType,
        data: eventData,
        timestamp: Date.now(),
      };

      setEvents(prev => [newEvent, ...prev.slice(0, 19)]); // Keep last 20 events

      // Auto-generate violation for speed violations
      if (randomType === 'speed_violation' && eventData.speed > eventData.speedLimit + 15) {
        setTimeout(() => {
          createViolation(
            randomVehicle.id,
            'speeding',
            `Exceeded speed limit by ${eventData.speed - eventData.speedLimit} mph`,
            Math.floor((eventData.speed - eventData.speedLimit) * 5), // $5 per mph over
            eventData.location
          );
        }, 2000);
      }
    }, 3000); // New event every 3 seconds

    return () => clearInterval(interval);
  }, [isSimulating, vehicles, createViolation]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'speed_violation':
        return <Gauge className="h-4 w-4 text-destructive" />;
      case 'location_update':
        return <MapPin className="h-4 w-4 text-primary" />;
      case 'engine_status':
        return <Activity className="h-4 w-4 text-warning" />;
      case 'fuel_level':
        return <Car className="h-4 w-4 text-success" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'speed_violation':
        return 'border-destructive/20 bg-destructive/5';
      case 'location_update':
        return 'border-primary/20 bg-primary/5';
      case 'engine_status':
        return 'border-warning/20 bg-warning/5';
      case 'fuel_level':
        return 'border-success/20 bg-success/5';
      default:
        return 'border-border bg-muted/5';
    }
  };

  const formatEventData = (type: string, data: any) => {
    switch (type) {
      case 'speed_violation':
        return `${data.speed} mph (limit: ${data.speedLimit}) at ${data.location}`;
      case 'location_update':
        return `${data.address} (${data.lat.toFixed(4)}, ${data.lng.toFixed(4)})`;
      case 'engine_status':
        return `Temp: ${data.temperature}°F, Oil: ${data.oil_pressure} PSI, RPM: ${data.rpm}`;
      case 'fuel_level':
        return `${data.level}% fuel, ${data.range} miles range`;
      default:
        return JSON.stringify(data);
    }
  };

  const rentedVehicles = vehicles.filter(v => !v.isAvailable);

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>IoT Simulation</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={isSimulating ? "default" : "secondary"}>
              {isSimulating ? "Active" : "Inactive"}
            </Badge>
            <Button
              size="sm"
              onClick={() => setIsSimulating(!isSimulating)}
              disabled={rentedVehicles.length === 0}
              variant={isSimulating ? "destructive" : "default"}
            >
              {isSimulating ? "Stop" : "Start"} Simulation
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {rentedVehicles.length === 0 ? (
          <div className="text-center py-8">
            <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No vehicles currently rented</p>
            <p className="text-sm text-muted-foreground">Start a rental to simulate IoT events</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {isSimulating ? "Waiting for events..." : "Start simulation to see IoT events"}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {events.map((event) => {
              const vehicle = vehicles.find(v => v.id === event.vehicleId);
              return (
                <div
                  key={event.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${getEventColor(event.type)}`}
                >
                  <div className="mt-0.5">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium capitalize">
                        {event.type.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle'}
                    </p>
                    <p className="text-sm">{formatEventData(event.type, event.data)}</p>
                    {event.type === 'speed_violation' && event.data.speed > event.data.speedLimit + 15 && (
                      <div className="mt-2 flex items-center space-x-1">
                        <AlertTriangle className="h-3 w-3 text-destructive" />
                        <span className="text-xs text-destructive font-medium">
                          Violation will be automatically issued
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}