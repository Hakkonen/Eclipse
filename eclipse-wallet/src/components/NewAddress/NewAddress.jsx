import * as React from "react"
import { useEffect, useState } from "react"

// MUI
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Grow from '@mui/material/Grow'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import { Typography } from "@mui/material"

export default function NewAddress(props) {

    return (
        <Grow in={props.newAddPage}>
            <Box
                sx={{ width: "100%", height: "100%", minHeight: 500, position: "absolute", top: 0, bottom: 0, left: 0, right: 0, zIndex: 50, bgcolor: "background.default" }}
            >
                <Typography variant="h5" sx={{ textAlign: "center", pt: 2 }}>Add Address</Typography>
                <List>

                    <ListItem>
                        <ListItemButton  
                            sx={{ bgcolor: "rgba(255,255,255,0.05)", borderRadius: "3px" }}
                            onClick={() => {
                                props.setLoading(true)
                                props.toggleNewAddrPage(false)
                                props.createNewHDKeypair()
                            }}
                        >
                            <ListItemText 
                                primary="Create a new address" 
                                secondary="Generate a new wallet address"
                            />
                        </ListItemButton>
                    </ListItem>

                    <ListItem>
                    <ListItemButton sx={{ bgcolor: "rgba(255,255,255,0.05)", borderRadius: "3px" }}>
                        <ListItemText 
                            primary="Import address" 
                            secondary="Import wallet in WIF format"
                            onClick={() => {
                                props.toggleNewAddrPage(false)
                                props.toggleImportAdd(true)
                            }}
                        />
                    </ListItemButton>
                    </ListItem>

                </List>

                <Box sx={{ p: 2, position: "absolute", bottom: 0, width: "100%" }}>
                    <Button 
                        variant="outlined" sx={{ width: "100%", bgcolor: "rgba(255,255,255,0.05)", borderRadius: "3px" }}
                        onClick={() => {props.toggleNewAddrPage(false)}}
                    >
                        Close
                    </Button>
                </Box>
            </Box>
        </Grow>
    )
}