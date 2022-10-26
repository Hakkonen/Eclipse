// Runs user send function

import React from "react"
import { useEffect, useState } from "react"

import axios from "axios"

// MUI
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Slide from '@mui/material/Slide'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import { Divider, Typography } from "@mui/material"
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import InputLabel from '@mui/material/InputLabel'
import Card from '@mui/material/Card'

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

// Funcs
import assetToID from "../../functions/xcp/assetToID"
import createRandomID from "../../functions/xcp/createRandID"
import getAssetInfo from "../../functions/api/getAssetInfo"
import getAssetById from "../../functions/api/getAssets"
import getSendInfo from "../../functions/send/getSendInfo"
import base58Check from "../../functions/address/base58Check"

import btcSend from "../../functions/send/btcSend"
import createDataChunk from "../../functions/xcp/createDataChunk"
import opReturnTx from "../../functions/send/opReturnTx"
import createIssuance from "../../functions/api/createIssuance"
import createAddIssuance from "../../functions/api/createAddSupply"
import createDestroy from "../../functions/api/createDestroy"

import signRawHex from "../../functions/api/signRawHex"

// JSX
import ResultPopup from "./ResultPopup.jsx"
import ErrorPopup from "./ErrorPopup.jsx"
import LoadingPopup from "./LoadingPopup.jsx"

export default function AddSupply(props) {

    const [ assetName, setAssetName ] = useState("")        
    const [ assetQty, setAssetQty ] = useState(0)
    const [ assetDetails, setAssetDetails ] = useState({})
    const [ assetConfirmed, setAssetConfirmed ] = useState(false)            

    // Fee and balance
    const [ fee, setFee ] = useState(0)                     
    const [ balance, setBalance ] = useState(0)            

    // Checks
    const [ error, setError ] = useState({field: "", message: ""})
    const [ disabledMint, toggleDisableMint ] = useState(true)

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

    useEffect(() => {
        // Check balance for asset
        if(props.wallet.loaded) {

            let found = false
            for(const asset of props.wallet.addressBook[props.wallet.addrIndex].balance) {
                if(asset.asset == assetName || asset.asset_longname == assetName) {
                    if(asset.issuer == props.wallet.addressBook[props.wallet.addrIndex].pubKey) {
                        found = true
                        console.log("FOUND: " + asset.asset)
                        setAssetDetails(asset)
                        break
                    }
                }
            }
            if(found) {
                setAssetConfirmed(true)
            } else {
                setAssetConfirmed(false)
            }
        }
    }, [assetName])

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
    }, [props.showAddSupply])
    useEffect(() => {
        console.log(props)
        // Updates assets balance
        if(props.wallet.loaded == true) {
            setBalance(props.wallet.addressBook[props.wallet.addrIndex].btcBalance)
        }

    }, [props.showAddSupply])

    // Check that fee is equal to or below balance
    useEffect(() => {
        if(balance) {
            console.log("FEE: " + parseInt(fee * 100000000) + " balance: " + balance)
            if(parseInt(fee * 100000000) >= balance) {
                setError({field: "fee", message: "Insufficient BTC for issuance"})
            }
        }
    }, [fee, balance])

    // Creates lock hex
    async function createSupplyHex() {

        props.setPopupComp(<LoadingPopup />)
        props.toggleShowPopup(true)

        const dataChunk = await createIssuance(props.wallet.addressBook[props.wallet.addrIndex].pubKey, assetName, assetQty, false, assetDetails.description, (fee * 100000000)).then(
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
                mode: "Destroy",
                asset: assetName,
                fee: fee,
                hex: signedHex.data
            }
            props.toggleShowPopup(false)
            props.setBroadcastHex(broadcastObj)
            props.toggleShowBroadcastTx(true)
        } else {
            props.setPopupComp(<ErrorPopup toggleShowPopup={props.toggleShowPopup} error={signedHex.message} />)
            props.toggleShowPopup(true)
        }

    }

    // Reset data
    function resetData() {
        setAssetName("")  
        setAssetDetails({})
        setError({field: "", message: ""})
    }

    return (
        <Slide direction="right" in={props.showAddSupply} mountOnEnter unmountOnExit>
            <Box sx={{
                width: "100%", height: "100%", maxWidth: 350, position: "absolute", zIndex: 25,
                top: 0, left: 0, right: 0, bottom: 0, p: 2, overflow: "scroll", backdropFilter: "blur(4px)"
            }}>
                <Card sx={{ width: "100%" }}>
                    <Grid container xs sx={{ backgroundColor: "secondary.main" }}>

                        <Grid item xs={2} sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>

                            <IconButton aria-label="back" onClick={() => {
                                props.toggleShowAddSupply(false);
                                resetData();
                            }}>
                                <ArrowBackIcon sx={{ color: "primary.contrastText"  }} />
                            </IconButton>

                        </Grid>

                        <Grid item xs={8} sx={{ width: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Typography variant="h5" sx={{ pt: 2, pb: 2, color: "primary.contrastText"}}>
                                Add Supply
                            </Typography>
                        </Grid>

                        <Grid item xs={2}></Grid>

                    </Grid>

                    <Grid xs container>

                            <Grid item xs={12} sx={{ p: 2 }}>
                                <Tooltip title="Asset to issue supply of">
                                    <InputLabel id="asset-name">Asset Name</InputLabel>
                                </Tooltip>
                                <TextField
                                    id="asset-name"
                                    value={assetName}
                                    onInput={(e) => {handleNameInput(e.target.value)}}
                                    sx={{ width: "100%" }}
                                    error={error.field == "name"}
                                    helperText={error.field == "name" ? error.message : ""}
                                />

                            </Grid>

                            <Grid item xs={12} sx={{ p: 2 }}>
                                <Tooltip title="Quantity of supply to issue">
                                    <InputLabel id="asset-qty">Amount</InputLabel>
                                </Tooltip>
                                <TextField
                                    id="asset-name"
                                    value={assetQty}
                                    onInput={(e) => {setAssetQty(e.target.value)}}
                                    sx={{ width: "100%" }}
                                    error={error.field == "name"}
                                    helperText={error.field == "name" ? error.message : ""}
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
                                    onClick={() => {createSupplyHex()}}
                                    disabled={!assetConfirmed}
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