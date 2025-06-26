
function SortPosts({ array, type, comments }) {
  const eqId = (a, b) => a.toString() === b.toString();

  // recurse through replies
  function getLatestTimestampForComment(comment) {
    let maxTs = new Date(comment.commentedDate).getTime();
    (comment.commentIDs || []).forEach(childId => {
      const child = comments.find(c => eqId(c._id, childId)); //Use mongoID 
      if (child) {
        const childTs = getLatestTimestampForComment(child);
        if (childTs > maxTs) maxTs = childTs;
      }
    });
    return maxTs;
  }

 
  function getLatestCommentTimestamp(post) {
    let maxTs = new Date(post.postedDate).getTime();  //Posts with no comments fall back on creation time
    (post.commentIDs || []).forEach(rootId => {
      const root = comments.find(c => eqId(c._id, rootId));
      if (root) {
        const ts = getLatestTimestampForComment(root);
        if (ts > maxTs) maxTs = ts;
      }
    });
    return maxTs;
  }

  const cloned = [...array];

  if (type === "active") {
    return cloned.sort((a, b) => {
      const aTs = getLatestCommentTimestamp(a);
      const bTs = getLatestCommentTimestamp(b);
      // tie breaker
      if (aTs === bTs) {
        return new Date(b.postedDate) - new Date(a.postedDate);
      }
      return bTs - aTs;
    });
  }

  if (type === "oldest") {
    return cloned.sort(
      (a, b) => new Date(a.postedDate) - new Date(b.postedDate)
    );
  }

  return cloned.sort(
    (a, b) => new Date(b.postedDate) - new Date(a.postedDate)
  );
}

export default SortPosts;