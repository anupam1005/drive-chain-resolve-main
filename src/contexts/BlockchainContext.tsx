import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { BlockchainState, Vehicle, Rental, Violation, Dispute } from '@/types/blockchain';
import { blockchain } from '@/lib/blockchain';
import { useToast } from '@/hooks/use-toast';

interface BlockchainContextType extends BlockchainState {
  connectWallet: () => Promise<void>;
  registerVehicle: (vehicleData: Omit<Vehicle, 'id' | 'registrationTimestamp'>) => Promise<void>;
  createRental: (vehicleId: string, driverName: string, driverLicense: string, depositAmount: number) => Promise<void>;
  endRental: (rentalId: string) => Promise<void>;
  createViolation: (vehicleId: string, type: Violation['type'], description: string, fineAmount: number, location: string) => Promise<void>;
  createDispute: (rentalId: string, violationId: string, reason: string) => Promise<void>;
  refreshData: () => void;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

type BlockchainAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CONNECTED_ADDRESS'; payload: string }
  | { type: 'SET_VEHICLES'; payload: Vehicle[] }
  | { type: 'SET_RENTALS'; payload: Rental[] }
  | { type: 'SET_VIOLATIONS'; payload: Violation[] }
  | { type: 'SET_DISPUTES'; payload: Dispute[] }
  | { type: 'REFRESH_ALL' };

const initialState: BlockchainState = {
  vehicles: [],
  rentals: [],
  violations: [],
  disputes: [],
  connectedAddress: undefined,
  isLoading: false,
};

function blockchainReducer(state: BlockchainState, action: BlockchainAction): BlockchainState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_CONNECTED_ADDRESS':
      return { ...state, connectedAddress: action.payload };
    case 'SET_VEHICLES':
      return { ...state, vehicles: action.payload };
    case 'SET_RENTALS':
      return { ...state, rentals: action.payload };
    case 'SET_VIOLATIONS':
      return { ...state, violations: action.payload };
    case 'SET_DISPUTES':
      return { ...state, disputes: action.payload };
    case 'REFRESH_ALL':
      return {
        ...state,
        vehicles: blockchain.getVehicles(),
        rentals: blockchain.getRentals(),
        violations: blockchain.getViolations(),
        disputes: blockchain.getDisputes(),
      };
    default:
      return state;
  }
}

export function BlockchainProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(blockchainReducer, initialState);
  const { toast } = useToast();

  const refreshData = () => {
    dispatch({ type: 'REFRESH_ALL' });
  };

  const connectWallet = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const address = await blockchain.connectWallet();
      if (address) {
        dispatch({ type: 'SET_CONNECTED_ADDRESS', payload: address });
        toast({
          title: "Wallet Connected",
          description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
        });
        refreshData();
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const registerVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'registrationTimestamp'>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await blockchain.registerVehicle({
        ...vehicleData,
        owner: state.connectedAddress || '0x1234567890123456789012345678901234567890',
      });
      refreshData();
      toast({
        title: "Vehicle Registered",
        description: `${vehicleData.make} ${vehicleData.model} has been registered successfully.`,
      });
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Failed to register vehicle",
        variant: "destructive",
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createRental = async (vehicleId: string, driverName: string, driverLicense: string, depositAmount: number) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await blockchain.createRental(
        vehicleId,
        driverName,
        driverLicense,
        state.connectedAddress || '0x1234567890123456789012345678901234567890',
        depositAmount
      );
      refreshData();
      toast({
        title: "Rental Started",
        description: `Rental started for ${driverName}`,
      });
    } catch (error) {
      toast({
        title: "Rental Failed",
        description: error instanceof Error ? error.message : "Failed to start rental",
        variant: "destructive",
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const endRental = async (rentalId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await blockchain.endRental(rentalId);
      refreshData();
      toast({
        title: "Rental Ended",
        description: "Rental has been completed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to end rental",
        variant: "destructive",
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createViolation = async (vehicleId: string, type: Violation['type'], description: string, fineAmount: number, location: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await blockchain.createViolation(vehicleId, type, description, fineAmount, location);
      refreshData();
      toast({
        title: "Violation Recorded",
        description: `${type} violation has been recorded`,
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record violation",
        variant: "destructive",
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createDispute = async (rentalId: string, violationId: string, reason: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await blockchain.createDispute(
        rentalId,
        violationId,
        reason,
        state.connectedAddress || '0x1234567890123456789012345678901234567890'
      );
      refreshData();
      toast({
        title: "Dispute Filed",
        description: "Your dispute has been submitted for review",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to file dispute",
        variant: "destructive",
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const contextValue: BlockchainContextType = {
    ...state,
    connectWallet,
    registerVehicle,
    createRental,
    endRental,
    createViolation,
    createDispute,
    refreshData,
  };

  return (
    <BlockchainContext.Provider value={contextValue}>
      {children}
    </BlockchainContext.Provider>
  );
}

export function useBlockchain() {
  const context = useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
}