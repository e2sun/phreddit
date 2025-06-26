import React, { useState, useEffect } from "react";
import Comment from "./Comment.jsx";
import ParseDescription from "./ParseDescription.jsx";
import PropTypes from "prop-types";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:8000';

function PostPage({
  post,
  getLinkFlair,
  getCommentLength,
  goToNewComment,
  isLoggedIn,
  handleError
}) {
  const [votes, setVotes] = useState(post.vote);
  const [commentArray, setCommentArray] = useState([]);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [hasDownvoted, setHasDownvoted] = useState(false);
  const [isTooLow, setTooLow] = useState(true); // assume too low if guest

  useEffect(() => {
    async function loadComments() {
      try {
        const { data } = await axios.get(`/comments/${post._id}`);
        setCommentArray(data);
      } catch (err) {
        console.error("Error loading comments:", err);
        handleError(err);
      }
    }
    loadComments();
  }, [post._id]);

  const checkTooLow = async () => {
    try {
      const result = await axios.get('/checkTooLow');
      setTooLow(result.data.isTooLow);
    } catch (err) {
      if (err.response?.status === 401) {
        setTooLow(true);
        return;
      }
      console.error("Error checking too-low status:", err);
      handleError(err);
    }
  };

  const checkVote = async () => {
    try {
      const result = await axios.get(`/checkVote/${post._id}`);
      setHasUpvoted(result.data.hasUpVoted);
      setHasDownvoted(result.data.hasDownVoted);
    } catch (err) {
      if (err.response?.status === 401) return;
      console.error("Error checking vote status:", err);
      handleError(err);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      checkTooLow();
      checkVote();
    }
  }, [isLoggedIn]);

  const increaseVoteCount = async (e) => {
    e.preventDefault();
    try {
      let result;
      if (hasUpvoted) {
        result = await axios.put(`/removeUpvote/${post.postedBy}`, { postID: post._id });
        setHasUpvoted(false);
      } else {
        result = await axios.put(`/incrementPost/${post.postedBy}`, { postID: post._id });
        setHasUpvoted(true);
        if (hasDownvoted) {
          await axios.put(`/removeDownvote/${post.postedBy}`, { postID: post._id });
          setHasDownvoted(false);
        }
      }
      setVotes(result.data);
    } catch (err) {
      console.error("Upvote toggle error:", err);
      handleError(err);
    }
  };

  const decreaseVoteCount = async (e) => {
    e.preventDefault();
    try {
      let result;
      if (hasDownvoted) {
        result = await axios.put(`/removeDownvote/${post.postedBy}`, { postID: post._id });
        setHasDownvoted(false);
      } else {
        result = await axios.put(`/decrementPost/${post.postedBy}`, { postID: post._id });
        setHasDownvoted(true);
        if (hasUpvoted) {
          await axios.put(`/removeUpvote/${post.postedBy}`, { postID: post._id });
          setHasUpvoted(false);
        }
      }
      setVotes(result.data);
    } catch (err) {
      console.error("Downvote toggle error:", err);
      handleError(err);
    }
  };

  const greyButtonStyle = { backgroundColor: "#A9A9A9", color: "grey" };
  return (
    <>
      <div id="postpage_setup">
        <p id="post_user">Posted by: {post.postedBy}</p>
        <h1 className="red_title">{post.title}</h1>
        <p id="post_link_flair">{getLinkFlair(post.linkFlairID)}</p>
        <p id="post_content">
          <ParseDescription description={post.content} />
        </p>
        <p id="views_and_comments">
          Views: {post.views} | Comments: {getCommentLength(post.commentIDs)} |{" "}
          Votes: {votes}
        </p>

        {isLoggedIn && !isTooLow && (
          <div className="vote-controls">
            <button
              id="user_upvote"
              onClick={increaseVoteCount}
              className="vote-btn upvote"
              aria-label="Upvote"
            >
              <svg
                viewBox="0 0 24 24"
                style={{ fill: hasUpvoted ? "red" : "#A9A9A9" }}
              >
                <path d="M12 4l-8 8h5v8h6v-8h5z" />
              </svg>
            </button>
            <span className="vote-count">{votes}</span>
            <button
              id="user_downvote"
              onClick={decreaseVoteCount}
              className="vote-btn downvote"
              aria-label="Downvote"
            >
              <svg
                viewBox="0 0 24 24"
                style={{ fill: hasDownvoted ? "blue" : "#A9A9A9" }}
              >
                <path d="M12 20l8-8h-5v-8h-6v8h-5z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {isLoggedIn ? (
        <button
          id="add_comment_button"
          onClick={(e) => {
            e.preventDefault();
            goToNewComment(post);
          }}
        >
          Add a comment
        </button>
      ) : (
        <button id="add_comment_button" style={greyButtonStyle}>
          Add a comment
        </button>
      )}

      <hr />

      <div id="comment_listing">
        {commentArray.map((c) => (
          <Comment
            key={c._id}
            comment={c}
            indent={0}
            goToNewComment={goToNewComment}
            isLoggedIn={isLoggedIn}
            handleError={handleError}
          />
        ))}
      </div>
    </>
  );
}

export default PostPage;

PostPage.propTypes = {
  post: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    postedBy: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    linkFlairID: PropTypes.string,
    commentIDs: PropTypes.arrayOf(PropTypes.string).isRequired,
    views: PropTypes.number.isRequired,
    vote: PropTypes.number.isRequired,
    upvotedBy: PropTypes.arrayOf(PropTypes.string),
    downvotedBy: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  getLinkFlair: PropTypes.func.isRequired,
  getCommentLength: PropTypes.func.isRequired,
  goToNewComment: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
};