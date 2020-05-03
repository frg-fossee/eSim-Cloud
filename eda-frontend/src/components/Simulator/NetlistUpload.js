import React, { Component } from "react";
import { Grid, Button, Paper } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";

const styles = (theme) => ({
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    backgroundColor: "#404040",
    color: "#fff",
  },
  finlabel: {
    cursor: "pointer",
    color: "#9feaf9",
    padding: theme.spacing(1),
    border: "2px solid #9feaf9",
  },
  finput: {
    opacity: 0,
    position: "absolute",
    zIndex: -1,
  },
});

class SimpleReactFileUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      filename: "Choose Netlist",
    };
    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.fileUpload = this.fileUpload.bind(this);
  }

  onFormSubmit(e) {
    // Stop default form submit
    e.preventDefault();
  }

  onChange(e) {
    this.setState({
      file: e.target.files[0],
      filename: e.target.files[0].name,
    });
  }

  fileUpload(file) {}

  fileData = () => {
    if (this.state.file) {
      return (
        <div>
          <h3>File Details:</h3>
          <p>File Name: {this.state.file.name}</p>
          <p>File Type: Ngspice Netlist</p>
        </div>
      );
    } else {
      return (
        <div>
          <h4>Choose Netlist before pressing UPLOAD button</h4>
        </div>
      );
    }
  };

  render() {
    const { classes } = this.props;
    return (
      <>
        <Grid item xs={12} sm={5}>
          <Paper className={classes.paper}>
            <h2>Submit Netlist</h2>
            <form onSubmit={this.onFormSubmit} style={{ marginTop: "45px" }}>
              <label htmlFor="netlist" className={classes.finlabel}>
                {this.state.filename}
              </label>
              <input
                type="file"
                id="netlist"
                onChange={this.onChange}
                className={classes.finput}
              />
              <br />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                style={{ marginTop: "30px" }}
              >
                Upload
              </Button>
            </form>
            <br />
            {this.fileData()}
          </Paper>
        </Grid>
      </>
    );
  }
}

export default withStyles(styles, { withTheme: true })(SimpleReactFileUpload);
