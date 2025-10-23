import { createConfig, http } from 'wagmi';
import { localhost, sepolia } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// Configure chains
const chains = [localhost, sepolia];

// Create wagmi config
export const wagmiConfig = getDefaultConfig({
  appName: 'AI-DAO Governance',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains,
  transports: {
    [localhost.id]: http('http://127.0.0.1:8545'),
    [sepolia.id]: http(),
  },
});

// Contract addresses (will be populated after deployment)
export const CONTRACT_ADDRESSES = {
  GovernanceToken: import.meta.env.VITE_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000',
  DAOGovernor: import.meta.env.VITE_GOVERNOR_ADDRESS || '0x0000000000000000000000000000000000000000',
  DAOTreasury: import.meta.env.VITE_TREASURY_ADDRESS || '0x0000000000000000000000000000000000000000',
  AIOracle: import.meta.env.VITE_ORACLE_ADDRESS || '0x0000000000000000000000000000000000000000',
};

// API configuration
export const API_CONFIG = {
  backend: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  ai: import.meta.env.VITE_AI_API_URL || 'http://localhost:8000',
  oracle: import.meta.env.VITE_ORACLE_URL || 'http://localhost:3001',
};

