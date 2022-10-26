import * as React from "react"
import { useEffect, useState } from "react"

// Functions
import decryptString from "../../functions/login/decryptString"
import { getGlobalData } from "../../functions/address/getLS"

// MUI imports
import { Typography } from "@mui/material"
import { Container } from "@mui/system"
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'
import MenuIcon from '@mui/icons-material/Menu'
import IconButton from '@mui/material/IconButton'
import { alpha, styled } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';

// Asset imports
import logoD from "../../assets/eclipse-logo-m.png"
import logoL from "../../assets/eclipse-logo-l-large.png"

// JSX


function LoginPage(props) {

    const PasswordInput = styled(InputBase)(({ theme }) => ({
        'label + &': {
            marginTop: theme.spacing(3),
        },
        '& .MuiInputBase-input': {
            width: "100%",
            color: "white",
            borderRadius: 4,
            position: 'relative',
            backgroundColor: theme.palette.primary.light,
            border: `1px solid ${theme.palette.primary.light}`,
            fontSize: 16,
            padding: '10px 12px',
            transition: theme.transitions.create([
                'border-color',
                'background-color',
                'box-shadow',
            ]),
            "&:hover": {
                border: '1px solid #ced4da',
            },
            '&:focus': {
                boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
                border: '1px solid #ced4da',
                backgroundColor: theme.palette.primary.dark
            },
        },
    }));
    
    return (
        <Grid container xs={12} sx={{
            height: "100%", minHeight: "600px",
            display: "flex", justifyContent: "space-between", alignItems: "center" , flexDirection: "column", bgcolor: "primary.main"
        }}>
			<Grid // Header
				container xs={12} sx={{
					minHeight: "60px",
					height: "auto",
					display: "flex", justifyContent: "center", alignItems: "center",
				}}
			>
                <Grid item xs={3}>

                </Grid>
				<Grid item xs={6} sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                    <Typography textAlign={"center"} variant="h4" className="noselect" sx={{ color: "white", pt: 2, fontWeight: 500, letterSpacing: 1.5 }}>Eclipse</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 100, color: "primary.contrastText" }}>
                        Beta v0.6
                    </Typography>
				</Grid>

				<Grid item xs={3} sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", pr:2 }}>
					{/* <IconButton 
                        sx={{ color: "primary.contrastText" }}
                        onClick={() => {
						props.toggleMenu(!props.menu)
					}}>
						<MenuIcon />
					</IconButton> */}
				</Grid>
			</Grid>

            <Grid // Login 
                item xs={12}       
                sx={{ 
                    pb: 0, width: "100%", minHeight: "250px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" 
                }}            
                className="noselect"
            >
                <Box
                    component="img"
                    sx={{
                        height: 168,
                        width: 168,
                    }}
                    alt="Eclipse"
                    src={logoL}
                />

            </Grid>

            <Grid // password entry
                item xs={12}
                sx={{ pb: 8, pl: 2, pr: 2 }}
            >

                <FormControl variant="standard" sx={{ width: "100%" }}>
                    <Box sx={{ display: "flex", flexDirection: "row", flexWrap: "nowrap", pb:1 }}>
                        <Typography sx={{ color: "primary.contrastText", width: "50%" }} className="noselect">
                            Password
                        </Typography>

                        {/* <Typography 
                            sx={{ color: "primary.light", width: "50%", textAlign: "right", ":hover": { textDecoration: "underline" } }}  
                            className="noselect" 
                            onClick={() => {console.log("Reset")}}
                        >
                            Reset Account
                        </Typography> */}
                    </Box>
                    <PasswordInput 
                        fullWidth={true}
                        placeholder="Enter password..." 
                        id="password" 
                        autoComplete="off" error={props.error.error} 
                        // autoFocus
                        onKeyPress={(event) => {
                            if (event.key === 'Enter') {props.handleLogin()}
                        }}
                    />
                    {
                        
                    }
                    <FormHelperText id="password-error" sx={{ color: "error.main" }}>{props.error.message}</FormHelperText>
                </FormControl>

                <Button
                    type="submit"
                    variant="contained"
                    onClick={props.handleLogin}
                    sx={{ 
                        width: "100%", mt: 1, backgroundColor: "secondary.main",
                        ":hover": {
                            bgcolor: "secondary.light"
                        }
                    }}
                >Login</Button>

            </Grid>

        </Grid>
    )
}

export default function LoginFromPword(props) {

    // Ingests pword and decrypts wallet
    async function handleLogin() {

        // Get password
        const password = document.getElementById("password").value

        // Decrypt wallet using pword to get seed
        let wallet = {}
        if ("encrypted" in props) {
            // Decrypt wallet
            wallet = decryptString(props.encrypted, password)

            // Get global data from LS
            const btcPairs = await getGlobalData()
            props.setBtcPairs(btcPairs)

            if (wallet === false) {
                // Set UI error
                console.log("failed decrypt")
                props.setError({error: true, message: "Wrong password"})
            } else {
                // Resset any errors
                props.setError({error: false, message: ""})

                // Pass up to parent wallet
                wallet.loaded = true
                props.setWallet(wallet)

                // Open app
                props.setPage("app")
            }
        }
    }

    return (
        <Container
            sx={{ width: "100%", height: "100%", p: 0, m: 0 }}
            disableGutters={true}
        >

            <LoginPage 
                menu={props.menu}
                toggleMenu={props.toggleMenu}
                handleLogin={handleLogin}
                error={props.error}
                setError={props.setError}
                sx={{ width: "100%", height: "100%", p: 0, m: 0 }}
            />

        </Container>
    )
}