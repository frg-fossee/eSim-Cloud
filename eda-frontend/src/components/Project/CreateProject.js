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
  InputLabel,
  List,
  ListItem,
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
  const [details, setDetails] = useState(
    {
      title: '',
      description: ''
    })
  const [fields, setFields] = useState([{ name: 'Procedure', text: '' },{ name: 'Observation', text: '' },{ name: 'Conclusion', text: '' }])
  const [changed, setChanged] = useState(0)
  useEffect(() => {
    if (open && publication.details?.publication_id) {
      dispatch(getStatus(publication.details?.publication_id))
    }
    if (publication.details) {
      setDetails({ title: publication.details.title, description: publication.details.description })
      setFields(publication.details.fields)
    }
  }, [open, dispatch, publication.details])
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const createPub = () => {
    dispatch(createPublication(save_id, [details, fields]))
  }
  const handleSelectChange = (event) => {
    if (changed === 0) {
      setChanged(2)
    }
    else if (changed === 1) {
      setChanged(3)
    }
    setStatus(event.target.value)
  };
  const clickChange = () => {
    if (changed === 1 || changed === 3) {
      dispatch(createPublication(save_id, [details, fields]))
    }
    if (changed === 2 || changed === 3) {
      dispatch(changeStatus(publication.details.publication_id, status,''))
    }

  }
  const clickPreview = () => {
    let win = window.open();
    win.location.href = '/eda/#/publication?save_id=' + publication.details.save_id + '&publication_id=' + publication.details.publication_id
    win.focus();
  }
  const changeFieldText = (e) => {
    if (changed === 0) {
      setChanged(1)
    }
    else if (changed === 2) {
      setChanged(3)
    }
    var temp = [...fields]
    if (e.target.name === 'name') {
      temp[e.target.id].name = e.target.value
      setFields(temp)
    }
    else if (e.target.name === 'text') {
      temp[e.target.id].text = e.target.value
      setFields(temp)
    }
    else {
      setDetails({ ...details, [e.target.name]: e.target.value })
    }
  }
  const addField = () => {
    setFields([...fields, { name: '', text: '' }])
  }
  const onRemove = (e) =>
  {
    var list = [...fields]
    console.log(e)
    list.splice(e,1)
    setFields(list)
  }
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
            {publication.details && <Button color="inherit" onClick={clickPreview}>
              Preview
            </Button>}
            {changed !== 0 && <Button color="inherit" onClick={clickChange}>
              Update Project
            </Button>}
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" className={classes.header}>
          <Grid
            container
            spacing={3}
            direction="row"
            justify="center"
            alignItems="flex-start"
          >
            <Grid item xs={12} sm={12}>
              {publication.details && <Paper style={{ padding: '.2% 0%', marginBottom: "1%" }}>
                <h3 style={{ textAlign: 'center' }}>Status of the project: {publication.details.status_name}  </h3>
                <h4 style={{ textAlign: 'center' }}>Reviewer Notes: {publication.details.history.reverse()[0]?.reviewer_notes}</h4>
              </Paper>}
              <Paper className={classes.paper}>

                <TextField
                  color='primary'
                  autoFocus
                  margin="dense"
                  id="title"
                  label="Title"
                  name='title'
                  type="text"
                  fullWidth
                  disabled={!publication.states && publication.details}
                  value={details.title}
                  onChange={changeFieldText}

                />
                <TextField
                  color='primary'
                  margin="dense"
                  multiline
                  id="description"
                  label="Description"
                  name='description'
                  rows={4}
                  type="text"
                  disabled={!publication.states && publication.details}
                  value={details.description}
                  onChange={changeFieldText}
                  fullWidth
                />
                {fields.map((item, index) =>
                (
                  <>
                    <hr />
                    <IconButton style={{ float: 'right' }} onClick={()=>onRemove(index)}>
                      <CloseIcon />
                    </IconButton>
                    <TextField
                      color='primary'
                      margin="dense"
                      id={index}
                      label={"Title " + index}
                      type="text"
                      name='name'
                      disabled={!publication.states && publication.details}
                      value={item.name}
                      onChange={changeFieldText}
                      fullWidth
                    />
                    <TextField
                      color='primary'
                      margin="dense"
                      multiline
                      id={index}
                      label={"Text " + index}
                      rows={4}
                      type="text"
                      name='text'
                      disabled={!publication.states && publication.details}
                      value={item.text}
                      onChange={changeFieldText}
                      fullWidth
                    />
                  </>
                ))}
                <br />
                {((publication.states && publication.details) || !publication.details) && <Button onClick={addField}>+ Add Field</Button>}
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
            <Grid item xs={6} sm={6}>
              <Paper style={{ paddingTop: '0%', padding: '2%' }}>
                <List>
                  <h3>List of Approved Reports</h3>
                  {publication.reports?.approved[0] ?
                    <>
                      {publication.reports.approved.map((item, index) => (
                        <ListItem>
                          {index + 1}. {item.description}
                        </ListItem>
                      ))}
                    </> : <h4>No approved reports.</h4>}
                </List>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={6}>
              <Paper style={{ padding: '2%' }}>
                <List>
                  <h3>History of this Project</h3>
                  {publication.details?.history[0] ?
                    <>
                      {publication.details.history.slice(0).reverse().map((item, index) => (
                        <ListItem>
                          <p style={{ margin: '0%' }}>{index + 1}. {item.from_state_name} to {item.to_state_name}
                            <br />
                            <h5>-On {item.transition_time} by {item.transition_author}</h5>
                          </p>
                        </ListItem>
                      ))}</>
                    : <h4>No history of this project.</h4>
                  }
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Dialog>
    </div>
  )
}
export default CreateProject