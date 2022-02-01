import React, { useContext, useEffect } from "react"
import DispatchContext from "../DispatchContext"
import { useImmer } from "use-immer"
import axios from "axios"
import { Link } from "react-router-dom"
import Post from "./Post"

function Search() {
  const globalAppDispatch = useContext(DispatchContext)

  //initial state
  const [state, setState] = useImmer({
    searchTerm: "", //holds the text that the user types in the search textfield
    results: [], //holds any post data that matches the search term
    show: "neither", //decides between displaying loading icon or post data from the db
    requestCount: 0
  })

  //useEffect hook to exit the search overlay by pressing the escape keyboard key
  useEffect(() => {
    //add a keyboard listener event to the browser
    document.addEventListener("keyup", searchKeyPressHandler)

    //remove the event listener once the user exits the search overlay
    return () => document.removeEventListener("keyup", searchKeyPressHandler)
  }, [])

  //function to close the overlay only the user presses the escape keyboard key (code 27)
  function searchKeyPressHandler(e) {
    if (e.keyCode == 27) {
      globalAppDispatch({ type: "closeSearch" })
    }
  }

  //function to handle any change in the search input field
  function handleInput(e) {
    const value = e.target.value //holds the text from the textfield
    setState(draft => {
      draft.searchTerm = value //stores that text in state
    })
  }

  //delay any text that the user writes before increment the request count
  useEffect(() => {
    if (state.searchTerm.trim()) {
      //if searchfield is not blank
      setState(draft => {
        draft.show = "loading"
      })

      const delay = setTimeout(() => {
        setState(draft => {
          draft.requestCount++
        })
      }, 750)

      //if any text is added or deleted before the 750 millisecond timeout, clear that timeout and start a new one
      return () => clearTimeout(delay)
    } else {
      setState(draft => {
        draft.show = "neither"
      })
    }
  }, [state.searchTerm])

  //if the count is bigger than 0, send a request to the server to search for any matching posts
  useEffect(() => {
    if (state.requestCount) {
      // Send axios request
      const request = axios.CancelToken.source()
      async function fetchResults() {
        try {
          const response = await axios.post("/search", { searchTerm: state.searchTerm }, { cancelToken: request.token })
          //store result() in state
          setState(draft => {
            draft.results = response.data
            draft.show = "results"
          })
        } catch (e) {
          console.log("There was a problem or the request was cancelled")
        }
      }
      fetchResults()
      return () => request.cancel()
    }
  }, [state.requestCount])

  return (
    <>
      <div className="search-overlay-top shadow-sm">
        <div className="container container--narrow">
          <label htmlFor="live-search-field" className="search-overlay-icon">
            <i className="fas fa-search"></i>
          </label>
          <input onChange={handleInput} autoFocus type="text" autoComplete="off" id="live-search-field" className="live-search-field" placeholder="What are you interested in?" />
          <span onClick={() => globalAppDispatch({ type: "closeSearch" })} className="close-live-search">
            <i className="fas fa-times-circle"></i>
          </span>
        </div>
      </div>

      <div className="search-overlay-bottom">
        <div className="container container--narrow py-3">
          <div className={"circle-loader " + (state.show == "loading" ? "circle-loader--visible" : "")}></div>
          <div className={"live-search-results " + (state.show == "results" ? "live-search-results--visible" : "")}>
            {Boolean(state.results.length) && (
              <div className="list-group shadow-sm">
                <div className="list-group-item active">
                  <strong>Search Results</strong> ({state.results.length} {state.results.length > 1 ? "items" : "item"} found)
                </div>
                {state.results.map(post => {
                  return <Post post={post} key={post._id} onClick={() => globalAppDispatch({ type: "closeSearch" })} />
                })}
              </div>
            )}
            {!Boolean(state.results.length) && <p className="alert alert-danger text-center shadow-sm">Sorry, we could not find any results for that search</p>}
          </div>
        </div>
      </div>
    </>
  )
}

export default Search
