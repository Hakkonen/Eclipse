import * as React from "react"
import { useEffect, useState } from "react"

// MUI
import { Typography } from "@mui/material"
import { borderColor, Container } from "@mui/system"
import Box from '@mui/material/Box'

import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import Slide from '@mui/material/Slide'

import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CardMedia from '@mui/material/CardMedia'

import Skeleton from '@mui/material/Skeleton'
import Grid from '@mui/material/Grid'

import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SendIcon from '@mui/icons-material/Send'
import LockIcon from '@mui/icons-material/Lock'
import LaunchIcon from '@mui/icons-material/Launch'

// assets
import imgPlaceholder from "../../assets/counterparty-mono.png"

export default function InfoPopup(props) {
    

    if(typeof props.data.type == "undefined") {
        return (
            <AssetInfo data={props.data} infoPop={props.infoPop} toggleInfoPop={props.toggleInfoPop} />
        )
    } else {
        return (
            <TxInfo data={props.data} infoPop={props.infoPop} toggleInfoPop={props.toggleInfoPop} />
        )
    }
}

function TxInfo(props) {
    console.log(props)
    // // Properties
    // const [ properties, setProperties ] = useState({loading: "true"})

    // // Var loader
    // useEffect(() => {
    //     setDescription(props.data.description)
    //     let newProperties = {
            
    //     }
    //     // setProperties(newProperties)
    // }, [])
    // useEffect(() => {
    //     console.log(properties)
    // }, [properties])

    const [ txHash, setTxHash ] = useState("")
    useEffect(() => {
        props.data.event != null ?
        setTxHash(props.data.event) :
        setTxHash(props.data.tx_hash)
    }, [])
    
    return (
        <Slide direction="right" in={props.infoPop} mountOnEnter unmountOnExit>
        <Box
            sx={{
                width: "100%", height: "100%", minHeight: 500, minWidth: 300, maxWidth: 400, position: "absolute", zIndex: 25, top: 0, left: 0, right: 0, bottom: 0,backdropFilter: "blur(4px)", p: 2, overflow: "scroll"
            }}
        >
            <Card 
                sx={{ height: "100%", overflow: "scroll", borderRadius: "3px"  }}
            >
                <Grid // Header
                    container xs  sx={{ width: "100%", bgcolor: "secondary.main"}}
                >

                    <Grid 
                        item xs={2} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                        <IconButton aria-label="back" onClick={() => {props.toggleInfoPop(false)}}>
                            <ArrowBackIcon sx={{ color: "primary.contrastText"  }} />
                        </IconButton>
                    </Grid>

                    <Grid item xs={8} sx={{width: "100%"}}>
                        <Typography variant="h5" sx={{ width: "100%", maxWidth: 300, wordWrap: "break-word", pt: 2, pb: 2, color: "primary.contrastText" }} textAlign="center" className="noselect">
                            Transaction
                        </Typography>
                    </Grid>

                    <Grid item xs={2}></Grid>

                </Grid>

                <Grid // Tx info list
                    container xs={12}
                >
                    <Grid item xs={12} sx={{ pl: 2, pt: 2}}>
                        <Button 
                            variant="text" sx={{ color: "text.hint" }} 
                            endIcon={<LaunchIcon />}
                            onClick={() => {window.open(`https://xchain.io/tx/${txHash}`, '_blank').focus();}}
                        >
                            View on explorer
                        </Button>
                    </Grid>

                    <TableContainer >
                    <Table aria-label="Tx info">

                        <TableHead>
                            <TableRow>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>

                            {   
                                // Function
                                props.data.type != null ?
                                <TableRow>
                                    <TableCell align="left">
                                        <Typography sx={{fontWeight: 500}}>Function</Typography>
                                    </TableCell>
                                    <TableCell align="right">{props.data.action != null ? props.data.action : props.data.type}</TableCell>
                                </TableRow>
                                : null
                            }
                            
                                {/* // Tx hash */}
                                <TableRow>
                                    <TableCell align="left">
                                        <Typography sx={{fontWeight: 500}}>Tx Hash</Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={{ maxWidth: 300, wordBreak: "break-word" }}>
                                        {
                                            txHash
                                        }
                                    </TableCell>
                                </TableRow>


                            {   
                                // Tx index
                                props.data.tx_index != null ?
                                <TableRow>
                                    <TableCell align="left">
                                        <Typography sx={{fontWeight: 500}}>Tx Index</Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={{ maxWidth: 300, wordBreak: "break-word" }}>
                                        {props.data.tx_index}
                                    </TableCell>
                                </TableRow>
                                : null
                            }

                            {   
                                // block index
                                props.data.block_index != null ?
                                <TableRow>
                                    <TableCell align="left">
                                        <Typography sx={{fontWeight: 500}}>Block Index</Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={{ maxWidth: 300, wordBreak: "break-word" }}>
                                        {props.data.block_index}
                                    </TableCell>
                                </TableRow>
                                : null
                            }

                            {   
                                // Asset
                                props.data.asset != null ?
                                <TableRow>
                                    <TableCell align="left">
                                        <Typography sx={{fontWeight: 500}}>Asset</Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={{ maxWidth: 300, wordBreak: "break-word" }}>
                                        {props.data.asset}
                                    </TableCell>
                                </TableRow>
                                : null
                            }

                            {   
                                // Qty
                                props.data.quantity != null && props.data.divisible != null ?
                                <TableRow>
                                    <TableCell align="left">
                                        <Typography sx={{fontWeight: 500}}>Quantity</Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={{ maxWidth: 300, wordBreak: "break-word" }}>
                                        {
                                            props.data.divisible ?
                                            (props.data.quantity / 100000000) :
                                            props.data.quantity
                                        }
                                    </TableCell>
                                </TableRow>
                                : null
                            }

                        </TableBody>

                    </Table>
                    </TableContainer>
                </Grid>

            </Card>
            
        </Box>
        </Slide>
    )
}

function AssetInfo(props) {

    let name = ""
    typeof props.data.asset_longname != "undefined" && props.data.asset_longname != null ?
    name = props.data.asset_longname :
    name = props.data.asset

    // NFT image
    const [ preview, setPreview ] = useState(imgPlaceholder)

    // Descr
    const [ description, setDescription ] = useState("Loading...")

    // Properties
    const [ properties, setProperties ] = useState({loading: "true"})

    // Var loader
    useEffect(() => {
        setDescription(props.data.description)
        let newProperties = {
            owned: Boolean(props.data.divisible) ? props.data.quantity / 100000000 : props.data.quantity,
            supply: Boolean(props.data.divisible) ? props.data.supply / 100000000 : props.data.supply,
            locked: props.data.locked,
            divisible: (Boolean(props.data.divisible)),
            issuer: props.data.issuer != null ? (props.data.issuer.slice(0,8) + "...") : "Null"
        }
        setProperties(newProperties)
    }, [])
    useEffect(() => {
        console.log(properties)
    }, [properties])

    return (
        <Slide direction="right" in={props.infoPop} mountOnEnter unmountOnExit>
        <Box
            sx={{
                width: "100%", height: "100%", minHeight: 500, minWidth: 300, maxWidth: 400, position: "absolute", zIndex: 25, top: 0, left: 0, right: 0, bottom: 0,backdropFilter: "blur(4px)", p: 2, overflow: "scroll"
            }}
        >
            
            <Card 
                sx={{ height: "100%", overflow: "scroll", borderRadius: "3px"  }}
            >
                <Grid // Header
                    container xs sx={{ width: "100%", bgcolor: "secondary.main"}}
                >

                    <Grid 
                        item xs={2} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                        <IconButton aria-label="back" onClick={() => {props.toggleInfoPop(false)}}>
                            <ArrowBackIcon sx={{ color: "primary.contrastText"  }} />
                        </IconButton>
                    </Grid>

                    <Grid item xs={8} sx={{width: "100%"}}>
                        <Typography variant="h5" sx={{ width: "100%", maxWidth: 300, wordWrap: "break-word", pt: 2, pb: 2, color: "primary.contrastText" }} textAlign="center">
                            {name}
                        </Typography>
                    </Grid>

                    <Grid item xs={2}></Grid>

                </Grid>

                <Grid // Image preview
                    container xs={12} sx={{ p: 2 }}
                >
                    <CardMedia
                        component="img"
                        alt={name}
                        height="200"
                        width="100%"
                        image={preview}
                        sx={{ borderStyle: "solid", borderColor: "text.hint", borderWidth: "1px", padding: "1em", borderRadius: 3, objectFit: "contain" }}
                    />
                </Grid>

                {/* <Grid // Interaction buttons
                    container xs={12} sx={{ pl: 2, pr: 2 }}
                >
                    <Stack spacing={2} direction="row" sx={{ width: "100%" }}>

                        <Button 
							startIcon={<SendIcon />}
							variant="contained"
							onClick={() => {props.toggleShowSend(true)}}
							sx={{
								width: "100%", bgcolor: "primary.light", ":hover": { bgcolor: "primary.dark" }, ":active": { bgcolor: "primary.light" }
							}}
						>Send</Button>

                        <Button 
							startIcon={<LockIcon />}
							variant="contained"
							onClick={() => {props.toggleShowSend(true)}}
							sx={{
								width: "100%", bgcolor: "primary.light", ":hover": { bgcolor: "primary.dark" }, ":active": { bgcolor: "primary.light" }
							}}
						>Lock</Button>

                    </Stack>
                </Grid> */}

                <Grid // Description
                    container xs={12} sx={{ p: 2 }}
                >
                    <Typography sx={{ color: "text.secondary", width: "100%" }} >
                        Description
                    </Typography>
                    <Typography sx={{ width: "100%" }}>
                        { description }
                    </Typography>
                </Grid>

                <Grid // Properties
                    container xs={12} sx={{ p: 2 }}
                >
                    <Grid xs={12} sx={{ pb: 1 }}>
                        <Typography sx={{ color: "text.secondary" }} >
                            Properties
                        </Typography>
                    </Grid>

                    <Grid xs={12} sx={{ display: "flex", flexWrap: "wrap", flexDirection: "row", alignItems: "flex-start" }}>
                        
                        {
                            Object.entries(properties).map(([key, value]) => (
                                <PropertiesBox title={key.toString()} value={value.toString()} />
                            ))
                        }
                    </Grid>

                </Grid>

            </Card>
        </Box>
        </Slide>
    )
}

function PropertiesBox(props) {

    return (
        <Grid item xs="auto" sx={{ borderStyle: "solid", borderColor: "text.hint", borderWidth: "1px", p: 1, mr: 1, mb: 1, borderRadius: 2 }}>
            <Typography variant="caption">
                {props.title.toUpperCase()}
            </Typography>
            <Typography sx={{ textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }}>
                {props.value}
            </Typography>
        </Grid>
    )


}