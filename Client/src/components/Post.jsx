
import TimeStamps from './TimeStamps.jsx';
import ParseDescription from './ParseDescription.jsx';
import PropTypes from 'prop-types';
import { useState, useEffect } from "react";

function Post({post, goToPostPage, getCommunityName, community, getCommentLength, checkPostExists}){
  const shortenedContent = post.content.length > 80? post.content.substring(0, 80) + "..." : post.content;
  const content = <ParseDescription description={shortenedContent}/>;
  const linkFlair = post.linkFlairID;
  const [communityName, setCommunityName] = useState("");
  const [postExist, setPostExists] = useState(true);
  console.log("Made it to post page");

  useEffect(() => {
    const checkPost = async () => {
      try{
        const exists = await checkPostExists(post._id);
        setPostExists(exists);
      } catch (err){
        console.error("Error checking post existance", err);
      }
    };

    const fetchCommunityName = async () => {
      const name = await getCommunityName(post._id);
      setCommunityName(name);
    };

    fetchCommunityName();
    checkPost();
  }, [post._id, getCommunityName, checkPostExists]);
  
  if (!post || !post.content || !Array.isArray(post.commentIDs)) {
    return <div>Loading…</div>;
  }

  if(!postExist){
    return;
  }

  console.log("Rendering post:", post.title, post._id);
  console.log("Community name:", communityName);
    
      return (
        <div key={post._id} className="post-container">
     
          <div
            className="post-link"
            onClick={e => {
              e.preventDefault();
              goToPostPage(post);
            }}
          >
            <div id="post-header">
              <span>
                {!community && `${communityName} |`}{" "}
                {post.postedBy} | <TimeStamps date={post.postedDate} />
              </span>
            </div>
            <div id="post-title">
              <h3>{post.title}</h3>
            </div>
            <div id="linkflair-content">
              {linkFlair ? linkFlair.content : ""}
            </div>
            <div id="post-description">{content}</div>
            <div id="post-footer">
              <span>
                Views: {post.views} | Comments: {getCommentLength(post.commentIDs)} |  Votes: {post.vote}
              </span>
              
            </div>
            <hr className="post_line" />
          </div>

          </div>
    

      );
    }
    
    export default Post;
    
    Post.propTypes = {
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
      }).isRequired,
      goToPostPage: PropTypes.func.isRequired,
      getCommunityName: PropTypes.func.isRequired,
      community: PropTypes.bool.isRequired,
      getCommentLength: PropTypes.func.isRequired
    };