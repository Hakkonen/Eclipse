import React from "react"
import { useEffect, useState } from "react"

// MUI
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Grow from '@mui/material/Grow'
import Slide from '@mui/material/Slide'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import { Typography } from "@mui/material"
import TextField from '@mui/material/TextField'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'


import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LogoutIcon from '@mui/icons-material/Logout'

// Functions
import { setSettingsLs } from "../functions/address/setLS"
import clearLs from "../functions/login/clearLs"
import decodeSeed from "../functions/address/decodeSeed"
import PreviewIcon from '@mui/icons-material/Preview'

export default function Settings(props) {

    async function handleToggleTheme() {
        let newTheme = props.theme == "light" ? "dark" : "light"
        props.toggleTheme(newTheme)
        let newSettings = props.userSettings
        newSettings.theme = newTheme
        console.log("new user settings")
        console.log(newSettings)
        props.setUserSettings(newSettings)
        setSettingsLs(newSettings)
    }

    // DELETE ACCOUNT !WARNING!
    const [ deletePop, toggleDeletePop ] = useState(false)
    function handleDeleteAcct() {
        console.log("WARNING: DELETING WALLET")
        toggleDeletePop(true)
    }

    const [ phrasePop, togglePhrasePop ] = useState(false)
    function handlePhrase() {
        togglePhrasePop(true)
    }

    return(
        <Slide direction="right" in={props.showSettings} mountOnEnter unmountOnExit>
            <Box sx={{
                width: "100%", height: "100%", maxWidth: 350, position: "absolute", zIndex: 25,
                top: 0, left: 0, right: 0, bottom: 0, bgcolor: "background.default"
            }}>
                <Grid container xs sx={{ p: 2, width: "100%" }}>
                    <Grid item xs={2} sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <IconButton aria-label="back" onClick={() => {props.toggleShowSettings(false)}}>
                            <ArrowBackIcon />
                        </IconButton>
                    </Grid>
                    <Grid item xs={8} sx={{ width: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Typography variant="h5" sx={{ textAlign: "center", width: "100%" }}>Settings</Typography>
                    </Grid>
                    <Grid item xs={2}></Grid>

                    <Grid item xs={12} sx={{ pt: 2 }}>

                    <ListItemButton onClick={handleToggleTheme}>
                        <ListItemIcon>
                            {
                                props.theme == "light" ?
                                <LightModeIcon /> :
                                <DarkModeIcon />
                            }
                        </ListItemIcon>
                        <ListItemText primary="Theme" />
                    </ListItemButton>

                    <ListItemButton
                        onClick={handlePhrase}
                    >
                        <ListItemIcon>
                            <PreviewIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Reveal Secret Phrase</ListItemText>
                    </ListItemButton>

                    <ListItemButton
                        onClick={handleDeleteAcct}
                    >
                        <ListItemIcon>
                            <LogoutIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Delete Account</ListItemText>
                    </ListItemButton>

                    </Grid>
                </Grid>

                {
                    phrasePop ?
                    <RevealPhrase phrasePop={phrasePop} togglePhrasePop={togglePhrasePop} />
                    : null
                }

                {
                    deletePop ?
                    <DeleteAccount deletePop={deletePop} toggleDeletePop={toggleDeletePop} />
                    : null
                }

            </Box>
            
        </Slide>
    )
}

function RevealPhrase(props) {

    const [ secret, setSecret ] = useState("")
    const [ phrase, setPhrase ] = useState("")
    const [ error, setError ] = useState(false)

    async function handleReveal() {
        try {
            const seed = await decodeSeed(secret).then(res => {
                console.log(res)
                setError(false)
                return res
            })
            setPhrase(seed)
        } catch(e) {
            setError(true)
        }

    }

    return(
        <Box sx={{width: "100%", height: "100%", maxWidth: 350, position: "absolute", zIndex: 75,
            top: 0, left: 0, right: 0, bottom: 0, p: 2, overflow: "scroll", backdropFilter: "blur(4px)"}}
        >

			<Card variant="outlined" sx={{ width: "auto", height: "auto", borderRadius: "5px", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", pt: 2, pb: 2, pl: 4, pr: 4 }}>

				<CardContent sx={{ width: "100%", maxWidth: 350 }}>
					<Typography variant="h6" textAlign={"center"} sx={{ pb: 2 }}>
						XCP Phrase
					</Typography>

                    <Typography variant="body1" sx={{ p: 1 }}>
                        Enter Password
                    </Typography>

                    <TextField variant="outlined" autoComplete="off" sx={{ width: "100%", pt: 1, pb: 1}} onInput={(e) => {setSecret(e.target.value)}} error={error} />

                    <Button
                        variant="contained"
                        onClick={() => {handleReveal()}}
                        sx={{ width: "100%", p: 1, mt: 1 }}
                    >
                        Reveal
                    </Button>

                    {
                        phrase != "" ?
                        <Box>
                            <TextField
                                sx={{ width: "100%", pt: 1, pb: 1 }}
                                // disabled
                                multiline
                                maxRows={5}
                                defaultValue={phrase}
                            >
                                
                            </TextField>
                            <Button
                                variant="outlined"
                                sx={{ width: "100%", mt: 1 }}
                                onClick={() => {navigator.clipboard.writeText(phrase)}}
                            >
                                Copy
                            </Button>
                        </Box>
                        : null
                    }

                    <Button
                        variant="outlined"
                        onClick={() => {props.togglePhrasePop(false)}}
                        sx={{ width: "100%", p: 1, mt: 1 }}
                    >
                        Cancel
                    </Button>


                </CardContent>

            </Card>
        </Box>
    )

}

function DeleteAccount(props) {

    function deleteWallet() {
        // Do not perform unless wallet is backed up!
        clearLs()
        window.location.reload(false)
    }

    const [ deleteConfirm, setDeleteConfirm ] = useState("")

    return (
        // <Slide direction="up" in={props.deletePop} mountOnEnter unmountOnExit>
			<Box sx={{width: "100%", height: "100%", maxWidth: 350, position: "absolute", zIndex: 75,
                top: 0, left: 0, right: 0, bottom: 0, p: 2, overflow: "scroll", backdropFilter: "blur(4px)"}}
			>

			<Card variant="outlined" sx={{ width: "auto", height: "auto", borderRadius: "5px", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", pt: 2, pb: 2, pl: 4, pr: 4 }}>

				<CardContent sx={{ width: "100%", maxWidth: 350 }}>
					<Typography variant="h6" textAlign={"center"} sx={{ pb: 2 }}>
						Delete Wallet
					</Typography>

                    <Typography variant="body1" sx={{ p: 1, color: "error.main"  }}>
                        WARNING: Deleting your wallet will completely remove all seed, address, and wallet data. Please backup your seed phrase before deletion.
                    </Typography>

                    <Typography variant="body1" sx={{ p: 1 }}>
                        Type "Delete" in the box below to delete your wallet...
                    </Typography>

                    <TextField id="delete" variant="outlined" autoComplete="off" placeholder="Type Delete to delete wallet" onInput={(e) => {setDeleteConfirm(e.target.value)}} sx={{ width: "100%", pb: 1, pt: 1 }} />

                    <Button 
                        variant="contained"
                        disabled={deleteConfirm != "Delete"}
                        onClick={() => {deleteWallet()}}
                        sx={{ width: "100%", p: 1 }}
                        color="error"
                    >
                        Delete Wallet
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => {props.toggleDeletePop(false)}}
                        sx={{ width: "100%", p: 1, mt: 1 }}
                    >
                        Cancel
                    </Button>

                </CardContent>

            </Card>

            </Box>
        // </Slide>
    )
}