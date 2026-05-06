export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  owner: string;
  isAvailable: boolean;
  pricePerDay: number;
  location: string;
  imageUrl?: string;
  features: string[];
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  transmission: 'manual' | 'automatic';
  registrationTimestamp: number;
}

export interface Rental {
  id: string;
  vehicleId: string;
  driverName: string;
  driverLicense: string;
  startTime: number;
  endTime?: number;
  totalCost?: number;
  status: 'active' | 'completed' | 'disputed';
  renterAddress: string;
  depositAmount: number;
}

export interface Violation {
  id: string;
  vehicleId: string;
  rentalId: string;
  type: 'speeding' | 'parking' | 'red_light' | 'other';
  description: string;
  fineAmount: number;
  timestamp: number;
  location: string;
  driverName: string;
  isDisputed: boolean;
  evidenceUrl?: string;
  status: 'pending' | 'paid' | 'disputed' | 'resolved';
}

export interface Dispute {
  id: string;
  rentalId: string;
  violationId: string;
  reason: string;
  submittedBy: string;
  submissionTime: number;
  status: 'pending' | 'under_review' | 'resolved' | 'rejected';
  resolution?: string;
  resolvedBy?: string;
  resolutionTime?: number;
}

export interface BlockchainState {
  vehicles: Vehicle[];
  rentals: Rental[];
  violations: Violation[];
  disputes: Dispute[];
  connectedAddress?: string;
  isLoading: boolean;
}