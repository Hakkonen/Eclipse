import React from "react"
import { useEffect, useState } from "react"

// MUI
import { Typography } from "@mui/material"
import { Container } from "@mui/system"
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'

// assets
import logo from "../../assets/eclipse-logo-l-large.png"

// functions
import Mnemonic from "../../functions/Mnemonic"

export default function SplashPage(props) {

    const [ createSeed, toggleCreateSeed ] = useState(false)

    return (
        <Grid container xs={12} sx={{
            height: "100%", minHeight: 600, display: "flex", alignItems: "center", justifyContent: "space-around"
        }}>
            <Grid item xs={12} sx={{
                height: "100%", minHeight: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-around"
            }}>
                
				<Grid container xs={12} sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                    <Typography textAlign={"center"} variant="h4" className="noselect" sx={{ color: "primary.main", fontWeight: 500, letterSpacing: 1.5 }}>Eclipse</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 100, color: "primary.main", pb: 2 }}>
                        Beta v0.6
                    </Typography>
				</Grid>

                <Box
                    component="img"
                    sx={{
                        height: 168,
                        width: 168,
                    }}
                    alt="Eclipse"
                    src={logo}
                />
            </Grid>

            <Grid container xs={12} sx={{
            display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column"
            }}>
                <Grid item xs={12} sx={{ pb: 1 }}>
                    <Button 
                        variant="contained" sx={{ width: "200px", fontSize: "0.7rem" }}
                        onClick={() => {props.setPage("login-legacy")}}
                    >Import using Seed Phrase</Button>
                </Grid>

                <Grid item xs={12}>
                    <Button 
                        variant="outlined" sx={{ width: "200px", fontSize: "0.7rem" }}
                        onClick={() => {toggleCreateSeed(true)}}
                    >Create a new wallet</Button>
                </Grid>
            </Grid>

            {
                createSeed ?
                <CreateSeed createSeed={createSeed} toggleCreateSeed={toggleCreateSeed} />
                : null
            }
            
        </Grid>
    )
}

function CreateSeed(props) {

    const [ newSeed, setNewSeed ] = useState("")
    // Create new seed phrase
    useEffect(() => {
        const mnemonic = new Mnemonic(128).toWords().toString().replace(/,/gi, " ");
        setNewSeed(mnemonic)
    }, [])

    return (
        <Box sx={{width: "100%", height: "100%", maxWidth: 350, position: "absolute", zIndex: 75,
            top: 0, left: 0, right: 0, bottom: 0, p: 2, overflow: "scroll", backdropFilter: "blur(4px)"}}
        >

			<Card variant="outlined" sx={{ width: "auto", height: "auto", borderRadius: "5px", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", pt: 2, pb: 2, pl: 4, pr: 4 }}>

				<CardContent sx={{ width: "100%", maxWidth: 350 }}>
					<Typography variant="h6" textAlign={"center"} sx={{ pb: 2 }}>
						New Wallet Phrase
					</Typography>

                    <Typography variant="body1" sx={{ p: 1 }}>
                        This is your wallet seed phrase, it is the key to your entire wallet's contents. Write it down in a safe place and do not share it.
                    </Typography>

                    <TextField
                        sx={{ pt: 1, pb: 1, width: "100%" }}
                        defaultValue={newSeed}
                        multiline
                        maxRows={5}
                    >

                    </TextField>

                    <Button
                        sx={{ mt: 1, width: "100%" }}
                        variant="contained"
                        onClick={() => {navigator.clipboard.writeText(newSeed)}}
                    >
                        Copy
                    </Button>

                    <Button
                        sx={{ mt: 1, width: "100%" }}
                        variant="outlined"
                        onClick={() => {props.toggleCreateSeed(false)}}
                    >
                        Done
                    </Button>

                </CardContent>
            </Card>
        </Box>
    )
}
