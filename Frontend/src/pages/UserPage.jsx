import { useState, useEffect } from 'react'
import UserHeader from '../components/UserHeader'
import { useParams } from 'react-router-dom';
import useShowToast from '../hooks/useShowToast';
import { Flex, Spinner } from '@chakra-ui/react';
import Post from '../components/Post';
import useGetUserProfile from '../hooks/useGetUserProfile';
import { useRecoilState } from 'recoil';
import postsAtom from '../atoms/postAtom';

const UserPage = () => {

  const { user, loading } = useGetUserProfile()
  const { username } = useParams()
  const showToast = useShowToast()
  const [posts, setPosts] = useRecoilState(postsAtom)
  const [fetchingPost, setFetchingPosts] = useState(true);

  useEffect(() => {

    const getPosts = async () => {
      try {

        const response = await fetch(`http://localhost:5000/api/posts/user/${username}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        })
        const data = await response.json();
        // console.log(data)
        if (data.error) {
          showToast('Error', data.error, 'error');
          return;
        }
        setPosts(data.posts)
      } catch (error) {
        showToast("Error", error.message, "error")
        setPosts([])
      } finally {
        setFetchingPosts(false)
      }
    }

    getPosts()

  }, [username, showToast, setPosts])

  if (!user && loading) {
    return <Flex h={"80vh"} justifyContent={"center"} alignItems={"center"}><Spinner size={"xl"} /></Flex>
  }

  if (!user && !loading) {
    return <Flex h={"80vh"} justifyContent={"center"} alignItems={"center"}><h1>User not found</h1></Flex>;
  }
  return (
    <div>
      <UserHeader user={user} />

      {!fetchingPost && posts.length === 0 && <Flex justifyContent={"center"} alignItems={"center"} mt={5}><h1>User has no posts.</h1></Flex>}

      {fetchingPost && (<Flex justifyContent={"center"} alignItems={"center"}><Spinner mt={40} size={"xl"} /></Flex>)}

      {posts.map((post) => (
        <Post key={post._id} post={post} postedBy={post.postedBy}/>
      ))}
    </div>
  )
}

export default UserPage