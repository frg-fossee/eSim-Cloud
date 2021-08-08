import React, { useEffect } from 'react'
import {
  Card,
  Grid,
  Typography,
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
import { useDispatch, useSelector } from 'react-redux'
import ProjectCard from './ProjectCard'
import FilterListIcon from '@material-ui/icons/FilterList'
import PropTypes from 'prop-types'
import { fetchOtherProjects } from '../../redux/actions/index'

const useStyles = makeStyles({
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

function TabPanel (props) {
  const { children, value, index } = props

  return (
    <>
      {value === index && (
        <>{children}</>
      )}
    </>
  )
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired
}
function DashboardOtherProjects () {
  const projects = useSelector(state => state.dashboardReducer.otherProjects)
  const classes = useStyles()
  const auth = useSelector(state => state.authReducer)
  const dispatch = useDispatch()
  const [value, setValue] = React.useState(0)
  const [sort, setSort] = React.useState('')
  const [order, setOrder] = React.useState('ascending')
  const [filteredProjects, setFilteredProjects] = React.useState(projects)
  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)
  useEffect(() => {
    setFilteredProjects(projects)
  }, [projects])
  useEffect(() => {
    dispatch(fetchOtherProjects())
  }, [dispatch])
  const handleFilterOpen = (e) => {
    if (anchorEl) {
      setAnchorEl(null)
    } else {
      setAnchorEl(e.currentTarget)
    }
  }
  const handleChange = (event, newValue) => {
    setValue(newValue)
  }
  const sortSaves = (sorting, order) => {
    if (order === 'ascending') {
      if (sorting === 'name') {
        setFilteredProjects(filteredProjects.sort((a, b) => a.title > b.title))
      } else if (sorting === 'author') {
        setFilteredProjects(filteredProjects.sort((a, b) => a.author > b.author))
      } else if (sorting === 'status') {
        setFilteredProjects(filteredProjects.sort((a, b) => a.status_name > b.status_name))
      }
    } else {
      if (sorting === 'name') {
        setFilteredProjects(filteredProjects.sort((a, b) => a.title < b.title))
      } else if (sorting === 'author') {
        setFilteredProjects(filteredProjects.sort((a, b) => a.author < b.author))
      } else if (sorting === 'status') {
        setFilteredProjects(filteredProjects.sort((a, b) => a.status_name < b.status_name))
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
  const onSearch = (e) => {
    setFilteredProjects(projects.filter((o) =>
      // eslint-disable-next-line
      Object.keys(o).some((k) => {
        if ((k === 'title' || k === 'description' || k === 'author' || k === 'status_name') && String(o[k]).toLowerCase().includes(e.target.value.toLowerCase())) {
          return String(o[k]).toLowerCase().includes(e.target.value.toLowerCase())
        }
      }
      )
    ))
  }
  return (
    <>
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="space-between"
        alignContent="center"
        spacing={3}>
        <Grid item xs={12}>
          <Card className={classes.mainHead}>
            <CardContent>
              <Typography className={classes.title} gutterBottom>
                All the projects which are pending for a review are Listed Below
              </Typography>
              <Typography variant="h5" component="h2">
                Review Projects
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          {filteredProjects && <IconButton onClick={handleFilterOpen} style={{ float: 'right' }} ><FilterListIcon /></IconButton>}
          {filteredProjects && <Input style={{ float: 'right' }} onChange={(e) => onSearch(e)} placeholder='Search' />}
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
                <MenuItem key='author' value='author'>Author</MenuItem>
                <MenuItem key='status' value='status'>Status</MenuItem>
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
            <Tab label='Projects to be reviewed' />
            <Tab label='Reported Projects' />
          </Tabs>
        </AppBar>
        <TabPanel style={{ width: '100%' }} value={value} index={0}>
          {filteredProjects.filter(x => { return !x.is_reported }).length !== 0
            ? <>
              {filteredProjects.filter(x => { return !x.is_reported }).map(
                (project) => {
                  return (
                    <Grid item xs={12} sm={6} lg={3} key={project.project_id}>
                      <ProjectCard pub={project} is_review={true} />
                    </Grid>
                  )
                }
              )}
            </>
            : <Grid item xs={12}>
              <Card style={{ padding: '7px 15px' }} className={classes.mainHead}>
                <Typography variant="subtitle1" gutterBottom>
                  Hey {auth.user.username} , You don&apos;t have any projects to review...
                </Typography>
              </Card>
            </Grid>
          }
        </TabPanel>
        <TabPanel style={{ width: '100%' }} value={value} index={1}>
          {filteredProjects.filter(x => { return x.is_reported }).length !== 0
            ? <>
              {filteredProjects.filter(x => { return x.is_reported }).map(
                (project) => {
                  return (
                    <Grid item xs={12} sm={6} lg={3} key={project.project_id}>
                      <ProjectCard pub={project} is_review={true} />
                    </Grid>
                  )
                }
              )}
            </>
            : <Grid item xs={12}>
              <Card style={{ padding: '7px 15px' }} className={classes.mainHead}>
                <Typography variant="subtitle1" gutterBottom>
                  Hey {auth.user.username} , You dont have any reported projects to review...
                </Typography>
              </Card>
            </Grid>
          }
        </TabPanel>
      </Grid>
    </>
  )
}

export default DashboardOtherProjects
