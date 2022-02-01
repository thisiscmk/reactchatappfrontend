import React, { useContext, useEffect, useState } from "react"
import Page from "./Page"
import { useParams, Link, withRouter } from "react-router-dom"
import axios from "axios"
import LoadingDotsIcon from "./LoadingDotsIcon"
import ReactMarkdown from "react-markdown"
import ReactTooltip from "react-tooltip"
import NotFound from "./NotFound"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"

function ViewSinglePost(props) {
  const globalAppState = useContext(StateContext)
  const globalAppDispatch = useContext(DispatchContext)
  //create a piece of state that checks if the axios request to the backend has finished loading
  const [isLoading, setIsLoading] = useState(true)
  //create a piece of state that stores the user's posts data
  const [post, setPost] = useState()
  const { id } = useParams()

  useEffect(() => {
    //create a variable that identifies the axios request by its token
    const axiosRequest = axios.CancelToken.source()
    //you cannot pass an async function to useEffect directly, so create a new async function
    async function fetchPost() {
      try {
        const response = await axios.get(`/post/${id}`, { cancelToken: axiosRequest.token })
        //set the new state of post to have the user's post data
        setPost(response.data)
        setIsLoading(false)
      } catch (e) {
        console.log("Oops, there was a problem or this axios request has been cancelled")
      }
    }
    fetchPost()

    // return a function that cancels the axios request once this component is no longer rendered and another component is called
    return () => {
      axiosRequest.cancel()
    }
  }, [id]) //runs everytime the post id changes

  if (isLoading)
    return (
      <Page title="...">
        <LoadingDotsIcon />
      </Page>
    )

  //return a 404 page if the axios request does not find a post object in the database
  if (!isLoading && !post) {
    return <NotFound />
  }

  //create a variable that holds the dates that the posts were created on
  const date = new Date(post.createdDate)
  //define the format in which the dates should appear
  const dateFormatted = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`

  //function to check that the logged in user is the creator of the post before displaying the edit and delete icons
  function isOwner() {
    if (globalAppState.loggedIn) {
      //check that username from app state and post author username match
      return globalAppState.user.username == post.author.username
    }
    return false
  }

  //function to handle what happens when the user attempts to delete a post
  async function deleteHandler() {
    const confirm = window.confirm("Are you sure you want to delete this post?")
    if (confirm) {
      try {
        const response = await axios.delete(`/post/${id}`, { data: { token: globalAppState.user.token } })
        if (response.data == "Success") {
          // display flash message
          globalAppDispatch({ type: "flashMessage", value: "Post successfully deleted" })
          //redirect to current user's profile
          props.history.push(`/profile/${globalAppState.user.username}`)
        }
      } catch (e) {
        console.log("Oops, there was a problem when attempting to delete your post")
      }
    }
  }

  return (
    <Page title={post.title}>
      <div className="d-flex justify-content-between">
        <h2>{post.title}</h2>

        {isOwner() && (
          <span className="pt-2">
            <Link to={`/post/${post._id}/edit`} data-tip="Edit" data-for="edit" className="text-primary mr-2">
              <i className="fas fa-edit"></i>
            </Link>{" "}
            <ReactTooltip id="edit" className="custom-tooltip" />
            <a onClick={deleteHandler} className="delete-post-button text-danger" data-tip="Delete" data-for="delete">
              <i className="fas fa-trash"></i>
            </a>
            <ReactTooltip id="delete" className="custom-tooltip" />
          </span>
        )}
      </div>

      <p className="text-muted small mb-4">
        <Link to={`/profile/${post.author.username}`}>
          <img className="avatar-tiny" src={post.author.avatar} />
        </Link>
        Posted by <Link to={`/profile/${post.author.username}`}>{post.author.username}</Link> {dateFormatted}
      </p>

      <div className="body-content">
        <ReactMarkdown children={post.body} allowedTypes={["paragraph", "strong", "emphasis", "text", "heading", "list", "listItem"]} />
      </div>
    </Page>
  )
}

export default withRouter(ViewSinglePost)
