import React from "react";

import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Header from "../components/SchematicEditor/Header";

export default function SchematiEditor() {
  return (
    <>
      <Header />

      <Container maxWidth="lg">
        <Typography
          variant="h3"
          align="center"
          color="textSecondary"
          gutterBottom
        >
          <br></br>
          Schematic Editor
        </Typography>
      </Container>
    </>
  );
}
