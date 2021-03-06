import React from "react"
import Page from "./Page"
import { Link } from "react-router-dom"

function NotFound() {
  return (
    <Page title="Not Found">
      <div className="text-center">
        <h2>Sorry, we cannot find that page</h2>
        <p className="lead text-muted">
          {" "}
          You can always return to the <Link to="/">homepage</Link> to start over
        </p>
      </div>
    </Page>
  )
}

export default NotFound
