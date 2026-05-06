import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';
import { useBlockchain } from '@/contexts/BlockchainContext';
import type { Rental, Vehicle } from '@/types/blockchain';

interface GPSTrackerProps {
  rental: Rental;
  vehicle?: Vehicle;
}

const GPSTracker: React.FC<GPSTrackerProps> = ({ rental, vehicle }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isTokenSet, setIsTokenSet] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({
    lng: -74.006, // Default to NYC
    lat: 40.7128,
  });

  // Simulate real-time GPS updates
  useEffect(() => {
    if (!isTokenSet) return;

    const interval = setInterval(() => {
      // Simulate small GPS movements (within ~100m radius)
      setCurrentLocation(prev => ({
        lng: prev.lng + (Math.random() - 0.5) * 0.001,
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
      }));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isTokenSet]);

  // Initialize map when token is set
  useEffect(() => {
    if (!mapContainer.current || !isTokenSet || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [currentLocation.lng, currentLocation.lat],
      zoom: 15,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Create initial marker
    marker.current = new mapboxgl.Marker({ color: '#3b82f6' })
      .setLngLat([currentLocation.lng, currentLocation.lat])
      .addTo(map.current);

    return () => {
      map.current?.remove();
    };
  }, [isTokenSet, mapboxToken]);

  // Update marker position when location changes
  useEffect(() => {
    if (marker.current && isTokenSet) {
      marker.current.setLngLat([currentLocation.lng, currentLocation.lat]);
      map.current?.easeTo({
        center: [currentLocation.lng, currentLocation.lat],
        duration: 1000,
      });
    }
  }, [currentLocation, isTokenSet]);

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapboxToken.trim()) {
      setIsTokenSet(true);
    }
  };

  const handleCenterMap = () => {
    if (map.current) {
      map.current.easeTo({
        center: [currentLocation.lng, currentLocation.lat],
        zoom: 15,
        duration: 1000,
      });
    }
  };

  if (!isTokenSet) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <span>GPS Tracking Setup Required</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            To enable GPS tracking, please enter your Mapbox public token. 
            You can get one at{' '}
            <a 
              href="https://mapbox.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              mapbox.com
            </a>
          </p>
          <form onSubmit={handleTokenSubmit} className="space-y-4">
            <div>
              <Label htmlFor="mapboxToken">Mapbox Public Token</Label>
              <Input
                id="mapboxToken"
                type="password"
                placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIi..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Enable GPS Tracking
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span>Live GPS Tracking</span>
          </CardTitle>
          <Button onClick={handleCenterMap} size="sm" variant="outline">
            <Navigation className="h-4 w-4 mr-2" />
            Center
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {vehicle && (
          <div className="text-sm">
            <p className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</p>
            <p className="text-muted-foreground">License: {vehicle.licensePlate}</p>
            <p className="text-muted-foreground">Driver: {rental.driverName}</p>
          </div>
        )}
        
        <div className="relative h-64 rounded-lg overflow-hidden border">
          <div ref={mapContainer} className="absolute inset-0" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium">Latitude</p>
            <p className="text-muted-foreground">{currentLocation.lat.toFixed(6)}</p>
          </div>
          <div>
            <p className="font-medium">Longitude</p>
            <p className="text-muted-foreground">{currentLocation.lng.toFixed(6)}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-success">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span>Live tracking active</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default GPSTracker;