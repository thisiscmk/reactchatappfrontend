import React, { useEffect, useContext } from "react"
import Page from "./Page"
import StateContext from "../StateContext"
import { useImmer } from "use-immer"
import LoadingDotsIcon from "./LoadingDotsIcon"
import axios from "axios"
import { Link } from "react-router-dom"
import Post from "./Post"

function Home() {
  const globalAppState = useContext(StateContext)
  const [state, setState] = useImmer({
    isLoading: true, //displays a loading icon while the axios request is loading
    feed: [] //will store the json data for post objects
  })

  useEffect(() => {
    const request = axios.CancelToken.source()

    //you cannot pass an async function to useEffect directly, so create a new async function
    async function fetchData() {
      try {
        const response = await axios.post("/getHomeFeed", { token: globalAppState.user.token }, { cancelToken: request.token })
        setState(draft => {
          draft.isLoading = false
          draft.feed = response.data
        })
      } catch (e) {
        console.log("Problem found")
      }
    }
    fetchData()
    return () => {
      request.cancel()
    }
  }, [])

  if (state.isLoading) {
    return <LoadingDotsIcon />
  }

  return (
    <Page title="My Feed">
      {state.feed.length > 0 && (
        <>
          <h2 className="text-center mb-4"> The Latest From Those You Follow</h2>
          <div className="list-group">
            {state.feed.map(post => {
              return <Post post={post} key={post._id} />
            })}
          </div>
        </>
      )}
      {state.feed.length == 0 && (
        <>
          <h2 className="text-center">
            Hello <strong>{globalAppState.user.username.charAt(0).toUpperCase() + globalAppState.user.username.slice(1)} </strong>, your feed is empty.
          </h2>
          <p className="lead text-muted text-center">Your feed displays the latest posts from the people you follow. If you don&rsquo;t have any friends to follow that&rsquo;s okay; you can use the &ldquo;Search&rdquo; feature in the top menu bar to find content written by people with similar interests and then follow them.</p>
        </>
      )}
    </Page>
  )
}

export default Home
