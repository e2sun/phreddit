import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:8000';

export default function UserComment({comment, handleError}){
    const shortenedContent = comment.content.length > 20? comment.content.substring(0, 20) + "..." : comment.content;
    const [post, setPost] = useState(null);
    
    useEffect(() => {
        const fetchPost = async() => {
            try{
                const res = await axios.get(`/post/${comment._id}`);
                setPost(res.data);
            } catch (err) {
                console.error('Error fetching comment parent post');
                handleError(err);
            }
        };

        fetchPost();
    }, [comment._id])

    return (
        <div class="formatted_comment">
             {/* Add post title that comment belongs to */}
            <p><b>Post:</b> {post ? post.title : 'Loading post'}</p>
            <p><b>Comment:</b> {shortenedContent}</p>
        </div>
    );
};

const commentShape = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  commentIDs: PropTypes.arrayOf(PropTypes.string).isRequired,
  commentedBy: PropTypes.string.isRequired,
  commentedDate: PropTypes.instanceOf(Date).isRequired
});

UserComment.propTypes = {
    comment: commentShape.isRequired
}