import React, { useState } from 'react'
import AceEditor from 'react-ace'
import * as ace from 'brace'

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
      theme="github"
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
