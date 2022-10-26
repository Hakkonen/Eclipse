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
import Select from '@mui/material/Select'
import Tooltip from '@mui/material/Tooltip'

import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// Funcs
import createDispense from "../../functions/api/createDispense"
import createCloseDispenser from "../../functions/api/createCloseDispenser"

import signRawHex from "../../functions/api/signRawHex"

// JSX
import ResultPopup from "./ResultPopup.jsx"
import ErrorPopup from "./ErrorPopup.jsx"
import LoadingPopup from "./LoadingPopup.jsx"
import { parse } from "url"

export default function Dispense(props) {

    // Set token type
    const [ source, setSource ] = useState("")              // source : str (loc of disp)
    const [ assetName, setAssetName ] = useState("")        // asset str
    const [ giveQty, setGiveQty ] = useState("")             // give_quantity int
    const [ escrowQty, setEscrowQty ] = useState(null)         // give_quantity int
    const [ rate, setRate ] = useState(null)                   // mainchainrate int
    const [ status, setStatus ] = useState(0)               // status int

    const [ asset, setAsset ] = useState({})
    const [ assetBal, setAssetBal ] = useState([])
    useEffect(() => {
        if(props.wallet.loaded) {
            setAssetBal(props.wallet.addressBook[props.wallet.addrIndex].balance)
        }
    }, [props.showDispense])

    // Set default source as wallet addr
    useEffect(() => {
        if(props.wallet.loaded) {
            console.log("setting source!")
            setSource(props.wallet.addressBook[props.wallet.addrIndex].pubKey)
        }
    }, [props.showDispense])

    // Fee and balance
    const [ fee, setFee ] = useState(0)                     
    const [ balance, setBalance ] = useState(0)             

    // Checks
    const [ error, setError ] = useState({field: "", message: ""})
    const [ disableTx, toggleDisableTx ] = useState(true)

    // Fees
    // Get miner fee on load
    // const [ recFee, setRecFee ] = useState({high: 4000, medium: 2000, low: 1000})
    const avgByteSize = 250 // avg vbyte size for issuance
    useEffect(() => {
        axios.get("https://blockstream.info/api/fee-estimates")
            .then(res => {
                console.log(Math.ceil(res.data[1]))
                console.log(res.data[5])
                console.log(res.data[7])
                props.setRecFee({high: parseFloat(res.data[1]), medium: parseFloat(res.data[5]), low: parseFloat(res.data[7]), vLow: parseFloat(res.data[10])})
                setFee(parseInt(avgByteSize * parseFloat(res.data[5])) / 100000000)
            })
    }, [props.showIssuance])
    useEffect(() => {
        console.log(props)
        // Updates assets balance
        if(props.wallet.loaded == true) {
            setBalance(props.wallet.addressBook[props.wallet.addrIndex].btcBalance)
        }
    }, [props.showIssuance])

    // Check that fee is equal to or below balance
    useEffect(() => {
        if(balance) {
            console.log("FEE: " + parseInt(fee * 100000000) + " balance: " + balance)
            if(parseInt(fee * 100000000) >= balance) {
                setError({field: "fee", message: "Insufficient BTC for issuance"})
            }
        }
    }, [fee, balance])

    // Check all fields are filled
    useEffect(() => {
        // If status is to open
        if(status != 10) {
            if(source.length < 10) {
                toggleDisableTx(true)
            } else if(asset && Object.keys(asset).length > 0 && asset.asset.length < 1) {
                toggleDisableTx(true)
            } else if (giveQty <= 0) {
                toggleDisableTx(true)
            } else if(escrowQty <= 0) {
                toggleDisableTx(true)
            } else if(rate <= 0) {
                toggleDisableTx(true)
            } else {
                toggleDisableTx(false)
            }
        } else {
            if(asset && Object.keys(asset).length > 0 && asset.asset.length < 1) {
                toggleDisableTx(true)
            } else {
                toggleDisableTx(false)
            }
        }


    }, [asset, assetName, giveQty, escrowQty, rate]) 

    // handle name formatting
    function handleNameInput(stdin) {
        if(stdin.includes(".")) {
            console.log(stdin.includes("."))
            // Split into prefix and suffix
            let prefix = stdin.split(".")[0]
            let suffix = stdin.split(".")[1]
            setAssetName((prefix.toUpperCase() + "." + suffix))
        } else {
            setAssetName((stdin).toUpperCase())
        }
    }

    // Create tx
    async function createDispenseTx() {

        props.setPopupComp(<LoadingPopup />)
        props.toggleShowPopup(true)

        // If source is different to owner addr, set status to 1
        let disp_status = status
        if(status != 10) {
            if(source != props.wallet.addressBook[props.wallet.addrIndex].pubKey) {
                disp_status = 1
            } else {
                disp_status = 0
            }
        } 

        // if open dispenser
        if(status != 10) {
            // create div vars
            const give_qty = asset.divisible ? parseInt( giveQty * 100000000) : giveQty
            const escrow_qty = asset.divisible ? parseInt(escrowQty * 100000000) : escrowQty

            const dataChunk = await createDispense(
                props.wallet.addressBook[props.wallet.addrIndex].pubKey, 
                asset.asset, 
                give_qty, 
                escrow_qty, 
                parseInt(rate * 100000000), 
                source, 
                disp_status, 
                parseInt(fee * 100000000), 
                "mainnet").then(
                res => {return res}
            )

            if(!dataChunk.success) {
                props.setPopupComp(<ErrorPopup toggleShowPopup={props.toggleShowPopup} error={dataChunk.message} />)
                props.toggleShowPopup(true)
                throw "API Error"
            }

            // sign btc tx
            const signedHex = await signRawHex(props.wallet.addressBook[props.wallet.addrIndex].privKey, dataChunk.data).then(res => {return res})
            console.log(signedHex)

            if(signedHex.success) {
                // Open tx broadcast page
                const broadcastObj = {
                    mode: "Lock",
                    asset: assetName,
                    fee: fee,
                    hex: signedHex.data
                }
                props.setBroadcastHex(broadcastObj)
                props.toggleShowBroadcastTx(true)
                props.toggleShowPopup(false)
            } else {
                props.setPopupComp(<ErrorPopup toggleShowPopup={props.toggleShowPopup} error={signedHex.message} />)
                props.toggleShowPopup(true)
            }
        } else {
            // Else to close a dispenser
            const dataChunk = await createCloseDispenser(
                props.wallet.addressBook[props.wallet.addrIndex].pubKey, 
                asset.asset, 
                parseInt(fee * 100000000), 
                "mainnet").then(
                res => {return res}
            )

            if(!dataChunk.success) {
                props.setPopupComp(<ErrorPopup toggleShowPopup={props.toggleShowPopup} error={dataChunk.message} />)
                props.toggleShowPopup(true)
                throw "API Error"
            }

            // sign btc tx
            const signedHex = await signRawHex(props.wallet.addressBook[props.wallet.addrIndex].privKey, dataChunk.data).then(res => {return res})
            console.log(signedHex)

            if(signedHex.success) {
                // Open tx broadcast page
                const broadcastObj = {
                    mode: "Close",
                    asset: assetName,
                    fee: fee,
                    hex: signedHex.data
                }
                props.setBroadcastHex(broadcastObj)
                props.toggleShowBroadcastTx(true)
                props.toggleShowPopup(false)
            } else {
                props.setPopupComp(<ErrorPopup toggleShowPopup={props.toggleShowPopup} error={signedHex.message} />)
                props.toggleShowPopup(true)
            }
        }




    }

    // async function handleCloseDispenser() {

    //     props.setPopupComp(<LoadingPopup />)
    //     props.toggleShowPopup(true)

    //     createCloseDispenser()
    // }

    function handleAssetSelect(event) {
        // Takes in name, finds name in balance and gets data
        // Input asset
        const selection = event.target.value
        let balanceEntry = {}
        console.log("Selection: " + selection)

        // If status is to open
        if(status != 10) {
            // Find entry
            for(const asset of assetBal) {
                if (asset.asset == selection) {
                    balanceEntry = asset
                    break
                }
            }
            console.log(balanceEntry)

            // Filter out multiple methods of declaring divis
            let divisible = false
            if (balanceEntry.divisible == 1 || balanceEntry.divisible == true) {
                divisible = true
            } else if (balanceEntry.divisible == 0 || balanceEntry.divisible == false) {
                divisible = false
            }

            setAsset({
                asset: balanceEntry.asset,
                asset_longname: balanceEntry.asset_longname,
                divisible: divisible
            })
        } else {
            setAsset({
                asset: selection,
                asset_longname: "",
                divisible: false
            })
        }



    }
    useEffect(() => {
        console.log(asset)
    }, [asset])

    // Reset data
    function resetData() {
        setSource("")
        setAssetName("")
        setGiveQty()
        setEscrowQty()
        setRate()
        setStatus(0)
        setAsset({})
        setAssetBal([])
    }

    return (
        <Slide direction="right" in={props.showDispense} mountOnEnter unmountOnExit>
            <Box sx={{
                width: "100%", height: "100%", maxWidth: 350, position: "absolute", zIndex: 25,
                top: 0, left: 0, right: 0, bottom: 0, p: 2, overflow: "scroll", backdropFilter: "blur(4px)"
            }}>
                <Card sx={{ width: "100%" }}>
                    <Grid container xs sx={{ backgroundColor: "secondary.main" }}>

                        <Grid item xs={2} sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>

                            <IconButton aria-label="back" onClick={() => {
                                props.toggleShowDispense(false);
                                resetData();
                            }}>
                                <ArrowBackIcon sx={{ color: "primary.contrastText"  }} />
                            </IconButton>

                        </Grid>

                        <Grid item xs={8} sx={{ width: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Typography variant="h5" sx={{ pt: 2, pb: 2, color: "primary.contrastText"}}>
                                Dispense
                            </Typography>
                        </Grid>

                        <Grid item xs={2}></Grid>

                    </Grid>

                    <Grid xs container>

                            <Grid item xs={12} sx={{ p: 2 }}>
                                <ButtonGroup variant="contained" aria-label="outlined primary button group" sx={{ width: "100%" }}>
                                    <Button 
                                        onClick={() => {setStatus(0)}}
                                        variant={status == 0 ? "contained" : "outlined"}
                                        sx={{ width: "100%" }}
                                    >Open</Button>
                                    <Button 
                                        onClick={() => {
                                            setSource(props.wallet.addressBook[props.wallet.addrIndex].pubKey)
                                            setStatus(10)
                                        }}
                                        variant={status == 10 ? "contained" : "outlined"}
                                        sx={{ width: "100%" }}
                                        disabled={
                                            props.dispList && props.dispList.length < 1 ? true : false
                                        }
                                    >Close</Button>
                                </ButtonGroup>
                            </Grid>

                            <Grid item xs={12} sx={{ p: 2 }}>
                                
                                <Box sx={{ display: "flex", flexDirection: "row", flexWrap: "nowrap", alignItems: "center" }}>
                                    <InputLabel 
                                        id="dispenser-source"
                                        sx={{ pr: 1 }}
                                    >Target Address</InputLabel>
                                    <Tooltip title="The address you would like to open the dispenser at">
                                        <HelpOutlineIcon sx={{ width: 16, height: 16, color: "rgb(155,155,155)" }} />
                                    </Tooltip>
                                </Box>

                                <TextField
                                    id="dispenser-source"
                                    value={source}
                                    onInput={(e) => setSource(e.target.value)}
                                    // endAdornment={
                                    //     <InputAdornment></InputAdornment>
                                    // }
                                    sx={{ width: "100%" }}
                                    // disabled={assetType == "numeric"}
                                    // error={error.field == "name"}
                                    // helperText={error.field == "name" ? error.message : ""}
                                    disabled={status == 10}
                                />

                            </Grid>

                            {
                                // if status is to close then show active disp on addy
                                status != 10 ?
                                <Grid item xs={12} sx={{ p: 2 }}>
                                    <Tooltip title="Asset to be dispensed">
                                        <InputLabel id="dispenser-asset">Asset</InputLabel>
                                    </Tooltip>
                                    <TextField
                                        id="dispenser-asset"
                                        value={asset.asset}
                                        // onInput={(e) => {handleNameInput(e.target.value)}}
                                        onChange={handleAssetSelect}
                                        sx={{ width: "100%" }}
                                        placeholder="Asset..."
                                        select
                                        // disabled={assetType == "numeric"}
                                        // error={error.field == "name"}
                                        // helperText={error.field == "name" ? error.message : ""}
                                    >
                                        {
                                            assetBal.map((asset, i) => (
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

                                </Grid>
                                :
                                <Grid item xs={12} sx={{ p: 2 }}>
                                    <Tooltip title="Dispenser to be closed">
                                        <InputLabel id="dispenser-asset">Asset</InputLabel>
                                    </Tooltip>
                                    <TextField
                                        id="dispenser-asset"
                                        value={asset.asset}
                                        onChange={handleAssetSelect}
                                        sx={{ width: "100%" }}
                                        placeholder="Asset..."
                                        select
                                    >
                                        {
                                            props.dispList && props.dispList.length > 0 ?
                                            props.dispList.map((disp, i) => (
                                                <MenuItem key={i} value={disp.asset}>
                                                    {
                                                        disp.asset
                                                    }
                                                </MenuItem>
                                            ))
                                            : null
                                        }
                                    </TextField>

                                </Grid>
                            }
                                



                            <Grid item xs={12} sx={{ p: 2 }}>
                                <Tooltip title="Quantity of asset to be given at each sale event">
                                    <InputLabel id="dispenser-give-qty">Give Quantity</InputLabel>
                                </Tooltip>
                                <TextField
                                    id="dispenser-give-qty"
                                    value={giveQty}
                                    placeholder={0}
                                    onInput={(e) => {setGiveQty(e.target.value)}}
                                    sx={{ width: "100%" }}
                                    disabled={status == 10}
                                />

                            </Grid>

                            <Grid item xs={12} sx={{ p: 2 }}>
                                <Tooltip title="Total quantity of asset to be dispensed">
                                    <InputLabel id="dispenser-escrow-qty">Escrow Quantity</InputLabel>
                                </Tooltip>
                                <TextField
                                    id="dispenser-escrow-qty"
                                    value={escrowQty}
                                    placeholder={0}
                                    onInput={(e) => {setEscrowQty(e.target.value)}}
                                    sx={{ width: "100%" }}
                                    disabled={status == 10}
                                />

                            </Grid>

                            <Grid item xs={12} sx={{ p: 2 }}>
                                <Tooltip title="Price of each sale event in BTC">
                                    <InputLabel id="dispenser-rate">
                                        {"BTC Cost " + (rate > 0 ? "~$" + (rate * props.btcPairs.btcUSD).toFixed(2) : "")}
                                    </InputLabel>
                                </Tooltip>
                                <TextField
                                    id="dispenser-rate"
                                    value={rate}
                                    placeholder={0}
                                    onInput={(e) => {setRate(e.target.value)}}
                                    sx={{ width: "100%" }}
                                    disabled={status == 10}
                                />

                            </Grid>

                            <Grid item xs={12} sx={{ p: 2 }}>
                                <Tooltip title="Bitcoin transaction fee">
                                    <InputLabel id="fee">
                                        {
                                            props.btcPairs ?
                                            `Fee ~$${((fee * props.btcPairs.btcUSD).toFixed(2)).toString()} ` : "Fee"
                                        }
                                    </InputLabel>
                                </Tooltip>
                                <TextField
                                    value={fee}
                                    onInput={(e) => {setFee((e.target.value))}}
                                    sx={{ width: "100%" }}
                                    error={error.field == "fee"}
                                    helperText={error.message}
                                />

                                <ButtonGroup 
                                    variant="outlined" aria-label="fee-speeds" sx={{ width: "100%", pt: 1 }}
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

                            </Grid>

                            <Grid item xs={12} sx={{ p: 2 }}>

                                <Button 
                                    variant="contained"
                                    onClick={() => {createDispenseTx()}}
                                    disabled={disableTx}
                                >
                                    Generate
                                </Button>

                            </Grid>

                    </Grid>
                </Card>
            </Box>
        </Slide>
    )

}