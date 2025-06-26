// src/components/Comment.jsx
import React, { useState, useEffect } from "react";
import TimeStamps from "./TimeStamps.jsx";
import ParseDescription from "./ParseDescription.jsx";
import PropTypes from "prop-types";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:8000';

function Comment({ comment, indent = 0, goToNewComment, isLoggedIn, handleError }) {
  const [votes, setVotes] = useState(comment.vote);
  const [comments, setComments] = useState([]);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [hasDownvoted, setHasDownvoted] = useState(false);
  const [isTooLow, setTooLow] = useState(true); // default to true

  const checkVote = async () => {
    try {
      const { data } = await axios.get(`/checkCommentVote/${comment._id}`);
      setHasUpvoted(data.hasUpVoted);
      setHasDownvoted(data.hasDownVoted);
    } catch (err) {
      if (err.response?.status === 401) return;
      console.error("Error checking vote status:", err);
      handleError(err);
    }
  };

  const checkReputation = async () => {
    try {
      const { data } = await axios.get("/checkTooLow");
      setTooLow(data.isTooLow);
    } catch (err) {
      if (err.response?.status === 401) {
        setTooLow(true);
        return;
      }
      console.error("Error checking reputation:", err);
      handleError(err);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      checkVote();
      checkReputation();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    axios.get("/comments")
      .then(res => setComments(res.data))
      .catch(err => {
        console.error("Error loading comments:", err);
        handleError(err);
      });
  }, []);

  const increaseVoteCount = async (e) => {
    e.preventDefault();
    try {
      let result;
      if (hasUpvoted) {
        result = await axios.put(`/removeUpvoteComment/${comment.commentedBy}`, { commentID: comment._id });
        setHasUpvoted(false);
      } else {
        result = await axios.put(`/incrementComment/${comment.commentedBy}`, { commentID: comment._id });
        setHasUpvoted(true);
        if (hasDownvoted) {
          await axios.put(`/removeDownvoteComment/${comment.commentedBy}`, { commentID: comment._id });
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
        result = await axios.put(`/removeDownvoteComment/${comment.commentedBy}`, { commentID: comment._id });
        setHasDownvoted(false);
      } else {
        result = await axios.put(`/decrementComment/${comment.commentedBy}`, { commentID: comment._id });
        setHasDownvoted(true);
        if (hasUpvoted) {
          await axios.put(`/removeUpvoteComment/${comment.commentedBy}`, { commentID: comment._id });
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
    <div style={{ paddingLeft: `${indent * 20}px` }}>
      <p className="post_comment_top">
        {comment.commentedBy} | <TimeStamps date={comment.commentedDate} /> {!isLoggedIn && <>| Votes: {votes}</>}
      </p>
      <p className="post_comment"><ParseDescription description={comment.content} /></p>

      {isLoggedIn ? (
        <button className="comment_reply_button" onClick={() => goToNewComment(comment)}>Reply</button>
      ) : (
        <button className="comment_reply_button" style={greyButtonStyle}>Reply</button>
      )}

      {isLoggedIn && !isTooLow && (
        <div className="vote-controls">
          <button onClick={increaseVoteCount} className="vote-btn upvote" aria-label="Upvote">
            <svg viewBox="0 0 24 24" style={{ fill: hasUpvoted ? "red" : "#A9A9A9" }}>
              <path d="M12 4l-8 8h5v8h6v-8h5z" />
            </svg>
          </button>
          <span className="vote-count">{votes}</span>
          <button onClick={decreaseVoteCount} className="vote-btn downvote" aria-label="Downvote">
            <svg viewBox="0 0 24 24" style={{ fill: hasDownvoted ? "blue" : "#A9A9A9" }}>
              <path d="M12 20l8-8h-5v-8h-6v8h-5z" />
            </svg>
          </button>
        </div>
      )}

      <div className="comment_replies">
        {comment.commentIDs
          .map(id => comments.find(c => c._id === id))
          .filter(Boolean)
          .sort((a, b) => new Date(b.commentedDate) - new Date(a.commentedDate))
          .map(child => (
            <Comment
              key={child._id}
              comment={child}
              indent={indent + 1}
              goToNewComment={goToNewComment}
              isLoggedIn={isLoggedIn}
              handleError={handleError}
            />
          ))}
      </div>
    </div>
  );
}

Comment.propTypes = {
  comment: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    commentIDs: PropTypes.arrayOf(PropTypes.string).isRequired,
    commentedBy: PropTypes.string.isRequired,
    commentedDate: PropTypes.instanceOf(Date).isRequired,
    vote: PropTypes.number.isRequired,
  }).isRequired,
  indent: PropTypes.number,
  goToNewComment: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  handleError: PropTypes.func.isRequired,
};

export default Comment;
