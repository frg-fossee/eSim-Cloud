import React, { useState, useEffect, useCallback, useRef, useImperativeHandle } from 'react'
import PropTypes from 'prop-types'
import { TextField, InputAdornment, IconButton } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import SearchIcon from '@material-ui/icons/Search'
import ClearIcon from '@material-ui/icons/Clear'

const SEARCH_BY_OPTIONS = ['ALL', 'NAME', 'KEYWORD', 'DESCRIPTION', 'COMPONENT_LIBRARY', 'PREFIX']

const useStyles = makeStyles((theme) => ({
  searchWrapper: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    width: '100%'
  },
  input: {
    fontSize: '0.875rem'
  },
  searchByField: {
    marginTop: theme.spacing(1)
  }
}))

/**
 * Debounced search input + "Search By" filter for the component sidebar.
 *
 * Keyboard shortcuts (registered externally in ComponentSidebar.js):
 *   Ctrl+K / Cmd+K  → focus this input from anywhere in the editor
 *   /               → focus this input when not already typing
 *   Escape          → clear query and blur this input when focused
 *
 * @param {function} onSearchChange - called with (debouncedQuery, searchOption)
 * @param {string}   placeholder    - input placeholder text
 *
 * Ref API (useImperativeHandle):
 *   ref.current.focus()  → focuses the text input
 *   ref.current.clear()  → clears the query and notifies parent
 *   ref.current.isFocused() → returns true if the input currently has focus
 */
const ComponentSearchBar = React.forwardRef(function ComponentSearchBar (
  { onSearchChange, placeholder = 'Search components...' },
  ref
) {
  const classes = useStyles()
  const [inputValue, setInputValue] = useState('')
  const [searchOption, setSearchOption] = useState('ALL')

  // Internal ref pointing at the actual <input> DOM element inside MUI TextField
  const inputRef = useRef(null)

  // Expose imperative focus / clear / isFocused to parent via ref
  useImperativeHandle(ref, () => ({
    focus () {
      if (inputRef.current) {
        inputRef.current.focus()
        // Place cursor at end of any existing text
        const len = inputRef.current.value.length
        inputRef.current.setSelectionRange(len, len)
      }
    },
    clear () {
      // R3: don't call onSearchChange directly here — the debounce useEffect
      // will fire 300ms after setInputValue('') and notify the parent cleanly.
      // Calling both caused a double API request on every Escape keypress.
      setInputValue('')
      if (inputRef.current) inputRef.current.blur()
    },
    isFocused () {
      return document.activeElement === inputRef.current
    }
  }), []) // stable: only uses refs and state setters, no changing values

  const notifyParent = useCallback((query, option) => {
    onSearchChange(query, option)
  }, [onSearchChange])

  // Debounce search text; always pass current searchOption.
  useEffect(() => {
    const timerId = setTimeout(() => {
      notifyParent(inputValue, searchOption)
    }, 300)

    return () => clearTimeout(timerId)
  }, [inputValue, searchOption, notifyParent])

  const handleSearchOptionChange = (evt) => {
    const option = evt.target.value
    setSearchOption(option)
    if (inputValue.trim() !== '') {
      notifyParent(inputValue, option)
    }
  }

  const handleClear = useCallback(() => {
    setInputValue('')
    notifyParent('', searchOption)
  }, [notifyParent, searchOption])

  return (
    <div className={classes.searchWrapper}>
      {/*
        Hidden screen-reader hint: announced when the input is focused via
        aria-describedby. Not visible to sighted users.
      */}
      <span id="search-hint" style={{ display: 'none' }}>
        Press Ctrl+K or forward slash to focus search, Escape to clear
      </span>

      <TextField
        id="component-search-bar"
        placeholder={placeholder}
        variant="outlined"
        size="small"
        fullWidth
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        inputRef={inputRef}
        inputProps={{
          'aria-label': 'Search components',
          'aria-describedby': 'search-hint',
          role: 'searchbox'
        }}
        InputProps={{
          className: classes.input,
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: inputValue ? (
            <InputAdornment position="end">
              <IconButton
                aria-label="clear search"
                onClick={handleClear}
                edge="end"
                size="small"
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null
        }}
      />
      <TextField
        className={classes.searchByField}
        id="component-search-by"
        select
        label="Search By"
        variant="outlined"
        size="small"
        fullWidth
        value={searchOption}
        onChange={handleSearchOptionChange}
        SelectProps={{ native: true }}
      >
        {SEARCH_BY_OPTIONS.map((value) => (
          <option key={value} value={value}>
            {value === 'ALL' ? 'ALL FIELDS' : value}
          </option>
        ))}
      </TextField>
    </div>
  )
})

ComponentSearchBar.propTypes = {
  /** Called with debounced query and search option (e.g. ALL, NAME). */
  onSearchChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string
}

export default ComponentSearchBar
