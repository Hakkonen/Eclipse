import React from "react"
import { useEffect, useState } from "react"

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'

export default function LoadingPopup(props) {
    return (
        <Card variant="outlined" sx={{ width: "auto", height: "auto", borderRadius: "5px", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", pt: 2, pb: 2, pl: 4, pr: 4 }}>
            <CircularProgress color="secondary" />
        </Card>
    )
}