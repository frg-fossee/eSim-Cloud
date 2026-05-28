import React, { useState } from 'react'
import PropTypes from 'prop-types'
import {
  List,
  ListItem,
  Collapse,
  Button,
  Typography,
  IconButton,
  Snackbar,
  Box,
  CircularProgress,
  Switch,
  FormControlLabel
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import RefreshIcon from '@material-ui/icons/Refresh'
import FileCopyIcon from '@material-ui/icons/FileCopy'
import GetAppIcon from '@material-ui/icons/GetApp'
import CloseIcon from '@material-ui/icons/Close'
import AceEditor from 'react-ace'
import 'brace/theme/monokai'
import 'brace/theme/github'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { setNetlist } from '../../redux/actions/index'

import { buildNetlistFromGraph, sanitizeNetlistForExport } from './Helper/NetlistExporter'

const useStyles = makeStyles((theme) => ({
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(0.5),
    justifyContent: 'center',
    padding: theme.spacing(1)
  },
  footer: {
    padding: theme.spacing(1),
    textAlign: 'center',
    color: '#8c8c8c'
  },
  header: {
    margin: '5px'
  }
}))

export default function NetlistPreviewPanel ({ gridRef }) {
  const classes = useStyles()
  const [open, setOpen] = useState(false)
  const [netlistText, setNetlistText] = useState('// Netlist not generated yet.\n// Click Refresh to generate.')
  const [snackOpen, setSnackOpen] = useState(false)
  const [snackMessage, setSnackMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSpinner, setShowSpinner] = useState(false)
  const [themeState, setThemeState] = useState({ checkedA: false })

  const schSave = useSelector(state => state.saveSchematicReducer)
  const projectName = schSave.title || 'Untitled_Schematic'
  const history = useHistory()
  const dispatch = useDispatch()

  const handleThemeChange = (event) => {
    setThemeState({ ...themeState, [event.target.name]: event.target.checked })
  }

  const handleToggle = () => {
    setOpen(!open)
  }

  const handleRefresh = () => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setShowSpinner(true)
    }, 100)

    setTimeout(() => {
      if (!gridRef || !gridRef.current || !gridRef.current.graph) {
        setNetlistText('// Error: Graph not loaded yet.')
      } else {
        const graph = gridRef.current.graph
        try {
          const result = buildNetlistFromGraph(graph)
          setNetlistText(result.main)
          setSnackMessage('Netlist refreshed successfully!')
          setSnackOpen(true)
        } catch (e) {
          setNetlistText('// Error generating netlist:\n// ' + e.message)
        }
      }
      clearTimeout(timer)
      setShowSpinner(false)
      setIsLoading(false)
    }, 0)
  }

  const handleCopy = () => {
    if (!navigator.clipboard) {
      setSnackMessage('Clipboard API not available')
      setSnackOpen(true)
      return
    }
    navigator.clipboard.writeText(netlistText).then(() => {
      setSnackMessage('Copied to clipboard!')
      setSnackOpen(true)
    }).catch(err => {
      setSnackMessage('Failed to copy: ' + err.message)
      setSnackOpen(true)
    })
  }

  const handleDownload = () => {
    if (!netlistText || netlistText.trim() === '' || netlistText.startsWith('// Netlist not generated yet') || netlistText.startsWith('// Error:')) {
      setSnackMessage('Cannot download empty or invalid netlist.')
      setSnackOpen(true)
      return
    }
    const element = document.createElement('a')
    const file = new Blob([netlistText], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `${projectName}.cir`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleSendToSimulator = () => {
    const sanitized = sanitizeNetlistForExport(netlistText)
    dispatch(setNetlist(sanitized))
    setSnackMessage('Netlist loaded in Simulator')
    setSnackOpen(true)
    history.push('/simulator/ngspice')
  }

  const handleCloseSnack = (event, reason) => {
    if (reason === 'clickaway') return
    setSnackOpen(false)
  }

  // Calculate stats
  const lineCount = netlistText.split('\n').length
  const charCount = netlistText.length

  return (
    <>
      <List>
        <ListItem button onClick={handleToggle} divider>
          <h2 className={classes.header}>Netlist Preview</h2>
          <Box flexGrow={1} />
          {open ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Box className={classes.actions}>
            <Button
              size="small"
              onClick={handleRefresh}
              variant="outlined"
              color="primary"
              disabled={isLoading}
            >
              {showSpinner ? <CircularProgress size={24} /> : (
                <>
                  <RefreshIcon style={{ marginRight: 8 }} />
                  Refresh
                </>
              )}
            </Button>
            <Button
              size="small"
              startIcon={<FileCopyIcon />}
              onClick={handleCopy}
              variant="outlined"
            >
              Copy
            </Button>
            <Button
              size="small"
              startIcon={<GetAppIcon />}
              onClick={handleDownload}
              variant="outlined"
            >
              Download
            </Button>
            <Button
              size="small"
              onClick={handleSendToSimulator}
              variant="contained"
              color="primary"
            >
              Send to Simulator
            </Button>
            <FormControlLabel
              style={{ marginLeft: 'auto' }}
              control={<Switch checked={themeState.checkedA} color="primary" onChange={handleThemeChange} name="checkedA" size="small" />}
              label={<Typography variant="caption">Light Mode</Typography>}
            />
          </Box>
          <AceEditor
            style={{ width: '100%', minHeight: '300px', height: '300px' }}
            value={netlistText}
            theme={themeState.checkedA ? 'github' : 'monokai'}
            readOnly={true}
            mode="text"
            editorProps={{
              $blockScrolling: true
            }}
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              enableSnippets: true,
              fontSize: 14,
              showPrintMargin: false
            }}
          />
          <Typography variant="caption" display="block" className={classes.footer}>
            Line Count: {lineCount} | Char Count: {charCount}
          </Typography>
        </Collapse>
      </List>

      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        open={snackOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnack}
        message={snackMessage}
        action={
          <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseSnack}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </>
  )
}

NetlistPreviewPanel.propTypes = {
  gridRef: PropTypes.object.isRequired
}
