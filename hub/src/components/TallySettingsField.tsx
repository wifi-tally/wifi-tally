import { FormLabel, makeStyles } from '@material-ui/core'
import React from 'react'
import ChipLikeButton from './ChipLikeButton'

const useStyle = makeStyles((theme) => ({
  label: {
    marginBottom: theme.spacing(2),
    color: theme.palette.common.white,
  },
  labels: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
  }
}))
type TallySettingsFieldProps = {
  label: string
  testId: string
  isDefault: boolean
  children?: React.ReactNode
  className?: string
  onChange: (isDefault: boolean) => void
}

function TallySettingsField({label, testId, isDefault, children, className, onChange}:TallySettingsFieldProps) {
  const classes = useStyle()

  return <div className={className}>
    <div className={classes.labels}>
      <FormLabel className={classes.label}>{label}</FormLabel>
      <ChipLikeButton data-testid={`${testId}-toggle`} size="small" selected={isDefault} onClick={() => onChange(!isDefault)}>{isDefault ? "default" : "custom"}</ChipLikeButton>
    </div>
    {children}
  </div>
}

export default TallySettingsField