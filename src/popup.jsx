import React from "react"
import { render } from "react-dom"
import { useEffect, useState } from "react"

// CSS
import "./popup.css"

// MUI
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import { Typography } from "@mui/material"
import { Container } from "@mui/system"
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'

// Functions
import loadChainData from "./functions/api/loadChainData"
import encryptWalletToLs from "./functions/login/encryptWalletToLs"
import { setGlobalData } from "./functions/address/setLS"
import createKeyPair from "./functions/address/createKeyPair.js"
import decodeSeed from "./functions/address/decodeSeed"
import loginLegacy from "./functions/login/login-legacy"
import importFromWIF from "./functions/login/importFromWIF"
import getAssetInfo from "./functions/api/getAssetInfo"
import { getObjFromLs } from "./functions/address/getLS"
import decryptString from "./functions/login/decryptString"
import { setSettingsLs } from "./functions/address/setLS"
import getDispensers from "./functions/api/getDispensers"
import ping from "./functions/api/ping"

// JSX components
import Loading from  "./components/login/Loading.jsx"
import LoginLegacy from "./components/login/LoginFromSeed.jsx"
import LoginWithPword from "./components/login/LoginWithPword.jsx"
import App from "./components/App.jsx"
import SplashPage from "./components/login/SplashPage.jsx"
import NewAddress from "./components/NewAddress/NewAddress.jsx"
import Menu from "./components/Menu.jsx"
import ImportAddress from "./components/NewAddress/ImportAddress.jsx"
import Settings from "./components/Settings.jsx"
import Send from "./components/network/Send.jsx"
import Sign from "./components/sign/Sign.jsx"
import Issue from "./components/network/Issue.jsx"
import BroadcastTx from "./components/network/BroadcastTx.jsx"
import AlertPopup from "./components/AlertPopup.jsx"
import Lock from "./components/network/Lock.jsx"
import AddSupply from "./components/network/AddSupply.jsx"
import Destroy from "./components/network/Destroy.jsx"
import Dispense from "./components/network/Dispense.jsx"
import ResultPopup from "./components/network/ResultPopup.jsx"

// Theme
const darkTheme = createTheme({
	palette: {
		type: 'dark',
		mode: "dark",
		primary: {
			main: '#1c2a43',
			light: "rgb(73, 84, 104)",
			dark: "rgb(19, 29, 46)"
		},
		secondary: {
			main: '#fd5750',
			light: "rgb(253, 120, 115)",
			dark: "rgb(177, 60, 56)"
		},
		background: {
			default: '#2b2929',
			paper: '#3f3c3c',
		},
		text: {
			primary: '#ffffff',
			secondary: 'rgba(255,255,255,0.75)',
			disabled: 'rgba(255,255,255,0.55)',
			hint: 'rgba(255,255,255,0.55)',
		},
	},
})

const lightTheme = createTheme({
	palette: {
		type: 'light',
		mode: "light",
		primary: {
			main: '#1c2a43',
		},
		secondary: {
			main: '#fd5750',
		},
	},
})

// Wallet object
let walletObj = {
	loaded: false,
	network: "",
	name: "Wallet",
	addressBook: [],
	btcBalance: 0.0,
	addrIndex: 0,
	secret: ""
}
// const address = {
//  blockHeight: 0,
//  ttl: time: Date.now(),
// 	index: 0,
//  child: n,
// 	name: "name",
// 	node: {"object"},
// 	pubKey: "string",
// 	privKey: "string",
//  btcBalance: 0,
//  balance: [],
//  history: []
// }

const TTL = 600000 // 10min

export default function Popup() {

	// APP UI HOOKS
	const [ page, setPage ] = useState("loading")
	const [ loading, setLoading ] = useState(false)
	useEffect(() => {
		console.log("loading change: " + loading)
	}, [loading])
	const [ loadFeedback, setLoadFeedback ] = useState("")
	const [ error, setError ] = useState({ error: false, message: "" })
	const [ theme, toggleTheme ] = useState("light")
	const [ userSettings, setUserSettings ] = useState({
		theme: "light",
		currency: "usd"
	})
	// PSUEDO ROUTES
	// login-pword, login-legacy, loading, app, splash

	// WALLET
	// Used to manage and pass address / node information
	const [ wallet, setWallet ] = useState(walletObj)
	const [ encrypted, setEncrypted ] = useState("")
	// BTC PAIRS
	const [ btcPairs, setBtcPairs ] = useState({btcUSD: 15000})

	// NETWORK
	// Useage: "mainnet" || "testnet"
	const [ network, setNetwork ] = useState({
		network: "mainnet",
		status: false
	})
	useEffect(() => {
		console.log("Wallet @ root:")
		console.log(wallet)
	}, [wallet])

	// 1. INIT LOAD
	// Gets settings from LS and opens encrypted wallet
	useEffect(() => {
		// Load user settings
		async function getSettings() {
			await getObjFromLs("settings")
				.then(res => {
					if (Object.keys(res).length > 0) {
						console.log("LS THEME:")
						console.log(res.settings)
						setUserSettings(res.settings)
						toggleTheme(res.settings.theme)
						theme.palette.mode = res.settings.theme
					} 
				})
		}
		getSettings()

		// Try to open wallet from encrypted LS
		chrome.storage.local.get(["wallet"], (result) => {
			if ("wallet" in result) {
				// Passed encrypted object to decrypter
				setEncrypted(result.wallet)

				// setLoading(false)
				// console.log("END LOAD2")
				setPage("login-pword")
			}
		})

		// Else no wallet found go to splash
		// User can generate seed or login with existing seed
		setPage("splash")
	}, [])
	// 2. Refresh address on load
	useEffect(() => {
		// If wallet has been loaded and there is an address
		if (wallet.loaded && wallet.addressBook.length > 0) {

			// Update network connection state
			setNetwork(prev => ({
				...prev,
				status: true
			}))

			console.log(wallet.addressBook[wallet.addrIndex].balance)
			const preloaded = wallet.addressBook[wallet.addrIndex].balance.length > 0 ? true : false
			console.log("PRELOADED: " + preloaded)
			refreshAddress(wallet.addressBook[wallet.addrIndex].pubKey, parseInt(wallet.addrIndex), preloaded)

			setPage("app")
		}
	}, [wallet.loaded])

	// REFRESH
	// Gets all chain data
	async function refreshAddress(address=wallet.addressBook[wallet.addrIndex].pubKey, index=wallet.addrIndex, loadScreen=true, force=false) {

		if(loadScreen) {
			setLoading(true)
		} else {
			setLoading(false)
		}
		setLoadFeedback("Reading blockchain")
		// // Check block height
		// if address in address book and ttl is < 10min load ls
		const lsEncWallet = await getObjFromLs("wallet")
			.then(res => {
				return res.wallet
			})
		// decrypt wallet
		// TODO: Clean up
		const lsWallet = decryptString(lsEncWallet, wallet.secret)

		let blockHeight = 0
		if (wallet.loaded) {
			// Ping
			blockHeight = await ping()
			.then(res => {
				if (res.last_block !== null) {
					return res.last_block.block_index
				} else {
					return wallet.addressBook[index].blockHeight
				}
			})
		}
		console.log("Blocks: ",  blockHeight,  wallet.addressBook[index].blockHeight)

		// If new blocks present then load chain data
		if (blockHeight > wallet.addressBook[index].blockHeight || typeof wallet.addressBook[index].blockHeight == "undefined" || force) {

			// Load chain data
			await loadChainData(address)
				.then(res => {
					console.log("COMPILED RES")
					console.log(res)

					// Load info to app
					// a. conversion pairs
					console.log("BTCUSD")
					console.log(res.btcUSD)
					setGlobalData({btcUSD: res.btcUSD}) // Save to local
					setBtcPairs({btcUSD: res.btcUSD})	// Set state

					// b. update wallet LS and state
					let updateWallet = wallet
					
					updateWallet.addrIndex = index
					updateWallet.addressBook[index].blockHeight = res.blockHeight
					updateWallet.addressBook[index].btcBalance = res.btcBalance
					updateWallet.addressBook[index].ttl = Date.now()
					updateWallet.addressBook[index].balance = res.assetBalance
					updateWallet.addressBook[index].history = res.history
					setWallet(updateWallet)

					encryptWalletToLs(updateWallet, wallet.secret) // Encrypts to LS

					// Chains refresh asset info on load
					// refreshAssetInfo(res.assetBalance, parseInt(wallet.addrIndex))

					// End loading
					setLoadFeedback("")
					setLoading(false)
				})
		} else {
			// b. update wallet LS and state
			let updateWallet = wallet
			
			updateWallet.addrIndex = index
			setWallet(updateWallet)
			encryptWalletToLs(updateWallet, wallet.secret) // Encrypts to LS

			// End loading
			setLoadFeedback("")
			setLoading(false)
		}
	}

	// REFRESH PING
	// Pings for block height and runs refresh if new blocks are present
	const MINUTE_MS = 60000 // Frequency of check
	useEffect(() => {
		if(wallet.loaded) {
			const interval = setInterval(() => {
				console.log("Pinging")
				// Ping every minute
					ping()
						.then(res => {
							// If block height is above last read then refresh balance
							if(typeof res.last_block.block_index == "undefined") {
								console.log("Block undefined")
							} else {
								if(res.last_block.block_index >  wallet.addressBook[wallet.addrIndex].blockHeight) {
									// Refresh
									console.log("Refreshing account")
									refreshAddress(wallet.addressBook[wallet.addrIndex].pubKey, wallet.addrIndex, false)
									console.log("Current block height: " + res.last_block.block_index )
								}
							}
						})
			}, MINUTE_MS)
		return () => clearInterval(interval) // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
		}
	}, [wallet])

	// Handle create / import address
	const [ newAddPage, toggleNewAddrPage ] = useState(false)
	function handleNewAddress() {
		toggleNewAddrPage(!newAddPage)
	}
	// Creates a new child node from root
	async function createNewHDKeypair() {

		// Get root node
		const seed = await decodeSeed(wallet.secret)
		const node = loginLegacy(seed, network.network)

		// Create next-in-line keypair
		let child = 0
		for(const address of wallet.addressBook) {
			if (address.child >= child) {child = address.child + 1}
		}

		// Create new keypair object
		const newKeypair = createKeyPair(node, child)

		// Get length of address book for index
		const bookLen = wallet.addressBook.length
		// Update addr object
		let updateAddrBook = wallet.addressBook
		const newAddress = {
			ttl: 0,
			index: bookLen,
			child: child,
			name: `Wallet ${child + 1}`,
			node: newKeypair.childNode,
			pubKey: newKeypair.pubKey,
			privKey: newKeypair.privKey,
			balance: [],
			history: []
		}
		updateAddrBook.push(newAddress)

		// Append to wallet & update index
		setWallet(prev => ({
			...prev,
			addrIndex: bookLen,
			addressBook: updateAddrBook
		}))

		// Refresh data
		setLoading(true)
		refreshAddress(newKeypair.pubKey, bookLen)
	}

	// Import address from WIF
	function handleImportWIF(name, key) {
		if (name != "" && key != "") {

			let importedKeypair
			try {
				importedKeypair = importFromWIF(key)
			} catch(e) {
				console.error(e)
			}

			if("error" in importedKeypair) {
				setError({error: true, message: importedKeypair.message})
			} else {
				setError({error: false, message: ""})
				// Get length of address book for index
				const bookLen = wallet.addressBook.length
				// Update addr object
				let updateAddrBook = wallet.addressBook
				const newAddress = {
					ttl: 0,
					index: bookLen,
					// child: null,
					name: name,
					node: importedKeypair.ECPair,
					pubKey: importedKeypair.pubKey,
					privKey: importedKeypair.privKey,
					balance: [],
					history: []
				}
				updateAddrBook.push(newAddress)
				console.log(updateAddrBook)

				// Append to wallet & update index
				setWallet(prev => ({
					...prev,
					addrIndex: bookLen,
					addressBook: updateAddrBook
				}))
				console.log(wallet)

				// Refresh data
				setLoading(true)
				refreshAddress(importedKeypair.pubKey, bookLen)

				// Close import
				toggleImportAdd(false)
			}
		}
	}

	// Menu and menu sub-page toggles
	const [ menu, toggleMenu ] = useState(false)
	const [ importAdd, toggleImportAdd ] = useState(false)

	// Settings toggle
	const [ showSettings, toggleShowSettings ] = useState(false)

	// Send toggle
	const [ showSend, toggleShowSend ] = useState(false)
	const [ recFee, setRecFee ] = useState({high: 4000, medium: 2000, low: 1000}) // fee state for sends

	// Toggle sign page
	const [ showSign, toggleShowSign ] = useState(false)

	// Toggle issuance page
	const [ showIssuance, toggleShowIssuance ] = useState(false)
	const [ showLock, toggleShowLock ] = useState(false)
	const [ showDestroy, toggleShowDestroy ] = useState(false)
	const [ showAddSupply, toggleShowAddSupply ] = useState(false)
	const [ showDispense, toggleShowDispense ] = useState(false)

	// Broadcast Tx 
	const [ showBroadcastTx, toggleShowBroadcastTx ] = useState(false)
	const [ broadcastHex, setBroadcastHex ] = useState({
		mode: "",
		asset: "",
		address: "",
		destination: "",
		fee: 0,
		hex: null
	}) // Holding var for hex transactions
	useEffect(() => {
		console.log(broadcastHex)
	}, [broadcastHex])

	// Popup toggle
	const [ showPopup, toggleShowPopup ] = useState(false)
	const [ popupComp, setPopupComp ] = useState(<Box></Box>)

	// Dispenser list at address
	const [ dispList, setDispList ] = useState([])
	useEffect(() => {
		if(wallet.loaded) {
			getDispensers(wallet.addressBook[wallet.addrIndex].pubKey).then(res => {
				if (typeof res != "undefined") {
					setDispList(res)
				}
			})
		}
	}, [wallet])

	return (
		<ThemeProvider theme={
			userSettings.theme == "light" ?
			lightTheme :
			darkTheme
		}>
		<CssBaseline />
		<Container
			sx={{
				m: 0,
				p: 0,
				width: "350px",
				minHeight: "600px",
				height: "auto",
				display: "flex",
				alignItems: "center",
				justifyContent: "center"
			}}
			disableGutters
		>
			<Menu // Menu popin
				wallet={wallet}
				setWallet={setWallet}
				refreshAddress={refreshAddress}
				menu={menu} 
				toggleMenu={toggleMenu}
				setLoading={setLoading}
				handleNewAddress={handleNewAddress}
				toggleShowSettings={toggleShowSettings}
			/>
		{
			loading ?
			<Loading // Fills UI with loading when wallet vars aren't present
				feedback={loadFeedback}
			/>
			: null
		}
		{
			// Begin app page routes
			page === "splash" ?
			<SplashPage 
				setPage={setPage}
			/> 
			: null
		}
		{
			page === "login-pword" ?
			<LoginWithPword // Opens login w/ pword
				encrypted={encrypted}
				setWallet={setWallet}
				setPage={setPage}
				setBtcPairs={setBtcPairs}
				menu={menu} 
				toggleMenu={toggleMenu}
				loading={loading}
				setLoading={setLoading}
				error={error}
				setError={setError}
			/>
			: null
		}
		{
			page === "login-legacy" ?
			<LoginLegacy // opens login w/ seed
				network={network}
				setWallet={setWallet}
				setPage={setPage}
			/>
			: null
		}
		{
			// End app page routes
			page === "app" ?
			<App // Main app
				wallet={wallet}
				setWallet={setWallet}
				network={network}
				setNetwork={setNetwork}
				btcPairs={btcPairs}
				refreshAddress={refreshAddress}
				handleNewAddress={handleNewAddress}
				menu={menu} 
				toggleMenu={toggleMenu}
				loading={loading}
				setLoading={setLoading}
				loadFeedback={loadFeedback}
				setLoadFeedback={setLoadFeedback}
				toggleShowPopup={toggleShowPopup}
				setPopupComp={setPopupComp}
				setDispList={setDispList}
				dispList={dispList}
				toggleShowSend={toggleShowSend}
				toggleShowSign={toggleShowSign}
				toggleShowIssuance={toggleShowIssuance}
				toggleShowLock={toggleShowLock}
				toggleShowDestroy={toggleShowDestroy}
				toggleShowAddSupply={toggleShowAddSupply}
				toggleShowDispense={toggleShowDispense}
			/>
			: null
		}

			<NewAddress // Popup dialogue to create new address
				newAddPage={newAddPage}
				toggleNewAddrPage={toggleNewAddrPage}
				createNewHDKeypair={createNewHDKeypair}
				importAdd={importAdd}
				toggleImportAdd={toggleImportAdd}
				setLoading={setLoading}
			/>

			<ImportAddress // Import WIF popup
				importAdd={importAdd}
				toggleImportAdd={toggleImportAdd}
				handleImportWIF={handleImportWIF}
				error={error}
				setError={setError}
			/>

			<Settings // Settings page
				showSettings={showSettings}
				toggleShowSettings={toggleShowSettings}
				theme={theme}
				toggleTheme={toggleTheme}
				userSettings={userSettings}
				setUserSettings={setUserSettings}
			/>

			<Send // Enhanced send and BTC send
				showSend={showSend}
				toggleShowSend={toggleShowSend}
				wallet={wallet}
				btcPairs={btcPairs}
				toggleShowPopup={toggleShowPopup}
				setPopupComp={setPopupComp}
				refreshAddress={refreshAddress}
				setBroadcastHex={setBroadcastHex}
				broadcastHex={broadcastHex}
				toggleShowBroadcastTx={toggleShowBroadcastTx}
				recFee={recFee}
				setRecFee={setRecFee}
			/>

			<Sign 
				showSign={showSign}
				toggleShowSign={toggleShowSign}
				wallet={wallet}
			/>

			<BroadcastTx // Enhanced send and BTC send
				showBroadcastTx={showBroadcastTx}
				toggleShowBroadcastTx={toggleShowBroadcastTx}
				wallet={wallet}
				btcPairs={btcPairs}
				toggleShowPopup={toggleShowPopup}
				setPopupComp={setPopupComp}
				refreshAddress={refreshAddress}
				setBroadcastHex={setBroadcastHex}
				broadcastHex={broadcastHex}
				recFee={recFee}
				setRecFee={setRecFee}
			/>

			<Issue 
				wallet={wallet}
				showIssuance={showIssuance}
				toggleShowIssuance={toggleShowIssuance}
				setBroadcastHex={setBroadcastHex}
				toggleShowBroadcastTx={toggleShowBroadcastTx}
				recFee={recFee}
				setRecFee={setRecFee}
				btcPairs={btcPairs}
				toggleShowPopup={toggleShowPopup}
				setPopupComp={setPopupComp}
			/>

			<Lock 
				wallet={wallet}
				showLock={showLock}
				toggleShowLock={toggleShowLock}
				setBroadcastHex={setBroadcastHex}
				toggleShowBroadcastTx={toggleShowBroadcastTx}
				recFee={recFee}
				setRecFee={setRecFee}
				btcPairs={btcPairs}
				toggleShowPopup={toggleShowPopup}
				setPopupComp={setPopupComp}
			/>

			<AddSupply 
				wallet={wallet}
				showAddSupply={showAddSupply}
				toggleShowAddSupply={toggleShowAddSupply}
				setBroadcastHex={setBroadcastHex}
				toggleShowBroadcastTx={toggleShowBroadcastTx}
				recFee={recFee}
				setRecFee={setRecFee}
				btcPairs={btcPairs}
				toggleShowPopup={toggleShowPopup}
				setPopupComp={setPopupComp}
			/>

			<Dispense 
				wallet={wallet}
				showDispense={showDispense}
				toggleShowDispense={toggleShowDispense}
				setBroadcastHex={setBroadcastHex}
				toggleShowBroadcastTx={toggleShowBroadcastTx}
				recFee={recFee}
				setRecFee={setRecFee}
				btcPairs={btcPairs}
				toggleShowPopup={toggleShowPopup}
				setPopupComp={setPopupComp}
				dispList={dispList}
			/>

			<Destroy 
				wallet={wallet}
				showDestroy={showDestroy}
				toggleShowDestroy={toggleShowDestroy}
				setBroadcastHex={setBroadcastHex}
				toggleShowBroadcastTx={toggleShowBroadcastTx}
				recFee={recFee}
				setRecFee={setRecFee}
				btcPairs={btcPairs}
				toggleShowPopup={toggleShowPopup}
				setPopupComp={setPopupComp}
			/>

			<AlertPopup // Popup component
				showPopup={showPopup}
				toggleShowPopup={toggleShowPopup}
				popupComp={popupComp}
			/>

		</Container>
		</ThemeProvider>
	)
}

render(<Popup />, document.getElementById("root"))
