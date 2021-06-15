/* eslint-disable camelcase */
import React from 'react'
import Button from '@material-ui/core/Button'
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline'
import PropTypes from 'prop-types'
import api from '../../utils/Api'

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
  projectVersion
}) {
  const handleClick = (e) => {
    e.preventDefault()
    window.location = '#/editor?id=' + save_id + '&version=' + version + '&branch=' + branch
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
          var versionsAccordingFreq = {}
          resp.data.forEach((value) => {
            var d = new Date(value.save_time)
            value.date =
              d.getDate() + '/' + parseInt(d.getMonth() + 1) + '/' + d.getFullYear()
            value.time = d.getHours() + ':' + d.getMinutes()
            if (d.getMinutes() < 10) {
              value.time = d.getHours() + ':0' + d.getMinutes()
            }
            versionsAccordingFreq[value.branch] ? versionsAccordingFreq[value.branch].push(value) : versionsAccordingFreq[value.branch] = [value]
          })
          setVersions(Object.entries(versionsAccordingFreq).reverse())
          var temp = []
          for (var i = 0; i < Object.entries(versionsAccordingFreq).length; i++) {
            console.log(Object.entries(versionsAccordingFreq)[0])
            if (decodeURI(window.location.href.split('branch=')[1]) === Object.entries(versionsAccordingFreq)[i][0]) { temp.push(true) } else { temp.push(false) }
          }
          setBranchOpen(temp.reverse())
        })
        .catch((err) => {
          console.log(err)
        })
    })
  }
  return (
    <>
      <Button
        style={{ marginLeft: '10%', overflowX: 'hidden' }}
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
        <Button onClick={() => handleVersionDelete(save_id, version, branch)}>
          <DeleteOutlineIcon style={{ marginLeft: '10%' }} fontSize="small"/>
        </Button>
      }
      <br />
    </>
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
  projectVersion: PropTypes.string
}
