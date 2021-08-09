/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react'
import Timeline from '@material-ui/lab/Timeline'
import TimelineItem from '@material-ui/lab/TimelineItem'
import TimelineSeparator from '@material-ui/lab/TimelineSeparator'
import TimelineConnector from '@material-ui/lab/TimelineConnector'
import TimelineContent from '@material-ui/lab/TimelineContent'
import TimelineDot from '@material-ui/lab/TimelineDot'
import TimelineOppositeContent from '@material-ui/lab/TimelineOppositeContent'
import Typography from '@material-ui/core/Typography'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import {
  Tooltip,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle
} from '@material-ui/core'
import ImportExportIcon from '@material-ui/icons/ImportExport'

function getDate (jsonDate) {
  var json = jsonDate
  var date = new Date(json)
  var formattedDate
  if (date.getMinutes() >= 10) {
    formattedDate = date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear() + ' at ' + date.getHours() + ':' + date.getMinutes()
  } else {
    formattedDate = date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear() + ' at ' + date.getHours() + ':0' + date.getMinutes()
  }
  return `${formattedDate}`
}

function ProjectTimeline ({ history, isOwner }) {
  const auth = useSelector(state => state.authReducer)
  const [descending, setDescending] = useState(true)
  const [notes, setNotes] = useState(false)
  const [timeline, setTimeline] = useState(history)
  useEffect(() => {
    if (descending) {
      setTimeline(history)
    } else {
      setTimeline(history.slice(0).reverse())
    }
  }, [descending, history])
  return (
    <>
      <Button onClick={() => setNotes(true)}>Show Notes</Button>
      <Tooltip title={`Ordered by: ${descending ? 'Descending' : 'Ascending'}`}>
        <ImportExportIcon style={{ float: 'right' }} onClick={() => setDescending(!descending)} />
      </Tooltip>
      <Dialog fullWidth={true} maxWidth='sm' open={notes} onClose={() => setNotes(false)}>
        <DialogTitle>Reviewer Notes List</DialogTitle>
        <DialogContent>
          <ol>
            {history.map((item) => (
              <>
                {
                  item.reviewer_notes && <li>
                    &quot;{item.reviewer_notes}&quot; mentioned by {item.transition_author_name} at {getDate(item.transition_time)}
                  </li>
                }
              </>
            ))}
          </ol>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotes(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      {!descending ? <Timeline align="right">
        {isOwner
          ? <>
            {timeline.slice(0, -1).map((item) => (
              <>
                {item.transition.history_creator && <TimelineItem>
                  <TimelineOppositeContent>
                    <Typography color="textSecondary">{getDate(item.transition_time)} by {item.transition_author_name}</Typography>
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot />
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography>{item.transition.history_creator}</Typography>
                  </TimelineContent>
                </TimelineItem>}
              </>
            ))}
            {timeline[timeline.length - 1] && <TimelineItem>
              <TimelineOppositeContent>
                <Typography color="textSecondary">{getDate(timeline[timeline.length - 1].transition_time)} by {timeline[timeline.length - 1].transition_author_name}</Typography>
              </TimelineOppositeContent>
              <TimelineSeparator>
                {timeline[timeline.length - 1].transition.event_creator ? <TimelineDot /> : <TimelineDot color='primary' />}
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Typography>{timeline[timeline.length - 1].transition.history_creator}</Typography>
              </TimelineContent>
            </TimelineItem>}
            {timeline[timeline.length - 1] && timeline[timeline.length - 1].transition.event_creator && <TimelineItem>
              <TimelineSeparator>
                <TimelineDot color='primary' />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Typography color='primary'>{timeline[timeline.length - 1].transition.event_creator}</Typography>
              </TimelineContent>
            </TimelineItem>}

          </>
          : <>
            {auth.roles?.is_type_reviewer ? timeline.slice(0, -1).map((item) => (
              <>
                {item.transition.history_reviewer && <TimelineItem>
                  <TimelineOppositeContent>
                    <Typography color="textSecondary">{getDate(item.transition_time)} by {item.transition_author_name}</Typography>
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot />
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography>{item.transition.history_reviewer}</Typography>
                  </TimelineContent>
                </TimelineItem>}
              </>
            ))
              : timeline.slice(0, -1).map((item) => (
                <>
                  {item.transition.history_other && <TimelineItem>
                    <TimelineOppositeContent>
                      <Typography color="textSecondary">{getDate(item.transition_time)} by {item.transition_author_name}</Typography>
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot />
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography>{item.transition.history_other}</Typography>
                    </TimelineContent>
                  </TimelineItem>}
                </>
              ))
            }
            {timeline[timeline.length - 1] && <TimelineItem>
              <TimelineOppositeContent>
                <Typography color="textSecondary">{getDate(timeline[timeline.length - 1].transition_time)} by {timeline[timeline.length - 1].transition_author_name}</Typography>
              </TimelineOppositeContent>
              <TimelineSeparator>
                {(auth.roles?.is_type_reviewer && timeline[timeline.length - 1].transition.event_reviewer) || (timeline[timeline.length - 1].transition.event_other) ? <TimelineDot /> : <TimelineDot color='primary' />}
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Typography>{auth.roles?.is_type_reviewer ? timeline[timeline.length - 1].transition.history_reviewer : timeline[timeline.length - 1].transition.history_other}</Typography>
              </TimelineContent>
            </TimelineItem>}
            {timeline[timeline.length - 1] && (auth.roles?.is_type_reviewer ? timeline[timeline.length - 1].transition.event_reviewer : timeline[timeline.length - 1].transition.event_other) && <TimelineItem>
              <TimelineOppositeContent>
                <Typography color="textSecondary"></Typography>
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot color='primary' />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Typography color='primary'>{auth.roles?.is_type_reviewer ? timeline[timeline.length - 1].transition.event_reviewer : timeline[timeline.length - 1].transition.event_other}</Typography>
              </TimelineContent>
            </TimelineItem>}

          </>}
      </Timeline> : <Timeline align="right">
        {isOwner
          ? <>
            {timeline[0] && timeline[0].transition.event_creator && <TimelineItem>
              <TimelineSeparator>
                <TimelineDot color='primary' />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Typography color='primary'>{timeline[0].transition.event_creator}</Typography>
              </TimelineContent>
            </TimelineItem>}
            {timeline[0] && <TimelineItem>
              <TimelineOppositeContent>
                <Typography color="textSecondary">{getDate(timeline[0].transition_time)} by {timeline[0].transition_author_name}</Typography>
              </TimelineOppositeContent>
              <TimelineSeparator>
                {timeline[0].transition.event_creator ? <TimelineDot /> : <TimelineDot color='primary' />}
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Typography>{timeline[0].transition.history_creator}</Typography>
              </TimelineContent>
            </TimelineItem>}
            {timeline.slice(1).map((item) => (
              <>
                {item.transition.history_creator && <TimelineItem>
                  <TimelineOppositeContent>
                    <Typography color="textSecondary">{getDate(item.transition_time)} by {item.transition_author_name}</Typography>
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot />
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography>{item.transition.history_creator}</Typography>
                  </TimelineContent>
                </TimelineItem>}
              </>
            ))}
          </>
          : <>

            {timeline[0] && (auth.roles?.is_type_reviewer ? timeline[0].transition.event_reviewer : timeline[0].transition.event_other) && <TimelineItem>
              <TimelineOppositeContent>
                <Typography color="textSecondary"></Typography>
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot color='primary' />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Typography color='primary'>{auth.roles?.is_type_reviewer ? timeline[0].transition.event_reviewer : timeline[0].transition.event_other}</Typography>
              </TimelineContent>
            </TimelineItem>}
            {timeline[0] && <TimelineItem>
              <TimelineOppositeContent>
                <Typography color="textSecondary">{getDate(timeline[0].transition_time)} by {timeline[0].transition_author_name}</Typography>
              </TimelineOppositeContent>
              <TimelineSeparator>
                {(auth.roles?.is_type_reviewer && timeline[0].transition.event_reviewer) || (timeline[0].transition.event_other) ? <TimelineDot /> : <TimelineDot color='primary' />}
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Typography>{auth.roles?.is_type_reviewer ? timeline[0].transition.history_reviewer : timeline[0].transition.history_other}</Typography>
              </TimelineContent>
            </TimelineItem>}
            {auth.roles?.is_type_reviewer ? timeline.slice(1).map((item) => (
              <>
                {item.transition.history_reviewer && <TimelineItem>
                  <TimelineOppositeContent>
                    <Typography color="textSecondary">{getDate(item.transition_time)} by {item.transition_author_name}</Typography>
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot />
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography>{item.transition.history_reviewer}</Typography>
                  </TimelineContent>
                </TimelineItem>}
              </>
            ))
              : timeline.slice(1).map((item) => (
                <>
                  {item.transition.history_other && <TimelineItem>
                    <TimelineOppositeContent>
                      <Typography color="textSecondary">{getDate(item.transition_time)} by {item.transition_author_name}</Typography>
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot />
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography>{item.transition.history_other}</Typography>
                    </TimelineContent>
                  </TimelineItem>}
                </>
              ))
            }
          </>}
      </Timeline>}
    </>
  )
}

export default ProjectTimeline

ProjectTimeline.propTypes = {
  history: PropTypes.object,
  isOwner: PropTypes.bool
}
