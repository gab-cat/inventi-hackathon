'use node';

import { createWalletClient, createPublicClient, http, type Address, type WalletClient, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mainnet, sepolia } from 'viem/chains';

// Contract addresses - same as mobile
export const PROPERTY_CONTRACT_ADDRESS = '0x3Dd34b0c2a53CFedb8A6DE1890787BfDEB44C371' as Address;
export const VISITOR_MANAGEMENT_CONTRACT_ADDRESS = '0xB5Ea5dbd70387a795710db633bc69D9cbA7213C6' as Address;
export const DELIVERY_MANAGEMENT_CONTRACT_ADDRESS = '0x5FEcD21Ef64BEc84bdaa1277db394Dc2deCbb5Dc' as Address;

// Contract ABIs - same as mobile
export const PROPERTY_CONTRACT_ABI = [
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
  { inputs: [{ internalType: 'address', name: 'owner', type: 'address' }], name: 'OwnableInvalidOwner', type: 'error' },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
    type: 'error',
  },
  { inputs: [], name: 'PropertyManagementFactory__InvalidMaxVisitors', type: 'error' },
  { inputs: [], name: 'PropertyManagementFactory__InvalidOwner', type: 'error' },
  { inputs: [], name: 'PropertyManagementFactory__InvalidUnitId', type: 'error' },
  { inputs: [], name: 'PropertyManagementFactory__InvalidUnitOwner', type: 'error' },
  { inputs: [], name: 'PropertyManagementFactory__UnitExists', type: 'error' },
  { inputs: [], name: 'PropertyManagementFactory__UnitNotFound', type: 'error' },
  { inputs: [], name: 'PropertyManagementFactory__ZeroAddress', type: 'error' },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'previousOwner', type: 'address' },
      { indexed: true, internalType: 'address', name: 'newOwner', type: 'address' },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: 'address', name: 'wallet', type: 'address' }],
    name: 'PropertyManagementFactory__AuthorizedWalletAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: 'address', name: 'wallet', type: 'address' }],
    name: 'PropertyManagementFactory__AuthorizedWalletRemoved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'string', name: 'unitId', type: 'string' },
      { indexed: false, internalType: 'uint256', name: 'oldCapacity', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'newCapacity', type: 'uint256' },
    ],
    name: 'PropertyManagementFactory__UnitCapacityUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'string', name: 'unitId', type: 'string' },
      { indexed: false, internalType: 'address', name: 'oldOwner', type: 'address' },
      { indexed: false, internalType: 'address', name: 'newOwner', type: 'address' },
    ],
    name: 'PropertyManagementFactory__UnitOwnerUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'string', name: 'unitId', type: 'string' },
      { indexed: false, internalType: 'address', name: 'unitOwner', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'maxVisitors', type: 'uint256' },
    ],
    name: 'PropertyManagementFactory__UnitRegistered',
    type: 'event',
  },
  {
    inputs: [{ internalType: 'address', name: 'wallet', type: 'address' }],
    name: 'authorizeWallet',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getDeliveryManagement',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'string', name: 'unitId', type: 'string' }],
    name: 'getMaxVisitors',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_unitOwner', type: 'address' }],
    name: 'getUnitCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_unitOwner', type: 'address' }],
    name: 'getUnitIds',
    outputs: [{ internalType: 'string[]', name: '', type: 'string[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'string', name: 'unitId', type: 'string' }],
    name: 'getUnitOwner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getVisitorManagementRegistry',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'wallet', type: 'address' }],
    name: 'isAuthorized',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'unitOwner', type: 'address' },
      { internalType: 'string', name: 'unitId', type: 'string' },
      { internalType: 'uint256', name: 'maxVisitors', type: 'uint256' },
    ],
    name: 'registerUnit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  { inputs: [], name: 'renounceOwnership', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  {
    inputs: [{ internalType: 'address', name: 'wallet', type: 'address' }],
    name: 'revokeWallet',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'string', name: 'unitId', type: 'string' },
      { internalType: 'address', name: 'newOwner', type: 'address' },
    ],
    name: 'setUnitOwner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'string', name: 'unitId', type: 'string' },
      { internalType: 'uint256', name: 'newMaxVisitors', type: 'uint256' },
    ],
    name: 'updateUnitCapacity',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export const VISITOR_MANAGEMENT_CONTRACT_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'initialOwner', type: 'address' },
      { internalType: 'address', name: 'factoryAddress', type: 'address' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  { inputs: [{ internalType: 'address', name: 'owner', type: 'address' }], name: 'OwnableInvalidOwner', type: 'error' },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
    type: 'error',
  },
  { inputs: [], name: 'ReentrancyGuardReentrantCall', type: 'error' },
  { inputs: [], name: 'VisitorManagementRegistry__CapacityFull', type: 'error' },
  { inputs: [], name: 'VisitorManagementRegistry__InvalidStatus', type: 'error' },
  { inputs: [], name: 'VisitorManagementRegistry__NotAuthorized', type: 'error' },
  { inputs: [], name: 'VisitorManagementRegistry__NotUnitOwner', type: 'error' },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'previousOwner', type: 'address' },
      { indexed: true, internalType: 'address', name: 'newOwner', type: 'address' },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'piiHash', type: 'bytes32' },
      { indexed: false, internalType: 'string', name: 'unitId', type: 'string' },
      { indexed: false, internalType: 'uint64', name: 'timestamp', type: 'uint64' },
    ],
    name: 'VisitorCheckedIn',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'piiHash', type: 'bytes32' },
      { indexed: false, internalType: 'string', name: 'unitId', type: 'string' },
      { indexed: false, internalType: 'uint64', name: 'timestamp', type: 'uint64' },
    ],
    name: 'VisitorCheckedOut',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'piiHash', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'unitOwner', type: 'address' },
      { indexed: false, internalType: 'string', name: 'unitId', type: 'string' },
    ],
    name: 'VisitorEntryCreated',
    type: 'event',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'piiHash', type: 'bytes32' }],
    name: 'checkInVisitor',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'piiHash', type: 'bytes32' }],
    name: 'checkOutVisitor',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'unitOwner', type: 'address' },
      { internalType: 'string', name: 'unitId', type: 'string' },
      { internalType: 'uint64', name: 'visitStart', type: 'uint64' },
      { internalType: 'uint64', name: 'visitEnd', type: 'uint64' },
      { internalType: 'bytes32', name: 'piiHash', type: 'bytes32' },
    ],
    name: 'createVisitorEntry',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'string', name: 'unitId', type: 'string' }],
    name: 'getActiveVisitors',
    outputs: [{ internalType: 'bytes32[]', name: '', type: 'bytes32[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'offset', type: 'uint256' },
      { internalType: 'uint256', name: 'limit', type: 'uint256' },
    ],
    name: 'getMyVisitors',
    outputs: [{ internalType: 'bytes32[]', name: '', type: 'bytes32[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'piiHash', type: 'bytes32' }],
    name: 'getVisitorLog',
    outputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'piiHash', type: 'bytes32' },
          { internalType: 'address', name: 'unitOwner', type: 'address' },
          { internalType: 'string', name: 'unitId', type: 'string' },
          { internalType: 'uint64', name: 'visitStart', type: 'uint64' },
          { internalType: 'uint64', name: 'visitEnd', type: 'uint64' },
          { internalType: 'uint64', name: 'createdAt', type: 'uint64' },
          { internalType: 'enum VisitorManagementRegistry.VisitorStatus', name: 'status', type: 'uint8' },
          { internalType: 'uint64', name: 'checkInAt', type: 'uint64' },
          { internalType: 'uint64', name: 'checkOutAt', type: 'uint64' },
        ],
        internalType: 'struct VisitorManagementRegistry.Visitor',
        name: 'visitor',
        type: 'tuple',
      },
      { internalType: 'bytes32[]', name: 'documents', type: 'bytes32[]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  { inputs: [], name: 'renounceOwnership', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  {
    inputs: [
      { internalType: 'string', name: 'unitId', type: 'string' },
      { internalType: 'uint64', name: 'fromTs', type: 'uint64' },
      { internalType: 'uint64', name: 'toTs', type: 'uint64' },
      { internalType: 'uint256', name: 'offset', type: 'uint256' },
      { internalType: 'uint256', name: 'limit', type: 'uint256' },
    ],
    name: 'searchVisitorHistory',
    outputs: [{ internalType: 'bytes32[]', name: '', type: 'bytes32[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export const DELIVERY_MANAGEMENT_CONTRACT_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'initialOwner', type: 'address' },
      { internalType: 'address', name: 'factoryAddress', type: 'address' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  { inputs: [], name: 'DeliveryManagement__AlreadyArrived', type: 'error' },
  { inputs: [], name: 'DeliveryManagement__AlreadyCollected', type: 'error' },
  { inputs: [], name: 'DeliveryManagement__AlreadyFailed', type: 'error' },
  { inputs: [], name: 'DeliveryManagement__AlreadyRegistered', type: 'error' },
  { inputs: [], name: 'DeliveryManagement__AlreadyReturned', type: 'error' },
  { inputs: [], name: 'DeliveryManagement__NotAuthorized', type: 'error' },
  { inputs: [], name: 'DeliveryManagement__NotRegistered', type: 'error' },
  { inputs: [{ internalType: 'address', name: 'owner', type: 'address' }], name: 'OwnableInvalidOwner', type: 'error' },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
    type: 'error',
  },
  { inputs: [], name: 'ReentrancyGuardReentrantCall', type: 'error' },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'piiHash', type: 'bytes32' },
      { indexed: false, internalType: 'uint64', name: 'timestamp', type: 'uint64' },
    ],
    name: 'DeliveryArrived',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'piiHash', type: 'bytes32' },
      { indexed: false, internalType: 'uint64', name: 'timestamp', type: 'uint64' },
    ],
    name: 'DeliveryCollected',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'piiHash', type: 'bytes32' },
      { indexed: false, internalType: 'uint64', name: 'timestamp', type: 'uint64' },
    ],
    name: 'DeliveryFailed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'piiHash', type: 'bytes32' },
      { indexed: false, internalType: 'uint64', name: 'timestamp', type: 'uint64' },
    ],
    name: 'DeliveryRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'piiHash', type: 'bytes32' },
      { indexed: false, internalType: 'uint64', name: 'timestamp', type: 'uint64' },
    ],
    name: 'DeliveryReturned',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'previousOwner', type: 'address' },
      { indexed: true, internalType: 'address', name: 'newOwner', type: 'address' },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'piiHash', type: 'bytes32' }],
    name: 'getDelivery',
    outputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'piiHash', type: 'bytes32' },
          { internalType: 'uint64', name: 'timeRegistered', type: 'uint64' },
          { internalType: 'uint64', name: 'timeArrived', type: 'uint64' },
          { internalType: 'uint64', name: 'timeCollected', type: 'uint64' },
          { internalType: 'bool', name: 'failed', type: 'bool' },
          { internalType: 'bool', name: 'returned', type: 'bool' },
        ],
        internalType: 'struct DeliveryManagement.Delivery',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'piiHash', type: 'bytes32' }],
    name: 'markArrived',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'piiHash', type: 'bytes32' }],
    name: 'markCollected',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'piiHash', type: 'bytes32' }],
    name: 'markFailed',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'piiHash', type: 'bytes32' }],
    name: 'markReturned',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'piiHash', type: 'bytes32' }],
    name: 'registerDelivery',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  { inputs: [], name: 'renounceOwnership', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// Chain configuration
const getChain = () => {
  const env = process.env.CONVEX_ENVIRONMENT || 'development';
  return env === 'production' ? mainnet : sepolia;
};

// Client creation utilities
export const createClients = () => {
  const chain = getChain();

  // Get private key from environment variables
  const privateKey = process.env.BACKEND_WALLET_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('BACKEND_WALLET_PRIVATE_KEY environment variable not set');
  }

  // Create account from private key
  const account = privateKeyToAccount(privateKey as `0x${string}`);

  // Create public client for read operations
  const publicClient: PublicClient = createPublicClient({
    chain,
    transport: http(),
  });

  // Create wallet client for write operations
  const walletClient: WalletClient = createWalletClient({
    account,
    chain,
    transport: http(),
  });

  return { publicClient, walletClient, account, chain };
};

// Contract interaction utilities
export type ContractCallOptions = {
  address: Address;
  abi: readonly unknown[];
  functionName: string;
  args?: readonly unknown[];
};

export type ContractWriteOptions = ContractCallOptions & {
  value?: bigint;
};

// Read from contract
export const readContract = async (options: ContractCallOptions) => {
  const { publicClient } = createClients();

  return await publicClient.readContract({
    address: options.address,
    abi: options.abi,
    functionName: options.functionName,
    args: options.args,
  });
};

// Write to contract
export const writeContract = async (options: ContractWriteOptions) => {
  const { walletClient } = createClients();

  const contractOptions: any = {
    address: options.address,
    abi: options.abi,
    functionName: options.functionName,
    args: options.args,
  };

  if (options.value !== undefined) {
    contractOptions.value = options.value;
  }

  const hash = await walletClient.writeContract(contractOptions);

  return hash;
};

// Wait for transaction confirmation
export const waitForTransactionReceipt = async (hash: `0x${string}`) => {
  const { publicClient } = createClients();

  return await publicClient.waitForTransactionReceipt({
    hash,
  });
};

// Contract-specific utilities
export const propertyContract = {
  address: PROPERTY_CONTRACT_ADDRESS,
  abi: PROPERTY_CONTRACT_ABI,
};

export const visitorManagementContract = {
  address: VISITOR_MANAGEMENT_CONTRACT_ADDRESS,
  abi: VISITOR_MANAGEMENT_CONTRACT_ABI,
};

export const deliveryManagementContract = {
  address: DELIVERY_MANAGEMENT_CONTRACT_ADDRESS,
  abi: DELIVERY_MANAGEMENT_CONTRACT_ABI,
};
