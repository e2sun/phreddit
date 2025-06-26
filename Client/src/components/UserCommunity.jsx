import React from 'react';
import PropTypes from 'prop-types';

export default function UserCommunity({community}){
    return (
        <div class="formatted_community">
            <p>{community.name}</p>
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

const communityShape = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  postIDs: PropTypes.arrayOf(PropTypes.string).isRequired,
  startDate: PropTypes.instanceOf(Date).isRequired,
  members: PropTypes.arrayOf(PropTypes.string).isRequired,
  memberCount: PropTypes.number.isRequired
});


UserCommunity.propTypes = {
    community:communityShape.isRequired
}