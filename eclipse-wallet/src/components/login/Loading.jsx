import * as React from "react"
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import { Typography } from "@mui/material"

export default function Loading(props) {
    return (
        <Box sx={{ position: "absolute", width: "100%", height: "100%", top: 0, left: 0, right: 0, bototm: 0, display: 'flex', flexDirection: "column", justifyContent: "center", alignItems: "center", zIndex: 1000, bgcolor: "background.default", maxWidth: 400, maxHeight: 600 }}>
            <CircularProgress color="secondary" />
            <Typography sx={{ pt: 2 }}>{props.feedback}</Typography>
        </Box>
    )
}