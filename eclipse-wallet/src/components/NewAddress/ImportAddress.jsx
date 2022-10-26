import * as React from "react"
import { useEffect, useState } from "react"

// MUI
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Grow from '@mui/material/Grow'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import { Typography } from "@mui/material"
import TextField from '@mui/material/TextField'

// icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function ImportAddress(props) {

    function validateWIFInput() {
        const name = document.getElementById("walletName").value
        const wif = document.getElementById("privateKey").value
        console.log(name, wif)

        if (name != "" && wif != "") {
            props.handleImportWIF(name, wif)
        } else {
            props.setError({error: true, message: "Cannot leave fields empty"})
        }
    }

    return (
        <Grow in={props.importAdd}>
            <Box
                sx={{ width: "100%", height: "100%", maxWidth: 350, position: "absolute", top: 0, bottom: 0, left: 0, right: 0, zIndex: 50, bgcolor: "background.default" }}
            >
                <Grid
                    container xs sx={{
                        display: "flex", justifyContent: "center", alignItems: "center", pt: 2
                    }}
                >
                    <Grid item xs={2} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <IconButton aria-label="back"
                            onClick={() => {props.toggleImportAdd(false)}}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                    </Grid>
                    <Grid item xs={8} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <Typography variant="h5" sx={{ textAlign: "center" }}>Import Address</Typography>
                    </Grid>
                    <Grid item xs={2}></Grid>
                </Grid>

                <Box
                    component="form"
                    sx={{
                        display: "flex", justifyContent: "center", alignItems: "center", 
                        flexDirection: "column", pt: 2, width: "100%"
                    }}
                    noValidate
                    autoComplete="off"
                >
                    <TextField id="walletName" variant="outlined" placeholder="Wallet Name" sx={{ pt: 2, width: "80%" }} error={props.error.error} 
                        onKeyPress={(event) => {
                            if (event.key === 'Enter') {validateWIFInput()}
                        }}
                    />
                    <TextField id="privateKey" variant="outlined" placeholder="Private Key" sx={{ pt: 2, width: "80%" }} error={props.error.error}
                        onKeyPress={(event) => {
                            if (event.key === 'Enter') {validateWIFInput()}
                        }}
                    />
                    <Typography sx={{pt: 2, color: "error.main"}}>{props.error.message}</Typography>
                </Box>

                
                <Box sx={{ p: 2, position: "absolute", bottom: 0, width: "100%" }}>
                    <Button 
                        variant="outlined" sx={{ width: "100%", bgcolor: "rgba(255,255,255,0.05)", borderRadius: "3px" }}
                        onClick={() => {validateWIFInput()}}
                    >
                        Import
                    </Button>
                </Box>
            </Box>
        </Grow>
    )
}