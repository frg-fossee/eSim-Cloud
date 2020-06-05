import React, { useState } from 'react'
import AceEditor from 'react-ace'

export default function Editor (props) {
  // code={netlistCode} onCodeChange={onCodeChange}
  return (
    <div>
      <AceEditor
        onChange = {props.onCodeChange}
        value = {props.code}
      />
    </div>
  )
}
