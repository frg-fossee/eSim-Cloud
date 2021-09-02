/* eslint-disable camelcase */
import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'
import Canvg from 'canvg'
import {
  IconButton,
  Tooltip,
  Snackbar,
  Select,
  FormControl,
  InputLabel
} from '@material-ui/core'
import AddBoxOutlinedIcon from '@material-ui/icons/AddBoxOutlined'
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import UndoIcon from '@material-ui/icons/Undo'
import RedoIcon from '@material-ui/icons/Redo'
import ZoomInIcon from '@material-ui/icons/ZoomIn'
import ZoomOutIcon from '@material-ui/icons/ZoomOut'
import DeleteIcon from '@material-ui/icons/Delete'
import SettingsOverscanIcon from '@material-ui/icons/SettingsOverscan'
import PrintOutlinedIcon from '@material-ui/icons/PrintOutlined'
import BugReportOutlinedIcon from '@material-ui/icons/BugReportOutlined'
import RotateRightIcon from '@material-ui/icons/RotateRight'
import BorderClearIcon from '@material-ui/icons/BorderClear'
import { makeStyles } from '@material-ui/core/styles'
import CloseIcon from '@material-ui/icons/Close'
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined'
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser'
import ClearAllIcon from '@material-ui/icons/ClearAll'
import CreateNewFolderOutlinedIcon from '@material-ui/icons/CreateNewFolderOutlined'
import ImageOutlinedIcon from '@material-ui/icons/ImageOutlined'
import SystemUpdateAltOutlinedIcon from '@material-ui/icons/SystemUpdateAltOutlined'
import LibraryAddRoundedIcon from '@material-ui/icons/LibraryAddRounded'
import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Icon from '@material-ui/core/Icon'
import { Link as RouterLink } from 'react-router-dom'
import queryString from 'query-string'
import { RotateLeft } from '@material-ui/icons'
import AddPhotoAlternateIcon from '@material-ui/icons/AddPhotoAlternate'
import { fetchRole } from '../../redux/actions/authActions'

import {
  NetlistModal,
  HelpScreen,
  ImageExportDialog,
  OpenSchDialog,
  SelectLibrariesModal
} from './ToolbarExtension'
import {
  ZoomIn,
  ZoomOut,
  ZoomAct,
  DeleteComp,
  PrintPreview,
  ErcCheck,
  Rotate,
  GenerateNetList,
  Undo,
  Redo,
  Save,
  ClearGrid,
  RotateACW
} from './Helper/ToolbarTools'
import {
  toggleSimulate,
  closeCompProperties,
  setSchXmlData,
  saveSchematic,
  openLocalSch,
  saveToGallery
} from '../../redux/actions/index'
import CreateProject from '../Project/CreateProject'
import api from '../../utils/Api'
import { importSCHFile } from './Helper/KiCadFileUtils'
import SubmitResults from '../LTI/SubmitResults'

// Req for Development
// import CodeIcon from '@material-ui/icons/Code'
// // eslint-disable-next-line
// import { dispGraph } from './Helper/ToolbarTools'

const useStyles = makeStyles((theme) => ({
  menuButton: {
    marginLeft: 'auto',
    marginRight: theme.spacing(0),
    padding: theme.spacing(1),
    [theme.breakpoints.up('lg')]: {
      display: 'none'
    }
  },
  tools: {
    padding: theme.spacing(1),
    margin: theme.spacing(0, 0.5),
    color: '#262626'
  },
  pipe: {
    fontSize: '1.45rem',
    color: '#d6c4c2',
    margin: theme.spacing(0, 1.5)
  }
}))

// Notification snackbar to give alert messages
function SimpleSnackbar ({ open, close, message }) {
  return (
    <div>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        open={open}
        autoHideDuration={5000}
        onClose={close}
        message={message}
        action={
          <React.Fragment>
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={close}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />
    </div>
  )
}

SimpleSnackbar.propTypes = {
  open: PropTypes.bool,
  close: PropTypes.func,
  message: PropTypes.string
}

export default function SchematicToolbar ({
  mobileClose,
  gridRef,
  ltiSimResult,
  setLtiSimResult
}) {
  const classes = useStyles()
  const netfile = useSelector((state) => state.netlistReducer)
  const auth = useSelector((state) => state.authReducer)
  const schSave = useSelector((state) => state.saveSchematicReducer)

  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(fetchRole())
  }, [dispatch])
  // Netlist Modal Control
  const [open, setOpen] = React.useState(false)
  const [netlist, genNetlist] = React.useState('')
  const [ltiId, setLtiId] = React.useState('')
  const [ltiUserId, setLtiUserId] = React.useState('')
  const [ltiNonce, setLtiNonce] = React.useState('')
  const [submissionDetails, setSubmissionDetails] = React.useState('')
  const [submit, setSubmit] = React.useState(false)
  const [results, setResults] = React.useState(false)
  const [submitMessage, setSubmitMessage] = React.useState('')
  const [saveId, setSaveId] = React.useState(null)
  const [consumerKey, setConsumerKey] = React.useState('')
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [initalSch, setIntialSch] = React.useState('')
  const [modelSch, setModelSch] = React.useState('')
  const [id, setId] = React.useState('')
  // eslint-disable-next-line
  const [scored, setScored] = React.useState(false)
  const [ltiSimHistory, setLtiSimHistory] = React.useState([])
  const [activeSimResult, setActiveSimResult] = React.useState(null)

  useEffect(() => {
    if (ltiSimResult && ltiId) {
      api
        .get(`simulation/history/lti/${ltiId}`)
        .then((res) => {
          res.data.map((ele, index) => {
            ele.simulation_time = new Date(ele.simulation_time)
            return 0
          })
          setLtiSimHistory(res.data)
          setActiveSimResult(res.data[res.data.length - 1].id)
        })
        .catch((err) => {
          console.log(err)
        })
      console.log('SIM RESULTS FOUND')
      setLtiSimResult(false)
    }
    // eslint-disable-next-line
  }, [ltiSimResult]);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }
  const [shortCircuit, setshortCircuit] = React.useState(false)

  const handleShortClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setshortCircuit(false)
  }

  const handleSave = (version, newSave, save_id) => {
    if (!newSave) {
      window.location =
        '#/editor?id=' +
        window.location.href.split('id=')[1].substr(0, 36) +
        '&version=' +
        version +
        '&branch=' +
        window.location.href.split('branch=')[1].substr(0)
      window.location.reload()
    } else {
      window.location =
        '#/editor?id=' + save_id + '&version=' + version + '&branch=master'
      window.location.reload()
    }
  }

  const handleSaveForLTI = (version, newSave, save_id) => {
    setSaveId(save_id)
  }

  const handleChangeSim = (e) => {
    if (e.target.value === null) {
      setActiveSimResult(null)
    } else {
      setActiveSimResult(e.target.value)
    }
    setAnchorEl(null)
  }

  const handleClickOpen = () => {
    const compNetlist = GenerateNetList()
    let printToPlotControlBlock = ''
    const ctrlblk = netfile.controlBlock.split('\n')
    for (let line = 0; line < ctrlblk.length; line++) {
      if (ctrlblk[line].includes('print')) {
        printToPlotControlBlock += 'plot '
        let cleanCode = ctrlblk[line].split('print ')[1]
        cleanCode = cleanCode.split('>')[0]
        printToPlotControlBlock += cleanCode + '\n'
      } else {
        printToPlotControlBlock += ctrlblk[line] + '\n'
      }
    }
    const netlist =
      netfile.title +
      '\n\n' +
      compNetlist.models +
      '\n' +
      compNetlist.main +
      '\n' +
      netfile.controlLine +
      '\n' +
      printToPlotControlBlock +
      '\n'

    const checkNetlist = (netlist) => {
      netlist = netlist.split('\n')
      for (let line = 0; line < netlist.length; line++) {
        const splitLine = netlist[line].split(' ')
        // Works only for components with 2 nodes
        // For multiple nodes all nodes need to be checked with each other
        if (splitLine[1] === splitLine[2] && splitLine.length >= 2) {
          setshortCircuit(true)
          return
        }
      }
      setshortCircuit(false)
    }

    checkNetlist(compNetlist.main)
    genNetlist(netlist)
    setOpen(true)
  }

  useEffect(() => {
    var url = queryString.parse(window.location.href.split('editor')[1])
    setLtiId(url.lti_id)
    setLtiNonce(url.lti_nonce)
    setLtiUserId(url.lti_user_id)
    setConsumerKey(url.consumer_key)
    setId(url.id)
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (ltiId && id) {
      api
        .get(`lti/exist/${id}`)
        .then((res) => {
          if (res.data.secret_key) {
            setScored(res.data.scored)
          }
        })
        .catch((err) => console.log(err))
    }
    // eslint-disable-next-line
  }, [ltiId]);

  useEffect(() => {
    if (consumerKey) {
      console.log(schSave)
      api
        .get(`lti/exist/${id}`)
        .then((res) => {
          if (res.data.secret_key) {
            setIntialSch(res.data.initial_schematic)
            setModelSch(res.data.model_schematic)
            setScored(res.data.scored)
          }
        })
        .catch((err) => console.log(err))
    }
    // eslint-disable-next-line
  }, [consumerKey]);

  useEffect(() => {
    if (saveId !== null) {
      const body = {
        schematic: saveId,
        ltisession: {
          id: ltiId,
          user_id: ltiUserId,
          oauth_nonce: ltiNonce
        },
        student_simulation: activeSimResult
      }
      console.log(body)
      api
        .post('lti/submit/', body)
        .then((res) => {
          console.log(res.data)
          setSubmissionDetails(res.data)
          setResults(true)
          setSubmit(true)
          setSubmitMessage(res.data.message)
        })
        .catch((err) => {
          console.log(err)
          setSubmit(true)
          setSubmitMessage(
            'There was an error while submitting. Please try again later!'
          )
        })
    }
    // eslint-disable-next-line
  }, [saveId]);

  const onSubmission = () => {
    var xml = Save()
    dispatch(setSchXmlData(xml))
    var title = schSave.title
    var description = schSave.description
    exportImage('PNG').then((res) => {
      dispatch(
        saveSchematic(
          title,
          description,
          xml,
          res,
          false,
          null,
          handleSaveForLTI,
          true
        )
      )
    })
  }

  const handleSubmitClose = () => {
    setSubmit(false)
  }

  const handleClose = () => {
    setOpen(false)
  }

  // Control Help dialog window
  const [helpOpen, setHelpOpen] = React.useState(false)

  const handleHelpOpen = () => {
    setHelpOpen(true)
  }

  const handleHelpClose = () => {
    setHelpOpen(false)
  }

  // handle Delete component
  const handleDeleteComp = () => {
    DeleteComp()
    dispatch(closeCompProperties())
  }

  // handle Notification Snackbar
  const [snacOpen, setSnacOpen] = React.useState(false)
  const [message, setMessage] = React.useState('')

  const handleSnacClick = () => {
    setSnacOpen(true)
  }

  const handleSnacClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setSnacOpen(false)
  }

  const handleMenuOnClick = (e) => {
    window.location.href = `/eda/#/editor?id=${e}&consumer_key=${consumerKey}`
    window.location.reload()
  }

  // Image Export of Schematic Diagram
  async function exportImage (type) {
    const svg = document.querySelector('#divGrid > svg').cloneNode(true)
    svg.removeAttribute('style')
    svg.setAttribute('width', gridRef.current.scrollWidth)
    svg.setAttribute('height', gridRef.current.scrollHeight)
    const canvas = document.createElement('canvas')
    canvas.width = gridRef.current.scrollWidth
    canvas.height = gridRef.current.scrollHeight
    canvas.style.width = canvas.width + 'px'
    canvas.style.height = canvas.height + 'px'
    const images = svg.getElementsByTagName('image')
    for (const image of images) {
      const data = await fetch(image.getAttribute('xlink:href')).then((v) => {
        return v.text()
      })
      image.removeAttribute('xlink:href')
      image.setAttribute(
        'href',
        'data:image/svg+xml;base64,' + window.btoa(data)
      )
    }
    const ctx = canvas.getContext('2d')
    ctx.mozImageSmoothingEnabled = true
    ctx.webkitImageSmoothingEnabled = true
    ctx.msImageSmoothingEnabled = true
    ctx.imageSmoothingEnabled = true
    const pixelRatio = window.devicePixelRatio || 1
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    return new Promise((resolve) => {
      if (type === 'SVG') {
        const svgdata = new XMLSerializer().serializeToString(svg)
        resolve('<?xml version="1.0" encoding="UTF-8"?>' + svgdata)
        return
      }
      const v = Canvg.fromString(ctx, svg.outerHTML)
      v.render().then(() => {
        let image = ''
        if (type === 'JPG') {
          const imgdata = ctx.getImageData(0, 0, canvas.width, canvas.height)
          for (let i = 0; i < imgdata.data.length; i += 4) {
            if (imgdata.data[i + 3] === 0) {
              imgdata.data[i] = 255
              imgdata.data[i + 1] = 255
              imgdata.data[i + 2] = 255
              imgdata.data[i + 3] = 255
            }
          }
          ctx.putImageData(imgdata, 0, 0)
          image = canvas.toDataURL('image/jpeg', 1.0)
        } else {
          if (type === 'PNG') {
            image = canvas.toDataURL('image/png')
          }
        }
        resolve(image)
      })
    })
  }

  // Download JPEG, PNG exported Image
  function downloadImage (data, type) {
    const evt = new MouseEvent('click', {
      view: window,
      bubbles: false,
      cancelable: true
    })
    const a = document.createElement('a')
    const ext = type === 'PNG' ? '.png' : '.jpg'
    a.setAttribute('download', schSave.title + '_eSim_on_cloud' + ext)
    a.setAttribute('href', data)
    a.setAttribute('target', '_blank')
    a.dispatchEvent(evt)
  }

  // Download SVG image
  function downloadText (data, options) {
    const blob = new Blob(data, options)
    const evt = new MouseEvent('click', {
      view: window,
      bubbles: false,
      cancelable: true
    })
    const a = document.createElement('a')
    a.setAttribute('download', schSave.title + '_eSim_on_cloud.svg')
    a.href = URL.createObjectURL(blob)
    a.target = '_blank'
    a.setAttribute('target', '_blank')
    a.dispatchEvent(evt)
  }

  const [imgopen, setImgOpen] = React.useState(false)

  const handleImgClickOpen = () => {
    setImgOpen(true)
  }

  const handleImgClose = (value) => {
    setImgOpen(false)
    if (value === 'SVG') {
      exportImage('SVG').then((v) => {
        downloadText([v], {
          type: 'data:image/svg+xml;charset=utf-8;'
        })
      })
    } else if (value === 'PNG') {
      exportImage('PNG').then((v) => {
        downloadImage(v, 'PNG')
      })
    } else if (value === 'JPG') {
      exportImage('JPG').then((v) => {
        downloadImage(v, 'JPG')
      })
    }
  }

  // handle Save Schematic onCloud
  const handleSchSave = () => {
    if (auth.isAuthenticated !== true) {
      setMessage('You are not Logged In')
      handleSnacClick()
    } else {
      const xml = Save()
      dispatch(setSchXmlData(xml))
      const title = schSave.title
      const description = schSave.description
      exportImage('PNG').then((res) => {
        dispatch(
          saveSchematic(title, description, xml, res, false, null, handleSave)
        )
      })
      setMessage('Saved Successfully')
      handleSnacClick()
    }
  }

  // Handle Save to Gallery
  const handleGalSave = () => {
    if (auth.isAuthenticated !== true) {
      setMessage('You are not Logged In')
      handleSnacClick()
    } else {
      const xml = Save()
      dispatch(setSchXmlData(xml))
      const title = schSave.title
      const description = schSave.description
      exportImage('PNG').then((res) => {
        dispatch(saveToGallery(title, description, xml, res))
      })
      setMessage('Saved To Gallery Successfully')
      handleSnacClick()
    }
  }

  // Save Schematics Locally
  const handleLocalSchSave = () => {
    const saveLocalData = {}
    saveLocalData.data_dump = Save()
    saveLocalData.title = schSave.title
    saveLocalData.description = schSave.description
    const json = JSON.stringify(saveLocalData)
    const blob = new Blob([json], { type: 'octet/stream' })
    const evt = new MouseEvent('click', {
      view: window,
      bubbles: false,
      cancelable: true
    })
    const a = document.createElement('a')
    a.setAttribute('download', schSave.title + '_eSim_on_cloud.json')
    a.href = URL.createObjectURL(blob)
    a.target = '_blank'
    a.setAttribute('target', '_blank')
    a.dispatchEvent(evt)
  }

  // Open Locally Saved Schematic
  const handleLocalSchOpen = () => {
    let obj = {}
    const fileSelector = document.createElement('input')
    fileSelector.setAttribute('type', 'file')
    fileSelector.setAttribute('accept', 'application/JSON')
    fileSelector.click()
    fileSelector.addEventListener('change', function (event) {
      const reader = new FileReader()
      const filename = event.target.files[0].name
      if (filename.slice(filename.length - 4) === 'json') {
        reader.onload = onReaderLoad
        reader.readAsText(event.target.files[0])
      } else {
        setMessage('Unsupported file type error ! Select valid file.')
        handleSnacClick()
      }
    })
    const onReaderLoad = function (event) {
      obj = JSON.parse(event.target.result)
      if (
        obj.data_dump === undefined ||
        obj.title === undefined ||
        obj.description === undefined
      ) {
        setMessage('Unsupported file error !')
        handleSnacClick()
      } else {
        dispatch(openLocalSch(obj))
      }
    }
  }

  const handleKicadFileUpload = () => {
    const fileSelector = document.createElement('input')
    fileSelector.setAttribute('type', 'file')
    fileSelector.setAttribute('accept', '.sch')
    fileSelector.click()
    fileSelector.addEventListener('change', function (event) {
      var reader = new FileReader()
      var filename = event.target.files[0].name
      if (filename.slice(filename.length - 3) === 'sch') {
        reader.onload = async (e) => {
          importSCHFile(e.target.result)
        }
        reader.readAsText(event.target.files[0])
      }
    })
  }

  // Control Help dialog window open and close
  const [schOpen, setSchOpen] = React.useState(false)

  const handleSchDialOpen = () => {
    setSchOpen(true)
  }

  const handleSchDialClose = () => {
    setSchOpen(false)
  }

  const [libsOpen, setlibsOpen] = React.useState(false)

  const handleLibOpen = () => {
    setlibsOpen(true)
  }

  const handleLibClose = () => {
    setlibsOpen(false)
  }

  // Shortcuts that cant be put in Helper/KeyboardShortcuts.js
  useEffect(() => {
    function shrtcts (event) {
      // Save - Ctrl + S
      if (event.ctrlKey && event.keyCode === 83) {
        event.preventDefault()
        handleSchSave()
      }
      // Print - Ctrl + P
      if (event.ctrlKey && event.keyCode === 80) {
        event.preventDefault()
        PrintPreview()
      }
      // Open dialog - Ctrl + O
      if (event.ctrlKey && event.keyCode === 79) {
        event.preventDefault()
        handleSchDialOpen()
      }
      // Export - Ctrl + E / Image Export Ctrl + Shift + E
      if (event.ctrlKey && event.keyCode === 69) {
        event.preventDefault()
        if (event.shiftKey) {
          handleImgClickOpen()
        } else {
          handleLocalSchSave()
        }
      }
    }

    window.addEventListener('keydown', shrtcts)

    return () => {
      window.addEventListener('keydown', shrtcts)
    }
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <SimpleSnackbar
        message={'Possible short-circuit detected. Please recheck'}
        open={shortCircuit}
        close={handleShortClose}
      />

      {(!ltiId || !ltiNonce) && <Tooltip title="New">
        <IconButton
          color="inherit"
          className={classes.tools}
          size="small"
          target="_blank"
          component={RouterLink}
          to="/editor"
        >
          <CreateNewFolderOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>}
      {(!ltiId || !ltiNonce) && <Tooltip title="Open (Ctrl + O)">
        <IconButton
          color="inherit"
          className={classes.tools}
          size="small"
          onClick={handleSchDialOpen}
        >
          <OpenInBrowserIcon fontSize="small" />
        </IconButton>
      </Tooltip>}
      {(!ltiId || !ltiNonce) && <OpenSchDialog
        open={schOpen}
        close={handleSchDialClose}
        openLocal={handleLocalSchOpen}
        openKicad={handleKicadFileUpload}
      />}
      {(!ltiId || !ltiNonce) && <Tooltip title="Save (Ctrl + S)">
        <IconButton
          color="inherit"
          className={classes.tools}
          size="small"
          onClick={handleSchSave}
        >
          <SaveOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>}
      <SimpleSnackbar
        open={snacOpen}
        close={handleSnacClose}
        message={message}
      />
      {ltiId && ltiUserId && ltiNonce && ltiSimHistory && (
        <div>
          <FormControl
            size="small"
            style={{ marginLeft: '1%', paddingBottom: '1%' }}
            className={classes.formControl}
          >
            <InputLabel htmlFor="outlined-age-native-simple">
              See simulations
            </InputLabel>
            <Select
              labelId="demo-simple-select-placeholder-label-label"
              id="demo-simple-select-placeholder-label"
              value={activeSimResult}
              style={{ minWidth: '300px' }}
              onChange={handleChangeSim}
              label="Simulations"
              className={classes.selectEmpty}
            >
              {ltiSimHistory.map((sim) => {
                return (
                  <MenuItem key={sim.id} value={sim.id}>
                    {sim.simulation_type} at{' '}
                    {sim.simulation_time.toLocaleString()}
                  </MenuItem>
                )
              })}
            </Select>
          </FormControl>
        </div>
      )}
      {((ltiId && ltiUserId && ltiNonce) || consumerKey) &&
        activeSimResult && (
        <Tooltip title="Submit">
          <Button
            size="small"
            variant="outlined"
            color="primary"
            className={classes.button}
            endIcon={<Icon>send</Icon>}
            onClick={onSubmission}
          >
          Submit
          </Button>
        </Tooltip>
      )}
      <span className={classes.pipe}>|</span>
      {(!ltiId || !ltiNonce) && <Tooltip title="Export (Ctrl + E)">
        <IconButton
          color="inherit"
          className={classes.tools}
          size="small"
          onClick={handleLocalSchSave}
        >
          <SystemUpdateAltOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>}
      {(!ltiId || !ltiNonce) && <Tooltip title="Image Export (Ctrl + Shift + E)">
        <IconButton
          color="inherit"
          className={classes.tools}
          size="small"
          onClick={handleImgClickOpen}
        >
          <ImageOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>}
      {(!ltiId || !ltiNonce) && <ImageExportDialog open={imgopen} onClose={handleImgClose} />}
      {(!ltiId || !ltiNonce) && <Tooltip title="Print Preview (Ctrl + P)">
        <IconButton
          color="inherit"
          className={classes.tools}
          size="small"
          onClick={PrintPreview}
        >
          <PrintOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>}
      {(!ltiId || !ltiNonce) && <span className={classes.pipe}>|</span>}

      <Tooltip title="Simulate">
        <IconButton
          color="inherit"
          className={classes.tools}
          size="small"
          onClick={() => {
            dispatch(toggleSimulate())
          }}
        >
          <PlayCircleOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Generate Netlist">
        <IconButton
          color="inherit"
          className={classes.tools}
          size="small"
          onClick={handleClickOpen}
        >
          <BorderClearIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <NetlistModal open={open} close={handleClose} netlist={netlist} />
      <Tooltip title="ERC Check">
        <IconButton
          color="inherit"
          className={classes.tools}
          size="small"
          onClick={ErcCheck}
        >
          <BugReportOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Select Libraries">
        <IconButton
          color="inherit"
          className={classes.tools}
          size="small"
          onClick={handleLibOpen}
        >
          <LibraryAddRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <SelectLibrariesModal open={libsOpen} close={handleLibClose} />
      <span className={classes.pipe}>|</span>

      <Tooltip title="Undo (Ctrl + Z)">
        <IconButton
          color="inherit"
          className={classes.tools}
          size="small"
          onClick={Undo}
        >
          <UndoIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Redo (Ctrl + Shift + Z)">
        <IconButton
          color="inherit"
          className={classes.tools}
          size="small"
          onClick={Redo}
        >
          <RedoIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Rotate AntiClockWise (Alt + Left Arrow)">
        <IconButton
          color="inherit"
          className={classes.tools}
          size="small"
          onClick={RotateACW}
        >
          <RotateLeft fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Rotate ClockWise (Alt + Right Arrow)">
        <IconButton
          color="inherit"
          className={classes.tools}
          size="small"
          onClick={Rotate}
        >
          <RotateRightIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <span className={classes.pipe}>|</span>

      <Tooltip title="Zoom In (Ctrl + +)">
        <IconButton
          color="inherit"
          className={classes.tools}
          size="small"
          onClick={ZoomIn}
        >
          <ZoomInIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Zoom Out (Ctrl + -)">
        <IconButton
          color="inherit"
          className={classes.tools}
          size="small"
          onClick={ZoomOut}
        >
          <ZoomOutIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Default Size (Ctrl + Y)">
        <IconButton
          color="inherit"
          className={classes.tools}
          size="small"
          onClick={ZoomAct}
        >
          <SettingsOverscanIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <span className={classes.pipe}>|</span>

      <Tooltip title="Delete (Del)">
        <IconButton
          color="inherit"
          className={classes.tools}
          size="small"
          onClick={handleDeleteComp}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Clear All (Shift + Del)">
        <IconButton
          color="inherit"
          className={classes.tools}
          size="small"
          onClick={ClearGrid}
        >
          <ClearAllIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Help">
        <IconButton
          color="inherit"
          className={classes.tools}
          size="small"
          onClick={handleHelpOpen}
        >
          <HelpOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <HelpScreen open={helpOpen} close={handleHelpClose} />
      <span className={classes.pipe}>|</span>

      {consumerKey && (
        <>
          <Button
            size="small"
            color="primary"
            aria-controls="simple-menu"
            aria-haspopup="true"
            onClick={handleMenuClick}
          >
            See schematics
          </Button>
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleMenuOnClick(modelSch)}>
              Model Schematic
            </MenuItem>
            <MenuItem onClick={() => handleMenuOnClick(initalSch)}>
              Student Schematic{' '}
            </MenuItem>
          </Menu>
        </>
      )}

      <SubmitResults show={results} setResults={setResults} results={submissionDetails} />
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="end"
        size="small"
        onClick={mobileClose}
        className={classes.menuButton}
      >
        <AddBoxOutlinedIcon fontSize="small" />
      </IconButton>
      {!ltiId && <CreateProject />}

      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        open={submit}
        autoHideDuration={2000}
        onClose={handleSubmitClose}
        message={submitMessage}
        action={
          <>
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleSubmitClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </>
        }
      />
      {auth.roles && auth.roles.is_esim_staff && (
        <Tooltip title="Add to Gallery">
          <IconButton
            color="inherit"
            className={classes.tools}
            size="small"
            onClick={handleGalSave}
          >
            <AddPhotoAlternateIcon fontSize="medium" />
          </IconButton>
        </Tooltip>
      )}

      {/* <Tooltip title="Display MxGraph Root">
        <IconButton color="inherit" className={classes.tools} size="small" onClick={ () => dispGraph()}>
          <CodeIcon fontSize="small" />
        </IconButton>
      </Tooltip> */}
    </>
  )
}

SchematicToolbar.propTypes = {
  mobileClose: PropTypes.func,
  gridRef: PropTypes.object.isRequired,
  ltiSimResult: PropTypes.string,
  setLtiSimResult: PropTypes.string
}
