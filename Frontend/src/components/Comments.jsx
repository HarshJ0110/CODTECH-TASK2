import { Avatar, Divider, Flex, Image, Text } from '@chakra-ui/react'
import React from 'react'

const Comments = ({ comment, lastComment }) => {
    return (
        <>
            <Flex gap={4} py={2} my={3} w={"full"}>
                <Avatar src={comment.userProfilePic} size={"sm"} />
                <Flex gap={1} w={"full"} flexDirection={"column"}>
                    <Flex w={"full"} alignItems={"center"}>
                        <Text fontSize={"sm"} fontWeight={"bold"}>{comment.username}</Text>
                        <Image src='/verified.png' w={4} h={4} ml={1}></Image>
                    </Flex>
                    <Text>{comment.text}</Text>
                </Flex>
            </Flex>
            {!lastComment ? <Divider/> : null}
        </>
    )
}

export default Comments