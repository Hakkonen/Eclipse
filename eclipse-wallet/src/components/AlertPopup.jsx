import React from "react"
import { useEffect, useState } from "react"

// MUI
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Grow from '@mui/material/Grow'
import Fade from '@mui/material/Fade'
import Slide from '@mui/material/Slide'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'

export default function AlertPopup(props) {

    return (
        <Fade
            in={props.showPopup}
            sx={{ width: "100%", height: "100%", position: "absolute", zIndex: 150, top: 0, left: 0, right: 0, bottom: 0, display: "flex", justifyContent: "center", alignItems: "center", transformOrigin: '0 0 0' }}
        >
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                {props.popupComp}
            </Box>
        </Fade>
    )
}