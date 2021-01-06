import { makeStyles, FormHelperText, Tooltip } from '@material-ui/core'
import React, { useState } from 'react'
import ColorSchemes, { ColorSchemeId } from '../../tally/ColorScheme'
import ChipLikeButton from '../ChipLikeButton'

const useStyle = makeStyles(theme => ({
  root: {
    "&:hover $previewContainer": {
      opacity: 1
    }
  },
  selection: {
    display: "flex",
    verticalAlign: "center",
    justifyContent: "space-between",
  },
  buttonGroup: {
    display: "inline-block",
    marginBottom: theme.spacing(1),
  },
  button: {
    marginRight: theme.spacing(1),
  },
  preview: {
    padding: theme.spacing(1, 1.6),
    display: "inline-block",
    height: "1em",
    width: "1em",
    verticalAlign: "middle",
    boxSizing: "content-box",
    border: "solid 1px " + theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
    "&:not(:last-child)": {
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      borderRight: "none",
    },
    "&:not(:first-child)": {
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
    },
  },
  previewContainer: {
    opacity: 1,
    transition: "opacity .5s"
  },
  previewContainerDim: {
    opacity: 0,
  }
}))

type ColorSchemeSelectorProps = {
  value: ColorSchemeId
  onChange: (value: ColorSchemeId) => void
  disabled?: boolean
  testId: string
}

function ColorSchemeSelector({value, onChange, disabled, testId}: ColorSchemeSelectorProps) {
  const classes = useStyle()
  const schemes = ColorSchemes.getAll()
  const [focusTracker, setFocusTracker] = useState(new Map(schemes.map(scheme => [scheme.id, false])))
  const isFocussed = !!Array.from(focusTracker.values()).find(bool => bool)
  const selectedScheme = value !== undefined ? ColorSchemes.getById(value) : undefined

  const handleFocus = (scheme) => {
    const newTracker = new Map(focusTracker)
    newTracker.set(scheme.id, true)
    setFocusTracker(newTracker)
  }
  const handleBlur = (scheme) => {
    const newTracker = new Map(focusTracker)
    newTracker.set(scheme.id, false)
    setFocusTracker(newTracker)
  }

  return (
    <div className={classes.root} data-testid={testId} data-value={value}>
      <div className={classes.selection}>
        <div className={classes.buttonGroup}>
          {schemes.map(scheme => {
            const isSelected = scheme.id === value
            return (<ChipLikeButton 
              className={classes.button}
              data-testid={`${testId}-${scheme.id}`}
              data-value={value}
              selected={isSelected}
              onClick={() => {onChange(scheme.id)}}
              onFocus={() => {handleFocus(scheme)}}
              onBlur={() => {handleBlur(scheme)}}
              disabled={disabled}
              key={scheme.id}>
                {scheme.name}
              </ChipLikeButton>)
          })}
        </div>
        { selectedScheme && (
          <div className={classes.previewContainer + (isFocussed ? "" : (" " + classes.previewContainerDim))}>
            <Tooltip title="On-Air color"><span className={classes.preview} style={{backgroundColor: selectedScheme.program.toCss()}}></span></Tooltip>
            <Tooltip title="Preview color"><span className={classes.preview} style={{backgroundColor: selectedScheme.preview.toCss()}}></span></Tooltip>
          </div>
        )}
      </div>
      { selectedScheme && selectedScheme.description ? (<FormHelperText disabled={true}>{selectedScheme.description}</FormHelperText>) : "" }
    </div>
  )
}

export default ColorSchemeSelector