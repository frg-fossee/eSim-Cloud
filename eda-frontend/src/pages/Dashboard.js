import React from "react";

import Layout from "../components/Shared/Layout";
import Header from "../components/User/Header";

export default function Dashboard() {
  return (
    <>
      <Layout resToolbar={<Header />} />
    </>
  );
}
