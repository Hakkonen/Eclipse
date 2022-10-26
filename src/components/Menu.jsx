import * as React from "react"
import { useEffect, useState } from "react"

// Mui
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import MenuList from '@mui/material/MenuList'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import ContentCut from '@mui/icons-material/ContentCut'
import ContentCopy from '@mui/icons-material/ContentCopy'
import ContentPaste from '@mui/icons-material/ContentPaste'
import Cloud from '@mui/icons-material/Cloud'
import Slide from '@mui/material/Slide'
import IconButton from '@mui/material/IconButton'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'

// icons
import CloseIcon from '@mui/icons-material/Close'
import DoneIcon from '@mui/icons-material/Done'
import AddIcon from '@mui/icons-material/Add'
import HelpIcon from '@mui/icons-material/Help'
import SettingsIcon from '@mui/icons-material/Settings'
import LocalMallIcon from '@mui/icons-material/LocalMall'

// Functions
import clearLs from "../functions/login/clearLs"

// Network
import axios from "axios"
import { Button } from "@mui/material"

export default function Menu(props) {

    const [ donatePop, toggleDonatePop ] = useState(false)
    const [ aboutPop, toggleAboutPop ] = useState(false)

    // // DELETE ACCOUNT !WARNING!
    // function handleDeleteAcct() {
    //     console.log("WARNING: DELETING WALLET")
    //     clearLs()
    //     window.location.reload(false)
    // }

    // Change address function
    function handleChangeAddress(index, pubKey) {

        // Check index against stored index's address 
        if(pubKey == props.wallet.addressBook[index].pubKey) {

            props.setWallet(prev => ({
                ...prev,
                loaded: false,
                addrIndex: index
            }))
            // Start load
            props.setLoading(true)
            // Start address balances refresh
            // TODO: Pull from LS
            props.refreshAddress(pubKey, index)
            // Close menu
            props.toggleMenu(false)
        }
    }

    // Open settings
    function handleSettings() {
        props.toggleShowSettings(true)
        // Close menu
        props.toggleMenu(false)
    }

    function handleDonate() {
        toggleDonatePop(true)
        props.toggleMenu(false)
    }

    // Component for address list
    const AddressComp = (props) => (
        <MenuItem onClick={() => {handleChangeAddress(props.address.index, props.address.pubKey)}}>
            <ListItemText>
                {props.address.name}
                <Typography variant="caption" sx={{pl: 2, color: "text.secondary"}}>{props.address.pubKey.slice(0,5)}...{props.address.pubKey.slice(-4)}</Typography>
            </ListItemText>
            <ListItemIcon sx={{display: "flex", alignItems: "center", justifyContent: "flex-end"}}>
                {
                    props.address.pubKey == props.currentAddr ?
                    <DoneIcon />
                    : null
                }
            </ListItemIcon>
        </MenuItem>
    )

    return (
        <Box className="noselect">
            {
                props.menu ?
                <Box // Background
                    sx={{ backdropFilter: "blur(4px)", width: "100%", hieght: "100%", minHeight: 500, position: "absolute", left: 0, bottom: 0, top: 0, right: 0, zIndex: 50 }}
                    onClick={() => {props.toggleMenu(!props.menu)}}
                ></Box>
                : null
            }

            <Slide direction="left" in={props.menu} mountOnEnter unmountOnExit>
                            
            <Paper sx={{ width: "80%", height: "100%", position: "absolute", right: 0, top: 0, bottom: 0, zIndex: 100, overflow: "scroll" }}>
                <MenuList>
                    <ListItem>
                        <ListItemText>
                            <Typography variant="body1" color="text.secondary">
                                Eclipse Beta
                            </Typography>
                        </ListItemText>
                        <ListItemIcon sx={{display: "flex", alignItems: "center", justifyContent: "flex-end"}}>
                            <IconButton>
                                <CloseIcon onClick={() => {props.toggleMenu(!props.menu)}} />
                            </IconButton>
                        </ListItemIcon>
                    </ListItem>

                    <Divider />

                    <Box sx={{ width: "100%", height: "auto", maxHeight: "300px", overflow: "scroll" }}>

                    {   
                        // Map list of addresses in addressBook
                        typeof props.wallet != "undefined" && typeof props.wallet.addressBook != "undefined" ?
                        props.wallet.addressBook.map((address, i) => (
                            <AddressComp key={i} address={address} currentAddr={props.wallet.addressBook[props.wallet.addrIndex].pubKey} />
                        ))
                        : null
                    }

                    </Box>

                    <Divider />

                    {
                        typeof props.wallet != "undefined" && typeof props.wallet.addressBook != "undefined" && props.wallet.addressBook.length > 0 ?
                        <MenuItem onClick={() => {
                            props.toggleMenu(false)
                            props.handleNewAddress()
                        }}>
                            <ListItemIcon>
                                <AddIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Add / Import Wallet</ListItemText>
                        </MenuItem>
                        : null
                    }


                    <Divider />

                    <MenuItem onClick={handleSettings}>
                        <ListItemIcon>
                            <SettingsIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Settings</ListItemText>
                    </MenuItem>


                    <MenuItem onClick={() => {handleDonate()}}>
                        <ListItemIcon>
                            <LocalMallIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Donate</ListItemText>
                    </MenuItem>

                    <MenuItem onClick={() => {
                        toggleAboutPop(true)
                        props.toggleMenu(false)
                    }}>
                        <ListItemIcon>
                            <HelpIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>About</ListItemText>
                    </MenuItem>

                </MenuList>
            </Paper>

            </Slide>

            {
                donatePop ?
                <Donate toggleDonatePop={toggleDonatePop} donatePop={donatePop} />
                : null
            }

            {
                aboutPop ?
                <About toggleAboutPop={toggleAboutPop} aboutPop={aboutPop} />
                : null
            }
        </Box>
    )

}

function About(props) {

    return (
        <Box sx={{width: "100%", height: "100%", maxWidth: 350, position: "absolute", zIndex: 75,
            top: 0, left: 0, right: 0, bottom: 0, p: 2, overflow: "scroll", backdropFilter: "blur(4px)"}}
        >

            <Card variant="outlined" sx={{ width: "auto", height: "auto", borderRadius: "5px", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", pt: 2, pb: 2, pl: 4, pr: 4 }}>

                <CardContent sx={{ width: "100%", maxWidth: 350 }}>
                    <Typography variant="h6" textAlign={"center"} sx={{ pb: 2 }}>
                        About
                    </Typography>

                    <Typography variant="body">
                        This wallet is provided as a beta testing product, created as a hobby by Fabrique. To support further development please donate by purchasing an NFT in the "Donate" tab.
                    </Typography>

                    <br></br>
                    <br></br>

                    <Typography variant="caption">
                        Disclaimer: The creator/s of this software cannot be held accountable for any unexpected, or accidental occurances that result in loss of funds or assets.
                    </Typography>

                </CardContent>

                <Button
                    variant="outlined"
                    onClick={() => {props.toggleAboutPop(false)}}
                >
                    Close
                </Button>
            
            </Card>

        </Box>

    )
}

function Donate(props) {

    const [ dispenserList, setDispenserList ] = useState([])
    // Get dispensers
    useEffect(() => {
        if(props.donatePop) {
            axios.get("https://fapep.github.io/FABRIQUE/dispensers.json")
            .then(res => {
                setDispenserList(res.data)
            })
        }
    }, [props.donatePop])
    useEffect(() => {
        console.log(dispenserList)
    }, [dispenserList])

    return (
        <Box sx={{width: "100%", height: "100%", maxWidth: 350, position: "absolute", zIndex: 75,
            top: 0, left: 0, right: 0, bottom: 0, p: 2, overflow: "scroll", backdropFilter: "blur(4px)"}}
        >

            <Card variant="outlined" sx={{ width: "auto", height: "auto", borderRadius: "5px", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", pt: 2, pb: 2, pl: 4, pr: 4 }}>

                <CardContent sx={{ width: "100%", maxWidth: 350 }}>
                    <Typography variant="h6" textAlign={"center"} sx={{ pb: 2 }}>
                        Donate
                    </Typography>

                    <Typography variant="body1" sx={{ p: 1 }}>
                        Support development by purchasing an NFT from one of the following dispensers:
                    </Typography>

                    <List>
                        {
                            dispenserList && dispenserList.length > 0 ?
                            dispenserList.map((dispenser) => (
                                <ListItem disablePadding>
                                    <ListItemButton onClick={()=> window.open(`https://xchain.io/tx/${dispenser.tx_hash}`, "_blank")}>
                                        {dispenser.name}
                                    </ListItemButton>
                                </ListItem>
                            ))
                            : null
                        }
                    </List>

                    <Button
                        sx={{ width: "100%", mt: 1 }}
                        onClick={() => {props.toggleDonatePop(false)}}
                    >
                        Close
                    </Button>

                </CardContent>

            </Card>

        </Box>
    )
}