import React from "react"
import Button from "@material-ui/core/Button"
import { Link as RouterLink } from "react-router-dom"

export default function VersionComponent({
  name,
  date,
  time,
  save_id,
  version,
}) {
  return (
    <>
      <Button
        style={{ marginLeft: "15%",overflowX:"hidden" }}
        target="_blank"
        component={RouterLink}
        to={"/editor?id=" + save_id + "&version=" + version}
        size="small"
        color="primary"
        disabled={version === window.location.href.split("version=")[1]}
      >
        <p>
          {name} <br /> {date} {time}
        </p>
      </Button>
      <br />
    </>
  );
}
