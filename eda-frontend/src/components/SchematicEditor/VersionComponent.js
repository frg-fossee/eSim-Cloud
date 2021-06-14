/* eslint-disable camelcase */
import React from 'react'
import Button from '@material-ui/core/Button'
import PropTypes from 'prop-types'

export default function VersionComponent ({
  name,
  date,
  time,
  save_id,
  version,
  branch
}) {
  const handleClick = (e) => {
    e.preventDefault()
    window.location = '#/editor?id=' + save_id + '&version=' + version + '&branch=' + branch
    window.location.reload()
  }
  return (
    <>
      <Button
        style={{ marginLeft: '15%', overflowX: 'hidden' }}
        size="small"
        color="primary"
        disabled={((version === window.location.href.split('version=')[1].substr(0, 20)) && (branch === window.location.href.split('branch=')[1]))}
        onClick={handleClick}
      >
        <p>
          {name} <br /> {date} {time}
        </p>
      </Button>
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
  branch: PropTypes.string
}
