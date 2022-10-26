import * as React from "react"
import { useEffect, useState } from "react"

// Functions
import encryptSeedToLs from "../../functions/login/encryptSeedToLs"
import loginLegacy from "../../functions/login/login-legacy"
import createKeyPair from "../../functions/address/createKeyPair"

// MUI imports
import { Typography } from "@mui/material"
import { Container } from "@mui/system"
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress';

// Asset imports
import icon from "../../assets/raremoon-icon.png"
import logo from "../../assets/eclipse-logo-l-large.png"

// TODO: Add detailed create account func

function LoginPage(props) {

    return (
        <Grid container>
            <Grid // Login header
                item xs={12}       
                sx={{ pb: 2, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}      
                className="noselect"       
            >
                {/* <Typography textAlign={"center"} variant="overline">Eclipse</Typography> */}
                <Box
                    component="img"
                    sx={{
                        height: 128,
                        width: 128,
                    }}
                    alt="Eclipse"
                    src={logo}
                />
                
            </Grid>

            <Grid // Seed entry
                item xs={12}
                sx={{ pb: 2 }}
            >
                <Typography textAlign={"center"} variant="overline" sx={{ pl: 1 }}>Login</Typography>
                <TextField id="seedPhrase" label="Seed Phrase" variant="outlined" size="small" sx={{ width: "100%", pb:1 }} autoComplete="off" error={props.error} helperText={props.error ? "Incomplete seed phrase" : ""}
                />
                <TextField id="password" label="Password" variant="outlined" size="small" sx={{ width: "100%", pb:1 }} autoComplete="off"
                />
                <Button variant="contained">Legacy</Button>
                {/* <Button variant="outlined">BIP39</Button> */}
            </Grid>

            <Grid
                item xs={12}
                sx={{ pb: 2 }}
            >
                <Divider />
            </Grid>

            <Grid // Buttons
                item xs={12}
            >
                <Stack spacing={2} direction="row">
                    
                    <Button variant="outlined" sx={{  }}
                        onClick={props.handleLogin}
                    >Login</Button>
                </Stack>
            </Grid>


        </Grid>
    )
}

export default function LoginFromSeed(props) {
    
    const [ loading, setLoading ] = useState(false)
    const [ error, setError ] = useState(false)

    // Ingests seed phrase and returns HD node, or error
    function handleLogin() {
        // Set loading to true
        setLoading(true)

        try {
            // Get password
            const password = document.getElementById("password").value

            // Get seed phrase and decode into HD root node
            const seedPhrase = document.getElementById("seedPhrase").value
            const node = loginLegacy(seedPhrase, props.network.network)

            // Get next 10 addresses
            const addressList = []
            for (let n = 0; n < 10; n++) {
                
                const newPair = createKeyPair(node, n)
                const newAddress = {
                    blockHeight: 0,
                    ttl: 0,
                    index: n,
                    child: n,
                    name: `Wallet ${n + 1}`,
                    node: newPair.childNode,
                    pubKey: newPair.pubKey,
                    privKey: newPair.privKey,
                    btcBalance: 0,
                    balance: [],
                    history: []
                }
                addressList.push(newAddress)
            }

            // Set wallet with decrypted seed data
            // Default mainnet at start
            const wallet = {
                loaded: true,
                name: "Wallet",
                network: props.network.network,
                addressBook: addressList,
                addrIndex: 0,
                secret: password
            }
            props.setWallet(wallet)

            // Encrypts node into LS using AES
            encryptSeedToLs(wallet, seedPhrase, password)

            // setLoading(false)

            // Set page to app
            props.setPage("app")
        } catch(e) {
            console.error(e)
            setLoading(false)
            setError(true)
        }
    }

    return (
        <Container
            sx={{ width: "100%", height: "100%", pl: 2, pr: 2 }}
        >
            {
                loading === false ?
                    <LoginPage 
                        handleLogin={handleLogin}
                        error={error}
                    />
                :
                    <Box sx={{ display: 'flex', width: "100%", height: "100%" }}>
                        <CircularProgress />
                    </Box>
            }
        </Container>
    )
}