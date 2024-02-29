import React from "react";
import ReactDOM from "react-dom/client";
import {
	createBrowserRouter,
	RouterProvider,
  } from "react-router-dom";
import App from "./App";
import "./styles/index.css";

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";

import { WagmiConfig } from "wagmi";
import {
	goerli,
	arbitrum,
	gnosis,
	mainnet,
	optimism,
	polygon,
} from "wagmi/chains";

const chains = [
	mainnet,
	polygon,
	goerli,
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

const router = createBrowserRouter([
	{
		path: "/",
		element: <div>Hello world!</div>,
	},
]);

createWeb3Modal({ 
	wagmiConfig, 
	projectId, 
	chains,
	themeVariables: {
		'--w3m-color-mix': '#010101',
		'--w3m-color-mix-strength': 40
	} 

});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<WagmiConfig config={wagmiConfig}>
			<App />
			<RouterProvider router={router} />
		</WagmiConfig>
	</React.StrictMode>
);
