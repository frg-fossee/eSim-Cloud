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
      style={{ width: '100%', marginTop: '35px' }}
      onChange = {props.onCodeChange}
      value = {props.code}
      theme = {theme.dark}
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
}
