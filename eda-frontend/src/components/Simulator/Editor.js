import React from 'react'
import AceEditor from 'react-ace'
import PropTypes from 'prop-types'
import 'brace/theme/monokai'
import 'brace/theme/github'

export default function Editor (props) {
  // code editor for online spice simulator
  return (

    <AceEditor
      style={{ width: '100%', marginTop: '35px' }}
      onChange={props.onCodeChange}
      value={props.code}
      theme={props.dark.checkedA ? 'github' : 'monokai'}
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
  onCodeChange: PropTypes.func,
  dark: PropTypes.bool
}
