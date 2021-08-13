import React from 'react'
import {
    Typography,
    Dialog,
  } from '@material-ui/core'
import PropTypes from "prop-types";
function SubmitResults({show,setResults,results}) {
    return (
        <Dialog open={show} onClose={() => setResults(false)}>
            {results && <>We have results.</>}
        </Dialog>
    )
}

export default SubmitResults

SubmitResults.propTypes = {
    show:PropTypes.bool,
    setResults:PropTypes.func,
    results:PropTypes.object
}