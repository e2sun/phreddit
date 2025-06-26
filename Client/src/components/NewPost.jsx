import React, { useState, useEffect } from "react";
import axios from 'axios';
import PropTypes from 'prop-types';
axios.defaults.baseURL = 'http://localhost:8000';

function NewPost({addNewPost,editPost,onDelete, linkFlairs,user,isEdit,post, handleError}) {
  const [postCommunity, setPostCommunity] = useState('');
  const [postTitle, setPostTitle]         = useState('');
  const [linkFlairDrop, setLinkFlairDrop] = useState('');
  const [linkFlairType, setLinkFlairType] = useState('');
  const [postContent, setPostContent]     = useState('');

  const [baseCommunities, setCommunities]   = useState([]);
  const [communities, setLoggedCommunities] = useState([]);

  // Load all communities
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get('/communities');
        setCommunities(data);
      } catch (err) {
        console.error(err);
        handleError(err)
      }
    })();
  }, []);

  // Reorder so user's communities come first
  useEffect(() => {
    const myIDs = baseCommunities
      .filter(c => c.members.includes(user.email))
      .map(c => c._id);
    const mine  = baseCommunities.filter(c => myIDs.includes(c._id));
    const other = baseCommunities.filter(c => !myIDs.includes(c._id));
    setLoggedCommunities([...mine, ...other]);
  }, [user, baseCommunities]);

  // Prefill when editing
  useEffect(() => {
    if (isEdit && post) {
      (async () => {
        try {
          const { data: community } = await axios.get(
            `/community/${post._id}`
          );
          setPostCommunity(community.name);
          setPostTitle(post.title);
          setLinkFlairDrop(post.linkFlairID || '');
          setPostContent(post.content);
        } catch (err) {
          console.error("Failed to populate previous data", err);
          handleError(err);
        }
      })();
    }
  }, [isEdit, post]);

  
const handleSubmit = async (e) => {
        e.preventDefault();
        if(postCommunity === ''){
            alert("Please enter a community");
            return;
        }
        if(postTitle === ''){
            alert("Please enter a title");
            return;
        }
        if(postTitle.length > 100){
            alert("Title is too long, please choose a new one");
            return;
        }
        var postFlairID;
        if(linkFlairDrop !== '' && linkFlairType !== ''){
            alert("Please select only one linkFlair");
            return;
        } else if(linkFlairDrop !== ''){
            postFlairID = linkFlairDrop;
        } else if(linkFlairType !== ''){
            if(linkFlairType.length > 30){
                alert("Link Flair is too long, please choose a new one");
                return;
            }

            const newLinkFlair = {
                content: linkFlairType
            };
            // async function createNewLinkFlair() {
                console.log('Creating new link flair');
                try{
                    const linkFlair = await axios.post('http://localhost:8000/new_linkflair', newLinkFlair);
                    postFlairID = linkFlair.data._id;
                } catch{
                    console.log('Error with link flair');
                }
            // }
        }
        if(postContent === ''){
            alert("Please enter post content");
            return;
        }

        // Check hyperlinks
    const hyperlinkRegex = /\[([^\]]*)\]\((.*?)\)/g;

    let match;

    while ((match = hyperlinkRegex.exec(postContent)) !== null) {
      if (match[1].trim()===''){
        alert("The hyperlink text (inside []) cannot be empty!");
        return;
      }
      if (match[2].trim()===''){
        alert("The hyperlink URL (inside ()) cannot be empty!");
        return;
      }
  

      if (!(match[2].slice(0, 8) === 'https://' || match[2].slice(0, 7) === 'http://')) {
        alert("The hyperlink URL must begin with either 'https://' or 'http://'!");
        return;
      }
    }

        alert("Your post has successfully been created!");


      const payload = {
        title:      postTitle,
        content:    postContent,
        linkFlair: postFlairID,
        postedBy:   user.displayName,
        postedDate: new Date(),
        commentIDs: [],
        views:      0,
        community:  postCommunity
      };

    if (isEdit) editPost(payload, post);
    else         addNewPost(payload);

  }

  function loadCommunitySelections() {
    return (
      <select
        id="community_selection"
        value={postCommunity}
        onChange={e => setPostCommunity(e.target.value)}
      >
        <option value="">Select a Community</option>
        {communities.map(c => (
          <option key={c._id} value={c.name}>{c.name}</option>
        ))}
      </select>
    );
  }

  function loadLinkFlairSelections() {
    return (
      <select
        id="flair_selection"
        value={linkFlairDrop}
        onChange={e => setLinkFlairDrop(e.target.value)}
      >
        <option value="">Select a Link Flair</option>
        {linkFlairs.map(f => (
          <option key={f._id} value={f._id}>{f.content}</option>
        ))}
      </select>
    );
  }

  return (
    <div id="newpost_setup">
      <div id="newpost_header">
        <h1>{isEdit ? "Edit Post" : "Create a New Post"}</h1>
      </div>
      <form
        id="newpost_form"
        action="/send"
        method="POST"
        onSubmit={handleSubmit}
      >
        <h3>Select Community (required)</h3>
        {loadCommunitySelections()}

        <h3>Post Title (required, max 100 characters)</h3>
        <input
          id="post_title"
          type="text"
          value={postTitle}
          onChange={e => setPostTitle(e.target.value)}
        />

        <h3>Select Existing Flair</h3>
        {loadLinkFlairSelections()}

        <h3>Or Create a New Flair (max 30 characters)</h3>
        <input
          id="new_flair"
          type="text"
          value={linkFlairType}
          onChange={e => setLinkFlairType(e.target.value)}
        />

        <h3>Content (required)</h3>
        <textarea
          id="content"
          value={postContent}
          onChange={e => setPostContent(e.target.value)}
        />

        <button id="submit_post" type="submit">
          {isEdit ? "Save Changes" : "Submit Post"}
        </button>

        {isEdit && onDelete && (
          <button
            style={{ backgroundColor: '#f44336', color: '#fff' }}
            id="delete_post"
            type="button"
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this post?")) {
                onDelete(post);
              }
            }}
          >
            Delete Post
          </button>
        )}
      </form>
    </div>
  );
}

export default NewPost;

const linkFlairShape = PropTypes.shape({
  _id:     PropTypes.string.isRequired,
  content: PropTypes.string.isRequired
});

NewPost.propTypes = {
  addNewPost: PropTypes.func.isRequired,
  editPost:   PropTypes.func,           // required if isEdit
  onDelete:   PropTypes.func,           // optional delete handler
  linkFlairs: PropTypes.arrayOf(linkFlairShape).isRequired,
  user: PropTypes.shape({
    email:       PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired
  }).isRequired,
  isEdit: PropTypes.bool,
  post:   PropTypes.shape({ _id: PropTypes.string }).isRequired
};
