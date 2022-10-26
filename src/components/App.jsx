import * as React from "react"
import { useEffect, useState } from "react"

// Network
import axios from "axios"

// MUI imports
import { Typography } from "@mui/material"
import { Container } from "@mui/system"
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Skeleton from '@mui/material/Skeleton'
import Tooltip from '@mui/material/Tooltip'
import Slide from '@mui/material/Slide'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Link from '@mui/material/Link'

// Icons
import SendIcon from '@mui/icons-material/Send'
import MenuIcon from '@mui/icons-material/Menu'
import CreateIcon from '@mui/icons-material/Create'
import AddBoxIcon from '@mui/icons-material/AddBox'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import LockIcon from '@mui/icons-material/Lock'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import CopyAllIcon from '@mui/icons-material/CopyAll'
import SellIcon from '@mui/icons-material/Sell'
import PointOfSaleIcon from '@mui/icons-material/PointOfSale'

// Assets
import icon from "../assets/eclipse-logo-m.png"

// JSX
import TabComp from "./tabComponent/TabComp.jsx"
import Loading from "./login/Loading.jsx"
import Menu from "./Menu.jsx"
import ResultPopup from "./network/ResultPopup.jsx"

// Functions
import loadChainData from "../functions/api/loadChainData"
import getBalances from "../functions/api/getBalances"
import getBalanceHistory from "../functions/api/getBalanceHistory"
import getDispensers from "../functions/api/getDispensers"

function WalletInfo(props) {

	// Slider
	useEffect(() => {
		const slider = document.querySelector('.items');
		let isDown = false;
		let startX;
		let scrollLeft;
		
		slider.addEventListener('mousedown', (e) => {
			isDown = true;
			slider.classList.add('active');
			startX = e.pageX - slider.offsetLeft;
			scrollLeft = slider.scrollLeft;
		});
		slider.addEventListener('mouseleave', () => {
			isDown = false;
			slider.classList.remove('active');
		});
		slider.addEventListener('mouseup', () => {
			isDown = false;
			slider.classList.remove('active');
		});
		slider.addEventListener('mousemove', (e) => {
			if(!isDown) return;
			e.preventDefault();
			const x = e.pageX - slider.offsetLeft;
			const walk = (x - startX) * 2; //scroll-fast
			slider.scrollLeft = scrollLeft - walk;
			// console.log(walk);
		});
	}, [])

	// Get dispensers at address
	// const [ dispList, setDispList ] = useState([])
	const [ showDispInfo, toggleShowDispInfo ] = useState(false)
	// useEffect(() => {
	// 	if(props.wallet.loaded) {
	// 		getDispensers(props.wallet.addressBook[props.wallet.addrIndex].pubKey).then(res => {
	// 			console.log(res)
	// 			setDispList(res)
	// 		})
	// 	}
	// }, [props.wallet])

	// popup
	function handleDispInfo() {
		toggleShowDispInfo(true)
		// props.setPopupComp(
		// 	<ResultPopup toggleShowPopup={
		// 		"TEST TEXT"
		// 	} tx={res.tx} />
		// )
		// props.toggleShowPopup(true)
	}

	return (
		<Grid // Information grid
			container xs={12} sx={{
				height: "100%",
				display: "flex", justifyContent: "flex-start", flexDirection: "column"
			}}
		>

			<Grid // header
				container xs={12} sx={{
					height: "auto", minHeight: 200, width: "100%", backgroundColor: "primary.main", p: 2
				}}
			>
				<Grid // Header row: wallet name, address, menu icon
					container xs={12} sx={{
						height: "auto", maxHeight: 60, width: "100%", color: "primary.contrastText"
					}}
				>
					<Grid  // Wallet name and address container
						item xs={10} sx={{ p: 0 }}
					>
						<Typography
							textAlign="left" variant="body1" sx={{
							width: "100%", minHeight: "27px", fontWeight: "400", pb: 0, color: "primary.contrastText"
						}}>
							{
								props.wallet.addressBook[props.wallet.addrIndex].name != "" ?
								props.wallet.addressBook[props.wallet.addrIndex].name
								: ""
							}
							{
								// If dispenser is active on addy show icon
								props.dispList && Object.keys(props.dispList).length > 0 && props.dispList.length > 0 ?
									<Tooltip title="Dispenser active at this address">
										<IconButton sx={{ color: "primary.contrastText", p: 0.5, mb: "3px" }} onClick={() => {handleDispInfo()}}>
											<PointOfSaleIcon sx={{ height: 16, width: 16 }} />
										</IconButton>
									</Tooltip>
								: null
							}

						</Typography>
						<Typography 
							variant="caption" 
							className="noselect" 
							onClick={() => {navigator.clipboard.writeText(props.wallet.addressBook[props.wallet.addrIndex].pubKey)}}
							sx={{ 
							":hover": { color: "secondary.light" }, ":active": { color: "secondary.dark" }, color: "primary.contrastText"
						}}>
							Address: {(props.wallet.addressBook[props.wallet.addrIndex].pubKey).slice(0,6)}...{(props.wallet.addressBook[props.wallet.addrIndex].pubKey).slice(-5)} <ContentCopyIcon style={{ width: 14, height: 14, position: 'relative', top: 3}} />
						</Typography>

					</Grid>

					<Grid // Menu icon
						item xs={2} sx={{ p: 0, display: "flex", justifyContent: "flex-end", alignItems: "flex-start" }}
					>
						<IconButton sx={{ color: "primary.contrastText" }} onClick={() => {
							props.toggleMenu(!props.menu)
						}}>
							<MenuIcon />
						</IconButton>
					</Grid>
				</Grid>

				<Grid // Btc balance
					container xs={12} sx={{
						height: "auto", maxHeight: 100, width: "100%", color: "primary.contrastText"
					}}
				>
					{
						props.loading == true ?
						<Skeleton variant="rounded" width={125} height={42} />
						:
						<Box sx={{ width: "100%" }}>
							<Typography variant="h4" textAlign="left" sx={{
								fontWeight: 500
							}}>
								${((props.wallet.addressBook[props.wallet.addrIndex].btcBalance / 100000000) * props.btcPairs.btcUSD).toFixed(2)}
							</Typography>
							{/* <Typography variant="body1" textAlign="left" sx={{ fontSize: "0.75rem", fontWeight: 100 }}>
								{(props.wallet.addressBook[props.wallet.addrIndex].btcBalance / 100000000) + " btc"}
							</Typography> */}
						</Box>
					}	
				</Grid>

				<Grid // Buttons
					container xs={12} 
					className="hideScroll hideScrollM"
					sx={{
						height: "auto", maxHeight: 100, width: "100%", color: "primary.contrastText",
						overflow: "scroll"
					}}
				>
					<Stack spacing={2} direction="row" className="items hideScroll hideScrollM">
						<Button 
							className="item item1"
							startIcon={<SendIcon />}
							variant="contained"
							onClick={() => {props.toggleShowSend(true)}}
							sx={{
								minWidth: "120px", pt: 0, pb: 0, bgcolor: "primary.light", ":hover": { bgcolor: "primary.dark" }, ":active": { bgcolor: "primary.light" }
							}}
						>Send</Button>

						<Button 
							className="item item2"
							startIcon={<CreateIcon />}
							variant="contained"
							onClick={() => {props.toggleShowSign(true)}}
							sx={{
								minWidth: "120px!important", pt: 0, pb: 0, bgcolor: "primary.light", ":hover": { bgcolor: "primary.dark" }, ":active": { bgcolor: "primary.light" }
							}}
						>Sign</Button>

						<Button 
							className="item item3"
							startIcon={<AddBoxIcon />}
							variant="contained"
							onClick={() => {props.toggleShowIssuance(true)}}
							sx={{
								minWidth: "120px", pt: 0, pb: 0, bgcolor: "primary.light", ":hover": { bgcolor: "primary.dark" }, ":active": { bgcolor: "primary.light" }
							}}
						>Create</Button>

						<Button 
							className="item item4"
							startIcon={<SellIcon />}
							variant="contained"
							onClick={() => {props.toggleShowDispense(true)}}
							sx={{
								minWidth: "120px", pt: 0, pb: 0, bgcolor: "primary.light", ":hover": { bgcolor: "primary.dark" }, ":active": { bgcolor: "primary.light" }
							}}
						>Dispense</Button>

						<Button 
							className="item item5"
							startIcon={<CopyAllIcon />}
							variant="contained"
							onClick={() => {props.toggleShowAddSupply(true)}}
							sx={{
								minWidth: "120px", pt: 0, pb: 0, bgcolor: "primary.light", ":hover": { bgcolor: "primary.dark" }, ":active": { bgcolor: "primary.light" }
							}}
						>Issue</Button>

						<Button 
							className="item item6"
							startIcon={<LockIcon />}
							variant="contained"
							onClick={() => {props.toggleShowLock(true)}}
							sx={{
								minWidth: "120px", pt: 0, pb: 0, bgcolor: "primary.light", ":hover": { bgcolor: "primary.dark" }, ":active": { bgcolor: "primary.light" }
							}}
						>Lock</Button>

						<Button 
							className="item item7"
							startIcon={<LocalFireDepartmentIcon />}
							variant="contained"
							onClick={() => {props.toggleShowDestroy(true)}}
							sx={{
								minWidth: "120px", pt: 0, pb: 0, bgcolor: "primary.light", ":hover": { bgcolor: "primary.dark" }, ":active": { bgcolor: "primary.light" }
							}}
						>Destroy</Button>
						
					</Stack>
				</Grid>

			</Grid>

			{
				showDispInfo ?
					<DispenserInfo 
						showDispInfo={showDispInfo} 
						toggleShowDispInfo={toggleShowDispInfo} 
						dispList={props.dispList}
					/>
				: null
			}

		</Grid>
	)
}

export default function App(props) {

	// Loading state:
	//	default on while getting address data
	// useEffect(() => {
	// 	if (props.wallet.loaded) {
	// 		// props.setLoading(false)
	// 	}
	// }, [props.wallet])

	return (
		<Box
			sx={{ width: "100%", height: "100%", minHeight: "600px", p: 0, m: 0 }}
		>

			<Box
				sx={{ width: "100%", height: "100%", p: 0, m: 0 }}
			>
				<WalletInfo 
					wallet={props.wallet}
					setWallet={props.setWallet}
					network={props.network}
					btcPairs={props.btcPairs}
					toggleMenu={props.toggleMenu}
					menu={props.menu}
					loading={props.loading}
					setDispList={props.setDispList}
					dispList={props.dispList}
					toggleShowSend={props.toggleShowSend}
					toggleShowSign={props.toggleShowSign}
					toggleShowIssuance={props.toggleShowIssuance}
					toggleShowLock={props.toggleShowLock}
					toggleShowDestroy={props.toggleShowDestroy}
					toggleShowAddSupply={props.toggleShowAddSupply}
					toggleShowDispense={props.toggleShowDispense}
				/>
				<TabComp 
					wallet={props.wallet}
					addrIndex={props.addrIndex}
					btcPairs={props.btcPairs}
					loading={props.loading}
				/>
			</Box>

		</Box>
	)
}

// Show's active dispenser info
function DispenserInfo(props) {

	return (
		<Slide direction="up" in={props.showDispInfo} mountOnEnter unmountOnExit>
			<Box sx={{width: "100%", height: "100%", maxWidth: 350, position: "absolute", zIndex: 75,
                top: 0, left: 0, right: 0, bottom: 0, p: 2, overflow: "scroll", backdropFilter: "blur(4px)"}}
			>

			<Card variant="outlined" sx={{ width: "auto", height: "auto", borderRadius: "5px", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", pt: 2, pb: 2, pl: 4, pr: 4 }}>

				<CardContent sx={{ width: "100%", maxWidth: 350 }}>
					<Typography variant="h6" textAlign={"center"} sx={{ pb: 2 }}>
						Active Dispensers
					</Typography>

					{
						props.dispList.map((dispenser) => (
							<Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", pb: 2, flexDirection: "column"}}>
								<Typography 
									sx={{fontWeight: 500, width: "100%", maxWidth: 280, wordBreak: "break-word", textAlign: "center"}} variant="body1"
								>
									{dispenser.asset}
								</Typography>

								<Link href={`https://xchain.io/tx/${dispenser.tx_hash}`} underline="none" target="_blank" >
									<Button 
										variant="text" sx={{ color: "secondary.main" }}
									>View on explorer</Button>
								</Link>
							</Box>
						))
					}
					

				</CardContent>

				<CardActions sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>

					<Button variant="contained" onClick={() => {props.toggleShowDispInfo(false)}}>
						Done
					</Button>

				</CardActions>

			</Card>

			</Box>
		</Slide>
	)
}