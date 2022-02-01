import React, { useEffect, useContext, useState } from "react"
import Page from "./Page"
import { useParams, NavLink, Routes, Route, Switch } from "react-router-dom"
import axios from "axios"
import StateContext from "../StateContext"
import ProfilePosts from "./ProfilePosts"
import { useImmer } from "use-immer"
import ProfileFollows from "./ProfileFollows"
import NotFound from "../components/NotFound"

function Profile() {
  //create a variable that holds the username from the url
  const { username } = useParams()
  const globalAppState = useContext(StateContext)
  //create a variable that stores dummy post data whilst it waits for the response from the backend
  const [state, setState] = useImmer({
    followActionLoading: false,
    startFollowingRequestCount: 0,
    stopFollowingRequestCount: 0,
    profileData: {
      profileUsername: "...",
      profileAvatar: "https://gravatar.com/avatar/placeholder?s=128",
      isFollowing: false,
      counts: { postCount: "", followerCount: "", followingCount: "" }
    },
    notFound: false
  })

  useEffect(() => {
    const request = axios.CancelToken.source()

    ////you cannot pass an async function to useEffect directly, so create a new async function
    async function fetchData() {
      try {
        const response = await axios.post(`/profile/${username}`, { token: globalAppState.user.token }, { cancelToken: request.token })
        setState(draft => {
          if (response.data) {
            draft.profileData = response.data
          } else {
            draft.notFound = true
          }
        })
      } catch (e) {
        console.log("Problem found")
      }
    }
    fetchData()
    return () => {
      request.cancel()
    }
  }, [username])

  //hook that watches the start following count
  useEffect(() => {
    if (state.startFollowingRequestCount) {
      setState(draft => {
        draft.followActionLoading = true
      })
      const request = axios.CancelToken.source()

      async function fetchData() {
        try {
          const response = await axios.post(`/addFollow/${state.profileData.profileUsername}`, { token: globalAppState.user.token }, { cancelToken: request.token })
          setState(draft => {
            draft.profileData.isFollowing = true
            draft.profileData.counts.followerCount++
            draft.followActionLoading = false
          })
        } catch (e) {
          console.log("Problem found")
        }
      }
      fetchData()
      return () => {
        request.cancel()
      }
    }
  }, [state.startFollowingRequestCount])

  function startFollowing() {
    setState(draft => {
      draft.startFollowingRequestCount++
    })
  }

  function stopFollowing() {
    setState(draft => {
      draft.stopFollowingRequestCount++
    })
  }

  //hook that the stop following request count
  useEffect(() => {
    if (state.stopFollowingRequestCount) {
      setState(draft => {
        draft.followActionLoading = true
      })
      const request = axios.CancelToken.source()

      async function fetchData() {
        try {
          const response = await axios.post(`/removeFollow/${state.profileData.profileUsername}`, { token: globalAppState.user.token }, { cancelToken: request.token })
          setState(draft => {
            draft.profileData.isFollowing = false
            draft.profileData.counts.followerCount--
            draft.followActionLoading = false
          })
        } catch (e) {
          console.log("Problem found")
        }
      }
      fetchData()
      return () => {
        request.cancel()
      }
    }
  }, [state.stopFollowingRequestCount])

  if (state.notFound) return <NotFound />

  return (
    <Page title="Profile Screen">
      <h2>
        <img className="avatar-small" src={state.profileData.profileAvatar} /> {state.profileData.profileUsername}
        {globalAppState.loggedIn && !state.profileData.isFollowing && globalAppState.user.username != state.profileData.profileUsername && state.profileData.profileUsername != "..." && (
          <button onClick={startFollowing} disabled={state.followActionLoading} className="btn btn-primary btn-sm ml-2">
            Follow <i className="fas fa-user-plus"></i>
          </button>
        )}
        {globalAppState.loggedIn && state.profileData.isFollowing && globalAppState.user.username != state.profileData.profileUsername && state.profileData.profileUsername != "..." && (
          <button onClick={stopFollowing} disabled={state.followActionLoading} className="btn btn-danger btn-sm ml-2">
            Stop Following <i className="fas fa-user-times"></i>
          </button>
        )}
      </h2>

      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <NavLink exact to={`/profile/${state.profileData.profileUsername}`} end className="nav-item nav-link">
          Posts: {state.profileData.counts.postCount}
        </NavLink>
        <NavLink to={`/profile/${state.profileData.profileUsername}/followers`} className="nav-item nav-link">
          Followers: {state.profileData.counts.followerCount}
        </NavLink>
        <NavLink to={`/profile/${state.profileData.profileUsername}/following`} className="nav-item nav-link">
          Following: {state.profileData.counts.followingCount}
        </NavLink>
      </div>

      <Switch>
        <Route exact path="/profile/:username">
          <ProfilePosts />
        </Route>
        <Route path="/profile/:username/:action">
          <ProfileFollows action="followers" />
        </Route>
        <Route path="/profile/:username/:action">
          <ProfileFollows action="following" />
        </Route>
      </Switch>
    </Page>
  )
}

export default Profile
