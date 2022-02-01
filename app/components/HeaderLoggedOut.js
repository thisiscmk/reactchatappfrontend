import React, { useEffect, useState, useContext } from "react"
import Axios from "axios"
import DispatchContext from "../DispatchContext"

function HeaderLoggedOut(props) {
  //create a context variable to get access to the dispatch state from Main.js to modify the loggedIn state
  const globalAppDispatch = useContext(DispatchContext)

  //create states to handle the values of the login texfields
  const [username, setUsername] = useState()
  const [password, setPassword] = useState()

  //create a function that sends an axios request to the api to login a user
  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const response = await Axios.post("/login", { username: username, password: password })
      if (response.data) {
        //update the loggedIn state to true via the useReducer's dispatch method
        globalAppDispatch({ type: "login", data: response.data })
        globalAppDispatch({ type: "flashMessage", value: "Succesful Login" })
      } else {
        console.log("Incorrect username or password!!!")
        globalAppDispatch({ type: "flashMessage", value: "Invalid Username/Password" })
      }
    } catch (err) {
      console.log("Oops, there seems to be a problem")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-0 pt-2 pt-md-0">
      <div className="row align-items-center">
        <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
          <input onChange={e => setUsername(e.target.value)} name="username" className="form-control form-control-sm input-dark" type="text" placeholder="Username" autoComplete="off" />
        </div>
        <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
          <input onChange={e => setPassword(e.target.value)} name="password" className="form-control form-control-sm input-dark" type="password" placeholder="Password" />
        </div>
        <div className="col-md-auto">
          <button className="btn btn-success btn-sm">Sign In</button>
        </div>
      </div>
    </form>
  )
}

export default HeaderLoggedOut
