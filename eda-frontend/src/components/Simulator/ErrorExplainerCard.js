/**
 * @fileoverview ErrorExplainerCard — displays a friendly breakdown of a failed
 * ngspice simulation error: a one-line summary, actionable hints, and
 * collapsible technical details (raw error codes). Optionally surfaces an
 * "Ask AI About This Error" button that triggers the AI chat panel via a
 * window CustomEvent.
 */
import React from 'react'
import PropTypes from 'prop-types'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Button from '@material-ui/core/Button'
import ChatBubbleOutlineIcon from '@material-ui/icons/ChatBubbleOutline'
import {
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  /** The outer card has a 4px solid left border using the error palette colour. */
  card: {
    borderLeft: `4px solid ${theme.palette.error.main}`,
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.error.light
      ? 'rgba(244,67,54,0.08)'
      : '#fff3f3'
  },
  /** Bold summary line at the top of the card. */
  summary: {
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.error.dark
  },
  /** Compact list of hints rendered as bullet points. */
  hintList: {
    paddingTop: 0,
    paddingBottom: 0
  },
  /** Each hint entry — tight padding so the list stays compact. */
  hintItem: {
    paddingTop: theme.spacing(0.25),
    paddingBottom: theme.spacing(0.25)
  },
  /** Monospace style for the technical error codes inside the accordion. */
  codeText: {
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontSize: '0.8rem'
  },
  /** Expansion panel for technical details — no extra chrome. */
  accordion: {
    boxShadow: 'none',
    backgroundColor: 'transparent',
    '&:before': {
      display: 'none'
    }
  },
  /** Tight padding inside the expanded panel. */
  accordionDetails: {
    display: 'block',
    paddingTop: 0
  },
  /** Container for the "Ask AI" button — aligned to the right. */
  askAiRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(1)
  }
}))

/**
 * ErrorExplainerCard
 *
 * A Material-UI v4 card that presents a structured breakdown of a failed
 * ngspice simulation.  The backend's `error_help` object is mapped directly
 * to the three props below.
 *
 * @param {object}   props
 * @param {string}   props.summary   — Short sentence describing what went wrong.
 * @param {string[]} props.hints     — Ordered list of actionable fix suggestions.
 * @param {string[]} props.codes     — Raw error codes / keywords from the parser.
 * @param {Function} [props.onAskAI] — Called when the user clicks "Ask AI About
 *                                     This Error".  If omitted the button is hidden.
 */
export default function ErrorExplainerCard ({ summary, hints, codes, onAskAI }) {
  const classes = useStyles()

  return (
    <Card className={classes.card} variant="outlined">
      <CardContent>
        {/* ── Summary ────────────────────────────────────────────────── */}
        <Typography variant="subtitle1" className={classes.summary} gutterBottom>
          {summary}
        </Typography>

        {/* ── Hints ──────────────────────────────────────────────────── */}
        {hints && hints.length > 0 && (
          <List dense disablePadding className={classes.hintList}>
            {hints.map((hint, idx) => (
              <ListItem key={idx} className={classes.hintItem} disableGutters>
                {/* Unicode bullet prefix keeps dependency count at zero. */}
                <ListItemText primary={`• ${hint}`} />
              </ListItem>
            ))}
          </List>
        )}

        {/* ── Technical details (collapsible) ────────────────────────── */}
        <ExpansionPanel className={classes.accordion} elevation={0}>
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="error-technical-details-content"
            id="error-technical-details-header"
          >
            <Typography variant="body2" color="textSecondary">
              Technical Details
            </Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className={classes.accordionDetails}>
            {codes && codes.length > 0
              ? codes.map((code, idx) => (
                <Typography
                  key={idx}
                  variant="body2"
                  className={classes.codeText}
                  style={{ fontFamily: 'monospace' }}
                >
                  {code}
                </Typography>
              ))
              : (
                <Typography variant="body2" color="textSecondary">
                  No additional error codes available.
                </Typography>
              )}
          </ExpansionPanelDetails>
        </ExpansionPanel>

        {/* ── Ask AI button (only when callback is provided) ─────────── */}
        {typeof onAskAI === 'function' && (
          <div className={classes.askAiRow}>
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              startIcon={<ChatBubbleOutlineIcon />}
              onClick={onAskAI}
            >
              Ask AI About This Error
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

ErrorExplainerCard.propTypes = {
  /** Short sentence describing what went wrong. */
  summary: PropTypes.string.isRequired,
  /** Ordered list of actionable fix suggestions. */
  hints: PropTypes.arrayOf(PropTypes.string),
  /** Raw error codes / keywords from the backend parser. */
  codes: PropTypes.arrayOf(PropTypes.string),
  /**
   * Optional callback fired when the user clicks "Ask AI About This Error".
   * When omitted the button is not rendered at all.
   */
  onAskAI: PropTypes.func
}

ErrorExplainerCard.defaultProps = {
  hints: [],
  codes: []
}
