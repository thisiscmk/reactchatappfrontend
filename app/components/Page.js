import React, { useEffect } from "react"
import Container from "./Container"

function Page(props) {
  //use useEffect to change the title of the document when the appropriate link from the footer is clicked
  useEffect(() => {
    document.title = `${props.title} | ChatApp`
    window.scrollTo(0, 0) //the page scrolls to the top anywhere this link is clicked
  }, [props.title])

  return <Container wide={props.wide}>{props.children}</Container>
}

export default Page
