import {
  Card,
  Grid,
  Container,
  CssBaseline,
  CardContent,
  Typography,
  Select,
  MenuItem,
  Popover,
  FormControl,
  Input,
  IconButton,
  InputLabel
} from '@material-ui/core'
import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import ProjectCard from '../components/Dashboard/ProjectCard'
import { fetchPublicProjects } from '../redux/actions/index'
import FilterListIcon from '@material-ui/icons/FilterList'

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
          eSim Published Projects
        </Typography>
        <Typography className={classes.title} align="center" gutterBottom>
          Published Projects are listed below...
        </Typography>
      </CardContent>
    </Card>
  )
}

function PublicProjects (props) {
  const classes = useStyles()
  const dispatch = useDispatch()

  const projects = useSelector(state => state.dashboardReducer.publicProjects)
  const [sort, setSort] = React.useState('')
  const [order, setOrder] = React.useState('ascending')
  const [filteredProjects, setFilteredProjects] = React.useState(projects)
  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)
  useEffect(() => {
    dispatch(fetchPublicProjects())
  }, [dispatch])
  useEffect(() => {
    setFilteredProjects(projects)
  }, [projects])
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
          {/* Listing Gallery Schematics */}
          {filteredProjects.map(
            (pub) => {
              console.log(pub)
              return (
                <Grid item xs={12} sm={6} lg={4} key={pub.save_id}>
                  <ProjectCard pub={pub} is_review={true} />
                </Grid>
              )
            })}

        </Grid>
      </Container>
    </div>
  )
}

export default PublicProjects
