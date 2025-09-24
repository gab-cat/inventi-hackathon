# Smart Contract Integration with Convex Backend

This document explains how to set up and use smart contract interactions through the Convex backend instead of directly from the frontend.

## Overview

The system now supports calling smart contracts from the Convex backend, providing better security, centralized business logic, and the ability to combine contract calls with database operations.

## Architecture

```
Mobile App → Convex Actions → Smart Contracts (via viem)
              ↓
          Database Updates
```

### Benefits

1. **Security**: Private keys are stored server-side, not exposed to clients
2. **Centralized Logic**: Business logic combining contracts and database operations
3. **Error Handling**: Better error management and logging
4. **Database Integration**: Automatic database updates with transaction hashes
5. **Atomic Operations**: Combine contract calls with database mutations

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in your Convex project with the following variables:

```bash
# Backend Wallet Configuration
BACKEND_WALLET_PRIVATE_KEY=0x...your_private_key_here

# Environment (development uses Sepolia, production uses Mainnet)
CONVEX_ENVIRONMENT=development
```

**Important Security Notes:**

- Use a dedicated wallet for backend operations
- Never commit private keys to version control
- Ensure the wallet has sufficient ETH for gas fees
- Consider using a hardware wallet or key management service for production

### 2. Install Dependencies

The integration uses viem for smart contract interactions. Make sure you have the required dependencies:

```bash
npm install viem
```

### 3. Contract Configuration

Contract addresses and ABIs are already configured in `/convex/lib/contracts.ts`. Update these if your contracts change:

```typescript
export const PROPERTY_CONTRACT_ADDRESS = '0x3Dd34b0c2a53CFedb8A6DE1890787BfDEB44C371';
export const VISITOR_MANAGEMENT_CONTRACT_ADDRESS = '0xB5Ea5dbd70387a795710db633bc69D9cbA7213C6';
export const DELIVERY_MANAGEMENT_CONTRACT_ADDRESS = '0x5FEcD21Ef64BEc84bdaa1277db394Dc2deCbb5Dc';
```

## Available Contract Actions

### Delivery Management

- `registerDeliveryContract(piiHash)` - Register a new delivery
- `updateDeliveryStatusContract(piiHash, newStatus, notes?)` - Update delivery status with blockchain validation
  - Valid statuses: 'registered', 'arrived', 'collected', 'failed', 'returned'
  - Enforces status transition rules and blockchain recording
- `getDeliveryContract(piiHash)` - Get delivery status from contract

### Visitor Management

- `checkInVisitorContract(piiHash)` - Check in a visitor
- `checkOutVisitorContract(piiHash)` - Check out a visitor
- `createVisitorEntryContract(unitOwner, unitId, visitStart, visitEnd, piiHash)` - Create visitor entry
- `getVisitorLogContract(piiHash)` - Get visitor log from contract

### Property Management

- `authorizeWalletContract(wallet)` - Authorize a wallet address
- `registerUnitContract(unitOwner, unitId, maxVisitors)` - Register a new unit
- `isAuthorizedContract(wallet)` - Check if wallet is authorized

## Using the Integration

### In Mobile Components

The original hooks now include both direct contract calls and Convex backend calls:

```typescript
import { useDeliveryContract } from '@/hooks/use-delivery-contracts';

function DeliveryComponent() {
  const { convexContract } = useDeliveryContract();

  const handleRegisterDelivery = async () => {
    try {
      const result = await convexContract.registerDelivery('0x123...');
      if (result?.success) {
        console.log('Delivery registered:', result.transactionHash);
      } else {
        console.error('Registration failed:', result?.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <button
      onClick={handleRegisterDelivery}
      disabled={convexContract.isLoading}
    >
      {convexContract.isLoading ? 'Processing...' : 'Register Delivery'}
    </button>
  );
}
```

### Alternative: Direct Convex Hook Usage

You can also use the dedicated Convex hooks directly:

```typescript
import { useDeliveryContractConvex } from '@/hooks/use-delivery-contracts-convex';

function DeliveryComponent() {
  const {
    registerDelivery,
    isLoading,
    error,
    lastTransactionHash
  } = useDeliveryContractConvex();

  const handleRegister = async () => {
    const result = await registerDelivery('0x123...');
    // Handle result
  };

  return (
    <div>
      <button onClick={handleRegister} disabled={isLoading}>
        Register Delivery
      </button>
      {error && <p>Error: {error}</p>}
      {lastTransactionHash && <p>TX: {lastTransactionHash}</p>}
    </div>
  );
}
```

## Response Format

All contract actions return a standardized response:

```typescript
{
  success: boolean;
  transactionHash?: string;
  message?: string;
  // Additional data depending on the action
}
```

## Error Handling

The system includes comprehensive error handling:

1. **Contract Errors**: Smart contract revert reasons and gas estimation failures
2. **Network Errors**: RPC connection issues and timeout handling
3. **Validation Errors**: Parameter validation before contract calls
4. **Database Errors**: Database update failures after successful contract calls

## Migration Guide

### From Direct Contract Calls to Convex Backend

1. **Replace Direct Calls**:

   ```typescript
   // Old (direct contract call)
   const { writeContract } = useWriteContract();
   writeContract({
     address: CONTRACT_ADDRESS,
     abi: CONTRACT_ABI,
     functionName: 'registerDelivery',
     args: [piiHash],
   });

   // New (Convex backend call)
   const { convexContract } = useDeliveryContract();
   await convexContract.registerDelivery(piiHash);
   ```

2. **Update State Management**:

   ```typescript
   // Old (manual state tracking)
   const [isPending, setIsPending] = useState(false);

   // New (automatic state management)
   const { convexContract } = useDeliveryContract();
   const isLoading = convexContract.isLoading;
   ```

3. **Handle Responses**:
   ```typescript
   // New response handling
   const result = await convexContract.registerDelivery(piiHash);
   if (result?.success) {
     // Success handling
   } else {
     // Error handling with result.message
   }
   ```

## Monitoring and Debugging

### Transaction Tracking

All successful contract calls are automatically logged with:

- Transaction hash
- Block number
- Function called
- Parameters used
- Database updates

### Error Logging

Errors are logged with:

- Error type (contract, network, validation)
- Error message
- Function context
- Parameters that caused the error

### Database Updates

The system automatically updates the database with:

- Transaction hashes for successful calls
- Block numbers for confirmation
- Status updates based on contract state changes

## Security Considerations

1. **Private Key Management**: Store private keys securely, use environment variables
2. **Gas Limits**: Set appropriate gas limits to prevent stuck transactions
3. **Rate Limiting**: Consider implementing rate limiting for contract calls
4. **Validation**: Always validate parameters before contract calls
5. **Monitoring**: Monitor contract calls and gas usage
6. **Backup**: Have backup RPC endpoints configured

## Testing

### Local Testing

1. Use Sepolia testnet for development
2. Get test ETH from Sepolia faucets
3. Test all contract functions before production deployment

### Production Deployment

1. Switch `CONVEX_ENVIRONMENT` to `production`
2. Use mainnet private key with sufficient ETH
3. Monitor gas prices and adjust accordingly
4. Set up alerting for failed transactions

## Troubleshooting

### Common Issues

1. **Insufficient Gas**: Ensure wallet has ETH for gas fees
2. **Contract Reverts**: Check contract state and parameters
3. **Network Issues**: Verify RPC endpoint connectivity
4. **Private Key Issues**: Ensure private key format is correct (0x prefixed)

### Debug Steps

1. Check Convex logs for detailed error messages
2. Verify contract addresses and ABIs are correct
3. Test contract calls directly using a tool like Etherscan
4. Ensure environment variables are properly set

## Support

For additional support:

1. Check Convex logs for detailed error information
2. Verify smart contract state on blockchain explorers
3. Test individual components in isolation
4. Review this documentation for configuration issues
