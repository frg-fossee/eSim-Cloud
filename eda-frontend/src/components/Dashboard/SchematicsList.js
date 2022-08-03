import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Card,
  Grid,
  Button,
  Typography,
  CardActions,
  CardContent,
  Input,
  IconButton,
  Popover,
  FormControl,
  Tabs,
  Tab,
  AppBar,
  Select,
  MenuItem,
  InputLabel
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { Link as RouterLink } from 'react-router-dom'
import SchematicCard from './SchematicCard'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSchematics } from '../../redux/actions/index'
import FilterListIcon from '@material-ui/icons/FilterList'
const useStyles = makeStyles((theme) => ({
  mainHead: {
    width: '100%',
    backgroundColor: '#404040',
    color: '#fff'
  },
  title: {
    fontSize: 14,
    color: '#80ff80'
  },
  typography: {
    padding: theme.spacing(2)
  },
  popover: {
    paddingRight: '10px'
  }
}))

function TabPanel (props) {
  const { children, value, index } = props

  return (
    <React.Fragment
    >
      {value === index && (
        <>{children}</>
      )}
    </React.Fragment>
  )
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired
}

// Card displaying user my schematics page header.
function MainCard () {
  const classes = useStyles()

  return (
    <Card className={classes.mainHead}>
      <CardContent>
        <Typography className={classes.title} gutterBottom>
          All schematics are Listed Below
        </Typography>
        <Typography variant="h5" component="h2">
          My Schematics
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          target="_blank"
          component={RouterLink}
          to="/editor"
          size="small"
          color="primary"
        >
          Create New
        </Button>
        <Button size="small" color="secondary">
          Load More
        </Button>
      </CardActions>
    </Card>
  )
}

export default function SchematicsList ({ ltiDetails = null }) {
  const classes = useStyles()
  const auth = useSelector(state => state.authReducer)
  const schematics = useSelector(state => state.dashboardReducer.schematics)
  const [saves, setSaves] = React.useState(schematics)
  const dispatch = useDispatch()
  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)
  const [value, setValue] = React.useState(0)
  const [sort, setSort] = React.useState('')
  const [order, setOrder] = React.useState('ascending')
  // For Fetching Saved Schematics
  useEffect(() => {
    dispatch(fetchSchematics())
  }, [dispatch])
  useEffect(() => {
    setSaves(schematics)
  }, [schematics])
  const onSearch = (e) => {
    setSaves(schematics.filter((o) =>
      // eslint-disable-next-line
      Object.keys(o).some((k) => {
        if ((k === 'name' || k === 'description' || k === 'owner' || k === 'save_time' || k === 'create_time') && String(o[k]).toLowerCase().includes(e.target.value.toLowerCase())) {
          return String(o[k]).toLowerCase().includes(e.target.value.toLowerCase())
        }
      }
      )
    ))
  }
  const handleFilterOpen = (e) => {
    if (anchorEl) {
      setAnchorEl(null)
    } else {
      setAnchorEl(e.currentTarget)
    }
  }
  const sortSaves = (sorting, order) => {
    if (order === 'ascending') {
      if (sorting === 'name') {
        setSaves(saves.sort((a, b) => (a.name > b.name) ? 1 : -1))
      } else if (sorting === 'created_at') {
        setSaves(saves.sort((a, b) => (a.create_time > b.create_time) ? 1 : -1))
      } else if (sorting === 'updated_at') {
        setSaves(saves.sort((a, b) => (a.save_time < b.save_time) ? 1 : -1))
      }
    } else {
      if (sorting === 'name') {
        setSaves(saves.sort((a, b) => (a.name < b.name) ? 1 : -1))
      } else if (sorting === 'created_at') {
        setSaves(saves.sort((a, b) => (a.create_time < b.create_time) ? 1 : -1))
      } else if (sorting === 'updated_at') {
        setSaves(saves.sort((a, b) => (a.save_time > b.save_time) ? 1 : -1))
      }
    }
  }
  const handleSort = (e) => {
    sortSaves(e.target.value, order)
    setSort(e.target.value)
  }
  const handleOrder = (e) => {
    setOrder(e.target.value)
    if (sort !== '') {
      sortSaves(sort, e.target.value)
    }
  }
  const handleChange = (event, newValue) => {
    setValue(newValue)
  }
  return (
    <>
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
        alignContent="center"
        spacing={3}
      >
        {/* User Dashboard My Schematic Header */}
        <Grid item xs={12}>
          <MainCard />
        </Grid>
        <Grid item xs={12}>
          {schematics && <IconButton onClick={handleFilterOpen} style={{ float: 'right' }} ><FilterListIcon /></IconButton>}
          {schematics && <Input style={{ float: 'right' }} onChange={(e) => onSearch(e)} placeholder='Search' />}
          <Popover
            open={open}
            onClose={handleFilterOpen}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center'
            }}
            anchorEl={anchorEl}
          >
            <FormControl style={{ width: ' 200px', padding: '2%' }}>
              <InputLabel>Select Sort</InputLabel>
              <Select className={classes.popover} value={sort} onChange={handleSort} >
                <MenuItem key='name' value='name'>Name</MenuItem>
                <MenuItem key='created_at' value='created_at'>Created</MenuItem>
                <MenuItem key='updated_at' value='updated_at'>Updated</MenuItem>
              </Select>
            </FormControl>
            <FormControl style={{ width: ' 200px', padding: '2%' }}>
              <InputLabel>Select Order</InputLabel>
              <Select className={classes.popover} value={order} onChange={handleOrder} >
                <MenuItem key='ascending' value='ascending'>Ascending</MenuItem>
                <MenuItem key='descending' value='descending'>Descending</MenuItem>
              </Select>
            </FormControl>
          </Popover>
        </Grid>
        <AppBar position='static'>
          <Tabs value={value} onChange={handleChange}>
            <Tab label='Schematics' />
            <Tab label='Projects' />
            <Tab label='LTI Apps' />
            <Tab label='LTI Submissions' />
          </Tabs>
        </AppBar>
        <TabPanel style={{ width: '100%' }} value={value} index={0}>
          {saves.filter(x => { return (x.project_id == null && x.lti_id == null && x.is_submission == null) }).length !== 0
            ? <>
              {saves.filter(x => { return (x.project_id == null && x.lti_id == null && x.is_submission == null) }).map(
                (sch) => {
                  return (
                    <Grid item xs={12} sm={6} lg={3} key={sch.save_id}>
                      <SchematicCard sch={sch} />
                    </Grid>
                  )
                }
              )}
            </>
            : <Grid item xs={12}>
              <Card style={{ padding: '7px 15px' }} className={classes.mainHead}>
                <Typography variant="subtitle1" gutterBottom>
                  Hey {auth.user.username} , You dont have any saved schematics...
                </Typography>
              </Card>
            </Grid>
          }
        </TabPanel>
        <TabPanel style={{ width: '100%' }} value={value} index={1}>
          {saves.filter(x => { return x.project_id }).length !== 0
            ? <>
              {saves.filter(x => { return x.project_id }).map(
                (sch) => {
                  return (
                    <Grid item xs={12} sm={6} lg={3} key={sch.save_id}>
                      <SchematicCard sch={sch} />
                    </Grid>
                  )
                }
              )}
            </>
            : <Grid item xs={12}>
              <Card style={{ padding: '7px 15px' }} className={classes.mainHead}>
                <Typography variant="subtitle1" gutterBottom>
                  Hey {auth.user.username} , You dont have any saved projects...
                </Typography>
              </Card>
            </Grid>
          }
        </TabPanel>
        <TabPanel style={{ width: '100%' }} value={value} index={2}>
          {saves.filter(x => { return x.lti_id }).length !== 0
            ? <>
              {saves.filter(x => { return x.lti_id }).map(
                (sch) => {
                  return (
                    <Grid item xs={12} sm={6} lg={3} key={sch.save_id}>
                      <SchematicCard sch={sch} />
                    </Grid>
                  )
                }
              )}
            </>
            : <Grid item xs={12}>
              <Card style={{ padding: '7px 15px' }} className={classes.mainHead}>
                <Typography variant="subtitle1" gutterBottom>
                  Hey {auth.user.username} , You dont have any saved projects...
                </Typography>
              </Card>
            </Grid>
          }
        </TabPanel>
        <TabPanel style={{ width: '100%' }} value={value} index={3}>
          {saves.filter(x => { return x.is_submission }).length !== 0
            ? <>
              {saves.filter(x => { return x.is_submission }).map(
                (sch) => {
                  return (
                    <Grid item xs={12} sm={6} lg={3} key={sch.save_id}>
                      <SchematicCard sch={sch} />
                    </Grid>
                  )
                }
              )}
            </>
            : <Grid item xs={12}>
              <Card style={{ padding: '7px 15px' }} className={classes.mainHead}>
                <Typography variant="subtitle1" gutterBottom>
                  Hey {auth.user.username} , You dont have any saved projects...
                </Typography>
              </Card>
            </Grid>
          }
        </TabPanel>

      </Grid>
    </>
  )
}

SchematicsList.propTypes = {
  ltiDetails: PropTypes.string
}
