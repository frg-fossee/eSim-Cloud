import { Button, Card,CardActionArea, CardActions, CardContent, CardHeader, CardMedia, Typography } from '@material-ui/core'
import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
    media: {
        height: 0,
        paddingTop: '56.25%' // 16:9
    },
    rating: {
        marginTop: theme.spacing(1),
        marginLeft: 'auto'
    }
}))


export default function PublicationCard({ pub }) {
    const classes = useStyles()
    return (
        <>
            <Card>
                <CardActionArea>
                    <CardHeader title={pub.title} />
                    <CardMedia
                        className={classes.media}
                        image={pub.base64_image} />
                    <CardContent>
                        <Typography variant='body2' component='p'>
                            {pub.description}
                        </Typography>
                        <Typography variant='body2' component='p'>
                            Status: {pub.status_name}
                        </Typography>
                        <Typography variant='body2' component='p' color='textSecondary' style={{ margin: '5px 0px 0px 0px' }}>
                            Updated at {pub.last_updated}
                        </Typography>
                    </CardContent>
                </CardActionArea>
                <CardActions>
                    <Button>
                        Launch in Editor
                    </Button>
                </CardActions>
            </Card>
        </>
    )
}
PublicationCard.propTypes = {
    sch: PropTypes.object
}