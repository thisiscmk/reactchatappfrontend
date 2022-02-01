import React, { useContext, useEffect, useReducer, useState } from "react"
import Page from "./Page"
import { useParams, Link, withRouter } from "react-router-dom"
import axios from "axios"
import LoadingDotsIcon from "./LoadingDotsIcon"
import { useImmerReducer } from "use-immer"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
import NotFound from "./NotFound"

function EditPost(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

  //create a variable that holds an object of initial state values before the post data is fetched from the backend
  const originalState = {
    title: {
      value: "",
      hasErrors: false,
      errorMessage: ""
    },

    body: {
      value: "",
      hasErrors: false,
      errorMessage: ""
    },

    isFetching: true, //keeps track of whether the initial post data has loaded or not
    isSaving: false, //handles the save updates button to check whether it is in the process of sending an axios request
    id: useParams().id, //pulls the post id from the url
    sendCount: 0, //keeps track of how many times the user has tried to send an axios request
    notFound: false //checks whether a post id exists in the database
  }

  function myReducer(draft, action) {
    switch (action.type) {
      case "fetchComplete":
        draft.title.value = action.value.title
        draft.body.value = action.value.body
        draft.isFetching = false
        return

      case "titleChange":
        //remove any error messages as soon as the user writes text in the field
        draft.title.hasErrors = false
        draft.title.value = action.value
        return

      case "bodyChange":
        draft.body.hasErrors = false
        draft.body.value = action.value
        return

      case "submitRequest":
        if (!draft.title.hasErrors && !draft.body.hasErrors) {
          draft.sendCount++
        }
        return

      case "saveRequestStarted":
        draft.isSaving = true
        return

      case "saveRequestCompleted":
        draft.isSaving = false
        return

      case "titleRules":
        //if title is empty
        if (!action.value.trim()) {
          draft.title.hasErrors = true
          draft.title.message = "Please provide a title"
        }
        return

      case "bodyRules":
        if (!action.value.trim()) {
          draft.body.hasErrors = true
          draft.body.message = "Please write some body content"
        }
        return

      case "postNotFound":
        draft.notFound = true
        return
    }
  }

  //initialize ImmerReducer
  const [state, dispatch] = useImmerReducer(myReducer, originalState)

  function submitHandler(e) {
    e.preventDefault()
    //check validation rules before submitting the form
    dispatch({ type: "titleRules", value: state.title.value })
    dispatch({ type: "bodyRules", value: state.body.value })
    dispatch({ type: "submitRequest" })
  }

  //useEffect hook that sends axios request to retrieve existing post data
  useEffect(() => {
    //create a variable that identifies the axios request by its token
    const axiosRequest = axios.CancelToken.source()
    //you cannot pass an async function to useEffect directly, so create a new async function
    async function fetchPost() {
      try {
        const response = await axios.get(`/post/${state.id}`, { cancelToken: axiosRequest.token })
        if (response.data) {
          //set the new state of post to have the user's post data
          dispatch({ type: "fetchComplete", value: response.data })
          //make sure that only the logged in user can edit posts
          if (appState.user.username != response.data.author.username) {
            appDispatch({ type: "flashMessage", value: "You do not have permission to edit this post" })
            //redirect to home page
            props.history.push("/")
          }
        } else {
          dispatch({ type: "postNotFound" })
        }
      } catch (e) {
        console.log("Oops, there was a problem or this axios request has been cancelled")
      }
    }
    fetchPost()

    // return a function that cancels the axios request once this component is no longer rendered and another component is called
    return () => {
      axiosRequest.cancel()
    }
  }, []) //square bracket because it only runs the first time this page is loaded

  //useEffect hook that sends axios request with newly updated values
  useEffect(() => {
    if (state.sendCount) {
      //if the sendCount property is higher than zero (meaning that the save update button has been clicked at least once)

      dispatch({ type: "saveRequestStarted" })
      //create a variable that identifies the axios request by its token
      const axiosRequest = axios.CancelToken.source()
      //you cannot pass an async function to useEffect directly, so create a new async function
      async function fetchPost() {
        try {
          const response = await axios.post(`/post/${state.id}/edit`, { title: state.title.value, body: state.body.value, token: appState.user.token }, { cancelToken: axiosRequest.token })
          dispatch({ type: "saveRequestCompleted" })
          appDispatch({ type: "flashMessage", value: "Post successfully updated !!!" })
        } catch (e) {
          console.log("Oops, there was a problem or this axios request has been cancelled")
        }
      }
      fetchPost()

      // return a function that cancels the axios request once this component is no longer rendered and another component is called
      return () => {
        axiosRequest.cancel()
      }
    }
  }, [state.sendCount]) //sends a new axios request anytime the form is submitted (the save updates button is clicked)

  //if post is not found in the database, return an error page
  if (state.notFound) {
    return <NotFound />
  }

  //while the axios request is retrieving data from the database, display animated loading icons
  if (state.isFetching)
    return (
      <Page title="...">
        <LoadingDotsIcon />
      </Page>
    )

  return (
    <Page title="Edit Post">
      <Link className="small font-weight-bold" to={`/post/${state.id}`}>
        &laquo; Back to post
      </Link>
      <form className="mt-3" onSubmit={submitHandler}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input onBlur={e => dispatch({ type: "titleRules", value: e.target.value })} onChange={e => dispatch({ type: "titleChange", value: e.target.value })} value={state.title.value} autoFocus name="title" id="post-title" className="form-control form-control-lg form-control-title" type="text" placeholder="" autoComplete="off" />
          {state.title.hasErrors && <div className="alert alert-danger small liveValidateMessage"> {state.title.message}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea onBlur={e => dispatch({ type: "bodyRules", value: e.target.value })} onChange={e => dispatch({ type: "bodyChange", value: e.target.value })} value={state.body.value} name="body" id="post-body" className="body-content tall-textarea form-control" type="text" />
          {state.body.hasErrors && <div className="alert alert-danger small liveValidateMessage"> {state.body.message}</div>}
        </div>

        <button className="btn btn-primary" disabled={state.isSaving}>
          Save Updates
        </button>
      </form>
    </Page>
  )
}

export default withRouter(EditPost)
