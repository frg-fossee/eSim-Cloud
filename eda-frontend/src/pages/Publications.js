import { Card, Grid, Container,CssBaseline, CardContent, Typography } from '@material-ui/core'
import React, { useEffect } from 'react'
import { useSelector ,useDispatch} from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import PublicationCard from '../components/Dashboard/PublicationCard'
import { fetchPublicPublications} from '../redux/actions/index'

const useStyles = makeStyles((theme) => ({
    mainHead: {
        width: '100%',
        backgroundColor: '#404040',
        color: '#fff'
    },
    title: {
        fontSize: 18,
        color: '#80ff80'
    },
    header: {
        padding: theme.spacing(5, 0, 6, 0)
    },
    root: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f4f6f8'
    },
    media: {
        marginTop: theme.spacing(3),
        height: 170
    }
}))


// Card displaying eSim gallery page header.
function MainCard () {
    const classes = useStyles()
  
    return (
      <Card className={classes.mainHead}>
        <CardContent>
          <Typography variant="h2" align="center" gutterBottom>
          eSim Published Circuits
          </Typography>
          <Typography className={classes.title} align="center" gutterBottom>
          Published circuits are listed below...
          </Typography>
        </CardContent>
      </Card>
    )
  }
  

function Publications(props) {
    const classes = useStyles()
    const dispatch = useDispatch()

    const publications = useSelector(state => state.dashboardReducer.publicPublications)
    useEffect(() => {
        dispatch(fetchPublicPublications())
    }, [dispatch])
    return (
        <div className={classes.root}>
            <CssBaseline />
            <Container maxWidth="lg" className={classes.header}>
                <Grid
                    container
                    direction="row"
                    justify="flex-start"
                    alignItems="flex-start"
                    alignContent="center"
                    spacing={3}
                >
                    {/* eSim Gallery Header */}
                    <Grid item xs={12}>
                        <MainCard />
                    </Grid>

                    {/* Listing Gallery Schematics */}
                    {publications.map(
                        (pub) => {
                            console.log(pub)
                            return (
                                <Grid item xs={12} sm={6} lg={4} key={pub.save_id}>
                                    <PublicationCard pub={pub} is_review={true}/>
                                </Grid>
                            )
                        }
                    )}

                </Grid>
            </Container>
        </div>
    )
}

export default Publications;
