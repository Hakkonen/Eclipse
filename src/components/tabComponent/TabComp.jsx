import * as React from "react"
import { useEffect, useState } from "react"

// Mui
import { Typography } from "@mui/material"
import { Container } from "@mui/system"
import Box from '@mui/material/Box'

import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'

import PropTypes from 'prop-types'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Skeleton from '@mui/material/Skeleton'

import { useTheme } from '@mui/material/styles'

// Icons
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin'
import XCPLogo from "../../assets/counterparty-mono.png"
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import PointOfSaleIcon from '@mui/icons-material/PointOfSale'
import AddReactionIcon from '@mui/icons-material/AddReaction'
import MessageIcon from '@mui/icons-material/Message'
import SendIcon from '@mui/icons-material/Send'
import CallReceivedIcon from '@mui/icons-material/CallReceived'
import AddBoxIcon from '@mui/icons-material/AddBox'
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'

// JSX
import InfoPopup from "./InfoPopup.jsx"

function TabPanel(props) {
	const { children, value, index, ...other } = props

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
		>
			{value === index && (
				<Box sx={{ p: 0, color: "text.primary" }} >
					{children}
				</Box>
			)}
		</div>
	)
}

const logoList = [
	{ "name": "default", "logo": XCPLogo },
	{ "name": "XCP", "logo": XCPLogo }
]

export default function TabComp(props) {

	const theme = useTheme()

	// Balance
	// BTC Hardcoded as it's not returned as an asset
	const [ btc, setBtc ] = useState({
		address: props.wallet.addressBook[props.wallet.addrIndex].pubKey,
		asset: "BTC",
		divisible: true,
		quantity: props.wallet.addressBook[props.wallet.addrIndex].btcBalance
	})
	// Update balance on prop update
	useEffect(() => {
		// Update btc balance
		if ("btcBalance" in props.wallet) {
			setBtc(prev => ({
				...prev,
				quantity: props.wallet.btcBalance
			}))
		}
		// Update logos
		if ("balance" in props.wallet.addressBook[props.wallet.addrIndex]) {
			for (const name of logoList) {
				for (const asset of props.wallet.addressBook[props.wallet.addrIndex].balance) {
					if (asset.asset == name.name) {
						asset.logo = name.logo
					}
				}
			}
		}

	}, [props])

	// Tabs
	const [value, setValue] = React.useState(0)
	TabPanel.propTypes = {
		children: PropTypes.node,
		index: PropTypes.number.isRequired,
		value: PropTypes.number.isRequired,
	}
	function a11yProps(index) {
		return {
			id: `simple-tab-${index}`,
			'aria-controls': `simple-tabpanel-${index}`,
		}
	}
	const handleChange = (event, newValue) => {
		setValue(newValue)
	}

	// Info popup
	const [ infoPop, toggleInfoPop ] = useState(false)
	const [ popupInfo, setPopupInfo ] = useState({})
	function handleInfoPopup(data) {
		toggleInfoPop(true)
		setPopupInfo(data)
	}

    return (
        <Box // Tabs
            sx={{ width: '100%', height: "100%" }}
        >

			{
				infoPop ?
					<InfoPopup data={popupInfo} infoPop={infoPop} toggleInfoPop={toggleInfoPop} /> 
				:
					null
			}

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="Wallet Tabs" 
					textColor="secondary"
					indicatorColor="secondary"
				>
                    <Tab label="Assets" {...a11yProps(0)} sx={{ width: "50%" }} />
                    <Tab label="Activity" {...a11yProps(1)} sx={{ width: "50%"  }} />
                </Tabs>
            </Box>
            <TabPanel // Assets
				value={value} index={0}
			>
				<nav aria-label="Wallet assets">
                <List sx={{ height: "100%", maxHeight: "350px", overflow: "scroll", pt: 0 }}>

					<ListItem key={0} disablePadding secondaryAction={
						Object.keys(props.btcPairs).length < 1 ?
							<Skeleton variant="rounded" width={50} height={24} />
						: 
							<Typography>
								${((props.wallet.addressBook[props.wallet.addrIndex].btcBalance / 100000000) * props.btcPairs.btcUSD).toFixed(2)}
							</Typography>
					}>
						<ListItemButton onClick={() => {console.log(btc)}} sx={{ borderBottomColor: "divider", borderBottomStyle: "solid", borderBottomWidth: "1px" }}>
							<ListItemIcon><CurrencyBitcoinIcon sx={{ height: 40, width: 40, color: "gold" }} /></ListItemIcon>
							<ListItemText 
								primary="BTC" 
								secondary={
									(props.wallet.addressBook[props.wallet.addrIndex].btcBalance / 100000000).toString()
								}
							/>
						</ListItemButton>
					</ListItem>
				
				{
					props.wallet.addressBook[props.wallet.addrIndex].balance.length > 0 ?
					props.wallet.addressBook[props.wallet.addrIndex].balance.map((asset, key) => {
						// Render all XCP assets
						if (asset.asset != "BTC") {return (
						<ListItem disablePadding key={key + 2} onClick={() => {console.log(asset)}}>
							<ListItemButton onClick={() => {handleInfoPopup(asset)}} sx={{ borderBottomColor: "divider", borderBottomStyle: "solid", borderBottomWidth: "1px" }}>
								<ListItemIcon>
									{asset.logo ? <Avatar alt={asset.asset} src={asset.logo} /> : <Avatar alt={asset.asset} src={XCPLogo} />}
								</ListItemIcon>
								<ListItemText 
									sx={{ maxWidth: "335px", wordWrap: "break-word" }}
									primary={
										asset.asset_longname ?
										asset.asset_longname :
										asset.asset
									}
									secondary={
										asset.divisible ? asset.quantity / 100000000 : asset.quantity
									}
								/>
							</ListItemButton>
						</ListItem>
					)}})
					: null
				}

				</List>

				</nav>
            </TabPanel>

            <TabPanel // Activity
				value={value} index={1}
			>
                <nav aria-label="Wallet assets">
                <List sx={{ height: "100%", maxHeight: "350px", overflow: "scroll", pt: 0 }}>
				
				{
					props.wallet.addressBook[props.wallet.addrIndex].history.length > 0 ?
					props.wallet.addressBook[props.wallet.addrIndex].history.map((tx, key) => (
						<span key={key} onClick={() => {console.log(tx)}}>
							{
								tx.type == "btcTx" ?
								<Utxo tx={tx} address={props.wallet.addressBook[props.wallet.addrIndex].pubKey} handleInfoPopup={handleInfoPopup} />
								:null
							}
							{
								tx.type === "dispenser" ?
								<Dispenser tx={tx} handleInfoPopup={handleInfoPopup} />
								: null
							}
							{
								tx.type === "issuance" ?
								<Issuance tx={tx} handleInfoPopup={handleInfoPopup} />
								: null
							}
							{
								tx.type === "broadcast" ?
								<Broadcast tx={tx} handleInfoPopup={handleInfoPopup} />
								: null
							}
							{
								tx.type === "debit" ?
								<DebitCredit tx={tx} method={"Sent"} handleInfoPopup={handleInfoPopup} />
								: null
							}
							{
								tx.type === "credit" ?
								<DebitCredit tx={tx} method={"Received"} handleInfoPopup={handleInfoPopup} />
								: null
							}
						</span>
					))
					: null
				}

				</List>
				</nav>
            </TabPanel>
        </Box>
    )
}

function DebitCredit(props) {

	const theme = useTheme()
	
	let quantity = props.tx.quantity
	if (props.tx.divisible) {quantity = quantity / 100000000}
	let name = props.tx.asset
	if ("asset_longname" in props.tx && props.tx.asset_longname != "" && props.tx.asset_longname != null) {
		name = props.tx.asset_longname
	}

	return (
		<ListItem disablePadding>
			<ListItemButton onClick={() => {props.handleInfoPopup(props.tx)}}
				sx={{ borderBottomColor: "divider", borderBottomStyle: "solid", borderBottomWidth: "1px" }}
			>
				<ListItemIcon>
					{
						props.method == "Received" ?
						<CallReceivedIcon sx={{ filter: theme.mode === 'dark' ? "invert(1)" : null }} /> :
						<ArrowOutwardIcon sx={{ filter: theme.mode === 'dark' ? "invert(1)" : null }} />
					}
				</ListItemIcon>
				<ListItemText 
					primary={props.method}
					secondary={
					<span>
						<Typography>
							{quantity + " " + name}
						</Typography>
						<Typography  variant="caption">{
							"Block " + props.tx.block_index
						}</Typography>
					</span>
					}
				/>
			</ListItemButton>
		</ListItem>
	)
}

function Broadcast(props) {

	const theme = useTheme()

	return (
		<ListItem disablePadding>
			<ListItemButton onClick={() => {props.handleInfoPopup(props.tx)}} sx={{ borderBottomColor: "divider", borderBottomStyle: "solid", borderBottomWidth: "1px" }}>
				<ListItemIcon><MessageIcon sx={{ filter: theme.mode === 'dark' ? "invert(1)" : null }} /></ListItemIcon>
				<ListItemText 
					primary={"Broadcast"}
					secondary={
						<span>
						<Typography>
							{props.tx.text}
						</Typography>
						<Typography  variant="caption">{
							"Block " + props.tx.block_index
						}</Typography>
						</span>
					}
				/>
				
			</ListItemButton>
		</ListItem>
	)
}

function Issuance(props) {

	const theme = useTheme()

	return (
		<ListItem disablePadding>
			<ListItemButton onClick={() => {props.handleInfoPopup(props.tx)}} sx={{ borderBottomColor: "divider", borderBottomStyle: "solid", borderBottomWidth: "1px" }}>
				{
					theme.mode === 'dark' ?
					<ListItemIcon><AddBoxIcon sx={{ color: "white" }} /></ListItemIcon>
					: 
					<ListItemIcon><AddBoxIcon /></ListItemIcon>
				}
				
				<ListItemText 
					primary={"Issued " + props.tx.asset}
					secondary={
						<span>
							<Typography>{
								"QTY " + props.tx.quantity
							}</Typography>
							<Typography  variant="caption">{
								"Block " + props.tx.block_index
							}</Typography>
						</span>
					}
				/>
				
			</ListItemButton>
		</ListItem>
	)
}

function Dispenser(props) {

	const theme = useTheme()

	return (
		<ListItem disablePadding>
			<ListItemButton onClick={() => {props.handleInfoPopup(props.tx)}} sx={{ borderBottomColor: "divider", borderBottomStyle: "solid", borderBottomWidth: "1px" }}>
				<ListItemIcon><PointOfSaleIcon sx={{ filter: theme.mode === 'dark' ? "invert(1)" : null }} /></ListItemIcon>
				<ListItemText 
					primary={"Dispense " + props.tx.asset}
					secondary={
						<span>
							<Typography>
							{"for " + (props.tx.satoshirate / 100000000) + " BTC"}
							</Typography>
							<Typography> {"at " + props.tx.source.slice(0,7) + "..." + props.tx.source.slice(-6)}
							</Typography>
							<Typography variant="caption">{
								"Block " + props.tx.block_index
							}</Typography>
						</span>
					}
				/>
			</ListItemButton>
		</ListItem>
	)
}

function Utxo(props) {

	const theme = useTheme()

	let method = "Received"
	let icon = <ArrowDownwardIcon sx={{ color: theme.mode === 'dark' ? "white" : null }} />
	if (props.tx.address != props.address) {
		method = "Sent"
		icon = <ArrowUpwardIcon sx={{ color: theme.mode === 'dark' ? "white" : null }} />
	}

	return (
		<ListItem disablePadding>
			<ListItemButton onClick={() => {
				window.open(`https://blockstream.info/tx/${props.tx.hash}`, '_blank').focus()
				}} sx={{ borderBottomColor: "divider", borderBottomStyle: "solid", borderBottomWidth: "1px" }}
			>
				<ListItemIcon>{icon}</ListItemIcon>
				<ListItemText 
					primary={method}
					secondary={
						<span>
							<Typography>{(props.tx.value / 100000000) + " BTC"}</Typography>
							{
								props.tx.confirmed != null ?
								<Typography variant="caption">{
								new Date(String(props.tx.confirmed)).toLocaleString("en-GB")
								}</Typography>
								: 
								<Typography variant="caption">{
								"Block " + props.tx.blockIndex
								}</Typography>
							}
						</span>
					}
				/>
				
			</ListItemButton>
		</ListItem>
	)

}