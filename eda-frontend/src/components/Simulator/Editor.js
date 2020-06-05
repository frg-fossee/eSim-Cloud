import React from 'react'
import AceEditor from 'react-ace'
import PropTypes from 'prop-types'
import 'brace/theme/monokai'
import 'brace/theme/github'

const theme = {
  light: 'github',
  dark: 'monokai'
}

export default function Editor (props) {
  return (

    <AceEditor

      onChange = {props.onCodeChange}
      value = {props.code}
      theme = {theme.light}
      editorProps={{
        $blockScrolling: true
      }}

      setOptions={{
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        enableSnippets: true,
        fontSize: 18

      }}
    />

  )
}

Editor.propTypes = {
  code: PropTypes.string,
  onCodeChange: PropTypes.func
  // simResults: PropTypes.object
}
