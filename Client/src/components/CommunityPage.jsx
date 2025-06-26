import Post from './Post.jsx';
import TimeStamps from './TimeStamps.jsx';
import ParseDescription from './ParseDescription.jsx';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import SortPosts from './SortPosts.jsx';
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:8000';

function CommunityPage({
  community,
  getPosts,
  goToPostPage,
  getCommunityName,
  comments,
  getCommentLength,
  isLoggedIn,
  buttonTrigger,
  handleError,
  checkPostExists
}) {
  const [type, setType] = useState('newest');
  const [isMember, setMemberStatus] = useState(false);
  const [posts, setPosts] = useState([]);
  const [memberCount, setMemberCount] = useState(community.memberCount);

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        if (isLoggedIn) {
          const response = await axios.get(`/member/${community._id}`, {
            withCredentials: true
          });
          setMemberStatus(response.data.isMember);
        }
        const postArray = await axios.get(`/communityPosts/${community._id}`);
        setPosts(postArray.data);

        setMemberCount(community.memberCount);
      } catch (err) {
        console.error("Error fetching community data:", err);
        handleError(err);
      }
    };

    setType('newest');
    fetchCommunityData();
  }, [community._id, isLoggedIn]);

  const leaveCommunity = async (e) => {
    e.preventDefault();
    try {
      const newMemberCount = await axios.post(`/leaveCommunity/${community._id}`);
      setMemberCount(newMemberCount.data);
      setMemberStatus(false);
      buttonTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error leaving the community');
      handleError(err);
    }
  };

  const joinCommunity = async (e) => {
    e.preventDefault();
    try {
      const newMemberCount = await axios.post(`/joinCommunity/${community._id}`);
      setMemberCount(newMemberCount.data);
      setMemberStatus(true);
      buttonTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error joining the community');
      handleError(err);
    }
  };

  const communityArray = SortPosts({ array: posts, type, comments });

  const handleClick = (order) => {
    setType(order);
  };

  return (
    <div id="communitypage_setup">
      <div id="community_wrapper">
        <div id="community_view_name">
          <h1>{community.name}</h1>
        </div>
        <div id="community_buttons">
          <button id="community_newest" onClick={() => handleClick('newest')}>Newest</button>
          <button id="community_oldest" onClick={() => handleClick('oldest')}>Oldest</button>
          <button id="community_active" onClick={() => handleClick('active')}>Active</button>
        </div>
      </div>

      <div id="community_description">
        <ParseDescription description={community.description} />
      </div>
      <div id="community_timestamp">
        <p>Created <TimeStamps date={community.startDate} /> by {community.creator}</p>
      </div>
      <p id="numberOfPosts"> {communityArray.length} post(s) | {memberCount} member(s)</p>

      {isLoggedIn ? (
        <>
          {isMember ? (
            <button id="join_leave" onClick={leaveCommunity}>Leave</button>
          ) : (
            <button id="join_leave" onClick={joinCommunity}>Join</button>
          )}
        </>
      ) : (
        <></>
        // <p id="numberOfPosts"> {communityArray.length} post(s)</p>
      )}

      <hr />
      <div id="community_posts">
        {communityArray.map(post => (
          <Post
            key={post._id}
            post={post}
            goToPostPage={goToPostPage}
            getCommunityName={getCommunityName}
            community={true}
            getCommentLength={getCommentLength}
            checkPostExists={checkPostExists}
          />
        ))}
      </div>
    </div>
  );
}

export default CommunityPage;

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

CommunityPage.propTypes = {
  community: communityShape.isRequired,
  getPosts: PropTypes.func.isRequired,
  goToPostPage: PropTypes.func.isRequired,
  getCommunityName: PropTypes.func.isRequired,
  comments: PropTypes.arrayOf(commentShape).isRequired,
  getCommentLength: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  buttonTrigger: PropTypes.func.isRequired,
  handleError: PropTypes.func.isRequired
};
