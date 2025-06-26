import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import TimeStamps from './TimeStamps.jsx';
import UserComment from './UserComment.jsx';
import UserPost from './UserPost.jsx';
import UserCommunity from './UserCommunity.jsx';
import Admin from './Admin.jsx';
axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;

export default function UserProfile({
  goToPostPage,
  getCommunityName,
  getCommentLength,
  onCommunityEdit,
  onPostEdit,
  onCommentEdit,
  onAdminClick,
  subUser,
  shouldGoBack,
  returnClick,
  handleError,
  setButtonTrigger
}) {
  const [userButton, setButton] = useState('posts');
  const [content, setContent] = useState([]);
  const [user, setUser] = useState({});


  const getPosts = async () => {
    if (subUser) {
      try {
        const response = await axios.get(
          `/userPosts/${subUser._id}`
        );
        return response.data;
      } catch (err) {
        console.error('Error getting specific user posts:', err);
        handleError(err);
      }
    } else {
      try {
        console.log("USER: ", user)
        const response = await axios.get('/userPosts');
        return response.data;
      } catch (err) {
        console.error('Error getting user posts:', err);
        //handleError(err);
      }
    }
  };

  const getComments = async () => {
    if (subUser) {
      try {
        const response = await axios.get(
          `/userComments/${subUser._id}`
        );
        return response.data;
      } catch (err) {
        console.error('Error getting specific user comments:', err);
        handleError(err);
      }
    } else {
      try {
        const response = await axios.get(
          '/userComments'
        );
        return response.data;
      } catch (err) {
        console.error('Error getting user comments:', err);
        handleError(err);
      }
    }
  };

  const getCommunities = async () => {
    if (subUser) {
      try {
        const response = await axios.get(
          `/userCommunities/${subUser._id}`
        );
        return response.data;
      } catch (err) {
        console.error('Error getting specific user communities:', err);
        handleError(err);
      }
    } else {
      try {
        const response = await axios.get(
          '/userCommunities'
        );
        console.log("Got user communities");
        console.log(response.data); 
        return response.data;
      } catch (err) {
        console.error('Error getting user communities:', err);
        handleError(err);
      }
    }
  };

  const getUsers = async () => {
    try {
      const response = await axios.get('/users');
      return response.data;
    } catch (err) {
      console.error('Error fetching users:', err);
      handleError(err);
    }
  };

  const handleDeleteUser = async userId => {
    if (userId === user._id) {
      alert("You cannot delete your own account!");
      return;
    }
    
    if (
      !window.confirm(
        'Are you sure you want to delete this user?'
      )
    ) {
      return;
    }
   
    try {
      await axios.delete(
        `/deleteUser/${userId}`,
        { withCredentials: true }
      );
      setContent(prev => prev.filter(u => u._id !== userId));
      setButtonTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Delete user failed', err);
      alert('Deleting user failed.');
      handleError(err);
    }
  };

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await axios.get(
          '/userProfile'
        );
        setUser(response.data);
      } catch (err) {
        console.error('Error fetching user:', err);
        handleError(err);
      }
    }

    if (subUser) {
      setUser(subUser);
      setButton('posts');
    } else {
      fetchUser();
    }
  }, [subUser, handleError]);

  useEffect(() => {
    if (!user) return;

    async function fetchContent() {
      let data = [];
      switch (userButton) {
        case 'posts':
          data = await getPosts();
          break;
        case 'communities':
          data = await getCommunities();
          break;
        case 'comments':
          data = await getComments();
          break;
        case 'users':
          data = await getUsers();
          break;
        default:
          data = await getPosts();
      }
      setContent(data || []);
    }

    fetchContent();
  }, [userButton, user, user.isAdmin]);

  return (
    <div>
      <h1 id="user_profile_for">
        User Profile for: {user.displayName}
      </h1>
      <p id="user_profile_info">
        Email: {user.email} | Member Since:{' '}
        <TimeStamps date={user.createdAt} /> | Reputation:{' '}
        {user.reputation}
      </p>

      {shouldGoBack && (
        <button
          id="phreddit_users"
          onClick={e => {
            e.preventDefault();
            returnClick();
          }}
        >
          Return to User Profile
        </button>
      )}

      <div id="user_profile_buttons">
        <button
          id="user_communities_button"
          onClick={e => {
            e.preventDefault();
            if (userButton !== 'communities') {
              setContent([]);
              setButton('communities');
            }
          }}
        >
          Communities
        </button>
        <button
          id="user_posts_button"
          onClick={e => {
            e.preventDefault();
            if (userButton !== 'posts') {
              setContent([]);
              setButton('posts');
            }
          }}
        >
          Posts
        </button>
        <button
          id="user_comments_button"
          onClick={e => {
            e.preventDefault();
            if (userButton !== 'comments') {
              setContent([]);
              setButton('comments');
            }
          }}
        >
          Comments
        </button>
        {user.isAdmin && (
          <button
            id="admin_user_button"
            onClick={e => {
              e.preventDefault();
              if (userButton !== 'users') {
                setContent([]);
                setButton('users');
              }
            }}
          >
            Phreddit Users
          </button>
        )}
      </div>

      <hr />

      <div id="main_content">
        {userButton === 'posts' && (
          <div id="user_posts">
            {content.length === 0 ? (<><h1 className='missingContent'>You've got no posts!</h1></>) : (
            <ul id="post_list">
              {content.map(post => {
                const postLinkStyle = {
                  whiteSpace: 'normal',
                  overflowWrap: 'break-word',
                  wordWrap: 'break-word',
                  maxWidth: '150px',
                };
                return (
                  <li key={post._id}>
                    <a
                      href="#"
                      style={postLinkStyle}
                      onClick={e => {
                        e.preventDefault();
                        onPostEdit(post);
                      }}
                    >
                      <UserPost post={post} />
                    </a>
                  </li>
                );
              })}
            </ul>
            )}
          </div>
        )}

        {userButton === 'communities' && (
          <div id="user_communities">
            {content.length === 0 ? (<><h1 className='missingContent'>You've got no communities!</h1></>) : (
            <ul id="community_list">
              {content.map(community => {
                const communityLinkStyle = {
                  whiteSpace: 'normal',
                  overflowWrap: 'break-word',
                  wordWrap: 'break-word',
                  maxWidth: '150px',
                };
                return (
                  <li key={community._id}>
                    <a
                      href="#"
                      style={communityLinkStyle}
                      onClick={e => {
                        e.preventDefault();
                        onCommunityEdit(community);
                      }}
                    >
                      {console.log(community)}
                      <UserCommunity community={community} />
                    </a>
                  </li>
                );
              })}
            </ul>
            )}
          </div>
        )}

        {userButton === 'comments' && (
          <div id="user_comments">
            {content.length === 0 ? (<><h1 className='missingContent'>You've got no comments!</h1></>) : (
            <ul id="comment_list">
              {content.map(comment => {
                const commentLinkStyle = {
                  whiteSpace: 'normal',
                  overflowWrap: 'break-word',
                  wordWrap: 'break-word',
                  maxWidth: '150px',
                };
                return (
                  <li key={comment._id}>
                    <a
                      href="#"
                      style={commentLinkStyle}
                      onClick={e => {
                        e.preventDefault();
                        onCommentEdit(comment);
                      }}
                    >
                      <UserComment comment={comment} handleError={handleError}/>
                    </a>
                  </li>
                );
              })}
            </ul>
            )}
          </div>
        )}

        {userButton === 'users' && (
          <div id="all_users">
            {content.length === 0 ? (<><h1 className='missingContent'>There are no users!</h1></>) : (
            <ul id="user_list">
              {content.map(user => {
                const userLinkStyle = {
                  whiteSpace: 'normal',
                  overflowWrap: 'break-word',
                  wordWrap: 'break-word',
                  maxWidth: '150px',
                };
                return (
                  <li key={user._id}>
                    <a
                      href="#"
                      style={userLinkStyle}
                      onClick={e => {
                        e.preventDefault();
                        onAdminClick(user);
                      }}
                    >
                      <Admin user={user} />
                    </a>
                    <button
                      id="delete_user"
                      onClick={e => {
                        e.preventDefault();
                        handleDeleteUser(user._id);
                      }}
                    >
                      Delete User
                    </button>
                  </li>
                );
              })}
            </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

UserProfile.propTypes = {
  goToPostPage: PropTypes.func.isRequired,
  getCommunityName: PropTypes.func.isRequired,
  getCommentLength: PropTypes.func.isRequired,
  onCommunityEdit: PropTypes.func.isRequired,
  onPostEdit: PropTypes.func.isRequired,
  onCommentEdit: PropTypes.func.isRequired,
  onAdminClick: PropTypes.func.isRequired,
  subUser: PropTypes.object,
  shouldGoBack: PropTypes.bool,
  returnClick: PropTypes.func
};
