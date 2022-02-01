import React, { useEffect, useState, useContext } from "react"
import Page from "./Page"
import axios from "axios"
import { withRouter } from "react-router"
import DispatchContext from "../DispatchContext"
import StateContext from "../StateContext"

function CreatePost(props) {
  const [title, setTitle] = useState()
  const [body, setBody] = useState()
  //create a context variable to get access to the dispatch method from Main.js
  const globalAppDispatch = useContext(DispatchContext)
  //create a context variable to get access to the state from Main.js
  const globalAppState = useContext(StateContext)

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const response = await axios.post("/create-post", { title: title, body: body, token: globalAppState.user.token })
      //create a new flash message alerting the user that their post has been successfully created
      globalAppDispatch({ type: "flashMessage", value: "New Post successfully created" })
      //Redirect to new ViewSinglePost component with the new post's id
      props.history.push(`/post/${response.data}`)
      console.log("new post created")
    } catch (err) {
      console.log("Oops there seems to be an error")
    }
  }
  return (
    <Page title="Create New Post">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input onChange={e => setTitle(e.target.value)} autoFocus name="title" id="post-title" className="form-control form-control-lg form-control-title" type="text" placeholder="" autoComplete="off" />
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea onChange={e => setBody(e.target.value)} name="body" id="post-body" className="body-content tall-textarea form-control" type="text"></textarea>
        </div>

        <button className="btn btn-primary">Save New Post</button>
      </form>
    </Page>
  )
}

export default withRouter(CreatePost)
