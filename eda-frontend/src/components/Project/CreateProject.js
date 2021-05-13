import React, { useState, useEffect } from 'react'
import {
  Button,
  Dialog,
  Toolbar,
  IconButton,
  Typography,
  Slide,
  AppBar,
  Container,
  Grid,
  Paper,
  TextField,
  Tooltip,
  Select,
  MenuItem,
  InputLabel
}
  from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close';
import PostAddIcon from '@material-ui/icons/PostAdd';
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch, useSelector } from 'react-redux'
import { changeStatus, createPublication, getStatus } from '../../redux/actions'

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: 'relative',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  header: {
    padding: theme.spacing(5, 0, 6),
    color: '#fff'
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: '#fff'
  }
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function CreateProject() {
  const [open, setOpen] = useState(false)
  const classes = useStyles();
  const dispatch = useDispatch()
  const publication = useSelector(state => state.publicationReducer)
  const auth = useSelector(state => state.authReducer)
  const save_id = useSelector(state => state.saveSchematicReducer.details.save_id)
  const owner = useSelector(state => state.saveSchematicReducer.details.owner)
  const [status, setStatus] = React.useState(null)
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const createPub = () => {
    dispatch(createPublication(save_id))
  }
  const handleSelectChange = (event) => {
    setStatus(event.target.value)
  };
  const clickChangeStatus = () => {
    dispatch(changeStatus(publication.details.publication_id, status))
  }
  useEffect(() => {
    if (open && publication.details?.publication_id) {
      dispatch(getStatus())
    }
  }, [open, dispatch,publication.details])

  return (
    <div>
      {(window.location.href.split('?id=')[1] && auth.user?.username === owner) &&
        <IconButton
          color='inherit'
          aria-label='open drawer'
          edge='end'
          size="small"
          onClick={handleClickOpen}>
          <Tooltip title="Create Project">
            <PostAddIcon />
          </Tooltip>
        </IconButton>}
      <Dialog fullScreen open={open} TransitionComponent={Transition} onClose={handleClickOpen} PaperProps={{
        style: {
          backgroundColor: '#4d4d4d',
          boxShadow: 'none'
        }
      }}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Project Details
                    </Typography>

            {!publication.details && <Button color="inherit" onClick={createPub}>
              Create Project
            </Button>}
            {status && <Button color="inherit" onClick={clickChangeStatus}>
              Change Status
            </Button>}
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
            {/* Card to display simualtion result screen header */}
            <Grid item xs={12} sm={12}>
              <Paper className={classes.paper}>
                <TextField
                  color='primary'
                  autoFocus
                  margin="dense"
                  id="title"
                  label="Title"
                  type="text"
                  fullWidth
                  disabled={!publication.states && publication.details}
                  defaultValue={publication.details?.title}
                />
                <TextField
                  color='primary'
                  margin="dense"
                  multiline
                  id="description"
                  label="Description"
                  rows={2}
                  type="text"
                  disabled={!publication.states && publication.details}
                  defaultValue={publication.details?.description}
                  fullWidth
                />
                {/* <TextField
                  color='primary'
                  margin="dense"
                  id="procedure"
                  label="Procedure"
                  multiline
                  rows={4}
                  type="text"
                  disabled={!publication.states && publication.details}
                  fullWidth
                />
                <TextField
                  color='primary'
                  margin="dense"
                  multiline
                  id="observations"
                  label="Observations"
                  type="text"
                  rows={4}
                  disabled={!publication.states && publication.details}
                  fullWidth
                /> */}
                {publication.details && <>{
                  publication.states ?
                    <div style={{ textAlign: 'left' }}>
                      <br />
                      <InputLabel id="demo-simple-select-label">Change Status</InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        style={{ width: '50%' }}
                        onChange={handleSelectChange}
                        value={status}
                      >
                        {publication.states.map((item, index) =>
                        (
                          <MenuItem value={item}>{item}</MenuItem>
                        ))}
                      </Select>
                    </div> :
                    <h3 style={{ color: 'black', textAlign: 'left' }}>Project review in progress.</h3>
                }</>}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Dialog>
    </div>
  )
}
export default CreateProject