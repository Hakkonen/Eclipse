import React from "react"
import { useEffect, useState } from "react"

import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

export default function ResultPopup(props) {
    return (
        <Card variant="outlined" sx={{ width: "auto", height: "auto", borderRadius: "5px", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", pt: 2, pb: 2, pl: 4, pr: 4 }}>
            <CardContent sx={{ width: "100%", maxWidth: 350 }}>
                <Typography sx={{width: "100%", textAlign: "center"}} variant="body1">Transaction successful</Typography>
            </CardContent>
            <CardActions sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Button variant="outlined" onClick={() => {window.open(`https://xchain.io/tx/${props.tx}`, '_blank', 'noopener,noreferrer')}}>
                    View Transaction
                </Button>
                <Button variant="contained" onClick={() => {props.toggleShowPopup(false)}}>
                    Done
                </Button>
            </CardActions>
        </Card>
    )
}