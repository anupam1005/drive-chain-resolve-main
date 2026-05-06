import { ethers } from 'ethers';
import { Vehicle, Rental, Violation, Dispute } from '@/types/blockchain';
import { v4 as uuidv4 } from 'uuid';

// Mock blockchain data - in a real app, this would interact with actual smart contracts
class MockBlockchain {
  private vehicles: Vehicle[] = [];
  private rentals: Rental[] = [];
  private violations: Violation[] = [];
  private disputes: Dispute[] = [];
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  constructor() {
    this.initializeMockData();
  }

  async connectWallet(): Promise<string | null> {
    if (typeof (window as any).ethereum !== 'undefined') {
      try {
        this.provider = new ethers.BrowserProvider((window as any).ethereum);
        await this.provider.send("eth_requestAccounts", []);
        this.signer = await this.provider.getSigner();
        const address = await this.signer.getAddress();
        return address;
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        return null;
      }
    } else {
      // Mock wallet connection for demo
      return '0x1234567890123456789012345678901234567890';
    }
  }

  async registerVehicle(vehicleData: Omit<Vehicle, 'id' | 'registrationTimestamp'>): Promise<Vehicle> {
    const vehicle: Vehicle = {
      ...vehicleData,
      id: uuidv4(),
      registrationTimestamp: Date.now(),
    };
    
    this.vehicles.push(vehicle);
    return vehicle;
  }

  async createRental(
    vehicleId: string,
    driverName: string,
    driverLicense: string,
    renterAddress: string,
    depositAmount: number
  ): Promise<Rental> {
    const vehicle = this.vehicles.find(v => v.id === vehicleId);
    if (!vehicle || !vehicle.isAvailable) {
      throw new Error('Vehicle not available for rental');
    }

    const rental: Rental = {
      id: uuidv4(),
      vehicleId,
      driverName,
      driverLicense,
      startTime: Date.now(),
      status: 'active',
      renterAddress,
      depositAmount,
    };

    // Update vehicle availability
    vehicle.isAvailable = false;
    this.rentals.push(rental);
    
    return rental;
  }

  async createViolation(
    vehicleId: string,
    type: Violation['type'],
    description: string,
    fineAmount: number,
    location: string
  ): Promise<Violation> {
    // Find active rental for this vehicle
    const activeRental = this.rentals.find(
      r => r.vehicleId === vehicleId && r.status === 'active'
    );

    if (!activeRental) {
      throw new Error('No active rental found for this vehicle');
    }

    const violation: Violation = {
      id: uuidv4(),
      vehicleId,
      rentalId: activeRental.id,
      type,
      description,
      fineAmount,
      timestamp: Date.now(),
      location,
      driverName: activeRental.driverName,
      isDisputed: false,
      status: 'pending',
    };

    this.violations.push(violation);
    return violation;
  }

  async createDispute(
    rentalId: string,
    violationId: string,
    reason: string,
    submittedBy: string
  ): Promise<Dispute> {
    const dispute: Dispute = {
      id: uuidv4(),
      rentalId,
      violationId,
      reason,
      submittedBy,
      submissionTime: Date.now(),
      status: 'pending',
    };

    // Mark violation as disputed
    const violation = this.violations.find(v => v.id === violationId);
    if (violation) {
      violation.isDisputed = true;
      violation.status = 'disputed';
    }

    // Mark rental as disputed
    const rental = this.rentals.find(r => r.id === rentalId);
    if (rental) {
      rental.status = 'disputed';
    }

    this.disputes.push(dispute);
    return dispute;
  }

  async endRental(rentalId: string): Promise<Rental> {
    const rental = this.rentals.find(r => r.id === rentalId);
    if (!rental) {
      throw new Error('Rental not found');
    }

    rental.endTime = Date.now();
    rental.status = 'completed';
    
    // Calculate total cost (simple calculation for demo)
    const duration = (rental.endTime - rental.startTime) / (1000 * 60 * 60 * 24); // days
    const vehicle = this.vehicles.find(v => v.id === rental.vehicleId);
    if (vehicle) {
      rental.totalCost = Math.ceil(duration) * vehicle.pricePerDay;
      vehicle.isAvailable = true;
    }

    return rental;
  }

  // Getter methods
  getVehicles(): Vehicle[] {
    return [...this.vehicles];
  }

  getRentals(): Rental[] {
    return [...this.rentals];
  }

  getViolations(): Violation[] {
    return [...this.violations];
  }

  getDisputes(): Dispute[] {
    return [...this.disputes];
  }

  private initializeMockData() {
    // Initialize with some sample data
    this.vehicles = [
      {
        id: '1',
        make: 'Tesla',
        model: 'Model 3',
        year: 2023,
        licensePlate: 'ABC-123',
        vin: '5YJ3E1EA4JF123456',
        owner: '0x1234567890123456789012345678901234567890',
        isAvailable: true,
        pricePerDay: 89,
        location: 'San Francisco, CA',
        features: ['Autopilot', 'Premium Interior', 'Supercharging'],
        fuelType: 'electric',
        transmission: 'automatic',
        registrationTimestamp: Date.now() - 86400000,
      },
      {
        id: '2',
        make: 'BMW',
        model: '3 Series',
        year: 2022,
        licensePlate: 'XYZ-789',
        vin: 'WBA3A5C59CF123456',
        owner: '0x1234567890123456789012345678901234567890',
        isAvailable: true,
        pricePerDay: 75,
        location: 'Los Angeles, CA',
        features: ['Navigation', 'Heated Seats', 'Sunroof'],
        fuelType: 'gasoline',
        transmission: 'automatic',
        registrationTimestamp: Date.now() - 172800000,
      },
    ];
  }
}

export const blockchain = new MockBlockchain();