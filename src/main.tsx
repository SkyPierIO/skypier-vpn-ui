import React from "react";
import { BrowserRouter } from 'react-router-dom';
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import CssBaseline from '@mui/material/CssBaseline';
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// Reown AppKit (replaces @web3modal/wagmi)
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Networks from @reown/appkit (includes viem-compatible chain definitions)
import {
	sepolia,
	arbitrum,
	gnosis,
	mainnet,
	optimism,
	polygon,
	base,
	localhost,
} from "@reown/appkit/networks";

const queryClient = new QueryClient();

const projectId = import.meta.env.VITE_PROJECT_ID || "";

const metadata = {
	name: "Skypier VPN",
	description: "Skypier VPN",
	url: "https://skypier.io",
	icons: ["https://avatars.githubusercontent.com/u/145208723"],
};

const networks = [localhost, sepolia, mainnet, polygon, base, arbitrum, optimism, gnosis];

// Create WagmiAdapter (replaces defaultWagmiConfig)
const wagmiAdapter = new WagmiAdapter({
	networks: networks as any,
	projectId,
});

// Create AppKit modal (replaces createWeb3Modal)
createAppKit({
	adapters: [wagmiAdapter],
	networks: networks as any,
	projectId,
	metadata,
	features: {
		analytics: false,
	},
	themeMode: 'dark',
	themeVariables: {
		'--w3m-accent': 'rgba(255, 255, 255, 0.1)',
		'--w3m-border-radius-master': '1000px',
		'--w3m-font-family': '"Roboto","Helvetica","Arial",sans-serif',
	},
	termsConditionsUrl: 'https://skypier.io/terms-of-service/',
});

const subgraphUri = "https://api.studio.thegraph.com/query/74284/skypier_vpn_nodes/version/latest";
const apolloClient = new ApolloClient({
	uri: subgraphUri,
	cache: new InMemoryCache(),
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<ApolloProvider client={apolloClient}>
			{/* WagmiProvider replaces WagmiConfig; QueryClientProvider is now required */}
			<WagmiProvider config={wagmiAdapter.wagmiConfig}>
				<QueryClientProvider client={queryClient}>
					<BrowserRouter>
						<CssBaseline />
						<App />
					</BrowserRouter>
				</QueryClientProvider>
			</WagmiProvider>
		</ApolloProvider>
	</React.StrictMode>
);
