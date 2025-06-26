import React from 'react';
import PropTypes from 'prop-types';

export default function UserPost({post}){
    return (
        <div class="formatted_post">
            <p>{post.title}</p>
        </div>
    );
};


UserPost.propTypes = {
    post: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        linkFlairID: PropTypes.object,
        postedBy: PropTypes.string.isRequired,
        postedDate: PropTypes.instanceOf(Date).isRequired,
        commentIDs: PropTypes.arrayOf(PropTypes.string).isRequired,
        views: PropTypes.number.isRequired,
        vote: PropTypes.number
    }).isRequired
}