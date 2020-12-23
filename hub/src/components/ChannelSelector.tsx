import { makeStyles, Select } from "@material-ui/core";
import React, { useState } from "react";
import Channel from '../domain/Channel'

const useStyles = makeStyles(theme => ({
    root: {
        display: "block",
        overflow: "hidden",
        marginBottom: theme.spacing(2),
    },
    select: {
        paddingTop: theme.spacing(1),
    },
}))

type ChannelSelectorProps = {
    channels?: Channel[]
    defaultSelect?: string
    onChange?: (value: string|null) => void
}

const ChannelSelector = ({channels, defaultSelect, onChange} : ChannelSelectorProps) => {
    channels = channels || []
    const [value, setValue] = useState(defaultSelect)
    const classes = useStyles()

    const handleValueChange = (e) => {
        let val = e.target.value.toString()
        if (val === "") { val = null }

        setValue(val)
        if (onChange) {
            onChange(val)
        }
    }

    let optionFound = value === null

    return (<Select native autoWidth={true} className={classes.root} classes={{ select: classes.select }} value={value || ""} onChange={handleValueChange}>
        <option value="" key={null}>(unpatched)</option>
        {channels.map(c => {
            if (c.id === value) {
                optionFound = true
            }
            return <option key={c.id} value={c.id}>{c.name || `Channel ${c.id}`}</option>
        })}
        { !optionFound && value !== undefined ? (<option key={value} value={value}>Channel {value}</option>) : "" }
    </Select>)
}

export default ChannelSelector;
