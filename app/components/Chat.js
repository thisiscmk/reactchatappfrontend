import React, { useEffect, useContext, useRef } from "react"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
import { useImmer } from "use-immer"
import { Link } from "react-router-dom"
import { io } from "socket.io-client"

function Chat() {
  const socket = useRef(null)
  const globalAppState = useContext(StateContext)
  const globalAppDispatch = useContext(DispatchContext)
  const chatField = useRef(null) //useRef modifies the state of an object (htmlinputelement etc.) without having to use setState.
  const chatLog = useRef(null)
  const [state, setState] = useImmer({
    textfieldValue: "",
    chatMessages: []
  })

  //hook to focus the chat box's textfield
  useEffect(() => {
    if (globalAppState.isChatOpen) {
      chatField.current.focus()
      globalAppDispatch({ type: "clearUnreadChatCount" })
    }
  }, [globalAppState.isChatOpen])

  //function to handle the chat textfield onchange event
  function handleFieldChange(e) {
    const value = e.target.value
    setState(draft => {
      draft.textfieldValue = value
    })
  }

  //useEffect hook for socket.io for the browser to start listening to the server
  useEffect(() => {
    socket.current = io(process.env.BACKENDURL || "https://cmkchatappbackend.herokuapp.com")

    socket.current.on("chatFromServer", message => {
      setState(draft => {
        draft.chatMessages.push(message)
      })
    })

    return () => socket.current.disconnect()
  }, [])

  //hook that watches the chat messages
  useEffect(() => {
    chatLog.current.scrollTop = chatLog.current.scrollHeight //scroll the chatbox to make the latest message appear automatically

    if (state.chatMessages.length && !globalAppState.isChatOpen) {
      globalAppDispatch({ type: "incrementUnreadChatCount" })
    }
  }, [state.chatMessages])

  //function to handle the form submission (when user presses enter once done typing)
  function handleSubmit(e) {
    e.preventDefault()
    //send message to chat server
    socket.current.emit("chatFromBrowser", { message: state.textfieldValue, token: globalAppState.user.token })

    setState(draft => {
      //add user typed message to state collection of messages
      draft.chatMessages.push({ message: draft.textfieldValue, username: globalAppState.user.username, avatar: globalAppState.user.avatar })
      draft.textfieldValue = "" //clear out the textfield after the user has pressed enter
    })
  }

  return (
    <div id="chat-wrapper" className={"chat-wrapper shadow border-top border-left border-right " + (globalAppState.isChatOpen ? "chat-wrapper--is-visible" : "")}>
      <div className="chat-title-bar bg-primary">
        Chat
        <span onClick={() => globalAppDispatch({ type: "closeChat" })} className="chat-title-bar-close">
          <i className="fas fa-times-circle"></i>
        </span>
      </div>
      <div id="chat" ref={chatLog} className="chat-log">
        {state.chatMessages.map((message, index) => {
          if (message.username == globalAppState.user.username) {
            //if its the logged in user texting
            return (
              <div key={index} className="chat-self">
                <div className="chat-message">
                  <div className="chat-message-inner">{message.message}</div>
                </div>
                <img className="chat-avatar avatar-tiny" src={message.avatar} />
              </div>
            )
          }

          //if its a text from another user
          return (
            <div key={index} className="chat-other">
              <Link to={`/profile/${message.username}`}>
                <img className="avatar-tiny" src={message.avatar} />
              </Link>
              <div className="chat-message">
                <div className="chat-message-inner">
                  <Link to={`/profile/${message.username}`}>
                    <strong>{message.username} : </strong>
                  </Link>
                  {message.message}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <form onSubmit={handleSubmit} id="chatForm" className="chat-form border-top">
        <input value={state.textfieldValue} onChange={handleFieldChange} ref={chatField} type="text" className="chat-field" id="chatField" placeholder="Type a message…" autoComplete="off" />
      </form>
    </div>
  )
}

export default Chat
