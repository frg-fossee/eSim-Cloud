import React from 'react'
import {
  List,
  Checkbox,
  ListItem,
  Button,
  TextField,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Typography
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { makeStyles } from '@material-ui/core/styles'

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
  simulationOptions: {
    margin: '0px',
    padding: '0px',
    width: '100%'
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular
  }
}))

export default function SimulationProperties () {
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
            {/* Simulation modes list */}
            <List>

              <ListItem className={classes.simulationOptions} divider>
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
                          <Button size='small' variant="contained" color="primary">
                            Run dc solver
                          </Button>
                        </ListItem>
                      </List>
                    </ExpansionPanelDetails>
                  </ExpansionPanel>
                </div>
              </ListItem>

              <ListItem className={classes.simulationOptions} divider>
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
                          <TextField size='small' variant="outlined" id="parameter" label="Parameter" />
                        </ListItem>
                        <ListItem>
                          <TextField
                            style={{ width: '100%' }}
                            id="standard-select-currency-native"
                            size='small'
                            variant="outlined"
                            select
                            label="Sweep Type"
                            // value={currency}
                            // onChange={handleChange}
                            SelectProps={{
                              native: true
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
                          <TextField id="start" label="Start" size='small' variant="outlined" />
                        </ListItem>
                        <ListItem>
                          <TextField id="end" label="End" size='small' variant="outlined" />
                        </ListItem>
                        <ListItem>
                          <TextField id="step" label="Step" size='small' variant="outlined" />
                        </ListItem>
                        <ListItem>
                          Second Parameter:
                          <Checkbox inputProps={{ 'aria-label': 'uncontrolled-checkbox' }} />
                        </ListItem>
                        <ListItem>
                          <Button size='small' variant="contained">Add Expression</Button>
                        </ListItem>
                        <ListItem>
                          <Button size='small' variant="contained" color="primary">
                            Simulate
                          </Button>
                        </ListItem>
                      </List>
                    </form>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
              </ListItem>

              <ListItem className={classes.simulationOptions} divider>
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
                          <TextField id="start" label="Start Time" size='small' variant="outlined" />
                        </ListItem>
                        <ListItem>
                          <TextField id="end" label="Stop Time" size='small' variant="outlined" />
                        </ListItem>
                        <ListItem>
                          <TextField id="step" label="Time Step" size='small' variant="outlined" />
                        </ListItem>
                        <ListItem>
                          <TextField
                            style={{ width: '100%' }}
                            id="standard-select-currency-native"
                            size='small'
                            variant="outlined"
                            select
                            label="Skip Initial"
                            // value={currency}
                            // onChange={handleChange}
                            SelectProps={{
                              native: true
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
                          <Button size='small' variant="contained">Add Expression</Button>
                        </ListItem>
                        <ListItem>
                          <Button size='small' variant="contained" color="primary">
                            Simulate
                          </Button>
                        </ListItem>
                      </List>
                    </form>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
              </ListItem>

              <ListItem className={classes.simulationOptions} divider>
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
                          <TextField id="parameter" label="Input" size='small' variant="outlined" />
                        </ListItem>
                        <ListItem>
                          <TextField id="start" label="Start" size='small' variant="outlined" />
                        </ListItem>
                        <ListItem>
                          <TextField id="end" label="End" size='small' variant="outlined" />
                        </ListItem>
                        <ListItem>
                          <TextField id="points-deacde" label="Points/ Decade" size='small' variant="outlined" />
                        </ListItem>
                        <ListItem>
                          Sweep Parameter:
                          <Checkbox inputProps={{ 'aria-label': 'uncontrolled-checkbox' }} />
                        </ListItem>
                        <ListItem>
                          <Button size='small' variant="contained">Add Expression</Button>
                        </ListItem>
                        <ListItem>
                          <Button size='small' variant="contained" color="primary">
                            Simulate
                          </Button>
                        </ListItem>
                      </List>
                    </form>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
              </ListItem>

            </List>

          </ExpansionPanelDetails>
        </ExpansionPanel>
      </div>
    </>
  )
}
