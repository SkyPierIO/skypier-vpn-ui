import React from "react";
import CssBaseline from '@mui/material/CssBaseline';
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";
import { WagmiConfig } from "wagmi";
import {
	sepolia,
	goerli,
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
	goerli,
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

const theme = createTheme({
	palette: {
		// mode: 'dark',
		mode: 'light',
	},
});

createWeb3Modal({ 
	wagmiConfig, 
	projectId, 
	chains,
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<WagmiConfig config={wagmiConfig}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<App />
			</ThemeProvider>
		</WagmiConfig>
	</React.StrictMode>
);
