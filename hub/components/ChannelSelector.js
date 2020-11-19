import React, { useState } from "react";

const ChannelSelector = ({className, channels, defaultSelect, onChange}) => {
    channels = channels || []
    const [value, setValue] = useState(defaultSelect || null)

    const handleValueChange = (e) => {
        let val = e.target.value.toString()
        if (val === "") { val = null }

        setValue(val)
        if (onChange) {
            onChange(val)
        }
    }

    let optionFound = value === null

    return (<select className={className} value={value || ""} onChange={handleValueChange}>
        <option value="" key={null}>(unpatched)</option>
        {
            channels.map(c => {
                if (c.id === value) {
                    optionFound = true
                }
                return <option key={c.id} value={c.id}>{c.name || `Channel ${c.id}`}</option>
            })
        }
        { !optionFound ? (<option key={value} value={value}>Channel {value}</option>) : "" }
    </select>)
}

export default ChannelSelector;
