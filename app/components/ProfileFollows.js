import React, { useEffect, useState, useContext } from "react"
import Axios from "axios"
import { useParams, Link } from "react-router-dom"
import LoadingDotsIcon from "./LoadingDotsIcon"
import StateContext from "../StateContext"

function ProfileFollows(props) {
  const { username, action } = useParams()
  const appState = useContext(StateContext)
  const [isLoading, setIsLoading] = useState(true)
  const [follows, setFollows] = useState([])

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()

    async function fetchProfiles() {
      try {
        const response = await Axios.get(`/profile/${username}/${action}`, {
          cancelToken: ourRequest.token
        })
        setFollows(response.data)
        setIsLoading(false)
        // console.log(response.data);
      } catch (e) {
        console.log("There was a problem or the request was cancelled.")
      }
    }
    fetchProfiles()
    return function CleanUpToken() {
      ourRequest.cancel()
    }
  }, [username, action])

  if (isLoading) {
    return <LoadingDotsIcon />
  } else {
    return (
      <div className="list-group">
        {appState.loggedIn &&
          follows.length > 0 &&
          follows.map((follow, index) => {
            return (
              <Link key={index} to={`/profile/${follow.username}`} className="list-group-item list-group-item-action">
                <img className="avatar-tiny" src={follow.avatar} />
                {follow.username}
              </Link>
            )
          })}
        {appState.loggedIn && follows.length == 0 && action == "followers" && <div className="list-group-item lead text-muted text-center">No followers yet.</div>}
        {appState.loggedIn && follows.length == 0 && action == "following" && <div className="list-group-item lead text-muted text-center">No followings yet.</div>}
        {!appState.loggedIn && <div className="list-group-item lead text-muted text-center">Only users with a registered account can see this information.</div>}
      </div>
    )
  }
}

export default ProfileFollows
