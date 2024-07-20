import { Flex, Spinner } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import useShowToast from '../hooks/useShowToast';
import Post from '../components/Post';
import { useRecoilState } from 'recoil';
import postsAtom from '../atoms/postAtom';

const HomePage = () => {

  const [posts, setPosts] = useRecoilState(postsAtom)
  const [loading, setLoading] = useState(true);
  const showToast = useShowToast();

  useEffect(() => {
    setPosts([])
    const getFeedPosts = async () => {
      setLoading(true);
      try {

        const response = await fetch('http://localhost:5000/api/posts/feed', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        })
        const data = await response.json();
        if (data.error) {
          showToast('Error', data.error, 'error');
          return;
        }
        setPosts(data)
      } catch (error) {
        showToast('Error', error.message, 'error');
      } finally {
        setLoading(false);
      }
    } 
    getFeedPosts();
  }, [setPosts, showToast])

  return (
    <>
      {!loading && posts.length === 0 && <Flex h={"80vh"} justifyContent={"center"} alignItems={"center"}><h1>Follow some users to see the feed</h1></Flex>}

      {loading && (
        <Flex h={"80vh"} justifyContent={"center"} alignItems={"center"}><Spinner size={"xl"} /></Flex>
      )}

      {posts?.map((post) => {
        return <Post key={post._id} post={post} postedBy={post.postedBy} />
      })}
    </>
  )
}

export default HomePage