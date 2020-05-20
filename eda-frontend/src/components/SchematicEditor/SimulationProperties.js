import React from 'react'
import { List, Checkbox, ListItem, Button, TextField, Divider } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles((theme) => ({
    toolbar: {
        minHeight: '90px'
    },
    pages: {
        margin: theme.spacing(0, 1)
    },

    propertiesBox: {
        width: '100%'
    },

    siulationOptions: {
        margin: "0px",
        padding: '0px',
        width: "100%",
    },

    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
    },

}))


export default function SimulationProperties({ gridRef }) {
    const classes = useStyles()
    return (
        <>

            <div className={classes.SimulationOptions}>
                <ExpansionPanel>
                    <ExpansionPanelSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >

                        <Typography className={classes.heading}>Simulation Modes</Typography>
                    </ExpansionPanelSummary>

                    <ExpansionPanelDetails className={classes.siulationOptions}>
                        {/* beginning of Simulation modes list */}

                        <List>
                            <Divider />
                            <ListItem className={classes.siulationOptions}>
                                <div className={classes.propertiesBox}>

                                    <ExpansionPanel>
                                        <ExpansionPanelSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls="panel1a-content"
                                            id="panel1a-header"
                                        >
                                            <Typography className={classes.heading}>DC Solver</Typography>
                                        </ExpansionPanelSummary>

                                        <ExpansionPanelDetails>
                                            <List>
                                                <ListItem>
                                                    <Button variant="contained" color="primary">
                                                        Run dc solver
                                </Button>
                                                </ListItem>
                                            </List>
                                        </ExpansionPanelDetails>
                                    </ExpansionPanel>
                                </div>
                            </ListItem>

                            <Divider />

                            <ListItem className={classes.siulationOptions}>

                                <div className={classes.propertiesBox}>
                                    <ExpansionPanel>
                                        <ExpansionPanelSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls="panel1a-content"
                                            id="panel1a-header"
                                        >
                                            <Typography className={classes.heading}>DC Sweep</Typography>
                                        </ExpansionPanelSummary>
                                        <ExpansionPanelDetails>
                                            <form className={classes.propertiesBox} noValidate autoComplete="off">
                                                <List>
                                                    <ListItem>
                                                        <TextField id="parameter" label="Parameter" />

                                                    </ListItem>

                                                    <ListItem>
                                                        <TextField
                                                            style={{ width: '100%' }}
                                                            id="standard-select-currency-native"
                                                            select
                                                            label="Sweep Type"
                                                            // value={currency}
                                                            // onChange={handleChange}
                                                            SelectProps={{
                                                                native: true,
                                                            }}

                                                        >

                                                            <option key="linear" value="linear">
                                                                Linear
                                </option>
                                                            <option key="decade" value="decade">
                                                                Decade
                                </option>


                                                        </TextField>

                                                    </ListItem>


                                                    <ListItem>

                                                        <TextField id="start" label="Start" />
                                                    </ListItem>
                                                    <ListItem>

                                                        <TextField id="end" label="End" />
                                                    </ListItem>
                                                    <ListItem>
                                                        <TextField id="step" label="Step" />
                                                    </ListItem>
                                                    <ListItem>
                                                        Second Parameter:
                                <Checkbox inputProps={{ 'aria-label': 'uncontrolled-checkbox' }} />

                                                    </ListItem>

                                                    <ListItem>
                                                        <Button variant="contained">Add Expression</Button>

                                                    </ListItem>

                                                    <ListItem>
                                                        <Button variant="contained" color="primary">
                                                            Simulate
                                </Button>
                                                    </ListItem>



                                                </List>
                                            </form>
                                        </ExpansionPanelDetails>
                                    </ExpansionPanel>

                                </div>

                            </ListItem>

                            <Divider />

                            <ListItem className={classes.siulationOptions}>
                                <div className={classes.propertiesBox}>
                                    <ExpansionPanel>
                                        <ExpansionPanelSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls="panel1a-content"
                                            id="panel1a-header"
                                        >
                                            <Typography className={classes.heading}>Time Domain</Typography>
                                        </ExpansionPanelSummary>
                                        <ExpansionPanelDetails>
                                            <form className={classes.propertiesBox} noValidate autoComplete="off">
                                                <List>


                                                    <ListItem>
                                                        <TextField id="start" label="Start Time" />
                                                    </ListItem>

                                                    <ListItem>
                                                        <TextField id="end" label="Stop Time" />
                                                    </ListItem>

                                                    <ListItem>
                                                        <TextField id="step" label="Time Step" />
                                                    </ListItem>

                                                    <ListItem>
                                                        <TextField
                                                            style={{ width: '100%' }}
                                                            id="standard-select-currency-native"
                                                            select
                                                            label="Skip Initial"
                                                            // value={currency}
                                                            // onChange={handleChange}
                                                            SelectProps={{
                                                                native: true,
                                                            }}

                                                        >

                                                            <option key="N" value="N">
                                                                No
                                </option>
                                                            <option key="Y" value="Y">
                                                                Yes
                                </option>



                                                        </TextField>
                                                    </ListItem>

                                                    <ListItem>
                                                        Sweep Parameter:
                                <Checkbox inputProps={{ 'aria-label': 'uncontrolled-checkbox' }} />

                                                    </ListItem>

                                                    <ListItem>
                                                        <Button variant="contained">Add Expression</Button>

                                                    </ListItem>

                                                    <ListItem>
                                                        <Button variant="contained" color="primary">
                                                            Simulate
                                    </Button>

                                                    </ListItem>



                                                </List>
                                            </form>
                                        </ExpansionPanelDetails>
                                    </ExpansionPanel>

                                </div>
                            </ListItem>


                            <Divider />

                            <ListItem className={classes.siulationOptions}>
                                <div className={classes.propertiesBox}>
                                    <ExpansionPanel>
                                        <ExpansionPanelSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls="panel1a-content"
                                            id="panel1a-header"
                                        >
                                            <Typography className={classes.heading}>Frequency Domain</Typography>
                                        </ExpansionPanelSummary>
                                        <ExpansionPanelDetails>
                                            <form className={classes.propertiesBox} noValidate autoComplete="off">
                                                <List>
                                                    <ListItem>
                                                        <TextField id="parameter" label="input" />

                                                    </ListItem>



                                                    <ListItem>

                                                        <TextField id="start" label="Start" />
                                                    </ListItem>
                                                    <ListItem>

                                                        <TextField id="end" label="End" />
                                                    </ListItem>
                                                    <ListItem>
                                                        <TextField id="points-deacde" label="Points/Decade" />

                                                    </ListItem>

                                                    <ListItem>
                                                        Sweep Parameter:
                                <Checkbox inputProps={{ 'aria-label': 'uncontrolled-checkbox' }} />

                                                    </ListItem>

                                                    <ListItem>
                                                        <Button variant="contained">Add Expression</Button>

                                                    </ListItem>

                                                    <ListItem>
                                                        <Button variant="contained" color="primary">
                                                            Simulate
                                </Button>
                                                    </ListItem>



                                                </List>
                                            </form>
                                        </ExpansionPanelDetails>
                                    </ExpansionPanel>

                                </div>
                            </ListItem>

                            <Divider />

                        </List>

                    </ExpansionPanelDetails>
                </ExpansionPanel>

            </div>



        </>
    )

}
