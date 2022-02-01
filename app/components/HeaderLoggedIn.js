import React, { useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import DispatchContext from "../DispatchContext"
import StateContext from "../StateContext"
import ReactTooltip from "react-tooltip"

function HeaderLoggedIn(props) {
  //create a context variable to get access to the dispatch state from Main.js to modify the loggedIn state
  const globalAppDispatch = useContext(DispatchContext)
  const globalAppState = useContext(StateContext)

  //create a function that handles the event once the sign out button is clicked
  function handleLogOut() {
    //when the user clicks on sign out, change/update the state called logged in to false
    globalAppDispatch({ type: "logout" })
    globalAppDispatch({ type: "flashMessage", value: "Succesful Logout" })
  }

  //function that makes a dispatch call to open the search overlay
  function handleSearchIcon(e) {
    e.preventDefault()
    globalAppDispatch({ type: "openSearch" })
  }

  return (
    <div className="flex-row my-3 my-md-0">
      <a data-for="search" data-tip="Search" onClick={handleSearchIcon} href="#" className="text-white mr-2 header-search-icon">
        <i className="fas fa-search"></i>
      </a>
      <ReactTooltip place="bottom" id="search" className="custom-tooltip" />{" "}
      <span onClick={() => globalAppDispatch({ type: "toggleChat" })} data-for="chat" data-tip="Chat" className={"mr-2 header-chat-icon " + (globalAppState.unreadChatCount ? "text-danger" : "text-white")}>
        <i className="fas fa-comment"></i>
        {globalAppState.unreadChatCount ? <span className="chat-count-badge text-white">{globalAppState.unreadChatCount < 10 ? globalAppState.unreadChatCount : "9+"} </span> : ""}
      </span>
      <ReactTooltip place="bottom" id="chat" className="custom-tooltip" />{" "}
      <Link data-for="profile" data-tip="My Profile" to={`/profile/${globalAppState.user.username}`} className="mr-2">
        <img className="small-header-avatar" src={globalAppState.user.avatar} />
      </Link>
      <ReactTooltip place="bottom" id="profile" className="custom-tooltip" />{" "}
      <Link className="btn btn-sm btn-success mr-2" to="/create-post">
        Create Post
      </Link>{" "}
      <button onClick={handleLogOut} className="btn btn-sm btn-secondary">
        Sign Out
      </button>
    </div>
  )
}

export default HeaderLoggedIn
