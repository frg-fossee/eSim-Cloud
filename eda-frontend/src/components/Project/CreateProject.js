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
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { makeStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import { useDispatch, useSelector } from 'react-redux'
import { changeStatus, createProject, getStatus } from '../../redux/actions'
import api from "../../utils/Api"

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
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function CreateProject() {
  const [open, setOpen] = useState(false)
  const classes = useStyles();
  const dispatch = useDispatch()
  const project = useSelector(state => state.projectReducer)
  const auth = useSelector(state => state.authReducer)
  const save_id = useSelector(state => state.saveSchematicReducer.details.save_id)
  const owner = useSelector(state => state.saveSchematicReducer.details.owner)
  const [status, setStatus] = React.useState(null)
  const [versions,setVersions] = React.useState(null)
  const [activeVersion,setActiveVersion] = React.useState("")
  const [activeName,setActiveName] = React.useState(null)
  const [details, setDetails] = useState(
    {
      title: '',
      description: '',
      active_branch: '',
      active_version: ''
    })
  const [fields, setFields] = useState([{ name: 'Procedure', text: '' }, { name: 'Observation', text: '' }, { name: 'Conclusion', text: '' }])
  const [changed, setChanged] = useState(0)
  useEffect(() => {
    if (open && project.details?.project_id) {
      dispatch(getStatus(project.details?.project_id))
      console.log(project.details)
    }
    if (project.details) {
      setDetails({ title: project.details.title, description: project.details.description, active_version: project.details.active_version, active_branch: project.details.active_branch })
      setFields(project.details.fields)
    }
  }, [open, dispatch, project.details])
  useEffect(()=>{
    const config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };
    const token = localStorage.getItem("esim_token")
    // If token available add to headers
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }
    if (window.location.href.split("?id=")[1]) {
      api
        .get(
          "save/versions/" +
          window.location.href.split("?id=")[1].substring(0, 36),
          config
        )
        .then((resp) => {
          console.log(resp.data);
          setVersions(resp.data)
        })
        .catch((err) => {
          console.log(err)
        });
    }
  },[])
  useEffect(()=>{
    if(versions&&project.details){
      for(var i=0;i<versions.length;i++){
        if(versions[i].version===project.details.active_version&&versions[i].branch===project.details.active_branch){
          setActiveVersion(`${versions[i].version}-${versions[i].branch}`)
          setActiveName(versions[i].name)
          break
        }
      }
    }
  },[project.details,versions])
  const handleActiveVersion = (e) =>{
    if (changed === 0) {
      setChanged(1)
    }
    else if (changed === 2) {
      setChanged(3)
    }
    setActiveVersion(e.target.value)
    setDetails({...details,'active_branch':e.target.value.split("-")[1],'active_version':e.target.value.split("-")[0]})
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
  const changeFieldText = (e) => {
    console.log(e.target.value)
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
  const handleClick = () => {
    setOpen(!open);
  };
  const createPub = () => {
    dispatch(createProject(save_id, [details, fields]))
  }
  const clickChange = () => {
    console.log(changed)
    if (changed === 1) {
      dispatch(createProject(save_id, [details, fields]))
    }
    else if (changed === 2) {
      dispatch(changeStatus(project.details.project_id, status, ''))
    }
    else if (changed === 3) {
      dispatch(createProject(save_id, [details, fields,status]))
    }
    setChanged(0)
  }
  const clickPreview = () => {
    let win = window.open();
    win.location.href = '/eda/#/project?save_id=' + project.save_id + '&version=' + project.details.active_version + '&branch=' + project.details.active_branch +  '&project_id=' + project.details.project_id
    win.focus();
  }
  const addField = () => {
    setFields([...fields, { name: '', text: '' }])
    if (changed === 0) {
      setChanged(1)
    }
    else if (changed === 2) {
      setChanged(3)
    }
  }
  const onClickShift = (type, index) => {
    if (type === 'above') {
      let temporary = [...fields]
      let current = temporary[index]
      temporary[index] = temporary[index - 1]
      temporary[index - 1] = current
      setFields(temporary)
    }
    else {
      let temporary = [...fields]
      let current = temporary[index]
      temporary[index] = temporary[index + 1]
      temporary[index + 1] = current
      setFields(temporary)
    }
  }
  const onRemove = (e) => {
    var list = [...fields]
    console.log(e)
    list.splice(e, 1)
    setFields(list)
    if (changed === 0) {
      setChanged(1)
    }
    else if (changed === 2) {
      setChanged(3)
    }
  }
  return (
    <div>
      {(window.location.href.split('?id=')[1] && auth.user?.username === owner) &&
        <IconButton
          color='inherit'
          aria-label='open drawer'
          edge='end'
          size="small"
          onClick={handleClick}>
          <Tooltip title="Create Project">
            <PostAddIcon />
          </Tooltip>
        </IconButton>}
      <Dialog fullScreen open={open} TransitionComponent={Transition} onClose={handleClick} PaperProps={{
        style: {
          backgroundColor: '#4d4d4d',
          boxShadow: 'none'
        }
      }}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={handleClick} aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Project Details
            </Typography>

            {!project.details && <Button color="inherit" onClick={createPub}>
              Create Project
            </Button>}
            {project.details && <Button color="inherit" onClick={clickPreview}>
              Preview
            </Button>}
            {project.details && changed !== 0 && <Button color="inherit" onClick={clickChange}>
              Update Project
            </Button>}
          </Toolbar>
        </AppBar>
        {versions != null && <Container maxWidth="lg" className={classes.header}>
        <Grid
            container
            spacing={3}
            direction="row"
            justify="center"
            alignItems="flex-start"
            style={{backgroundColor:"white",borderRadius:"5px"}}
        >
          <Grid item xs={12} sm={12}>
          {
            ((project.details && project.details.can_edit)||!project.details) &&
            <FormControl className={classes.formControl}>
              <InputLabel id="demo-simple-select-label">Active Version</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={activeVersion}
                onChange={handleActiveVersion}
              >
                {versions.map(version=>{
                  return <MenuItem value={`${version.version}-${version.branch}`}>Version {version.name} from branch {version.branch}</MenuItem>
                })}
              </Select>
            </FormControl>
          }
          </Grid>
        </Grid>
        </Container>}
        <Container maxWidth="lg" className={classes.header}>
          <Grid
            container
            spacing={3}
            direction="row"
            justify="center"
            alignItems="flex-start"
          >
            <Grid item xs={12} sm={12}>
              {project.details && <Paper style={{ padding: '.2% 0%', marginBottom: "1%" }}>
                <h3 style={{ textAlign: 'center' }}>Status of the project: {project.details.status_name}  </h3>
                <h3 style={{ textAlign: 'center' }}>Active Version: {activeName} of branch {project.details.active_branch}  </h3>
                {project.details.history && project.details.history.slice(0).reverse()[0]?.reviewer_notes && <h4 style={{ textAlign: 'center' }}>Reviewer Notes: {project.details.history.slice(0).reverse()[0]?.reviewer_notes}</h4>}
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
                  disabled={project.details && !project.details.can_edit}
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
                  disabled={project.details && !project.details.can_edit}
                  value={details.description}
                  onChange={changeFieldText}
                  fullWidth
                />
                {fields && fields.map((item, index) =>
                (
                  <>
                    <hr />
                    {project.details && project.details.can_edit &&
                      <>
                        <Tooltip title="Delete Field">
                          <IconButton style={{ float: 'right' }} onClick={() => onRemove(index)}>
                            <CloseIcon />
                          </IconButton></Tooltip>
                        {index !== fields.length - 1 && <IconButton style={{ float: 'right' }} onClick={() => onClickShift('below', index)}>
                          <Tooltip title="Move Field Down">
                            <KeyboardArrowDownIcon />
                          </Tooltip>
                        </IconButton>}
                        {index !== 0 && <IconButton style={{ float: 'right' }} onClick={() => onClickShift('above', index)}>
                          <Tooltip title="Move Field Up">
                            <KeyboardArrowUpIcon />
                          </Tooltip>
                        </IconButton>}
                      </>}
                    <TextField
                      color='primary'
                      margin="dense"
                      id={index}
                      label={"Title " + index}
                      type="text"
                      name='name'
                      disabled={project.details && !project.details.can_edit}
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
                      disabled={project.details && !project.details.can_edit}
                      value={item.text}
                      onChange={changeFieldText}
                      fullWidth
                    />
                  </>
                ))}
                <br />
                {((project.states && project.details) || !project.details) && <Button onClick={addField}>+ Add Field</Button>}
                {project.details && <>{
                  project.states ?
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
                        {project.states.map((item, index) =>
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
                  {project.reports?.approved[0] ?
                    <>
                      {project.reports.approved.map((item, index) => (
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
                  {(project.details?.history && project.details?.history[0]) ?
                    <>
                      {project.details.history.slice(0).reverse().map((item, index) => (
                        <ListItem>
                          <p style={{ margin: '0%' }}>{index + 1}. {item.from_state_name} to {item.to_state_name}
                            <br />
                            <h5>-On {item.transition_time} by {item.transition_author_name}</h5>
                            {item.reviewer_notes}

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