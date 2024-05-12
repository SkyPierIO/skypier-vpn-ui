import React from "react";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import CssBaseline from '@mui/material/CssBaseline';
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";
import { WagmiConfig } from "wagmi";
import {
	sepolia,
	arbitrum,
	gnosis,
	mainnet,
	optimism,
	polygon,
	base,
	localhost
} from "wagmi/chains";

const chains = [
	localhost,
	sepolia,
	mainnet,
	polygon,
	base,
	arbitrum,
	optimism,
	gnosis,
];

const projectId = import.meta.env.VITE_PROJECT_ID || "";

const metadata = {
	name: "Skypier VPN",
	description: "Skypier VPN",
	url: "https://skypier.io",
	icons: ["https://avatars.githubusercontent.com/u/145208723"],
};

const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

createWeb3Modal({ 
	wagmiConfig, 
	projectId, 
	chains,
	termsConditionsUrl: 'https://skypier.io/terms-of-service/'
});

const subgraphUri = "https://api.studio.thegraph.com/query/74284/skypier_vpn_nodes/version/latest";
const apolloClient = new ApolloClient({
  uri: subgraphUri,
  cache: new InMemoryCache(),
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<ApolloProvider client={apolloClient}>
			<WagmiConfig config={wagmiConfig}>
				<CssBaseline />
				<App />
			</WagmiConfig>
		</ApolloProvider>
	</React.StrictMode>
);
