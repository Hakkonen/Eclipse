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

import signRawHex from "../../functions/api/signRawHex"

// JSX
import ResultPopup from "./ResultPopup.jsx"
import ErrorPopup from "./ErrorPopup.jsx"
import LoadingPopup from "./LoadingPopup.jsx"
import { parse } from "url"

export default function Issue(props) {

    // Set token type
    const [ assetType, setAssetType ] = useState("numeric")
    const [ assetName, setAssetName ] = useState("")        // String.length > 2 && < 14
    const [ assetId, setAssetId ] = useState("")            // Str
    const [ assetQty, setAssetQty ] = useState(1)           // Int
    const [ assetMeta, setAssetMeta ] = useState("")        // Str.length < 42

    // Fee and balance
    const [ fee, setFee ] = useState(0)                     // div by 100 000 000
    const [ balance, setBalance ] = useState(0)            

    // Checks
    const [ error, setError ] = useState({field: "", message: ""})
    const [ disabledMint, toggleDisableMint ] = useState(true)

    // Asset type
    useEffect(() => {
        if(assetType == "numeric") {
            // Generate random A name
            const rndName = createRandomID()
            setAssetName(rndName)
        } else if(assetType == "named" || "subasset") {
            setAssetName("")
        }
    }, [assetType])

    // Mint button checks
    useEffect(() => {
        let check = false

        // Check name length
        if(assetType == "subasset") {
            // Allow up to 250 total chars for subassets
            if(assetName[0] != "A") {
                if(assetName.length < 3 || assetName.length > 100 ) {
                    check = true
                }
            }
        } else {
            // Named asset limit at 13 chars
            if(assetName[0] != "A") {
                if(assetName.length < 3 || assetName.length > 13 ) {
                    check = true
                }
            }
        }

        // Check qty
        if(parseInt(assetQty) < 1 || parseInt(assetQty) > 100000) {
            check = true
        }
        // Check meta length
        if(assetType == "subasset") {
            // Limit subasset desc to 100 chars
            if(assetMeta.length > 100) {
                check = true
            }
        } else {
            // Lengths over 46 chars will be sent as a multisig
            if(assetMeta.length > 100) {
                check = true
            }
        }

        toggleDisableMint(check)
    }, [assetName, assetQty, assetMeta])

    // Check asset is unique
    async function checkAssetAvail(name) {
        console.log(name)
        // Convert b26
        const assetID = assetToID(name)
        console.log(assetID)

        // Check db for existing asset
        let result
        await getAssetById([assetID]).then(
            res => {
                console.log(res)
                // If an asset is found set error to name taken
                if(res.length > 0) {
                    setError({field: "name", message: "Asset name unavailable"})
                    result = false
                } else {
                    result = true
                }
            }
        )

        return result
    }

    // Create "named" asset
    async function mintNft(name, qty, metaUrl) {
        // Reset any pre-existing error
        setError({field: "", message: ""})
        props.setPopupComp(<LoadingPopup />)
        props.toggleShowPopup(true)

        // If A name or Named asset
        if (assetType != "subasset") {
            // Check asset name is available
            const assetAvailable = await checkAssetAvail(name)
            console.log("Avail: " + assetAvailable)

            if(assetAvailable) {
                const issuanceData = {
                    mode: "Issuance",
                    assetName: name,
                    issanceQty: qty,
                    description: metaUrl
                }

                // If desc < 46 chars create enhanced issuance
                if(issuanceData.description.length <= 44) {
                    // Create XCP data chunk
                    const dataChunk = createDataChunk(issuanceData)
                    console.log(dataChunk)

                    // Create BTC tx
                    const btcSendFields = {
                        pubKey: props.wallet.addressBook[props.wallet.addrIndex].pubKey,
                        privKey: props.wallet.addressBook[props.wallet.addrIndex].privKey,
                        fee: fee,
                        dataChunk: dataChunk
                    }
                    const btcTx = await opReturnTx(btcSendFields)

                    if(btcTx.success) {
                        // Open tx broadcast page
                        const broadcastObj = {
                            mode: "Issuance",
                            asset: assetName,
                            fee: fee,
                            hex: btcTx.hex
                        }
                        props.setBroadcastHex(broadcastObj)
                        props.toggleShowBroadcastTx(true)
                        props.toggleShowPopup(false)
                    }
                } else if (issuanceData.description.length <= 100) {
                    // Create multisig from api call
                    // Call api for btc tx hex
                    const dataChunk = await createIssuance(props.wallet.addressBook[props.wallet.addrIndex].pubKey, issuanceData.assetName, issuanceData.issanceQty, false, issuanceData.description, (fee * 100000000)).then (res => {return res})

                    // Error check
                    if(!dataChunk.success) {
                        props.setPopupComp(<ErrorPopup toggleShowPopup={props.toggleShowPopup} error={dataChunk.message} />)
                        props.toggleShowPopup(true)
                        throw "API Error"
                    }

                    // sign btc tx
                    const signedHex = await signRawHex(props.wallet.addressBook[props.wallet.addrIndex].privKey, dataChunk.data).then(res => {return res})
                    console.log(signedHex)

                    // Broadcast if successful
                    if(signedHex.success) {
                        // Open tx broadcast page
                        const broadcastObj = {
                            mode: "Issuance",
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
                    throw "Description too long"
                }


            } else {
                throw "Asset name is unavailable"
            }
        } else if (assetType == "subasset") {
            // If asset is SUBASSET
            // Split name
            let prefix = name.split(".")[0]
            let suffix = name.split(".")[1]
            console.log(prefix, suffix)
            
            // Check asset is in your inventory
            let assetOwned = false
            for(let asset of props.wallet.addressBook[props.wallet.addrIndex].balance) {
                if (asset.asset == prefix) {
                    assetOwned = true
                }
            }
            if (assetOwned) {
                // Create XCP datachunk via counterparty create_issuance
                console.log("Creating")

                // Call api for btc tx hex
                const dataChunk = await createIssuance(props.wallet.addressBook[props.wallet.addrIndex].pubKey, name, qty, false, metaUrl, (fee * 100000000)).then (res => {return res})

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
                        mode: "Issuance",
                        asset: assetName,
                        fee: fee,
                        hex: signedHex.data
                    }
                    props.setBroadcastHex(broadcastObj)
                    props.toggleShowBroadcastTx(true)
                } else {
                    props.setPopupComp(<ErrorPopup toggleShowPopup={props.toggleShowPopup} error={signedHex.message} />)
                    props.toggleShowPopup(true)
                }
            }
        } else {
            throw "Where tf you get a fourth option?"
        }
        
    }

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

    // Reset data
    function resetData() {
        // Set token type
        setAssetType("numeric")
        setAssetName("")
        setAssetId("")
        setAssetQty(1)
        setAssetMeta("")      
        setError({field: "", message: ""})
        toggleDisableMint(true)
    }

    return (
        <Slide direction="right" in={props.showIssuance} mountOnEnter unmountOnExit>
            <Box sx={{
                width: "100%", height: "100%", maxWidth: 350, position: "absolute", zIndex: 25,
                top: 0, left: 0, right: 0, bottom: 0, p: 2, overflow: "scroll", backdropFilter: "blur(4px)"
            }}>
                <Card sx={{ width: "100%" }}>
                    <Grid container xs sx={{ backgroundColor: "secondary.main" }}>

                        <Grid item xs={2} sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>

                            <IconButton aria-label="back" onClick={() => {
                                props.toggleShowIssuance(false);
                                resetData();
                            }}>
                                <ArrowBackIcon sx={{ color: "primary.contrastText"  }} />
                            </IconButton>

                        </Grid>

                        <Grid item xs={8} sx={{ width: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Typography variant="h5" sx={{ pt: 2, pb: 2, color: "primary.contrastText"}}>
                                Create Asset
                            </Typography>
                        </Grid>

                        <Grid item xs={2}></Grid>

                    </Grid>

                    <Grid xs container>

                            <Grid item xs={12} sx={{ p: 2 }}>

                                <Tooltip title="Asset types: Numeric (no fee), Named (0.5xcp fee), Subasset (0.25xcp fee)">
                                    <InputLabel id="asset-type">Asset Type</InputLabel>
                                </Tooltip>
                                <Select
                                    id="asset-type"
                                    value={assetType}
                                    onChange={(e) => {setAssetType(e.target.value)}}
                                    sx={{ width: "100%" }}
                                >
                                    <MenuItem value={"numeric"}>Numeric</MenuItem>
                                    <MenuItem value={"named"}>Named</MenuItem>
                                    <MenuItem value={"subasset"}>Subasset</MenuItem>
                                </Select>

                            </Grid>

                            <Grid item xs={12} sx={{ p: 2 }}>
                                <Tooltip title="Name of the new asset">
                                    <InputLabel id="asset-name">Token Name</InputLabel>
                                </Tooltip>
                                <TextField
                                    id="asset-name"
                                    value={assetName}
                                    onInput={(e) => {handleNameInput(e.target.value)}}
                                    sx={{ width: "100%" }}
                                    disabled={assetType == "numeric"}
                                    error={error.field == "name"}
                                    helperText={error.field == "name" ? error.message : ""}
                                />

                            </Grid>

                            <Grid item xs={12} sx={{ p: 2 }}>
                                <Tooltip title="Quantity to issue on creation">
                                    <InputLabel id="asset-qty">Quantity</InputLabel>
                                </Tooltip>
                                <TextField
                                    id="asset-qty"
                                    value={assetQty}
                                    onInput={(e) => {setAssetQty(e.target.value)}}
                                    sx={{ width: "100%" }}
                                />

                            </Grid>

                            <Grid item xs={12} sx={{ p: 2 }}>
                                <Tooltip title="Metadata: link to a url that contains a metadata JSON">
                                    <InputLabel>Metadata URL</InputLabel>
                                </Tooltip>
                                <TextField
                                    id="asset-meta"
                                    value={assetMeta}
                                    onInput={(e) => {setAssetMeta((e.target.value).toString())}}
                                    sx={{ width: "100%" }}
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
                                    onClick={() => {mintNft(assetName, assetQty, assetMeta)}}
                                    disabled={disabledMint}
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