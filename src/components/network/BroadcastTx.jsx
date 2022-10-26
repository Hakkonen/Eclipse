// Broadcasts hex to btc network

import React from "react"
import { useEffect, useState } from "react"

import axios from "axios"

// MUI
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Grow from '@mui/material/Grow'
import Slide from '@mui/material/Slide'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import { Divider, Typography } from "@mui/material"
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Collapse from '@mui/material/Collapse'
import { styled } from '@mui/material/styles'

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

// Icons
import Icon from '@mui/material/Icon'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'

// Funcs
import postTx from "../../functions/send/postTx.js"

// JSX
import ResultPopup from "./ResultPopup.jsx"
import ErrorPopup from "./ErrorPopup.jsx"
import LoadingPopup from "./LoadingPopup.jsx"

// TODO:
// BTC SEND FIX

export default function BroadcastTx(props) {

    // Broadcast hex to network
    async function broadcastHexToNetwork(network="mainnet") {
        // SHow loading
        props.setPopupComp(<LoadingPopup />)
        props.toggleShowPopup(true)

        // Broadcast to network
        await postTx(props.broadcastHex.hex, network).then(
            res => {
                console.log(res)
                // If tx success
                if (res.success) {
                    // Show success popup
                    props.setPopupComp(<ResultPopup toggleShowPopup={props.toggleShowPopup} tx={res.tx} />)
                    props.toggleShowPopup(true)
                    // Reset hex obj data
                    props.setBroadcastHex({
                        mode: "",
                        asset: "",
                        address: "",
                        destination: "",
                        fee: 0,
                        hex: null
                    })

                    // Refresh address
                    props.refreshAddress(undefined, undefined, false, true)
                // If tx failed pass error
                } else {
                    props.setPopupComp(<ErrorPopup toggleShowPopup={props.toggleShowPopup} error={res.error} />)
                    props.toggleShowPopup(true)
                }
            }
        )
    }

    // hex expander
    const [ expanded, setExpanded ] = useState(false)
    const handleExpandClick = () => {
        setExpanded(!expanded);
    }

    // Fee guide
    const [ satPerByte, setSatPerByte ] = useState(0)
    const [ feeGuide, setFeeGuide ] = useState({
        speed: "",
        colour: "primary"
    })
    useEffect(() => {
        console.log(props.broadcastHex)
        if(props.broadcastHex.hex != null) {
            const byteSize = props.broadcastHex.hex.length / 2
            // TODO: Fix send fee multiplcation issue
            const satsB = parseInt((props.broadcastHex.fee * 100000000) / byteSize)
            console.log("DILEMMA: " + props.broadcastHex.fee + " * " + 100000000 + ") / " + byteSize + " = " + satsB)
            
            console.log(parseInt(props.broadcastHex.fee / (props.broadcastHex.hex.length / 2)))
            console.log("High: " + (props.recFee.high))
            console.log("Med: " + (props.recFee.medium))
            console.log("Low: " + (props.recFee.low))

            setSatPerByte(satsB)
            if (satsB >= parseInt(props.recFee.high)) {
                setFeeGuide({
                    speed: "Fast: 1-2 blocks",
                    colour: "success.dark"
                })
            } else if (satsB >= parseInt(props.recFee.medium)) {
                setFeeGuide({
                    speed: "Normal: 3-6 blocks",
                    colour: "primary.dark"
                })
            } else if (satsB >= (props.recFee.low)) {
                setFeeGuide({
                    speed: "Slow: 7+ blocks",
                    colour: "warning.dark"
                })
            } else if (satsB >= (props.recFee.vLow)) {
                setFeeGuide({
                    speed: "Very Slow: 10+ blocks",
                    colour: "warning.dark"
                })
            } else if (satsB > 3) {
                setFeeGuide({
                    speed: "Very Slow: 13+ blocks",
                    colour: "warning.dark"
                })
            } else {
                setFeeGuide({
                    speed: "Warning: tx may be rejected",
                    colour: "error.dark"
                })
            }
        }
    }, [props.broadcastHex])

    // Reject tx
    function rejectTx() {
        // reset broadcast obj
        props.setBroadcastHex({
            mode: "",
            asset: "",
            address: "",
            destination: "",
            fee: 0,
            hex: null
        })
        // close page
    }

    return (
        <Fade in={props.broadcastHex.hex != null}  mountOnEnter unmountOnExit>
            <Box sx={{
                width: "100%", height: "100%", maxWidth: 350, position: "absolute", zIndex: 75,
                top: 0, left: 0, right: 0, bottom: 0, p: 2, overflow: "scroll", backdropFilter: "blur(4px)"
            }}>
                <Card sx={{
                    width: "100%", height: "100%", overflow: "scroll", p: 2
                }}>
            
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <Typography variant="h6" sx={{ width: "100%", pb: 1, pl: 1 }}>
                        Review Transaction
                    </Typography>
                </Box>

                <List sx={{ width: '100%', height: "auto", overflow: "scroll", bgcolor: 'background.paper', borderRadius: "3px" }}>
                    <ListItem sx={{ pl: 2, pt: 0, pb: 0 }}>
                        <ListItemText 
                            primary="Mode" secondary={props.broadcastHex.mode}
                        />
                    </ListItem>
                    <ListItem sx={{ pl: 2, pt: 0, pb: 0 }}>
                        <ListItemText 
                            primary="Asset" secondary={props.broadcastHex.asset}
                        />
                    </ListItem>

                    {
                        props.broadcastHex.address != null ?
                        <ListItem sx={{ pl: 2, pt: 0, pb: 0 }}>
                            <ListItemText 
                                primary="From" secondary={
                                    props.broadcastHex.address != "" ?
                                    (props.broadcastHex.address).slice(0,6) + "..." + (props.broadcastHex.address).slice(-4)
                                    : ""
                                }
                            />
                        </ListItem>
                        : null
                    }

                    {
                        props.broadcastHex.destination != null ?
                        <ListItem sx={{ pl: 2, pt: 0, pb: 0 }}>
                            <ListItemText 
                                primary="To" secondary={
                                    props.broadcastHex.destination != "" ?
                                    (props.broadcastHex.destination).slice(0,6) + "..." + (props.broadcastHex.destination).slice(-4)
                                    : ""
                                }
                            />
                        </ListItem>
                        : null
                    }

                    <ListItem sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", bgcolor: feeGuide.colour }}>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: "primary.contrastText" }}>
                            Fee
                        </Typography>
                        <Typography sx={{ color: "primary.contrastText" }}>
                            {feeGuide.speed}
                        </Typography>
                        <Typography sx={{ color: "primary.contrastText" }}>
                            { 
                                props.broadcastHex.hex != null ?
                                satPerByte + " sats per byte"
                                : null
                            }
                        </Typography>
                    </ListItem>
                    <ListItemButton onClick={handleExpandClick}>
                        <ListItemText 
                            primary="Hex Data" secondary={
                                props.broadcastHex.hex != null ?
                                (props.broadcastHex.hex.length / 2) + " bytes"
                                : null
                            }
                        />
                        {expanded ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse sx={{ width: "100%", height: "auto", overflow: "scroll", p: 1 }} in={expanded} timeout="auto" unmountOnExit>
                        <Card sx={{ p: 2 }}>
                            <Typography sx={{ minWidth: "100%", maxWidth: "40ch", overflowWrap: "break-word", fontSize: "0.7rem", pb: 2 }} color="text.secondary">
                                {   
                                    props.broadcastHex.hex != null ?
                                    props.broadcastHex.hex.toString()
                                    : ""
                                }
                            </Typography>
                        </Card>
                    </Collapse>
                </List>
                
                <Box // Send butn
                    sx={{ display: "flex", flexDirection: "column", pt: 2 }}>
                    <Button 
                        variant="contained" sx={{ width: "100%", mb: 1 }}
                        onClick={() => {broadcastHexToNetwork()}}
                    >Send</Button>

                    <Button 
                        variant="outlined" sx={{ width: "100%" }}
                        disabled={false}
                        onClick={() => {rejectTx()}}
                    >Reject</Button>
                </Box>

                </Card>
            </Box>
        </Fade>
    )
}