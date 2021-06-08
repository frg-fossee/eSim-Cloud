import {  Card, Grid, CardContent, Typography } from '@material-ui/core'
import React from 'react'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import ProjectCard from './ProjectCard'


const useStyles = makeStyles({
    mainHead: {
        width: '100%',
        backgroundColor: '#404040',
        color: '#fff'
    },
    title: {
        fontSize: 14,
        color: '#80ff80'
    },
})
function DashboardOtherProjects() {
    const projects = useSelector(state => state.dashboardReducer.otherProjects)
    const classes = useStyles()
    return (
        <>
            <Grid
                container
                direction="row"
                justify="flex-start"
                alignItems="flex-start"
                alignContent="center"
                spacing={3}>
                <Grid item xs={12}>
                    <Card className={classes.mainHead}>
                        <CardContent>
                            <Typography className={classes.title} gutterBottom>
                                All the prtojects which are pending for a review are Listed Below
                    </Typography>
                            <Typography variant="h5" component="h2">
                                Review Projects
                    </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                {projects.length !== 0
                    ? <>
                        {projects.map(
                            (project) => {
                                return (
                                    <Grid item xs={12} sm={6} lg={3} key={project.save_id}>
                                    <ProjectCard pub={project} is_review={true}/>
                                    </Grid>
                                )
                            }
                        )}
                    </>
                    : <Grid item xs={12}>
                        <Card style={{ padding: '7px 15px' }} className={classes.mainHead}>
                            <Typography variant="subtitle1" gutterBottom>
                                Hey , You dont have any projects to review...
                            </Typography>
                        </Card>
                    </Grid>
                }
            </Grid>
        </>
    )
}

export default DashboardOtherProjects