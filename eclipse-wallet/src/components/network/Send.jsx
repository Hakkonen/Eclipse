// Runs user send function

import React from "react"
import { useEffect, useState } from "react"

import axios from "axios"

// MUI
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Grow from '@mui/material/Grow'
import Slide from '@mui/material/Slide'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import { Divider, Typography } from "@mui/material"
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'

import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'
import MenuItem from '@mui/material/MenuItem'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Tooltip from '@mui/material/Tooltip'

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import LinkIcon from '@mui/icons-material/Link'
import LinkOffIcon from '@mui/icons-material/LinkOff'

// Funcs
import getAssetInfo from "../../functions/api/getAssetInfo"
import getSendInfo from "../../functions/send/getSendInfo"
import base58Check from "../../functions/address/base58Check"
import opReturnTx from "../../functions/send/opReturnTx"
import createDataChunk from "../../functions/xcp/createDataChunk"
import btcSend from "../../functions/send/btcSend"
import assetToID from "../../functions/xcp/assetToID"

// JSX
import ResultPopup from "./ResultPopup.jsx"
import ErrorPopup from "./ErrorPopup.jsx"
import LoadingPopup from "./LoadingPopup.jsx"

export default function Send(props) {

    // TODO: Resolve dust issue
    // Dust is a result of the cost of sending being larger than the largest utxo
    // The current dust limit fee rate is 3 satoshis/byte. If, at 3 satoshis per byte, an output would cost more in fees to spend that it has in value, then that output is considered dust. If you are sending to non-segwit addresses, this limit is 3 sat/byte * 148 bytes = 444 sats

    // Get miner fee on load
    // const [ recFee, setRecFee ] = useState({high: 4000, medium: 2000, low: 1000})
    const avgByteSize = 250 // avg vbyte size
    // TODO: Merge fee calc into single func
    useEffect(() => {
        axios.get("https://blockstream.info/api/fee-estimates")
            .then(res => {
                console.log(Math.ceil(res.data[1]))
                console.log(res.data[5])
                console.log(res.data[7])
                console.log(res.data[10])
                props.setRecFee({high: parseFloat(res.data[1]), medium: parseFloat(res.data[5]), low: parseFloat(res.data[7]), vLow: parseFloat(res.data[10])})
                setFee(parseInt(avgByteSize * parseFloat(res.data[5])) / 100000000)
            })
    }, [props.showSend])
    
    // const [ btcBalance, setBtcBalance ] = useState(0.0)
    const [ balance, setBalance ] = useState([])
    useEffect(() => {

        // Updates assets balance
        if(props.wallet.loaded == true) {
            setBalance(props.wallet.addressBook[props.wallet.addrIndex].balance)
        }

    })

    // Sets selected asset and gets asset ID
    const [ asset, setAsset ] = useState({
        asset: "",
        asset_longname: "",
        available: 0,
        divisible: false,
        assetID: -1
    })

    // Sets asset to selected in dropdown menu and 
    //  gets asset ID for enhanced send
    async function handleChange (event) {
        // Takes in name, finds name in balance and gets data
        // Input asset
        const selection = event.target.value
        let balanceEntry = {}
        console.log("Selection: " + selection)

        // Find entry
        for(const asset of balance) {
            if (asset.asset == selection) {
                balanceEntry = asset
                break
            }
        }

        console.log("ASSET TO ID")
        console.log(assetToID(balanceEntry.asset))

        // Filter out multiple methods of declaring divis
        let divisible = false
        if (balanceEntry.divisible == 1 || balanceEntry.divisible == true) {
            divisible = true
        } else if (balanceEntry.divisible == 0 || balanceEntry.divisible == false) {
            divisible = false
        }

        // Get asset ID
        // If XCP asset get asset info
        if(balanceEntry.asset != "BTC") {
            const assetID = assetToID(balanceEntry.asset)
            const assetObj = {
                asset: balanceEntry.asset,
                asset_longname: balanceEntry.asset_longname,
                available: balanceEntry.quantity,
                divisible: divisible,
                assetID: assetID
            }
            setAsset(assetObj)
            // await getSendInfo(balanceEntry.asset)
            // .then(res => {
            //     const assetObj = {
            //         asset: balanceEntry.asset,
            //         asset_longname: balanceEntry.asset_longname,
            //         available: balanceEntry.quantity,
            //         divisible: divisible,
            //         assetID: res[0].asset_id
            //     }
            //     setAsset(assetObj)
            // })
        // Else return BTC object
        } else {
            const btcObj = {
                asset: balanceEntry.asset,
                asset_longname: balanceEntry.asset_longname,
                available: balanceEntry.quantity,
                divisible: true,
                assetID: 0
            }
            setAsset(btcObj)
        }
    }

    // Input values
    const [ destination, setDestination ] = useState("") // base58
    const [ dnsAddr, setDnsAddr ] = useState({dns: "", pubkey: ""}) // used for DNS
    const [ qty, setQty ] = useState("") // div by 100 000 000 if asset is div
    const [ memo, setMemo ] = useState("") // Limit
    const [ fee, setFee ] = useState(0) // div by 100 000 000
    const [ sendCheck, toggleSendCheck ] = useState(false) // disables send button
    const [ dnsActive, setDnsActive ] = useState(false) // checks for dns over address

    // Send Check
    useEffect(() => {

        // Clear DNS if switched off
        if (!dnsActive) {
            setDnsAddr({dns: "", pubkey: ""})
        }

        async function checkInputs() {
            // destination check
            let destinationCheck = null
            if (destination.length > 0) {

            // Asset selected
            let assetCheck = false
            if(asset.asset != "") {
                assetCheck = true
            }

            // Quantity
            let qtyCheck = false
            if(qty > 0) {
                qtyCheck = true
            }

                // Check base58
                let baseCheck
                try {
                    baseCheck = base58Check(destination)
                } catch(e) {
                    baseCheck = false
                }
                
                if (dnsActive) {
                    console.log("XCP suffix valid")
                    // // Check if dns has already been queried for this destination string
                    // if(dnsAddr.dns == destination) {
                    //     console.log("DNS already present")
                    //     destinationCheck = true
                    // } else {
                        // else get dns info
                        // const delayDebounceFn = setTimeout(() => {
                            console.log("calling dns")
                            // Search asset after 1s delay
                            // DNS concept: get asset's issuer
                            const dnsName = destination
                            console.log(dnsName)
                            destinationCheck = await getAssetInfo([dnsName]).then(
                                res => {
                                    console.log(res)
                                    if(res.length > 0 && res.owner != "") {
                                        setDnsAddr({dns: destination, pubkey: res[0].owner})
                                        setSendErrors(prev => ({
                                            ...prev,
                                            destination: false, destinationMsg: ""
                                        }))
                                        // Set dest check to true
                                        return true
                                    } else {
                                        setDnsAddr({dns: "", pubkey: ""})
                                        setSendErrors(prev => ({
                                            ...prev,
                                            destination: true, destinationMsg: "Non-existent DNS"
                                        }))
                                        return false
                                    }
                                }
                            )
                        // }, 1000)
                        // return () => clearTimeout(delayDebounceFn)
                    // }
                } else if(baseCheck) {
                    // set dest check to true
                    destinationCheck = true
                    setSendErrors(prev => ({
                        ...prev,
                        destination: false, destinationMsg: ""
                    }))
                    setDnsAddr({dns: "", pubkey: ""})
                // Check if xcp dns
                } else if (destination.slice(0,3) == "bc1" && destination.length == 42) {
                    // Check for bech32 address
                    destinationCheck = true
                    setSendErrors(prev => ({
                        ...prev,
                        destination: false, destinationMsg: ""
                    }))
                    setDnsAddr({dns: "", pubkey: ""})
                } else {
                    // set dest check to false
                    destinationCheck = false
                }

                if (destinationCheck != null && destinationCheck && assetCheck && qtyCheck) {
                    console.log("CHEKS: ", destinationCheck, assetCheck, qtyCheck)
                    toggleSendCheck(true)
                } else {
                    console.log("CHEKS: ", destinationCheck, assetCheck, qtyCheck)
                    toggleSendCheck(false)
                }

            }

            
            

        }
        const delayDebounceFn = setTimeout(() => {
            checkInputs()
        }, 500)
        return () => clearTimeout(delayDebounceFn)

    }, [destination, qty, dnsActive])

    // Set max send quant
    function setMaxQuant() {
        // If btc
        if(asset.asset == "BTC") {
            // Max send is balance - (send qty + fee)
            const maxSend = (asset.available - (fee * 100000000)) / 100000000
            setQty(maxSend)
        } else {
            // Max send is balance - send qty
            const maxSend = asset.divisible ? asset.available / 100000000 : asset.available
            setQty(maxSend)
        }
    }

    // Validate and SUBMIT
    const [ sendErrors, setSendErrors ] = useState({
        destination: false, destinationMsg: "", qty: false, qtyMsg: "", memo: false, memoMsg: "", fee: false, feeMsg: ""
    })
    // Enhanced & BTC send function
    async function submitSend() {
        props.setPopupComp(<LoadingPopup />)
        props.toggleShowPopup(true)
        let validSend = true
        // 1. Validate destination 
        let destinationPubKey = destination
        let baseCheck
        try {
            baseCheck = base58Check(destination)
        } catch(e) {
            baseCheck = false
            validSend = false
        }
        
        if(baseCheck) {
            setSendErrors(prev => ({
                ...prev,
                destination: false, destinationMsg: ""
            }))
        } else if (dnsAddr.pubkey != "" && dnsAddr.dns == destination) {
            console.log("Checking for DNS pubkey")
            destinationPubKey = dnsAddr.pubkey
            setSendErrors(prev => ({
                ...prev,
                destination: false, destinationMsg: ""
            }))
            // Set send back to valid
            validSend = true
        } else if (destination.slice(0,3) == "bc1" && destination.length == 42) {
            // Check for bech32 address
            setSendErrors(prev => ({
                ...prev,
                destination: false, destinationMsg: ""
            }))
            // Set send back to valid
            validSend = true
        } else {
            setSendErrors(prev => ({
                ...prev,
                destination: true, destinationMsg: "Invalid Address"
            }))
            validSend = false
        }

        // 2. Validate quantity
        let qtyInteger = 0 // units of 100 000 000
        if (asset.divisible) {
            
            // If asset is divisible
            // Check is qty <= avail
            const decimal = /^\d+\.\d{0,8}$/;

            // Check if valid decimal
            if(decimal.test(qty) || isNaN(qty) == false) {
                qtyInteger = parseInt(qty * 100000000)
            } else {
                setSendErrors(prev => ({
                    ...prev,
                    qty: true, qtyMsg: "Invalid decimal"
                }))
                validSend = false
            }

        } else {
            const inputQty = parseInt((qty).toString().split(".")[0])
            // Check if valid integer
            if(!isNaN(inputQty)) {
                qtyInteger = parseInt(inputQty)
            } else {
                setSendErrors(prev => ({
                    ...prev,
                    qty: true, qtyMsg: "Invalid integer"
                }))
                validSend = false
            }
        }
        if (qtyInteger > asset.available) {
            setSendErrors(prev => ({
                ...prev,
                qty: true, qtyMsg: "Insufficient balance"
            }))
            validSend = false
        }

        // 3. Validate memo
        // TODO max length 34char
        if(memo.length > 34) {
            setSendErrors(prev => ({
                ...prev,
                memo: true, memoMsg: "Memo too long"
            }))
            validSend = false
        }

        // 4. Validate fee
        let satFee = 0
        const decimal = /^\d+\.\d{0,8}$/;
        if(!decimal.test(fee)) {
            setSendErrors(prev => ({
                ...prev,
                fee: true, feeMsg: "Decimal numbers only"
            }))
            validSend = false
        } else {
            setSendErrors(prev => ({
                ...prev,
                fee: false, feeMsg: ""
            }))
            // Convert fee to sats
            console.log("!!!FEE: " + fee)
            satFee = parseInt(fee  * 100000000)
            console.log("!!!satFEE: " + satFee)
        }
        // If fee is over ~$1000usd throw error
        if(satFee > 500000) {
            setSendErrors(prev => ({
                ...prev,
                fee: true, feeMsg: "Satoshi fee is too high"
            }))
            validSend = false
        }

        // Check that outputs + fee do not exceed balance
        if(asset.asset == "BTC") {
            console.log("sat fee: " + satFee)
            console.log("sat fee: " + qtyInteger)
            if (qtyInteger + satFee > asset.available) {
                console.error("Invalid balance")
    
                setSendErrors(prev => ({
                    ...prev,
                    fee: true, feeMsg: "Insufficient funds"
                }))
                validSend = false
            } else {
                setSendErrors(prev => ({
                    ...prev,
                    fee: false, feeMsg: ""
                }))
            }
        } else {
            if (qtyInteger > asset.available) {
                console.error("Invalid balance")
    
                setSendErrors(prev => ({
                    ...prev,
                    fee: true, feeMsg: "Insufficient funds"
                }))
                validSend = false
            } else {
                setSendErrors(prev => ({
                    ...prev,
                    fee: false, feeMsg: ""
                }))
            }
        }

        // Finalise send object and start send func
        console.log("valid send: " + validSend)
        if(validSend) { 
            console.log("DESTINATION: " + destinationPubKey)
            // If asset is an XCP enhanced send
            if(asset.asset != "BTC") {
                console.log("Creating data chunk...")
                const sendObject = {
                    mode: "send",
                    assetName: asset.asset,
                    assetQty: qtyInteger,
                    destination: destinationPubKey,
                    memo: memo
                }

                // const sendObj = {
                //     pubKey: props.wallet.addressBook[props.wallet.addrIndex].pubKey,
                //     privKey: props.wallet.addressBook[props.wallet.addrIndex].privKey,
                //     fee: satFee,
                //     destination: destinationPubKey,
                //     assetId: asset.assetID,
                //     qty: qtyInteger,
                //     memo: memo
                // }
                // console.log(sendObj)

                // Create XCP Data Chunk for OP_RETURN
                const dataChunk = createDataChunk(sendObject)
                console.log(dataChunk)

                // Build OP_RETURN PSBT
                const btcSendFields = {
                    pubKey: props.wallet.addressBook[props.wallet.addrIndex].pubKey,
                    privKey: props.wallet.addressBook[props.wallet.addrIndex].privKey,
                    fee: satFee,
                    dataChunk: dataChunk
                }
                console.log("PSBT ENTRY FIELDS")
                console.log(btcSendFields)
                const btcTxBuild = await opReturnTx(btcSendFields)

                // // Enhanced send
                // const txBuild = await enhancedSend(sendObj).then(res => {
                //     console.log(res)
                //     return res
                // })

                if(btcTxBuild.success) {
                    // Hide load
                    props.toggleShowPopup(false)
                    // Open broadcast page by setting global hex var
                    props.setBroadcastHex({
                        mode: "Enhanced Send",
                        asset: asset.asset,
                        address: props.wallet.addressBook[props.wallet.addrIndex].pubKey,
                        destination: dnsAddr.dns != "" ? dnsAddr.pubkey : destination,
                        fee: fee,
                        hex: btcTxBuild.hex
                    })

                    // Reset send form data
                    // resetData()
                }

                // // If tx success
                // if (txRes.success) {
                //     console.log(txRes)
                //     // Show success popup
                //     props.setPopupComp(<ResultPopup toggleShowPopup={props.toggleShowPopup} tx={txRes.tx} />)
                //     props.toggleShowPopup(true)
                //     // Reset asset data
                //     resetData()

                //     // Refresh address
                //     props.refreshAddress(undefined, undefined, false, true)
                // // If tx failed pass error
                // } else {
                //     props.setPopupComp(<ErrorPopup toggleShowPopup={props.toggleShowPopup} error={txRes.error} />)
                //     props.toggleShowPopup(true)
                // }
            // ELSE if asset is BTC, create p2p send
            } else if (asset.asset == "BTC") {

                console.log("Finalising ouputs:")
                const sendObj = {
                    pubKey: props.wallet.addressBook[props.wallet.addrIndex].pubKey,
                    privKey: props.wallet.addressBook[props.wallet.addrIndex].privKey,
                    fee: satFee,
                    outputs: [
                        {address: destinationPubKey, value: qtyInteger}
                    ]
                }
                console.log(sendObj)

                // BTC send
                const txBuild = await btcSend(sendObj).then(res => {
                    console.log(res)
                    return res
                })

                if(txBuild.success) {
                    // Hide load
                    props.toggleShowPopup(false)
                    // Open broadcast page by setting global hex var
                    props.setBroadcastHex({
                        mode: "BTC Send",
                        asset: asset.asset,
                        address: props.wallet.addressBook[props.wallet.addrIndex].pubKey,
                        destination: dnsAddr.dns != "" ? dnsAddr.pubkey : destination,
                        fee: fee,
                        hex: txBuild.hex
                    })

                    // Reset send form data
                    // resetData()
                }

                // // If tx success
                // if (txRes.success) {
                //     console.log(txRes)
                //     // Show success popup
                //     props.setPopupComp(<ResultPopup toggleShowPopup={props.toggleShowPopup} tx={txRes.tx} />)
                //     props.toggleShowPopup(true)
                //     // Reset asset data
                //     resetData()

                //     // Refresh Address
                //     props.refreshAddress(undefined, undefined, false, true)
                // // If tx failed pass error
                // } else {
                //     props.setPopupComp(<ErrorPopup toggleShowPopup={props.toggleShowPopup} error={txRes.error} />)
                //     props.toggleShowPopup(true)
                // }
            }
        } else {
            props.toggleShowPopup(false)
        }
    }

    // handle name formatting
    function handleDestInput(stdin) {
        // if dns active
        if(dnsActive) {
            if(stdin.includes(".")) {
                console.log(stdin.includes("."))
                // Split into prefix and suffix
                let prefix = stdin.split(".")[0]
                let suffix = stdin.split(".")[1]
                setDestination((prefix.toUpperCase() + "." + suffix))
            } else {
                setDestination((stdin).toUpperCase())
            }
        } else {
            setDestination(stdin)
        }

    }

    // Reset data on page exit
    function resetData() {
        setAsset({     
            asset: "",
            asset_longname: "",
            available: 0,
            divisible: false,
            assetID: -1
        }) // reset asset hook
        setDestination("") // reset distination hook
        setDnsAddr({dns: "", pubkey: ""}) // reset dns info
        setQty("") // Set qty to empty
        setMemo("") // clear memo hook
        setSendErrors({destination: false, destinationMsg: "", qty: false, qtyMsg: "", memo: false, memoMsg: "", fee: false, feeMsg: ""}) // clear errors
        props.toggleShowSend(false) // Close send page
    }

    return (
        <Slide direction="right" in={props.showSend} mountOnEnter unmountOnExit>
            <Box sx={{
                width: "100%", height: "100%", maxWidth: 350, position: "absolute", zIndex: 25,
                top: 0, left: 0, right: 0, bottom: 0, p: 2, overflow: "scroll", backdropFilter: "blur(4px)"
            }}>
                <Card sx={{ width: "100%" }}>
                    
                    <Grid container xs sx={{ backgroundColor: "secondary.main" }}>

                        <Grid item xs={2} sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>

                            <IconButton aria-label="back" onClick={() => {
                                props.toggleShowSend(false);
                                resetData();
                            }}>
                                <ArrowBackIcon sx={{ color: "primary.contrastText"  }} />
                            </IconButton>

                        </Grid>

                        <Grid item xs={8} sx={{ width: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Typography variant="h5" sx={{ pt: 2, pb: 2, color: "primary.contrastText"}}>
                                Send
                            </Typography>
                        </Grid>

                        <Grid item xs={2}></Grid>

                    </Grid>
            
                    <CardContent>
                        <List
                            sx={{ width: '100%' }}
                        >
                            <ListItem // Destination
                                sx={{ display: "flex", flexDirection: "column" }}>
                                <Tooltip title="Destination address: public key by default or click the link icon to send to a DNS address. Counterparty DNS address directs asset destination to the owner of the input address token.">
                                    <ListItemText 
                                        secondary={
                                            dnsAddr.pubkey != "" ?
                                            "Destination " + dnsAddr.pubkey.slice(0,4) + "..." + dnsAddr.pubkey.slice(-4) :
                                            "Destination"
                                        } 
                                        sx={{ width: "95%" }} 
                                    />
                                </Tooltip>
                                <TextField
                                    sx={{ width: "100%", bgcolor: 'background.paper' }}
                                    id="destination"
                                    placeholder={
                                        dnsActive ?
                                        "Enter XCP Domain..." :
                                        "Enter address..."
                                    }
                                    size="small"
                                    value={destination}
                                    onInput={(e) => {
                                        // setDestination(e.target.value)
                                        handleDestInput(e.target.value)
                                    }}
                                    error={sendErrors.destination}
                                    color={(dnsAddr.pubkey != "" && !sendErrors.destination) ? "success" : ""}
                                    helperText={sendErrors.destinationMsg}
                                    InputProps={{
                                        endAdornment: <DnsIconBtc dnsActive={dnsActive} setDnsActive={setDnsActive}  />
                                    }}
                                />
                            </ListItem>

                            <ListItem // Asset selector
                                sx={{ display: "flex", flexDirection: "column" }}>
                                <Tooltip title="Asset to be sent">
                                    <ListItemText secondary="Asset" sx={{ width: "95%" }} />
                                </Tooltip>
                                <TextField
                                    sx={{ width: "100%", bgcolor: 'background.paper', maxWidth: 300 }}
                                    id="asset"
                                    placeholder="Asset..."
                                    size="small"
                                    select
                                    value={asset.asset}
                                    onChange={handleChange}
                                >
                                    {
                                        balance.map((asset, i) => (
                                            <MenuItem key={i} value={asset.asset}>
                                                {
                                                    asset.asset_longname != null ?
                                                    asset.asset_longname :
                                                    asset.asset
                                                }
                                            </MenuItem>
                                        ))
                                    }
                                </TextField>
                            </ListItem>

                            <ListItem // Amount available
                                sx={{ display: "flex", flexDirection: "column" }}>
                                <Tooltip title="Quantity of asset available">
                                    <ListItemText secondary="Available" sx={{ width: "95%" }} />
                                </Tooltip>
                                <TextField
                                    sx={{ width: "100%", bgcolor: 'background.paper' }}
                                    id="available"
                                    placeholder={
                                        asset.divisible ?
                                        (asset.available / 100000000).toString() :
                                        (asset.available).toString()
                                    }
                                    size="small"
                                    disabled
                                />
                            </ListItem>

                            <ListItem // Quantity to send
                                sx={{ display: "flex", flexDirection: "column" }}>
                                <Tooltip title="Quantity of asset to send">
                                    <ListItemText secondary={
                                        asset.asset == "BTC" ? `Quantity  ~$${((qty * props.btcPairs.btcUSD).toFixed(2)).toString()}` : "Quantity"
                                        } sx={{ width: "95%" }} />
                                </Tooltip>
                                <TextField
                                    sx={{ width: "100%", bgcolor: 'background.paper' }}
                                    id="quantity"
                                    type="text"
                                    value={qty}
                                    placeholder="Quantity to send..."
                                    size="small"
                                    // inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                    disabled={asset.asset == "" ? true : false}
                                    onChange={(e) => {setQty(e.target.value)}}
                                    error={sendErrors.qty}
                                    helperText={sendErrors.qtyMsg}
                                    InputProps={{
                                        endAdornment:
                                            <InputAdornment position="end" sx={{zIndex: 500 }}>
                                                <Button
                                                        aria-label="Max qty"
                                                        onClick={setMaxQuant}
                                                        edge="end"
                                                        sx={{ p: 0 }}
                                                        disabled={asset.asset == "" ? true : false}
                                                >
                                                    max
                                                </Button>
                                            </InputAdornment>
                                    }}
                                />
                            </ListItem>

                            <ListItem // Memo
                                sx={{ display: "flex", flexDirection: "column", pb: 2 }}>
                                <Tooltip title="Optional Memo">
                                    <ListItemText secondary="Memo" sx={{ width: "95%" }} />
                                </Tooltip>
                                <TextField
                                    sx={{ width: "100%", bgcolor: 'background.paper' }}
                                    id="memo"
                                    placeholder="Optional memo..."
                                    size="small"
                                    disabled={asset.asset == "" || asset.asset == "BTC" ? true : false}
                                    value={memo}
                                    onChange={(e) => {setMemo(e.target.value)}}
                                    error={sendErrors.memo}
                                    helperText={sendErrors.memoMsg}
                                />
                            </ListItem>

                            <ListItem // Fee
                                sx={{ display: "flex", flexDirection: "column"}}>
                                <Tooltip title="Bitcoin transaction fee">
                                    <ListItemText secondary={
                                        props.btcPairs ?
                                        `Fee ~$${((fee * props.btcPairs.btcUSD).toFixed(2)).toString()} ` : "Fee"
                                        } sx={{ width: "95%" }} />
                                </Tooltip>
                                <TextField
                                    sx={{ width: "100%", bgcolor: 'background.paper' }}
                                    id="fee"
                                    value={fee}
                                    placeholder="Enter miner's fee..."
                                    size="small"
                                    onInput={(e) => {setFee(e.target.value)}}
                                    error={sendErrors.fee}
                                    helperText={sendErrors.feeMsg}
                                />
                            </ListItem>

                            <ListItem // Fee selectors
                                sx={{ display: "flex", flexDirection: "column", pb: 2 }}
                            >
                                <ButtonGroup 
                                    variant="outlined" aria-label="Fee speeds"
                                >
                                    <Button
                                        sx={{ width: "100%" }}
                                        onClick={() => {setFee(parseInt((props.recFee.high) * avgByteSize) / 100000000)}}
                                    >Fast</Button>
                                    <Button
                                        sx={{ width: "100%" }}
                                        onClick={() => {setFee(parseInt((props.recFee.medium) * avgByteSize) / 100000000)}}
                                    >Normal</Button>
                                    <Button
                                        sx={{ width: "100%" }}
                                        onClick={() => {setFee(parseInt((props.recFee.low) * avgByteSize) / 100000000)}}
                                    >Economy</Button>
                                </ButtonGroup>
                            </ListItem>

                            <Divider />

                            <ListItem // Generate butn
                                sx={{ display: "flex", flexDirection: "column", pt: 2 }}>
                                <Button 
                                    variant="contained" sx={{ width: "100%" }}
                                    disabled={!sendCheck}
                                    // onClick={() => {props.toggleShowBroadcastTx(true)}}
                                    onClick={() => {submitSend()}}
                                >Generate</Button>
                            </ListItem>


                                {/* <ListItem // Send butn
                                    sx={{ display: "flex", flexDirection: "column", pt: 2 }}>
                                    <Button 
                                        variant="contained" sx={{ width: "100%" }}
                                        // disabled={!sendCheck}
                                        disabled={true}
                                        onClick={submitSend}
                                    >Send</Button>
                                </ListItem> */}

                        </List>
                        
                    </CardContent>
                </Card>
            </Box>
        </Slide>
    )
}

function DnsIconBtc(props) {

    return (
        <IconButton onClick={() => {
            props.setDnsActive(!props.dnsActive)
        }}>
            {
                props.dnsActive ?
                <LinkIcon /> :
                <LinkOffIcon />
            }
        </IconButton>
    )
}