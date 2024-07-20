import { AddIcon } from '@chakra-ui/icons'
import { Button, FormControl, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Textarea, useColorModeValue, useDisclosure, Text, Input, Flex, CloseButton, Image } from '@chakra-ui/react'
import React, { useRef, useState, useEffect } from 'react'
import usePreviewImg from '../hooks/usePreviewImg'
import { BsFillImageFill } from 'react-icons/bs'
import { useRecoilState, useRecoilValue } from 'recoil'
import userAtom from '../atoms/userAtom'
import useShowToast from '../hooks/useShowToast'
import { useNavigate, useParams } from 'react-router-dom'
import postsAtom from '../atoms/postAtom'

const MAX_CHAR = 500;

const CreatePost = () => {

    const { isOpen, onOpen, onClose } = useDisclosure()
    const showToast = useShowToast()
    const user = useRecoilValue(userAtom);
    const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();
    const [postText, setPostText] = useState('');
    const [remainingCharacter, setRemainingCharacter] = useState(MAX_CHAR);
    const [updating, setUpdating] = useState(false)
    const [redirect, setRedirect] = useState(false);
    const [posts, setPosts] = useRecoilState(postsAtom) 
    const fileRef = useRef(null)
    const navigate = useNavigate();
    const username = useParams();


    const handleTextChange = (e) => {
        const inputText = e.target.value;
        if(inputText.length > MAX_CHAR){
            const trunctedText = inputText.slice(0, MAX_CHAR);
            setPostText(trunctedText);
            setRemainingCharacter(0);
        }else{
            setPostText(inputText);
            setRemainingCharacter(MAX_CHAR - inputText.length)
        }
    }

    const handleCreatePost = async (e) => {
        setUpdating(true);
        try {
            e.preventDefault()

            const response = await fetch("http://localhost:5000/api/posts/create", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({postedBy: user._id, text: postText, img: imgUrl, }),
                credentials: 'include'
            })

            const data = await response.json();
            console.log(data)

            if (data.error) {
                showToast('Error', data.error, 'error');
                return;
            }
            showToast("Success", "Post Created successfully" , "success")
            onClose();
            setPosts([data, ...posts])
            setImgUrl("");
            setPostText("");
            setRedirect(true);

        } catch (error) {
            showToast("Error", error.message, "error")
        }finally{
            setUpdating(false);
        }
    }

    useEffect(() => {
        if (redirect) {
            navigate(`/${user.username}`);
        }
    }, [redirect, navigate]);

    return (
        <>
            <Button
                size={"sm"}
                bg={useColorModeValue("gray.300", "gray.dark")}
                onClick={onOpen}
            >
            <AddIcon />
            </Button>

            <Modal isOpen={isOpen} onClose={onClose} >
                <ModalOverlay />
                <ModalContent bg={useColorModeValue('white', 'gray.dark')}>
                    <ModalHeader>Create Post</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <FormControl>
                            <Textarea
                                placeholder='Post content goes here'
                                onChange={handleTextChange}
                                value={postText}
                            />
                            <Text fontSize={"xs"} fontWeight={"bold"} m={"1"} textAlign={"right"} color={"gray.light"}>{remainingCharacter}/{MAX_CHAR}</Text>
                            <Input
                                type='file'
                                hidden
                                ref={fileRef}
                                onChange={handleImageChange}
                            />
                            <BsFillImageFill
                                style={{marginLeft: "5px", cursor: "pointer"}}
                                size={16}
                                onClick={() => fileRef.current.click()}
                            />
                        </FormControl>
                        {imgUrl && (
                            <Flex mt={5} w={"full"} position={"relative"}>
                                <Image src={imgUrl} alt='Selected img'/>
                                <CloseButton 
                                    onClick={() => {
                                        setImgUrl("")
                                    }}
                                    bg={"gray.800"}
                                    position={"absolute"}
                                    top={2}
                                    right={2}
                                />
                            </Flex>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button bg={useColorModeValue('gray.300', 'gray.dark')} mr={3} onClick={handleCreatePost} isLoading={updating}>
                            Post
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default CreatePost