import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import SentimentVeryDissatisfiedIcon from '@material-ui/icons/SentimentVeryDissatisfied'
import { Typography } from '@material-ui/core'

const useStyles = makeStyles({
  text: {
    display: 'flex',
    alignItems: 'center',
  },
})

export const Loser = ({ currentBid, value }) => {
  const classes = useStyles()

  if (currentBid === '0') return null
  return (
    <Typography className={classes.text} variant="subtitle1" color="error" component="p">
      <SentimentVeryDissatisfiedIcon color="error" /> You have been overbid{' '}
      {value !== '0' && <span>({value} ETH)</span>}
    </Typography>
  )
}
