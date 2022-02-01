import axios from "axios"
import React, { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import LoadingDotsIcon from "./LoadingDotsIcon"
import Post from "./Post"

function ProfilePosts() {
  //create a piece of state that checks if the axios request to the backend has finished loading
  const [isLoading, setIsLoading] = useState(true)
  //create a piece of state that stores the raw/dummy data for all of the posts
  const [posts, setPosts] = useState([])

  //create a variable that retrieves the username from the url
  const { username } = useParams()

  useEffect(() => {
    const axiosRequest = axios.CancelToken.source()
    //you cannot pass an async function to useEffect directly, so create a new async function
    async function fetchPosts() {
      try {
        const response = await axios.get(`/profile/${username}/posts`, { cancelToken: axiosRequest.token })
        setPosts(response.data)
        setIsLoading(false)
      } catch (e) {
        console.log("Oops, there was a problem")
      }
    }
    fetchPosts()

    return () => {
      axiosRequest.cancel()
    }
  }, [username]) //square bracket because it only runs the first time this page is loaded

  //if the axios request is still loading, display a loading div
  if (isLoading) return <LoadingDotsIcon />

  return (
    <div className="list-group">
      {/* Loop through the array of posts in the database and print each of one of them */}
      {posts.map(post => {
        return <Post noAuthor={true} post={post} key={post._id} />
      })}
    </div>
  )
}

export default ProfilePosts
