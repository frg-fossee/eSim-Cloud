import React from "react";

import { Container, Typography } from "@material-ui/core";
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
