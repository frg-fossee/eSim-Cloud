import React, { useEffect } from 'react'
import Timeline from '@material-ui/lab/Timeline';
import TimelineItem from '@material-ui/lab/TimelineItem';
import TimelineSeparator from '@material-ui/lab/TimelineSeparator';
import TimelineConnector from '@material-ui/lab/TimelineConnector';
import TimelineContent from '@material-ui/lab/TimelineContent';
import TimelineDot from '@material-ui/lab/TimelineDot';
import TimelineOppositeContent from '@material-ui/lab/TimelineOppositeContent';
import Typography from '@material-ui/core/Typography';

function getDate(jsonDate) {
    var json = jsonDate
    var date = new Date(json)
    let formatted_date = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear() + " at " + date.getHours() + ":" + date.getMinutes();
    return `${formatted_date}`
}

function ProjectTimeline({ history }) {
    useEffect(() => {
        console.log(history)
    }, [history])
    return (
        <Timeline align="right">
            {history.map((item) => (
                <>
                    {item.event && <TimelineItem>
                        <TimelineSeparator>
                            <TimelineDot />
                            <TimelineConnector />
                        </TimelineSeparator>
                        <TimelineContent>
                            <Typography>{item.event}</Typography>
                        </TimelineContent>
                    </TimelineItem>}
                    {item.history && <TimelineItem>
                        <TimelineOppositeContent>
                            <Typography color="textSecondary">{getDate(item.transition_time)} by {item.transition_author_name}</Typography>
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                            <TimelineDot />
                            <TimelineConnector />
                        </TimelineSeparator>
                        <TimelineContent>
                            <Typography>{item.history}</Typography>
                        </TimelineContent>
                    </TimelineItem>}
                </>
            ))}
        </Timeline>
    )
}

export default ProjectTimeline
