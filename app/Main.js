import React, { useState, useReducer, useEffect, Suspense } from "react"
import ReactDOM from "react-dom"
import { useImmerReducer } from "use-immer"
import { BrowserRouter, Switch, Route } from "react-router-dom"
import { CSSTransition } from "react-transition-group"
import axios from "axios"
//make the base url for the backend api routes available here
axios.defaults.baseURL = process.env.BACKENDURL || "https://cmkchatappbackend.herokuapp.com"

//contexts
import StateContext from "./StateContext"
import DispatchContext from "./DispatchContext"

//components
import Header from "./components/Header"
import HomeGuest from "./components/HomeGuest"
import Footer from "./components/Footer"
import About from "./components/About"
import Terms from "./components/Terms"
import Home from "./components/Home"
const CreatePost = React.lazy(() => import("./components/CreatePost"))
const ViewSinglePost = React.lazy(() => import("./components/ViewSinglePost"))
const Search = React.lazy(() => import("./components/Search"))
const Chat = React.lazy(() => import("./components/Chat"))
import FlashMessages from "./components/FlashMessages"
import Profile from "./components/Profile"
import EditPost from "./components/EditPost"
import NotFound from "./components/NotFound"
import LoadingDotsIcon from "./components/LoadingDotsIcon"

function Main() {
  //configure the inital state of the useImmerReducer hook to have an initial state for login, flash messages and searchIcon
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("token")),
    flashMessages: [],
    user: {
      token: localStorage.getItem("token"),
      username: localStorage.getItem("username"),
      avatar: localStorage.getItem("avatar")
    },
    isSearchOpen: false, //checks if the search overlay is open
    isChatOpen: false, //checks if the chat box/wrapper is open
    unreadChatCount: 0
  }

  //create a function to initialize the reducer
  function ourReducer(draft, action) {
    switch (action.type) {
      case "login":
        draft.loggedIn = true
        draft.user = action.data
        return
      case "logout":
        draft.loggedIn = false
        return
      case "flashMessage":
        draft.flashMessages.push(action.value)
        return

      case "openSearch":
        draft.isSearchOpen = true
        return

      case "closeSearch":
        draft.isSearchOpen = false
        return

      case "toggleChat":
        draft.isChatOpen = !draft.isChatOpen //switch from open to close chat and vice versa (for the chat icon)
        return

      case "closeChat":
        draft.isChatOpen = false
        return

      case "incrementUnreadChatCount":
        draft.unreadChatCount++
        return

      case "clearUnreadChatCount":
        draft.unreadChatCount = 0
        return
    }
  }

  //initialize the useImmerReducer which is a combination of useReducer and Immer
  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  //initalize a useEffect hook to store a user's token, username, avatar into localStorage when the user logs in
  useEffect(() => {
    if (state.loggedIn) {
      //if loggedin state is true
      //store the json token, username and password in local storage
      localStorage.setItem("token", state.user.token)
      localStorage.setItem("username", state.user.username)
      localStorage.setItem("avatar", state.user.avatar)
    } else {
      //if loggedIn state is false
      //remove the json token, username and password from local storage
      localStorage.removeItem("token")
      localStorage.removeItem("username")
      localStorage.removeItem("avatar")
    }
  }, [state.loggedIn])

  //check if token has expired or not on first render
  useEffect(() => {
    if (state.loggedIn) {
      // Send axios request
      const request = axios.CancelToken.source()
      async function fetchResults() {
        try {
          const response = await axios.post("/checkToken", { token: state.user.token }, { cancelToken: request.token })
          if (!response.data) {
            //if token is not valid
            dispatch({ type: "logout" })
            dispatch({ type: "flashMessage", value: "Your session has expired. Please log in again" })
          }
        } catch (e) {
          console.log("There was a problem or the request was cancelled")
        }
      }
      fetchResults()
      return () => request.cancel()
    }
  }, [])

  return (
    //create separate context provider components for state and dispatch to allow consuming components to subscribe to context changes
    //each component will select only the context provider they need. This is perfect for performance to avoid unnecessary rendering
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
          <Suspense fallback={<LoadingDotsIcon />}>
            <Switch>
              <Route path="/" exact>
                {state.loggedIn ? <Home /> : <HomeGuest />}
              </Route>
              <Route path="/create-post" exact>
                {state.loggedIn ? <CreatePost /> : <HomeGuest />}
              </Route>
              <Route path="/post/:id" exact>
                {state.loggedIn ? <ViewSinglePost /> : <HomeGuest />}
              </Route>
              <Route path="/post/:id/edit" exact>
                {state.loggedIn ? <EditPost /> : <HomeGuest />}
              </Route>
              <Route path="/about-us" exact>
                <About />
              </Route>
              <Route path="/terms" exact>
                <Terms />
              </Route>
              <Route path="/profile/:username">{state.loggedIn ? <Profile /> : <HomeGuest />}</Route>
              <Route path="/profile/:username/followers" exact>
                {state.loggedIn ? <Profile /> : <HomeGuest />}
              </Route>
              <Route path="/profile/:username/following" exact>
                {state.loggedIn ? <Profile /> : <HomeGuest />}
              </Route>
              {/* Error route */}
              <Route>
                <NotFound />
              </Route>
            </Switch>
          </Suspense>
          <CSSTransition timeout={330} in={state.isSearchOpen} classNames="search-overlay" unmountOnExit>
            <div className="search-overlay">
              <Suspense fallback="">
                <Search />
              </Suspense>
            </div>
          </CSSTransition>
          <Suspense fallback="">{state.loggedIn && <Chat />}</Suspense>
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

ReactDOM.render(<Main />, document.querySelector("#app"))

//Load the modified javascript asynchronously every time you save
if (module.hot) {
  module.hot.accept()
}
