import React, { useState } from 'react'
import ChannelSelector from '../components/ChannelSelector'
import { Tally as TallyType } from '../domain/Tally'
import useChannels from '../hooks/useChannels'
import useProgramPreview from '../hooks/useProgramPreview'
import { socket } from '../hooks/useSocket'
import { Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/core'
import TallyMenu from './TallyMenu'


const useStyles = makeStyles(theme => {
    return {
        tally: {
            border: "solid 1px " + theme.palette.grey[800],
            width: "250px",
            margin: theme.spacing(1),
            backgroundColor: theme.palette.grey[700],
            overflow: "hidden",
        },
        borderInPreview: {
            borderColor: theme.palette.success.main,
        },
        borderInProgram: {
            borderColor: theme.palette.error.main,
        },
        borderUnpatched: {
            borderColor: theme.palette.grey[500],
        },
        bgInPreview: {
            backgroundColor: theme.palette.success.main,
        },
        bgInProgram: {
            backgroundColor: theme.palette.error.main,
        },
        bgUnpatched: {
            backgroundColor: theme.palette.grey[500],
        },
        tallyHead: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: theme.spacing(1, 1, 1, 2),
            borderBottom: "1px solid " + theme.palette.grey[800],
        },
        tallyHeadTitle:  {

        },
        tallyHeadIcon: {

        },
        tallyBody: {
            padding: theme.spacing(2)
        },
        tallyFoot: {
            padding: theme.spacing(1, 2),
            borderTop: "1px solid " + theme.palette.grey[800],
            fontSize: "0.75rem",
            display: "table",
            width: "100%",
            textTransform: "uppercase",
            textAlign: "center",
            fontWeight: "bold",
        },
        tallyFootLeft: {
            display: "table-cell",
            width: "50%",
            textAlign: "center",
        },
        tallyFootMissing: {
            backgroundColor: theme.palette.warning.main,
            color: theme.palette.getContrastText(theme.palette.warning.main)
        },
        tallyFootRight: {
            display: "table-cell",
            width: "50%",
            textAlign: "center",
            opacity: 0.5,
        },
    }
})

type TallyProps = {
    tally: TallyType
    className?: string
}

function Tally({ tally, className }: TallyProps) {
    const channels = useChannels()
    const [programs, previews] = useProgramPreview()
    const classes = useStyles()

    const patchTally = function (tally, channel) {
        socket.emit('tally.patch', tally.name, channel)
    }

    const classRoot: string[] = []
    className && classRoot.push(className)
    classRoot.push(classes.tally)
    const classHead = [classes.tallyHead]
    if (!tally.isPatched()) {
        classRoot.push(classes.borderUnpatched)
    } else if (programs && tally.isIn(programs)) {
        classRoot.push(classes.borderInProgram)
    } else if (previews && tally.isIn(previews)) {
        classRoot.push(classes.borderInPreview)
    }
    if (tally.isActive()) {
        if (!tally.isPatched()) {
            classHead.push(classes.bgUnpatched)
        } else if (programs && tally.isIn(programs)) {
            classHead.push(classes.bgInProgram)
        } else if (previews && tally.isIn(previews)) {
            classHead.push(classes.bgInPreview)
        }
    }

    return (<>
        <Paper className={classRoot.join(" ")} data-testid={`tally-${tally.name}`}>
            <div className={classHead.join(" ")}><>
                <div className={classes.tallyHeadTitle}>{tally.name}</div>
                <TallyMenu className={classes.tallyHeadIcon} tally={tally} />
            </></div>
            <div className={classes.tallyBody}>
                <ChannelSelector defaultSelect={tally.channelId} channels={channels} onChange={value => patchTally(tally, value)} />
            </div>
            <div className={classes.tallyFoot + (tally.isActive() && tally.isMissing() ? " " + classes.tallyFootMissing : "")}>
                {tally.isActive() ? (<>
                    <div className={classes.tallyFootLeft}>{ tally.isMissing() ? "missing": "connected" }</div>
                    <div className={classes.tallyFootRight}>{tally.address}:{tally.port}</div>
                </>) : "disconnected"}
            </div>
        </Paper>
    </>)
}


export default Tally;
