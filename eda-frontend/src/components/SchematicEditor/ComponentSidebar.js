import React, { useEffect, useState, useCallback, useRef } from 'react'
import PropTypes from 'prop-types'
import api from '../../utils/Api'
import {
  Hidden,
  List,
  ListItem,
  Collapse,
  ListItemIcon,
  IconButton,
  Tooltip,
  Divider,
  Typography,
  Chip,
  CircularProgress          // R2: moved from deep import to named import
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import CloseIcon from '@material-ui/icons/Close'
import StarIcon from '@material-ui/icons/Star'

import './Helper/SchematicEditor.css'
import { useDispatch, useSelector } from 'react-redux'
import { fetchLibraries, toggleCollapse, fetchComponents, toggleSimulate, fetchComponentsBySearch } from '../../redux/actions/index'
import SideComp from './SideComp.js'
import ComponentSearchBar from './ComponentSearchBar'
import SimulationProperties from './SimulationProperties'
const COMPONENTS_PER_ROW = 3

const useStyles = makeStyles((theme) => ({
  toolbar: {
    minHeight: '90px'
  },
  nested: {
    paddingLeft: theme.spacing(2),
    width: '100%'
  },
  head: {
    marginRight: 'auto'
  },
  /* ── Favourites chips bar ── */
  favBar: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    overflowX: 'auto',
    gap: theme.spacing(0.75),
    padding: theme.spacing(0.5, 1),
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderBottom: '1px solid #e0e0e0',
    /* hide scrollbar on non-hover for a cleaner look */
    '&::-webkit-scrollbar': {
      height: 4
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#bdbdbd',
      borderRadius: 2
    }
  },
  favChip: {
    flexShrink: 0,
    cursor: 'pointer',
    maxWidth: 120,
    fontWeight: 500
  }
}))

export default function ComponentSidebar ({ compRef, ltiSimResult, setLtiSimResult }) {
  const classes = useStyles()
  const libraries = useSelector(state => state.schematicEditorReducer.libraries)
  const collapse = useSelector(state => state.schematicEditorReducer.collapse)
  const components = useSelector(state => state.schematicEditorReducer.components)
  const isSimulate = useSelector(state => state.schematicEditorReducer.isSimulate)
  const auth = useSelector(state => state.authReducer)

  const dispatch = useDispatch()
  const [favourite, setFavourite] = useState([])  // R1: [] not null; null causes ambiguity between "not loaded" and "empty"
  const [favOpen, setFavOpen] = useState(false)
  const [uploaded, setuploaded] = useState(false)
  const [def, setdef] = useState(false)
  const [additional, setadditional] = useState(false)

  // Redux-backed API search state
  const searchResults = useSelector(state => state.schematicEditorReducer.searchResults)
  const searchLoading = useSelector(state => state.schematicEditorReducer.searchLoading)
  const searchError = useSelector(state => state.schematicEditorReducer.searchError)
  const [activeSearchQuery, setActiveSearchQuery] = useState('')

  const handleSearchChange = useCallback((query, searchOption = 'ALL') => {
    setActiveSearchQuery(query)
    dispatch(fetchComponentsBySearch(query, searchOption))
  }, [dispatch])

  // ─────────────────────────────────────────────────────────────────────────────
  // Ref for the ComponentSearchBar — used by keyboard shortcuts below
  // ─────────────────────────────────────────────────────────────────────────────
  const searchBarRef = useRef(null)

  React.useEffect(() => {
    if (!auth.isAuthenticated) return

    // Fix #1: unmount guard prevents state update on unmounted component
    let cancelled = false
    const token = localStorage.getItem('esim_token')
    const config = { headers: { 'Content-Type': 'application/json' } }
    if (token) config.headers.Authorization = `Token ${token}`

    api
      .get('favouritecomponents', config)
      .then((resp) => {
        if (!cancelled) {
          // Fix #5: null-safe — backend returns {} (not {component:[]}) when no favourites exist
          setFavourite(resp?.data?.component ?? [])
        }
      })
      .catch((err) => {
        if (!cancelled) console.error('[Favourites] fetch failed:', err.message || err) // Fix #6
      })

    return () => { cancelled = true }  // cleanup: cancel on unmount
  }, [auth])

  // ─────────────────────────────────────────────────────────────────────────────
  // Global keyboard shortcuts for the component search input
  //
  //  Ctrl+K / Cmd+K  → focus the search bar from anywhere in the editor
  //  /               → focus the search bar ONLY when NOT already typing
  //                    (safe: checked against event.target tag)
  //  Escape          → clear and blur the search bar when it is focused
  //
  // Implementation notes:
  //  • Uses document-level listeners so shortcuts work from anywhere (including
  //    when the mxGraph canvas has focus — mxKeyHandler only fires for graph events).
  //  • Guards against firing inside <input>, <textarea>, or contenteditable
  //    elements so mxGraph label editing and browser address bar are unaffected.
  //  • Cleans up on component unmount to prevent duplicate listeners.
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const isModifierPressed = (evt) =>
      // Cmd on Mac, Ctrl on Windows/Linux
      evt.metaKey || evt.ctrlKey

    const isTypingContext = (evt) => {
      const tag = evt.target.tagName
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA'
      const isEditable = evt.target.isContentEditable
      return isInput || isEditable
    }

    const handleKeyDown = (evt) => {
      // ── Ctrl+K / Cmd+K → focus search ────────────────────────────────────
      if (isModifierPressed(evt) && evt.key === 'k') {
        evt.preventDefault() // prevent browser address bar (Chrome)
        if (searchBarRef.current) {
          searchBarRef.current.focus()
        }
        return
      }

      // ── / → focus search (only when NOT already typing) ──────────────────
      if (evt.key === '/' && !isTypingContext(evt)) {
        evt.preventDefault()
        if (searchBarRef.current) {
          searchBarRef.current.focus()
        }
        return
      }

      // ── Escape → clear + blur search (only when search input is focused) ──
      if (evt.key === 'Escape' && searchBarRef.current &&
          searchBarRef.current.isFocused()) {
        evt.preventDefault()
        // Fix #14: clear() already calls onSearchChange → handleSearchChange → setActiveSearchQuery
        // Removed the redundant direct call to setActiveSearchQuery('')
        searchBarRef.current.clear()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, []) // stable: searchBarRef is a ref; keydown handler is self-contained

  const handleCollapse = (id) => {
    // Fetches Components for given library if not already fetched
    if (collapse[id] === false && (!components[id] || components[id].length === 0)) {
      dispatch(fetchComponents(id))
    }

    // Updates state of collapse to show/hide dropdown
    dispatch(toggleCollapse(id))
  }

  // For Fetching Libraries
  useEffect(() => {
    dispatch(fetchLibraries())
  }, [dispatch])

  useEffect(() => {
    if (libraries.filter((ob) => { return ob.default === true }).length !== 0) { setdef(true) } else { setdef(false) }
    if (libraries.filter((ob) => { return ob.additional === true }).length !== 0) { setadditional(true) } else { setadditional(false) }
    if (libraries.filter((ob) => { return (!ob.additional && !ob.default) }).length !== 0) { setuploaded(true) } else { setuploaded(false) }
  }, [libraries])

  // Used to chunk array
  const chunk = (array, size) => {
    return array.reduce((chunks, item, i) => {
      if (i % size === 0) {
        chunks.push([item])
      } else {
        chunks[chunks.length - 1].push(item)
      }
      return chunks
    }, [])
  }

  const libraryDropDown = (library) => {
    return (
      <div key={library.id}>
        <ListItem onClick={(e, id = library.id) => handleCollapse(id)} button divider>
          <span className={classes.head}>{library.library_name.slice(0, -4)}</span>
          {collapse[library.id] ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={collapse[library.id]} timeout={'auto'} unmountOnExit mountOnEnter exit={false}>
          <List component="div" disablePadding dense >
            {/* Chunked Components of Library */}
            {components[library.id] && chunk(components[library.id], COMPONENTS_PER_ROW).map((componentChunk) => {
              return (
                <ListItem key={componentChunk[0].svg_path} divider>
                  {componentChunk.map((component) => {
                    return (
                      <ListItemIcon key={component.full_name}>
                        <SideComp component={component} setFavourite={setFavourite} favourite={favourite} />
                      </ListItemIcon>
                    )
                  })}
                </ListItem>
              )
            })}
          </List>
        </Collapse>
      </div>
    )
  }


  return (
    <>
      <Hidden smDown>
        <div className={classes.toolbar} />
      </Hidden>

      <div style={isSimulate ? { display: 'none' } : {}}>
        {/* Display List of categorized components */}
        <List>
          <ListItem button>
            <h2 style={{ margin: '5px' }}>Components List</h2>
          </ListItem>

          {/* Component search bar — dispatches to backend API */}
          <ListItem>
            <ComponentSearchBar
              ref={searchBarRef}
              onSearchChange={handleSearchChange}
              placeholder="Search components…"
            />
          </ListItem>

          {/* ── Favourites Chips Bar ── always visible below search, shown only when logged in + has favourites */}
          {auth.isAuthenticated && favourite && favourite.length > 0 && (
            <ListItem style={{ padding: 0, flexDirection: 'column', alignItems: 'flex-start' }}>
              <Typography
                variant="caption"
                style={{
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: '#616161',
                  padding: '4px 8px 0'
                }}
              >
                ★ FAVOURITES
              </Typography>
              <div className={classes.favBar}>
                {favourite.map((comp) => (
                  <Chip
                    key={comp.id}
                    label={comp.name}
                    size="small"
                    icon={<StarIcon style={{ fontSize: 13, color: '#f4b400' }} />}
                    className={classes.favChip}
                    title={comp.full_name || comp.name}
                    // Fix #9: accessible label for screen readers
                    aria-label={`Favourite: ${comp.full_name || comp.name}. Click to locate in sidebar.`}
                    onClick={() => {
                      const src = '../' + comp.svg_path
                      const imgEl = document.querySelector(`img[src="${src}"]`)
                      if (imgEl) {
                        imgEl.click()
                      }
                    }}
                  />
                ))}
              </div>
            </ListItem>
          )}

          <div style={{ maxHeight: '70vh', overflowY: 'auto', overflowX: 'hidden' }} >

            {/* API search results from ComponentSearchBar */}
            {activeSearchQuery.trim() !== '' && (
              searchLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
                  <CircularProgress size={24} />
                </div>
              ) : searchError ? (
                <Typography variant="body2" style={{ padding: '16px', color: '#c62828' }}>
                  Search failed. Please try again.
                </Typography>
              ) : (searchResults && searchResults.length > 0) ? (
                chunk(searchResults, COMPONENTS_PER_ROW).map((componentChunk) => {
                  return (
                    <ListItem key={componentChunk.map((c) => c.id).join('-')} divider>
                      {componentChunk.map((component) => {
                        return (
                          <ListItemIcon key={component.id}>
                            <SideComp component={component} setFavourite={setFavourite} favourite={favourite} />
                          </ListItemIcon>
                        )
                      })}
                    </ListItem>
                  )
                })
              ) : (
                <Typography variant="body2" style={{ padding: '16px', color: '#999' }}>
                  No components found for &ldquo;{activeSearchQuery}&rdquo;
                </Typography>
              )
            )}

            {activeSearchQuery.trim() === '' && auth.isAuthenticated && favourite && favourite.length > 0 &&
              <>
                <ListItem button onClick={() => setFavOpen((prev) => !prev)} divider>
                  <span className={classes.head}>Favourite Components</span>
                  <div>
                    {favOpen ? <ExpandLess /> : <ExpandMore />}
                  </div>
                </ListItem>
                <Collapse in={favOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItem>
                      <div style={{ marginLeft: '-30px' }}>
                        {chunk(favourite, 3).map((componentChunk) => {
                          return (
                            // Fix #8: unique keys using component ID instead of svg_path
                            <div key={`fav-chunk-${componentChunk[0].id}`}>
                              <ListItem key={`fav-item-${componentChunk[0].id}`} divider>
                                {
                                  componentChunk.map((component) => {
                                    return (
                                      <ListItemIcon key={component.full_name}>
                                        {/* Fix #7: removed dead isFavourite={true} prop */}
                                        <SideComp favourite={favourite} setFavourite={setFavourite} component={component} />
                                      </ListItemIcon>
                                    )
                                  }
                                  )
                                }
                              </ListItem>
                            </div>
                          )
                        })}
                      </div>
                    </ListItem>
                  </List>
                </Collapse>
              </>
            }
            {activeSearchQuery.trim() === '' &&
            <>
              <div style={!def ? { display: 'none' } : {}}>
                <Divider />
                <ListItem dense divider style={{ backgroundColor: '#e8e8e8' }}>
                  <span>DEFAULT</span>
                </ListItem>
                <Divider />
                { libraries.sort(function (a, b) {
                  const textA = a.library_name.toUpperCase()
                  const textB = b.library_name.toUpperCase()
                  return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
                }).filter((library) => {
                  if (library.default) { return 1 }
                  return 0
                }).map(
                  (library) => {
                    return (libraryDropDown(library))
                  }
                )}
              </div>
              <div style={!additional ? { display: 'none' } : {}}>
                <ListItem dense divider style={{ backgroundColor: '#e8e8e8' }}>
                  <span className={classes.head}>ADDITIONAL</span>
                </ListItem>
                { libraries.sort(function (a, b) {
                  const textA = a.library_name.toUpperCase()
                  const textB = b.library_name.toUpperCase()
                  return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
                }).filter((library) => {
                  if (library.additional) { return 1 }
                  return 0
                }).map(
                  (library) => {
                    return (libraryDropDown(library))
                  }
                )}
              </div>
              <div style={!uploaded ? { display: 'none' } : {}}>
                <ListItem dense divider style={{ backgroundColor: '#e8e8e8' }}>
                  <span className={classes.head}>UPLOADED</span>
                </ListItem>
                { libraries.sort(function (a, b) {
                  const textA = a.library_name.toUpperCase()
                  const textB = b.library_name.toUpperCase()
                  return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
                }).filter((library) => {
                  if (!library.default && !library.additional) { return 1 }
                  return 0
                }).map(
                  (library) => {
                    return (libraryDropDown(library))
                  }
                )}
              </div>
            </>
            }

          </div>
        </List>
      </div>
      <div style={isSimulate ? {} : { display: 'none' }}>
        {/* Display simulation modes parameters on left side pane */}
        <List>
          <ListItem button divider>
            <h2 style={{ margin: '5px auto 5px 5px' }}>Simulation Modes</h2>
            <Tooltip title="close">
              <IconButton color="inherit" className={classes.tools} size="small" onClick={() => { dispatch(toggleSimulate()) }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </ListItem>
          <SimulationProperties ltiSimResult={ltiSimResult} setLtiSimResult={setLtiSimResult} />
        </List>
      </div>
    </>
  )
}

ComponentSidebar.propTypes = {
  compRef: PropTypes.object.isRequired,
  ltiSimResult: PropTypes.string,
  setLtiSimResult: PropTypes.func        // R4: was PropTypes.string — it is a state setter function
}
