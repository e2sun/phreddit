import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';

function NewComment({
  object,
  onCommentAdded,
  editComment,
  onDelete,       // delete handler
  user,
  isEdit,
  comment
}) {
  const [commentContent, setCommentContent] = useState('');

  // prefill when editing
  useEffect(() => {
    if (isEdit && comment) {
      setCommentContent(comment.content);
    }
  }, [isEdit, comment]);

  const handleSubmit = e => {
    e.preventDefault();
    if (!commentContent.trim()) {
      alert("Please add content to the comment");
      return;
    }
    if (commentContent.length > 500) {
      alert("Comment content is too long, please shorten it");
      return;
    }

    // hyperlink validation
    const hyperlinkRegex = /\[([^\]]*)\]\((.*?)\)/g;
    let match;
    while ((match = hyperlinkRegex.exec(commentContent)) !== null) {
      if (!match[1].trim()) return alert("The hyperlink text (inside []) cannot be empty!");
      if (!match[2].trim()) return alert("The hyperlink URL (inside ()) cannot be empty!");
      if (!/^https?:\/\//.test(match[2])) {
        return alert("The hyperlink URL must begin with 'http://' or 'https://'");
      }
    }

    const payload = {
      content:       commentContent,
      commentIDs:    [],
      commentedBy:   user.displayName,
      commentedDate: new Date(),
      objectId:      object._id
    };

    if (isEdit) {
      editComment(payload, comment);
    } else {
      onCommentAdded(payload);
    }
  };

  return (
    <div id="newcomment_setup">
      <div id="newcomment_header">
        <h1>{isEdit ? "Edit a Comment" : "Add a Comment"}</h1>
      </div>
      <form id="newcomment_form" onSubmit={handleSubmit}>
        <textarea
          id="comment"
          placeholder="Comment (required, max 500 characters)"
          onFocus={e => e.target.placeholder = ""}
          onChange={e => setCommentContent(e.target.value)}
          value={commentContent}
        />
        <input id="submit_comment" type="submit" value={isEdit ? "Edit Comment" : "Submit Comment"}
        />

        {isEdit && onDelete && (
          <button
            type="button"
            id="delete_comment"
            style={{ backgroundColor: '#f44336', color: '#fff' }}
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this comment?")) {
                onDelete(comment);
              }
            }}
          >
            Delete Comment
          </button>
        )}
      </form>
    </div>
  );
}

export default NewComment;

const objectShape = PropTypes.shape({
  _id: PropTypes.string.isRequired
});

NewComment.propTypes = {
  object:         objectShape.isRequired,
  onCommentAdded: PropTypes.func.isRequired,
  editComment:    PropTypes.func,            // required when isEdit
  onDelete:       PropTypes.func,            // optional delete handler
  user:           PropTypes.shape({
    displayName: PropTypes.string.isRequired
  }).isRequired,
  isEdit:         PropTypes.bool,
  comment:        PropTypes.shape({ _id: PropTypes.string }).isRequired
};
