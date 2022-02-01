import React, { useState, useContext } from "react"
import { Link } from "react-router-dom"
import HeaderLoggedOut from "./HeaderLoggedOut"
import HeaderLoggedIn from "./HeaderLoggedIn"
import StateContext from "../StateContext"

function Header(props) {
  const globalAppState = useContext(StateContext)
  const headerContent = globalAppState.loggedIn ? <HeaderLoggedIn /> : <HeaderLoggedOut />

  return (
    <header className="header-bar bg-primary mb-3">
      <div className="container d-flex flex-column flex-md-row align-items-center p-3">
        <h4 className="my-0 mr-md-auto font-weight-normal">
          <Link to="/" className="text-white">
            ChatApp?
          </Link>
        </h4>

        {!props.staticEmpty ? headerContent : ""}
      </div>
    </header>
  )
}

export default Header
