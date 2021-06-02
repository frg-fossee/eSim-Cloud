import React from 'react'
import PropTypes from 'prop-types'
import { Hidden, List, ListItem, ListItemText, TextField, MenuItem, TextareaAutosize, IconButton, Collapse, Dialog, DialogTitle, DialogContent, Button } from '@material-ui/core'
import CreateNewFolderOutlinedIcon from "@material-ui/icons/CreateNewFolderOutlined"
import { makeStyles } from '@material-ui/core/styles'
import ComponentProperties from './ComponentProperties'
import { useSelector, useDispatch } from 'react-redux'
import { setSchDescription,saveSchematic } from '../../redux/actions/index'
import api from "../../utils/Api"
import VersionComponent from "./VersionComponent"
import Canvg from "canvg";

import './Helper/SchematicEditor.css'

const useStyles = makeStyles((theme) => ({
  toolbar: {
    minHeight: '90px'
  },
  pages: {
    margin: theme.spacing(0, 0.7)
  }
}))

const pageSize = [
  {
    value: 'A1',
    label: 'A1'
  },
  {
    value: 'A2',
    label: 'A2'
  },
  {
    value: 'A3',
    label: 'A3'
  },
  {
    value: 'A4',
    label: 'A4'
  },
  {
    value: 'A5',
    label: 'A5'
  }
]

const pageLayout = [
  {
    value: 'P',
    label: 'Portrait'
  },
  {
    value: 'L',
    label: 'Landscape'
  }
]

// Display grid size and orientation
function GridProperties ({ gridRef }) {
  const classes = useStyles()

  const [gridSize, setGridSize] = React.useState('A4')
  const [gridLayout, setGridLayout] = React.useState('L')

  const handleSizeChange = (event) => {
    setGridSize(event.target.value)
    gridRef.current.className = 'grid-container ' + event.target.value + '-' + gridLayout
  }

  const handleLayoutChange = (event) => {
    setGridLayout(event.target.value)
    gridRef.current.className = 'grid-container ' + gridSize + '-' + event.target.value
  }

  return (
    <>
      <ListItem>
        <ListItemText primary="Grid Properties" />
      </ListItem>
      <ListItem style={{ padding: '10px 5px 15px 5px' }} divider>
        <TextField
          id="filled-select-currency"
          select
          size='small'
          className={classes.pages}
          value={gridSize}
          onChange={handleSizeChange}
          helperText="Grid size"
          variant="outlined"
        >
          {pageSize.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          id="grid-layout"
          select
          size='small'
          className={classes.pages}
          value={gridLayout}
          onChange={handleLayoutChange}
          helperText="Grid Layout"
          variant="outlined"
        >
          {pageLayout.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </ListItem>

    </>
  )
}
GridProperties.propTypes = {
  gridRef: PropTypes.object.isRequired
}

export default function PropertiesSidebar({ gridRef, outlineRef }) {
  const classes = useStyles()

  const isOpen = useSelector(state => state.componentPropertiesReducer.isPropertiesWindowOpen)
  const schSave = useSelector(state => state.saveSchematicReducer)

  const [description, setDescription] = React.useState(schSave.description)
  const [versions, setVersions] = React.useState(null)
  const [branchOpen,setBranchOpen] = React.useState(null)
  const [branchName,setBranchName] = React.useState("")
  const [dialogOpen,setDialogOpen] = React.useState(false)

  React.useEffect(() => {
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
          var versionsAccordingFreq={}
          resp.data.forEach((value) => {
            var d = new Date(value.save_time);
            value.date =
              d.getDate() + "/" + d.getMonth() + "/" + d.getFullYear();
            value.time = d.getHours() + ":" + d.getMinutes();
            if (d.getMinutes() < 10) {
              value.time = d.getHours() + ":0" + d.getMinutes();
            }
            versionsAccordingFreq[value.branch]?versionsAccordingFreq[value.branch].push(value):versionsAccordingFreq[value.branch]=[value]
          });
          setVersions(Object.entries(versionsAccordingFreq))
          var temp=[];
          for(var i=0;i<Object.entries(versionsAccordingFreq).length;i++)
          {
            console.log(Object.entries(versionsAccordingFreq)[0])
            if(window.location.href.split("branch=")[1]===Object.entries(versionsAccordingFreq)[i][0])
              temp.push(true)
            else
              temp.push(false)
          }
          setBranchOpen(temp);
        });
    }
  }, [])

  const dispatch = useDispatch()

  const getInputValues = (evt) => {
    setDescription(`${evt.target.value}`)
    dispatch(setSchDescription(evt.target.value))
  }

  async function exportImage(type) {
    const svg = document.querySelector("#divGrid > svg").cloneNode(true);
    svg.removeAttribute("style");
    svg.setAttribute("width", gridRef.current.scrollWidth);
    svg.setAttribute("height", gridRef.current.scrollHeight);
    const canvas = document.createElement("canvas");
    canvas.width = gridRef.current.scrollWidth;
    canvas.height = gridRef.current.scrollHeight;
    canvas.style.width = canvas.width + "px";
    canvas.style.height = canvas.height + "px";
    var images = svg.getElementsByTagName("image");
    for (var image of images) {
      const data = await fetch(image.getAttribute("xlink:href")).then((v) => {
        return v.text();
      });
      image.removeAttribute("xlink:href");
      image.setAttribute(
        "href",
        "data:image/svg+xml;base64," + window.btoa(data)
      );
    }
    var ctx = canvas.getContext("2d");
    ctx.mozImageSmoothingEnabled = true;
    ctx.webkitImageSmoothingEnabled = true;
    ctx.msImageSmoothingEnabled = true;
    ctx.imageSmoothingEnabled = true;
    const pixelRatio = window.devicePixelRatio || 1;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    return new Promise((resolve) => {
      if (type === "SVG") {
        var svgdata = new XMLSerializer().serializeToString(svg);
        resolve('<?xml version="1.0" encoding="UTF-8"?>' + svgdata);
        return;
      }
      var v = Canvg.fromString(ctx, svg.outerHTML);
      v.render().then(() => {
        var image = "";
        if (type === "JPG") {
          const imgdata = ctx.getImageData(0, 0, canvas.width, canvas.height);
          for (let i = 0; i < imgdata.data.length; i += 4) {
            if (imgdata.data[i + 3] === 0) {
              imgdata.data[i] = 255;
              imgdata.data[i + 1] = 255;
              imgdata.data[i + 2] = 255;
              imgdata.data[i + 3] = 255;
            }
          }
          ctx.putImageData(imgdata, 0, 0);
          image = canvas.toDataURL("image/jpeg", 1.0);
        } else {
          if (type === "PNG") {
            image = canvas.toDataURL("image/png");
          }
        }
        resolve(image);
      });
    });
  }

  const handleBranch = (branchName) => {
    setDialogOpen(false)
    exportImage("PNG").then((res) => {
      dispatch(saveSchematic(schSave.title,schSave.description,schSave.xmlData,res,true,branchName,setVersions,versions))
    })
    setBranchName("")
  }

  const handleClick = (index) => {
    console.log(index)
    var left=branchOpen.slice(0,index)
    var right=branchOpen.slice(index+1)
    var temp=!branchOpen[index]
    left.push(temp)
    left=left.concat(right)
    console.log(left)
    setBranchOpen(left)
  }

  const handleBranchName = (e) => {
    setBranchName(e.target.value)
  }

  const handleDialogOpen = () => {
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setBranchName("")
    setDialogOpen(false)
  }

  return (
    <>
      <Hidden mdDown>
        <div className={classes.toolbar} />
      </Hidden>

      <List>
        <ListItem button divider>
          <h2 style={{ margin: '5px' }}>Properties</h2>
        </ListItem>
        <div style={isOpen ? { display: 'none' } : {} }>
          <GridProperties gridRef={gridRef} />

          {/* Display component position box */}
          <ListItem>
            <ListItemText primary="Components Position" />
          </ListItem>
          <ListItem style={{ padding: '0px' }} divider>
            <div className="outline-container" ref={outlineRef} id="outlineContainer" />
          </ListItem>

          {/* Input form field for schematic description */}
          <ListItem>
            <ListItemText primary="Schematic Description" />
          </ListItem>
          <ListItem style={{ padding: '0px 7px 7px 7px' }} divider>
            <TextareaAutosize id='Description' label='Description' value={ schSave.description === '' ? description || '' : schSave.description } onChange={getInputValues} rowsMin={6} aria-label='Description' placeholder={'Add Schematic Description'} style={{ width: '100%', minWidth: '234px', maxHeight: '250px' }} />
          </ListItem>
        </div>
      </List>
      <ComponentProperties />
      <List>
        <ListItem button divider>
          <h2 style={{ margin: '5px',width:"90%" }}>History</h2>
          <IconButton
            className="new-branch"
            size="small"
            onClick={handleDialogOpen}
            >
              <CreateNewFolderOutlinedIcon fontSize="small" />
          </IconButton>
          <Dialog onClose={handleDialogClose} aria-labelledby="simple-dialog-title" open={dialogOpen}>
            <DialogTitle id="simple-dialog-title">Create new Sub-Feature</DialogTitle>
            <DialogContent>
              <TextField 
              id="branch-name" 
              label="Branch Name" 
              onChange={handleBranchName} 
              value={branchName}
              style={{width:"100%"}}/>
              <br/>
              <Button 
              style={{ marginTop: '20px', marginBottom: '10px' }} 
              variant="contained" 
              color="primary" 
              onClick={() => handleBranch(branchName) }>
                Set name and create sub-feature
              </Button>
              <Button
              target="_blank"
              style={{ marginTop: '5px', marginBottom: '10px', width: '50%' }}
              variant="contained"
              color="primary"
              href="/eda/#/editor"
              >
                Create a new Schematic
              </Button>
            </DialogContent>
          </Dialog>
        </ListItem>
        {(versions&&branchOpen) ? 
        <>
          {versions.map((branch,index) => {
              return (
              <>
                <ListItem button onClick={()=>handleClick(index)}>
                  <ListItemText primary={"Sub-Feature " + branch[0]}  />
                </ListItem>
                <Collapse in={branchOpen[index]} timeout="auto" unmountOnExit>
                {
                  branch[1].map((version) =>
                    <VersionComponent 
                    name={version.name} 
                    date={version.date} 
                    time={version.time} 
                    save_id={version.save_id} 
                    version={version.version} 
                    branch={version.branch} />
                  )
                }
                </Collapse>
                  
              </>
              )
            }
          )
        }
        </> 
        : <ListItemText>No History Available</ListItemText>
        }
      </List>
    </>
  )
}

PropertiesSidebar.propTypes = {
  gridRef: PropTypes.object.isRequired,
  outlineRef: PropTypes.object.isRequired
}
