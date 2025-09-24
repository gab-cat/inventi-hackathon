import "@walletconnect/react-native-compat";
import { http } from "wagmi"
import { mainnet, sepolia } from "wagmi/chains"
import type { Chain } from "wagmi/chains"
import { defaultWagmiConfig } from "@reown/appkit-wagmi-react-native"
import { authConnector } from "@reown/appkit-auth-wagmi-react-native"

// Define supported chains here for easy changes
export const chains = [mainnet, sepolia] as const satisfies readonly [Chain, ...Chain[]]

// Get projectId from environment variables
const projectId = process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID"

// Metadata for the app
const metadata = {
  name: "Inventi App",
  description: "Inventi Property Management System",
  url: "https://inventi.app",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
  redirect: {
    native: "inventi://",
    universal: "https://inventi.app",
  },
}

// Create auth connector for social authentication
const auth = authConnector({ projectId, metadata })

// Create wagmi config using Reown's defaultWagmiConfig
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  extraConnectors: [auth],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})