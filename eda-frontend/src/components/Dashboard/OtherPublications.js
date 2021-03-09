import { Button, Card, Grid, CardActions, CardContent, Typography } from '@material-ui/core'
import React from 'react'
import { useSelector } from 'react-redux'
import SchematicCard from './SchematicCard'
import { makeStyles } from '@material-ui/core/styles'
import { Link as RouterLink } from 'react-router-dom'
import PublicationCard from './PublicationCard'


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
    mainHead: {
        width: '100%',
        backgroundColor: '#404040',
        color: '#fff'
    },
    title: {
        fontSize: 14,
        color: '#80ff80'
    }
})
function OtherPublications() {
    const publications = useSelector(state => state.dashboardReducer.myPublications)
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
                                All publications to review are Listed Below
                    </Typography>
                            <Typography variant="h5" component="h2">
                                Other Publications
                    </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                {publications.length !== 0
                    ? <>
                        {publications.map(
                            (publication) => {
                                return (
                                    <Grid item xs={12} sm={6} lg={3} key={publication.save_id}>
                                    <PublicationCard pub={publication} />
                                    </Grid>
                                )
                            }
                        )}
                    </>
                    : <Grid item xs={12}>
                        <Card style={{ padding: '7px 15px' }} className={classes.mainHead}>
                            <Typography variant="subtitle1" gutterBottom>
                                Hey , You dont have any saved schematics...
                            </Typography>
                        </Card>
                    </Grid>
                }
            </Grid>
        </>
    )
}

export default OtherPublications
