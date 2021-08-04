/* eslint-disable camelcase */
import React from 'react'
import { Button, IconButton } from '@material-ui/core'
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline'
import PropTypes from 'prop-types'
import api from '../../utils/Api'
import Popover from '@material-ui/core/Popover'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  typography: {
    padding: theme.spacing(2)
  }
}))

export default function VersionComponent ({
  name,
  date,
  time,
  save_id,
  version,
  branch,
  setVersions,
  setBranchOpen,
  projectBranch,
  projectVersion,
  ltiId
}) {
  const classes = useStyles()

  const [anchorEl, setAnchorEl] = React.useState(null)

  const [popoverOpen, setPopoverOpen] = React.useState(false)

  const handleClickPopover = (e) => {
    setAnchorEl(e.currentTarget)
    setPopoverOpen(true)
  }

  const handleClosePopover = () => {
    setAnchorEl(null)
    setPopoverOpen(false)
  }

  const handleClick = (e) => {
    e.preventDefault()
    if (!ltiId) {
      window.location = '#/editor?id=' + save_id + '&version=' + version + '&branch=' + branch
    } else {
      window.location = '#/editor?id=' + save_id + '&version=' + version + '&lti_id=' + ltiId + '&branch=' + branch
    }
    window.location.reload()
  }

  const checkActiveVersionOrProject = (version, branch) => {
    if (version === window.location.href.split('version=')[1].substr(0, 20) && branch === decodeURI(window.location.href.split('branch=')[1])) return false
    if (version === projectVersion && branch === projectBranch) return false
    return true
  }

  const handleVersionDelete = (save_id, version, branch) => {
    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
    const token = localStorage.getItem('esim_token')
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }
    api.delete(`/save/${save_id}/${version}/${branch}`, config).then(resp => {
      api
        .get(
          'save/versions/' +
          window.location.href.split('?id=')[1].substring(0, 36),
          config
        )
        .then((resp) => {
          console.log(resp.data)
          const versionsAccordingFreq = {}
          resp.data.forEach((value) => {
            const d = new Date(value.save_time)
            value.date =
              d.getDate() + '/' + parseInt(d.getMonth() + 1) + '/' + d.getFullYear()
            value.time = d.getHours() + ':' + d.getMinutes()
            if (d.getMinutes() < 10) {
              value.time = d.getHours() + ':0' + d.getMinutes()
            }
            versionsAccordingFreq[value.branch] ? versionsAccordingFreq[value.branch].push(value) : versionsAccordingFreq[value.branch] = [value]
          })
          setVersions(Object.entries(versionsAccordingFreq).reverse())
          const temp = []
          for (let i = 0; i < Object.entries(versionsAccordingFreq).length; i++) {
            console.log(Object.entries(versionsAccordingFreq)[0])
            if (decodeURI(window.location.href.split('branch=')[1]) === Object.entries(versionsAccordingFreq)[i][0]) { temp.push(true) } else { temp.push(false) }
          }
          setBranchOpen(temp.reverse())
        })
        .catch((err) => {
          console.log(err)
        })
    }).catch(err => {
      console.log(err)
    })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'left', flexWrap: 'wrap' }}>
      <Button
        style={{ overflowX: 'hidden', width: '77%' }}
        size="small"
        color="primary"
        disabled={((version === window.location.href.split('version=')[1].substr(0, 20)) && (branch === decodeURI(window.location.href.split('branch=')[1])))}
        onClick={handleClick}
      >
        <p>
          {name} <br /> {date} {time}
        </p>
      </Button>
      {
        checkActiveVersionOrProject(version, branch) &&
        <>
          <IconButton style={{ backgroundColor: 'transparent' }} onClick={(e) => handleClickPopover(e)}>
            <DeleteOutlineIcon fontSize="small"/>
          </IconButton>
          <Popover
            open={popoverOpen}
            anchorEl={anchorEl}
            onClose={() => handleClosePopover()}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center'
            }}
          >
            <Typography className={classes.typography}>
              <b>Are you sure you want to delete this version?</b>
            </Typography>
            <Button style={{ marginLeft: '5%', backgroundColor: 'transparent' }} onClick={() => handleVersionDelete(save_id, version, branch)}>
            Delete Version
            </Button>
          </Popover>
        </>
      }
      <br />
    </div>
  )
}

VersionComponent.propTypes = {
  name: PropTypes.string,
  date: PropTypes.string,
  time: PropTypes.string,
  save_id: PropTypes.string,
  version: PropTypes.string,
  branch: PropTypes.string,
  setVersions: PropTypes.func,
  setBranchOpen: PropTypes.func,
  projectBranch: PropTypes.string,
  projectVersion: PropTypes.string,
  ltiId: PropTypes.string
}
