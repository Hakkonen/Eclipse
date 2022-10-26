// Runs user send function

import React from "react"
import { useEffect, useState } from "react"

// MUI
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Grow from '@mui/material/Grow'
import Slide from '@mui/material/Slide'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import { Typography } from "@mui/material"
import Divider from '@mui/material/Divider'

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

// Funcs
import SignString from "../../functions/sign/sign"
import Validate from "../../functions/sign/validate"

export default function Sign(props) {

    // sign
    const [ message, setMessage ] = useState("")
    const [ signedMessage, setSignedMessage ] = useState("")

    // validate
    const [ vMessage, setVMessage ] = useState("")
    const [ signature, setSignature ] = useState("")
    const [ signee, setSignee ] = useState("")
    const [ validity, setValidity ] = useState(null)
    const [ feedback, setFeedback ] = useState("")

    function signMessage(message, privKey) {
        setSignedMessage(SignString(message, privKey))
    }

    function validateMessage(address, message, signature) {
        // Reset
        setValidity(null)
        setFeedback("")

        try {
            const valid = Validate(address, message, signature)
            setValidity(valid)
        } catch (e) {
            setValidity(false)
            setFeedback(e)
        }
    }
    useEffect(() => {
        console.log(validity)
    }, [validity])

    return (
        <Slide direction="right" in={props.showSign} mountOnEnter unmountOnExit>
            <Box sx={{
                width: "100%", height: "100%", maxWidth: 350, position: "absolute", zIndex: 25,
                top: 0, left: 0, right: 0, bottom: 0, p: 2, overflow: "scroll", backdropFilter: "blur(4px)"
            }}>
                <Card sx={{ width: "100%" }}>

                <Grid container xs sx={{ backgroundColor: "secondary.main" }}>

                    <Grid item xs={2} sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>

                        <IconButton aria-label="back" onClick={() => {
                            props.toggleShowSign(false);
                            resetData();
                        }}>
                            <ArrowBackIcon sx={{ color: "primary.contrastText"  }} />
                        </IconButton>

                    </Grid>

                    <Grid item xs={8} sx={{ width: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Typography variant="h5" sx={{ pt: 2, pb: 2, color: "primary.contrastText"}}>
                            Sign
                        </Typography>
                    </Grid>

                    <Grid item xs={2}></Grid>

                </Grid>

                <Grid xs container>

                        <Grid item xs={12} sx={{ width: "100%", pl: 2, pr: 2, pt: 1, pb: 1, display: "flex", alignItems: "center" }}>
                            <TextField
                                id="message"
                                label="Message"
                                multiline
                                maxRows={5}
                                value={message}
                                onChange={(e) => {setMessage(e.target.value)}}
                                sx={{ width: "100%" }}
                            />
                        </Grid>

                        <Grid item xs={12} sx={{ width: "100%", pl: 2, pr: 2, pb: 2, display: "flex", alignItems: "center" }}>
                            <TextField
                                disabled
                                id="signature"
                                label="Signature"
                                multiline
                                maxRows={5}
                                value={signedMessage}
                                sx={{ width: "100%" }}
                            />
                        </Grid>

                        <Grid item xs={12} sx={{ width: "100%", pl: 2, pr: 2, pb: 2, display: "flex", alignItems: "flex-start" }}>
                            <Button 
                                variant="contained"
                                onClick={() => {signMessage(message, props.wallet.addressBook[props.wallet.addrIndex].privKey)}}
                            >Sign</Button>
                            <Button 
                                variant="outlined"
                                onClick={() => {
                                    setSignedMessage("");
                                    setMessage("");
                                }}
                                sx={{ ml: 1 }}
                            >Clear</Button>
                        </Grid>

                    </Grid>

                    <Divider />

                    <Grid container xs sx={{width: "100%"}}>

                        <Grid item xs={12}  sx={{width: "100%"}}>
                            <Typography variant="h5" sx={{ width: "100%", pt: 2, pb: 2 }} textAlign="center">Validate</Typography>
                        </Grid>

                        <Grid item xs={12} sx={{ width: "100%", pl: 2, pr: 2, pt: 1, pb: 1, display: "flex", alignItems: "center" }}>
                            <TextField
                                id="signee"
                                label="Signee's Address"
                                value={signee}
                                onChange={(e) => {setSignee(e.target.value)}}
                                sx={{ width: "100%" }}
                            />
                        </Grid>

                        <Grid item xs={12} sx={{ width: "100%", pl: 2, pr: 2, pb: 2, display: "flex", alignItems: "center" }}>
                            <TextField
                                id="vMessage"
                                label="Message To Validate"
                                multiline
                                maxRows={5}
                                onChange={(e) => {setVMessage(e.target.value)}}
                                value={vMessage}
                                sx={{ width: "100%" }}
                            />
                        </Grid>

                        <Grid item xs={12} sx={{ width: "100%", pl: 2, pr: 2, display: "flex", alignItems: "center" }}>
                            <TextField
                                id="validateSignature"
                                label="Signee's Signature"
                                multiline
                                maxRows={5}
                                onChange={(e) => {setSignature(e.target.value)}}
                                value={signature}
                                sx={{ width: "100%" }}
                                error={validity == false ? true : false}
                                color={validity == true ? "success" : ""}
                                helperText={validity == false ? "Invalid Signature" : ""}
                            />
                        </Grid>
                        <Grid item xs={12} sx={{ width: "100%", pl: 2, pr: 2, pt: 1, pb: 2, display: "flex", alignItems: "center" }}>
                            <Typography variant="caption" sx={{ color: "success.main" }}>
                                { validity == true ? "Valid" : "" }
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sx={{ width: "100%", pl: 2, pr: 2, pb: 2, display: "flex", alignItems: "flex-start" }}>
                            <Button 
                                variant="contained"
                                onClick={() => {validateMessage(signee, vMessage, signature)}}
                            >Validate</Button>
                            <Button 
                                variant="outlined"
                                onClick={() => {
                                    setSignee("");
                                    setVMessage("");
                                    setSignature("");
                                    setValidity(null);
                                }}
                                sx={{ ml: 1 }}
                            >Clear</Button>
                        </Grid>

                    </Grid>
                </Card>
            </Box>
        </Slide>
    )
}