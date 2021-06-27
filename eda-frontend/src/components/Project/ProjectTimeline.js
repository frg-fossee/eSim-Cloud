import React, { useEffect } from 'react'
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

function getDate(jsonDate) {
  var json = jsonDate
  var date = new Date(json)
  var formattedDate;
  if (date.getMinutes() >= 10) {
    formattedDate = date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear() + ' at ' + date.getHours() + ':' + date.getMinutes()
  }
  else {
    formattedDate = date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear() + ' at ' + date.getHours() + ':0' + date.getMinutes()

  }
  return `${formattedDate}`
}

function ProjectTimeline({ history, isOwner }) {
  const auth = useSelector(state => state.authReducer)
  useEffect(() => {
    console.log(history)
  }, [history])

  return (
    <Timeline align="right">
      {isOwner ? history.map((item) => (
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
      )) :
        <>
          {auth.roles?.is_type_reviewer ? history.map((item) => (
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
          )) :
            history.map((item) => (
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
          }
        </>}
    </Timeline>
  )
}

export default ProjectTimeline

ProjectTimeline.propTypes = {
  history: PropTypes.object,
  isOwner: PropTypes.bool,
}
