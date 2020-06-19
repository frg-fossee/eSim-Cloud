import React from 'react'
import PropTypes from 'prop-types'
import {
  Slide,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextareaAutosize,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Container,
  Grid,
  Paper,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  List,
  ListItem,
  ListItemText,
  Avatar,
  ListItemAvatar
} from '@material-ui/core'

import { makeStyles } from '@material-ui/core/styles'
import CloseIcon from '@material-ui/icons/Close'
import { useSelector } from 'react-redux'
import { blue } from '@material-ui/core/colors'

const Transition = React.forwardRef(function Transition (props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

var FileSaver = require('file-saver')

export function NetlistModal ({ open, close, netlist }) {
  const netfile = useSelector(state => state.netlistReducer)
  const createNetlistFile = () => {
    var titleA = netfile.title.split(' ')[1]
    var blob = new Blob([netlist], { type: 'text/plain;charset=utf-8' })
    FileSaver.saveAs(blob, `${titleA}.cir`)
  }
  return (
    <Dialog
      open={open}
      onClose={close}
      TransitionComponent={Transition}
      keepMounted
      aria-labelledby="generate-netlist"
      aria-describedby="generate-netlist-description"
    >
      <DialogTitle id="generate-netlist-title">{'Netlist Generator'}</DialogTitle>
      <DialogContent dividers>
        <DialogContentText id="generate-netlist-description">
          Current Netlist for given schematic...<br /><br />
          <TextareaAutosize aria-label="empty textarea" rowsMin={20} rowsMax={50} style={{ minWidth: '500px' }} value={netlist} />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={createNetlistFile}>
          Download
        </Button>
        <Button onClick={close} color="primary" autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

NetlistModal.propTypes = {
  open: PropTypes.bool,
  close: PropTypes.func,
  netlist: PropTypes.string
}

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: 'relative'
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1
  },
  header: {
    padding: theme.spacing(5, 0, 6),
    color: '#fff'
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    backgroundColor: '#404040',
    color: '#fff'
  },
  avatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    backgroundColor: blue[100],
    color: blue[600]
  }
}))

export function HelpScreen ({ open, close }) {
  const classes = useStyles()
  return (
    <div>
      <Dialog fullScreen open={open} onClose={close} TransitionComponent={Transition} PaperProps={{
        style: {
          backgroundColor: '#4d4d4d',
          boxShadow: 'none'
        }
      }} >
        <AppBar position="static" elevation={0} className={classes.appBar}>
          <Toolbar variant="dense" style={{ backgroundColor: '#404040' }} >
            <IconButton edge="start" color="inherit" onClick={close} aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Help
            </Typography>
            <Button autoFocus color="inherit" onClick={close}>
              close
            </Button>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" className={classes.header}>
          <Grid
            container
            spacing={3}
            direction="row"
            justify="center"
            alignItems="center"
          >

            <Grid item xs={12} sm={12}>
              <Paper className={classes.paper}>
                <fieldset style={{ padding: '20px 40px' }}>
                  <legend>
                    <Typography variant="h5" align="center" component="p" gutterBottom>
                      Keyboard Shorcuts
                    </Typography>
                  </legend>
                  <Typography variant="h6" align='left' gutterBottom>
                    UNDO
                  </Typography>
                  <Typography variant="subtitle1" align='left' style={{ color: '#b3b3b3' }} gutterBottom>
                    Ctrl + Z
                  </Typography>
                  <Divider />
                  <Typography variant="h6" align='left' gutterBottom>
                    REDO
                  </Typography>
                  <Typography variant="subtitle1" align='left' style={{ color: '#b3b3b3' }} gutterBottom>
                    Ctrl + A
                  </Typography>
                  <Divider />
                  <Typography variant="h6" align='left' gutterBottom>
                    ZOOM IN
                  </Typography>
                  <Typography variant="subtitle1" align='left' style={{ color: '#b3b3b3' }} gutterBottom>
                    Ctrl + I
                  </Typography>
                  <Divider />
                  <Typography variant="h6" align='left' gutterBottom>
                    ZOOM OUT
                  </Typography>
                  <Typography variant="subtitle1" align='left' style={{ color: '#b3b3b3' }} gutterBottom>
                    Ctrl + O
                  </Typography>
                  <Divider />
                  <Typography variant="h6" align='left' gutterBottom>
                    DEFAULT SIZE
                  </Typography>
                  <Typography variant="subtitle1" align='left' style={{ color: '#b3b3b3' }} gutterBottom>
                    Ctrl + Y
                  </Typography>
                </fieldset>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={12}>
              <Paper className={classes.paper}>
                <fieldset style={{ padding: '20px 40px' }}>
                  <legend>
                    <Typography variant="h5" align="center" component="p" gutterBottom>
                      Units Table
                    </Typography>
                  </legend>
                  <Typography>

                    <TableContainer component={Paper}>
                      <Table className={classes.table} aria-label="simple table">
                        <caption>Ngspice scale factors naming conventions</caption>
                        <TableHead>
                          <TableRow>
                            <TableCell align="center">SUFFIX</TableCell>
                            <TableCell align="center">NAME</TableCell>
                            <TableCell align="center">FACTOR</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>

                          <TableRow>
                            <TableCell align="center">T</TableCell>
                            <TableCell align="center">Tera</TableCell>
                            <TableCell align="center">10<sup>12</sup></TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell align="center">G</TableCell>
                            <TableCell align="center">Giga</TableCell>
                            <TableCell align="center">10<sup>9</sup></TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell align="center">Meg</TableCell>
                            <TableCell align="center">Mega</TableCell>
                            <TableCell align="center">10<sup>6</sup></TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell align="center">K</TableCell>
                            <TableCell align="center">Kilo</TableCell>
                            <TableCell align="center">10<sup>3</sup></TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell align="center">mil</TableCell>
                            <TableCell align="center">Mil</TableCell>
                            <TableCell align="center">25.4 X 10<sup>-6</sup></TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell align="center">m</TableCell>
                            <TableCell align="center">milli</TableCell>
                            <TableCell align="center">10<sup>-3</sup></TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell align="center">u</TableCell>
                            <TableCell align="center">micro</TableCell>
                            <TableCell align="center">10<sup>-6</sup></TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell align="center">n</TableCell>
                            <TableCell align="center">nano</TableCell>
                            <TableCell align="center">10<sup>-9</sup></TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell align="center">p</TableCell>
                            <TableCell align="center">pico</TableCell>
                            <TableCell align="center">10<sup>-12</sup></TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell align="center">f</TableCell>
                            <TableCell align="center">femto</TableCell>
                            <TableCell align="center">10<sup>-15</sup></TableCell>
                          </TableRow>

                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Typography>
                </fieldset>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={12}>
              <Paper className={classes.paper}>
                <fieldset style={{ padding: '20px 40px' }}>
                  <legend>
                    <Typography variant="h5" align="center" component="p" gutterBottom>
                      Simulation Modes
                    </Typography>
                  </legend>
                  <Typography variant="h6" align='left' gutterBottom>
                    DC Solver
                  </Typography>
                  <Typography variant="subtitle1" align='left' style={{ color: '#b3b3b3' }} gutterBottom>
                    A DC simulation attempts to find a stable DC solution of your circuit.
                  </Typography>
                  <Divider />
                  <Typography variant="h6" align='left' gutterBottom>
                    DC Sweep
                  </Typography>
                  <Typography variant="subtitle1" align='left' style={{ color: '#b3b3b3' }} gutterBottom>
                    A DC Sweep will plot the DC solution of your circuit across different values of a parameter of a circuit element.
                    You can sweep any numerical parameter of any circuit element in your circuit.
                  </Typography>
                  <Divider />
                  <Typography variant="h6" align='left' gutterBottom>
                    Transient Analysis
                  </Typography>
                  <Typography variant="subtitle1" align='left' style={{ color: '#b3b3b3' }} gutterBottom>
                    A Transient analysis does a Time-Domain Simulation of your circuit over a certain period of time.
                  </Typography>
                  <Divider />
                  <Typography variant="h6" align='left' gutterBottom>
                    AC Analysis
                  </Typography>
                  <Typography variant="subtitle1" align='left' style={{ color: '#b3b3b3' }} gutterBottom>
                    AC Analysis does a small signal analysis of your circuit. The input can be any voltage source or current source.
                  </Typography>
                </fieldset>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Dialog>
    </div >
  )
}

HelpScreen.propTypes = {
  open: PropTypes.bool,
  close: PropTypes.func
}

const ImgTypes = ['PNG', 'JPG', 'SVG']
export function ImageExportDialog (props) {
  const classes = useStyles()
  const { onClose, open } = props

  const handleClose = () => {
    onClose('')
  }

  const handleListItemClick = (value) => {
    onClose(value)
  }

  return (
    <Dialog onClose={handleClose} aria-labelledby="image-export-dialog-title" open={open}>
      <DialogTitle id="image-export-dialog-title">Select Image type</DialogTitle>
      <List>
        {ImgTypes.map((img) => (
          <ListItem button onClick={() => handleListItemClick(img)} key={img}>
            <ListItemAvatar>
              <Avatar className={classes.avatar}>
                {img.charAt(0).toUpperCase()}
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={img} />
          </ListItem>
        ))}
      </List>
      <DialogActions>
        <Button onClick={handleClose} color="primary" autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

ImageExportDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired
}
