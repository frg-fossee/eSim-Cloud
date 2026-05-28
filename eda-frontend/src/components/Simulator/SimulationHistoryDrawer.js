/**
 * SimulationHistoryDrawer
 *
 * A MUI v4 Drawer (anchored right, width 380 px) that lists past simulation
 * runs for the currently saved circuit.
 *
 * ── API endpoint ────────────────────────────────────────────────────────────
 *   GET /api/simulation/history/<save_id>/<version>/<branch>/<sim>
 *   Defined in simulationAPI/urls.py (line 17) → SimulationResults view.
 *   Requires authentication (IsAuthenticated permission class).
 *
 * ── Expected JSON shape (array) ─────────────────────────────────────────────
 *   [
 *     {
 *       "id": <int>,
 *       "simulation_type": <str | null>,   // e.g. "Transient", "DcSolver" …
 *       "simulation_time": <ISO-8601 str>, // auto_now_add from the model
 *       "task": { "task_id": <uuid>, "task_time": <ISO-8601 str>, "file": [] },
 *       "schematic": { "save_id": <uuid>, "name": <str>, ... },
 *       "owner": <int | null>,
 *       "netlist": <str>,
 *       "result": <object | null>          // Celery task result dict.
 *                                          // On failure: { "fail": "...", "error_help": {...} }
 *                                          // On success: { "graph": "true"|"false", "data": [...] }
 *     },
 *     …
 *   ]
 *
 * ── Auth token retrieval pattern ────────────────────────────────────────────
 *   Matches the exact pattern in schematicEditorActions.js:
 *     const token = store.getState().authReducer.token
 *     if (token) { config.headers.Authorization = `Token ${token}` }
 *
 * ── Responsive width ────────────────────────────────────────────────────────
 *   Follows the same breakpoint pattern as RightSidebar.js (theme.breakpoints).
 *   380 px on desktop, full screen width on mobile.
 */
import React, { useEffect, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'
import CloseIcon from '@material-ui/icons/Close'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import ErrorIcon from '@material-ui/icons/Error'
import HistoryIcon from '@material-ui/icons/History'
import MuiAlert from '@material-ui/lab/Alert'
import Skeleton from '@material-ui/lab/Skeleton'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { useSelector } from 'react-redux'
import api from '../../utils/Api'
import store from '../../redux/store'

// ── Constants ────────────────────────────────────────────────────────────────
const DRAWER_WIDTH = 380
// We always request all sim types from the history endpoint.
// The <str:sim> segment accepts any simulation type string; 'NgSpiceSimulator'
// is the default used by the standalone Simulator page — but SimulationResults
// view simply filters by it. Passing 'NgSpiceSimulator' gives the broadest set
// for a schematic that may have run multiple analysis types.
const SIM_TYPE_PARAM = 'NgSpiceSimulator'

// ── Styles ──────────────────────────────────────────────────────────────────
const useStyles = makeStyles((theme) => ({
  /** The drawer paper element — width adapts per breakpoint. */
  drawerPaper: {
    width: DRAWER_WIDTH,
    [theme.breakpoints.down('xs')]: {
      width: '100vw'
    },
    overflowX: 'hidden'
  },

  /** Fixed header row with title + close button. */
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1.5, 2),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    flexShrink: 0
  },

  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1)
  },

  headerIcon: {
    marginRight: theme.spacing(0.75),
    verticalAlign: 'middle'
  },

  /** Scrollable body below the header. */
  body: {
    flex: 1,
    overflowY: 'auto',
    padding: theme.spacing(1)
  },

  /** Centre-aligned message panels (empty state, info, etc.) */
  centeredBox: {
    padding: theme.spacing(3, 2),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2)
  },

  /** Individual simulation run row. */
  listItem: {
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(0.5),
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.action.hover
    }
  },

  /** Success icon — green. */
  successIcon: {
    color: theme.palette.success
      ? theme.palette.success.main
      : '#4caf50' // fallback for MUI v4 without palette.success
  },

  /** Failure icon — red. */
  failureIcon: {
    color: theme.palette.error.main
  },

  /** Subtle secondary line for simulation type. */
  simType: {
    color: theme.palette.text.secondary,
    fontStyle: 'italic'
  },

  /** Skeleton rows while loading. */
  skeleton: {
    margin: theme.spacing(1, 0)
  }
}))

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns a human-readable date/time string.
 * Example: "27 May 2026, 3:42 PM"
 */
function formatDateTime (isoString) {
  if (!isoString) return '—'
  try {
    return new Date(isoString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  } catch (_) {
    return isoString
  }
}

/**
 * Maps the raw simulation_type string to a readable label.
 * Falls back to the raw string if not mapped.
 */
function formatSimType (simType) {
  const map = {
    DcSolver: 'DC Solver',
    DcSweep: 'DC Sweep',
    Transient: 'Transient',
    Ac: 'AC Analysis',
    tfAnalysis: 'Transfer Function',
    noiseAnalysis: 'Noise Analysis',
    NgSpiceSimulator: 'NgSpice'
  }
  return (simType && map[simType]) ? map[simType] : (simType || 'Unknown')
}

/**
 * Returns true when the history item's result indicates a failure.
 * A failure is detected by the presence of the 'fail' key in result.
 */
function isFailedResult (item) {
  return !!(item.result && typeof item.result === 'object' && item.result.fail)
}

// ── Loading skeleton ─────────────────────────────────────────────────────────
function HistorySkeletonRows ({ classes }) {
  return (
    <List disablePadding>
      {[0, 1, 2].map((i) => (
        <ListItem key={i} disableGutters>
          <ListItemIcon>
            <Skeleton variant="circle" width={24} height={24} />
          </ListItemIcon>
          <ListItemText
            primary={<Skeleton variant="text" width="60%" className={classes.skeleton} />}
            secondary={<Skeleton variant="text" width="40%" />}
          />
        </ListItem>
      ))}
    </List>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * SimulationHistoryDrawer
 *
 * Right-anchored MUI v4 Drawer that shows past simulation runs for the saved
 * circuit identified by saveId / version / branch.
 *
 * @param {object}   props
 * @param {boolean}  props.open           — controls drawer visibility
 * @param {function} props.onClose        — called to close the drawer
 * @param {string}   props.saveId         — UUID of the current saved schematic (or null)
 * @param {string}   props.version        — version string of the schematic (or null)
 * @param {string}   props.branch         — branch string of the schematic (or null)
 * @param {function} props.onSelectResult — called with the full history item object on row click
 */
export default function SimulationHistoryDrawer ({
  open,
  onClose,
  saveId,
  version,
  branch,
  onSelectResult
}) {
  const classes = useStyles()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('xs'))

  // ── Redux selectors ──────────────────────────────────────────────────────
  // Auth state — check isAuthenticated flag (same approach as other components).
  const isAuthenticated = useSelector((state) => state.authReducer.isAuthenticated)

  // ── Local state ──────────────────────────────────────────────────────────
  /** 'idle' | 'loading' | 'success' | 'error' */
  const [fetchState, setFetchState] = useState('idle')
  const [historyItems, setHistoryItems] = useState([])
  const [fetchError, setFetchError] = useState(null)

  // ── Fetch logic ──────────────────────────────────────────────────────────
  /**
   * Builds the request config following the exact auth token pattern from
   * schematicEditorActions.js:
   *   const token = store.getState().authReducer.token
   *   if (token) { config.headers.Authorization = `Token ${token}` }
   */
  const fetchHistory = useCallback(() => {
    if (!saveId) return

    setFetchState('loading')
    setFetchError(null)
    setHistoryItems([])

    // Auth token retrieved from Redux store — matches schematicEditorActions.js pattern.
    const token = store.getState().authReducer.token
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    }
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }

    // URL: /api/simulation/history/<save_id>/<version>/<branch>/<sim>
    const url = `simulation/history/${saveId}/${version}/${branch}/${SIM_TYPE_PARAM}`

    api.get(url, config)
      .then((res) => {
        setHistoryItems(Array.isArray(res.data) ? res.data : [])
        setFetchState('success')
      })
      .catch((err) => {
        console.error('[SimulationHistoryDrawer] fetch error:', err)
        setFetchError(
          (err.response && err.response.data && JSON.stringify(err.response.data)) ||
          err.message ||
          'Unknown error'
        )
        setFetchState('error')
      })
  }, [saveId, version, branch])

  // Fetch whenever the drawer opens (and saveId is available).
  useEffect(() => {
    if (open && saveId) {
      fetchHistory()
    }
    // Reset when drawer closes so next open starts fresh.
    if (!open) {
      setFetchState('idle')
      setHistoryItems([])
      setFetchError(null)
    }
  }, [open, saveId, fetchHistory])

  // ── Render helpers ───────────────────────────────────────────────────────
  const renderBody = () => {
    // Case 1: User is explicitly not authenticated.
    if (isAuthenticated === false) {
      return (
        <div className={classes.centeredBox}>
          <MuiAlert severity="warning">
            Login to view simulation history.
          </MuiAlert>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => {
              // Navigate to /login using Hash router path (see App.js).
              window.location.href = '#/login'
            }}
          >
            Login
          </Button>
        </div>
      )
    }

    // Case 2: Circuit is not saved — saveId is null/undefined/empty.
    if (!saveId) {
      return (
        <div className={classes.centeredBox}>
          <MuiAlert severity="info">
            Save your circuit first to see simulation history.
          </MuiAlert>
        </div>
      )
    }

    // Case 3: Loading — show 3 skeleton rows (better UX than spinner).
    if (fetchState === 'loading' || fetchState === 'idle') {
      return (
        <div className={classes.body}>
          <HistorySkeletonRows classes={classes} />
        </div>
      )
    }

    // Case 4: API error.
    if (fetchState === 'error') {
      return (
        <div className={classes.centeredBox}>
          <MuiAlert severity="error">
            Failed to load simulation history. {fetchError ? `(${fetchError})` : ''}
          </MuiAlert>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={fetchHistory}
          >
            Retry
          </Button>
        </div>
      )
    }

    // Case 5: Success but empty list.
    if (fetchState === 'success' && historyItems.length === 0) {
      return (
        <div className={classes.body}>
          <Typography variant="body2" color="textSecondary" align="center" style={{ marginTop: 16 }}>
            No simulation history yet for this circuit.
          </Typography>
        </div>
      )
    }

    // Case 6: Success with results.
    return (
      <div className={classes.body}>
        <List disablePadding>
          {historyItems.map((item, idx) => {
            const failed = isFailedResult(item)
            return (
              <React.Fragment key={item.id || idx}>
                <ListItem
                  className={classes.listItem}
                  button
                  onClick={() => {
                    if (typeof onSelectResult === 'function') {
                      onSelectResult(item)
                    }
                    onClose()
                  }}
                  aria-label={`Simulation run on ${formatDateTime(item.simulation_time)}`}
                >
                  {/* Success / failure icon */}
                  <ListItemIcon>
                    {failed
                      ? <ErrorIcon className={classes.failureIcon} titleAccess="Simulation failed" />
                      : <CheckCircleIcon className={classes.successIcon} titleAccess="Simulation succeeded" />
                    }
                  </ListItemIcon>

                  {/* Date + simulation type */}
                  <ListItemText
                    primary={
                      <Typography variant="body2">
                        {formatDateTime(item.simulation_time)}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" className={classes.simType}>
                        {formatSimType(item.simulation_type)}
                        {failed ? ' — failed' : ''}
                      </Typography>
                    }
                  />

                  {/* Optional secondary action area (reserved for future use) */}
                  <ListItemSecondaryAction />
                </ListItem>
                {idx < historyItems.length - 1 && <Divider component="li" />}
              </React.Fragment>
            )
          })}
        </List>
      </div>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="temporary"
      ModalProps={{ keepMounted: true }} // Better open performance on mobile (matches RightSidebar.js)
      classes={{ paper: classes.drawerPaper }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className={classes.header}>
        <div className={classes.headerTitle}>
          <HistoryIcon className={classes.headerIcon} fontSize="small" />
          <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
            Simulation History
          </Typography>
        </div>
        <IconButton
          aria-label="Close simulation history drawer"
          onClick={onClose}
          size="small"
          style={{ color: 'inherit' }}
        >
          <CloseIcon />
        </IconButton>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      {renderBody()}
    </Drawer>
  )
}

SimulationHistoryDrawer.propTypes = {
  /** Controls whether the drawer is open. */
  open: PropTypes.bool.isRequired,
  /** Called to request that the drawer be closed. */
  onClose: PropTypes.func.isRequired,
  /** UUID of the currently saved schematic. Pass null when unsaved. */
  saveId: PropTypes.string,
  /** Version string of the schematic. */
  version: PropTypes.string,
  /** Branch string of the schematic. */
  branch: PropTypes.string,
  /**
   * Called with the full history item object when the user clicks a row.
   * The parent component should use this to display the historical result.
   */
  onSelectResult: PropTypes.func
}

SimulationHistoryDrawer.defaultProps = {
  saveId: null,
  version: null,
  branch: null
}
