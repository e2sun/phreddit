const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('./verify-middleware.js');

const app = express();

module.exports = app; // for express test

// Schemas
const Posts = require('./models/posts.js');
const Comments = require('./models/comments.js');
const Communities = require("./models/communities.js");
const LinkFlairs = require('./models/linkflairs.js');
const Users = require('./models/user.js');

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Database
mongoose.connect('mongodb://127.0.0.1:27017/phreddit', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error connecting to MongoDB'));
db.once('open', () => console.log('Connected to database'));

// Listen
app.listen(8000, () => console.log("Server listening on port 8000..."));

//Helper
async function deleteCommentsRecursive(commentIds){
  for (const commentID of commentIds){
    const comment = await Comments.findById(commentID);
    if (!comment) continue;
    if (comment.commentIDs && comment.commentIDs.length){
      await deleteCommentsRecursive(comment.commentIDs);
    }
    await Comments.findByIdAndDelete(commentID);
  }
}

// Test
app.get('/', (req, res) => {
  res.status(200).send("Connected");
});

// --- POSTS ---
app.get('/posts', async (req, res) => {
  const posts = await Posts.find().populate('linkFlairID').exec();
  res.send(posts);
});

app.get('/post/:commentID', async(req, res) => {
  try{
    let reply = true;
    let currentCommentID = req.params.commentID;

    while(reply){
      const comment = await Comments.findOne({ commentIDs: currentCommentID });
      if(!comment){
        reply = false;
        break;
      }
      
      currentCommentID = comment._id;
    }

    const post = await Posts.findOne({ commentIDs: currentCommentID })
    if(!post) return res.status(404).send('Comment parent post not found');
    
    res.send(post);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching comment parent post');
  }
})

app.post('/new_post', auth.verify, async (req, res) => {
  try {
    const flair = req.body.linkFlair 
      ? new mongoose.Types.ObjectId(req.body.linkFlair)
      : undefined;
    const p = new Posts({
      title: req.body.title,
      content: req.body.content,
      linkFlairID: flair,
      postedBy: req.body.postedBy,
      postedDate: req.body.postedDate,
      commentIDs: [],
      views: req.body.views
    });
    const saved = await p.save();
    await Communities.findOneAndUpdate(
      { name: req.body.community },
      { $push: { postIDs: saved._id } },
      { new: true }
    );
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: "Failed to create new post" });
  }
});

app.put('/editPost/:postID', auth.verify, async (req, res) => {
  
  try{
    let currentPost = await Posts.findById(req.params.postID);

    if(!currentPost) {
      res.status(404).send("Post to edit not found");
      return;
    }

    currentPost.title = req.body.title;
    currentPost.content = req.body.content;
    currentPost.linkFlairID = req.body.linkFlair ? new mongoose.Types.ObjectId(req.body.linkFlair) : undefined;
    currentPost.postedBy = req.body.postedBy;
    currentPost.postedDate = req.body.postedDate;
    currentPost.views = req.body.views;

    await currentPost.save()

    res.status(200).send('Post updated successfully');

  } catch (err) {
    res.status(500).send('Error editing post:', err);
  }
});

// deleting a post
app.delete('/deletePost/:postID', auth.verify, async (req, res) => {
  try {
    const postID = req.params.postID;
    const toDelete = await Posts.findById(postID);
    if (toDelete.commentIDs && toDelete.commentIDs.length){
      await deleteCommentsRecursive(toDelete.commentIDs);
    }
    // pull it out of its community
    await Communities.updateMany(
      { postIDs: postID },
      { $pull: { postIDs: postID } }
    );
    // delete all comments 
    await Posts.findByIdAndDelete(postID);
    res.sendStatus(204);
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ error: "Failed to delete post" });
  }
});




// --- COMMENTS ---

app.get('/comments', async (req, res) => {
  const comments = await Comments.find({}).exec();
  res.send(comments);
});

app.get('/comments/:postID', async (req, res) => {
  const post = await Posts.findById(req.params.postID);
  const comments = await Comments.find({ _id: { $in: post.commentIDs } });
  res.send(comments);
});

app.post('/new_comment', auth.verify, async (req, res) => {
  try {
    const c = new Comments({
      content: req.body.content,
      commentedBy: req.body.commentedBy,
      commentedDate: req.body.commentedDate,
      commentIDs: []
    });
    const saved = await c.save();

    const parentIsPost = await Posts.exists({ _id: req.body.objectId });
    const Model = parentIsPost ? Posts : Comments;
    await Model.findByIdAndUpdate(
      req.body.objectId,
      { $push: { commentIDs: saved._id } },
      { new: true }
    );
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error creating comment:", err);
    res.status(500).json({ error: "Failed to create new Comment" });
  }
});

app.put('/editComment/:commentID', auth.verify, async(req, res) => {
  try{
    let currentComment = await Comments.findById(req.params.commentID);

    if(!currentComment){
      res.status(404).send("Comment to edit not found");
      return;
    }

    currentComment.content = req.body.content;

    await currentComment.save()

    res.status(200).send("Comment updated successfully");
  } catch (err) {
    res.status(500).send("Error editing comment:", err);
  }
})

//Delete comment
// remove a comment and pull it out of its parent (post or comment)
app.delete('/deleteComment/:commentID', auth.verify, async (req, res) => {
  try {
    const id = req.params.commentID;
    const toDelete = await Comments.findById(id);
    if (toDelete.commentIDs && toDelete.commentIDs.length){
      await deleteCommentsRecursive(toDelete.commentIDs);
    }
    // pull ID out of any parent.commentIDs arrays
    await Posts.updateMany(
      { commentIDs: id },
      { $pull: { commentIDs: id } }
    );
    await Comments.updateMany(
      { commentIDs: id },
      { $pull: { commentIDs: id } }
    );
    // delete the comment itself
    await Comments.findByIdAndDelete(id);
    res.sendStatus(204);
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});


// --- FLAIRS & COMMUNITIES ---

app.get('/linkflairs', async (req, res) => {
  const flairs = await LinkFlairs.find({}).exec();
  res.send(flairs);
});

app.post('/new_linkflair', async (req, res) => {
  try {
    const lf = new LinkFlairs({ content: req.body.content });
    const saved = await lf.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error creating link flair:", err);
    res.status(500).json({ error: "Failed to create new link flair" });
  }
});

app.get('/postExist/:postId', async(req, res) => {
  try{
    const post = await Posts.findById(req.params.postId);
    if(!post){
      res.status(200).send(false);
    } else{
      res.status(200).send(true);
    }
  } catch(err) {
    console.error("Error checking post status:", err);
    res.status(500).json({error: "Failed to check post status"});
  }
});


// Get all communities
app.get('/communities', async(req,res) => {
    console.log("Get all communities");
    let communities = await Communities.find({}).exec();
    res.send(communities);
})

app.get('/getCommunityByPost/:postId', async(req, res) => {
    console.log("Getting community name");
    try{
      let community = await Communities.findOne({postIDs: req.params.postId})
      if(!community){
        return res.status(404).send("Community not found");
      }
      res.json({communityName: community.name});
    } catch(err) {
      res.status(500).json({error: "Failed to get post community name"});
    }
})

// Create a new community
app.post("/new_community", auth.verify, async (req, res) => {
    console.log("Post request received for new community");
    console.log("MEMBERS",req.body.members);
    try{
        const newCommunity = new Communities({
            name:req.body.name,
            description: req.body.description,
            postIDs: req.body.postIDs,
            startDate: req.body.startDate,
            members: req.body.members,
            creator: req.body.createdBy
        }) 
       
        const savedCommunity = await newCommunity.save();
        res.status(201).json(savedCommunity);
    }

    catch(error){
        console.log("Error creating new community", error );
        res.status(500).json({ error: "Failed to create new community" });
    }


});

app.post('/new_community', auth.verify, async (req, res) => {
  try {
    const cm = new Communities({
      name: req.body.name,
      description: req.body.description,
      postIDs: req.body.postIDs,
      startDate: req.body.startDate,
      members: req.body.members
    });
    const saved = await cm.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error creating community:", err);
    res.status(500).json({ error: "Failed to create new community" });
  }
});

app.get('/community/:postID', async(req, res) => {
  try {
    const community = await Communities.findOne({postIDs: req.params.postID});
    res.send(community)
  } catch (err) {
    console.error("Error getting post community");
    res.status(500).json({ error: "Failed to get community"});
  }
})

app.put('/editCommunity/:communityID', auth.verify, async(req, res) => {
  try{
    let currentCommunity = await Communities.findById(req.params.communityID);

    if(!currentCommunity){
      res.status(404).send("Community to edit not found");
      return;
    }

    currentCommunity.name = req.body.name;
    currentCommunity.description = req.body.description;

    await currentCommunity.save()

    res.status(200).send("Community updated successfully");
  } catch (err) {
    res.status(500).send("Error editing community:", err);
  }
})


// delete a community
// http://127.0.0.1:8000/deleteCommunity/${community._id}
app.delete('/deleteCommunity/:communityID', auth.verify, async (req, res) => {
  try {
    const id = req.params.communityID;

    // delete the community itself
    const community = await Communities.findByIdAndDelete(id)
    for (const postID of community.postIDs){
      const post = await Posts.findById(postID);
      if (!post) continue;
      if (post.commentIDs && post.commentIDs.length){
        await deleteCommentsRecursive(post.commentIDs);  
      }
      await Posts.findByIdAndDelete(postID);
    }
    await Communities.findByIdAndDelete(id);
    res.sendStatus(204);
  } catch (err) {
    console.error("Error deleting community:", err);
    res.status(500).json({ error: "Failed to delete community" });
  }
});

// --- USER AUTH & PROFILE ---

// in server.js (or wherever you define your routes)
app.post('/new_user', async (req, res) => {
    try {
      const emailExists = await Users.exists({ email: req.body.email });
      if (emailExists) {
        return res
        .status(409)
        .json({ error: 'EMAIL_TAKEN', message: 'That email is already registered.' });
      }
  
      const nameExists = await Users.exists({ displayName: req.body.displayName });
      if (nameExists) {
        return res
        .status(409)
        .json({ error: 'DISPLAYNAME_TAKEN', message: 'That display name is already taken.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(req.body.password, salt);
  
      const u = new Users({
        firstName:   req.body.firstName,
        lastName:    req.body.lastName,
        email:       req.body.email,
        displayName: req.body.displayName,
        password:    hash,
        reputation:  100
      });
  
      const saved = await u.save();
      res.status(201).json(saved);
  
    } catch (err) {
      console.error("Error creating user:", err);
  
      res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to create user' });
    }
  });
  

app.get('/userProfile', auth.verify, async (req, res) => {
    try {
      const currentUser = await Users.findById(req.userId)
      if (!currentUser) return res.status(404).json({ error: 'User not found' });
      res.json(currentUser);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });

app.get('/userPosts/:userID', auth.verify, async (req, res) => {
  try{
    const currentUser = await Users.findById(req.params.userID);
    if(!currentUser) return res.status(404).json({error: 'User not found'});
    
    let userPosts = await Posts.find({postedBy: currentUser.displayName});

    res.status(200).send(userPosts);
  } catch(err){
    console.error('Error getting user posts:', err);
    res.status(500).json({err: 'server error'});
    return;
  }
});

app.get('/userPosts', auth.verify, async(req, res) => {
  try{
    const currentUser = await Users.findById(req.userId);
    if(!currentUser) return res.status(404).json({error: 'Current user not found'});

    let userPosts = await Posts.find({postedBy: currentUser.displayName});

    res.status(200).send(userPosts);
  } catch(err){
    console.error('Error fetching current user posts');
    res.status(500).json({err: 'server error'});
    return;
  }
});

app.get('/userComments', auth.verify, async (req, res) => {
  try{
    const currentUser = await Users.findById(req.userId);
    if(!currentUser) return res.status(404).json({error: 'User not found'});
    let userComments = await Comments.find({commentedBy: currentUser.displayName});

    res.status(200).send(userComments);
  } catch(err){
    console.error('Error getting user comments:', err);
    res.status(500).json({error: 'server error'})
  }
});

app.get('/userComments/:userID', auth.verify, async (req, res) => {
  try{
    const currentUser = await Users.findById(req.params.userID);
    if(!currentUser) return res.status(404).json({error: 'User not found'});
    let userComments = await Comments.find({commentedBy: currentUser.displayName});

    res.status(200).send(userComments);
  } catch(err){
    console.error('Error getting user comments:', err);
    res.status(500).json({error: 'server error'})
  }
});

// DELETE a user and all of their content
app.delete('/deleteUser/:userID', auth.verify, async (req, res) => {
 
  try {
    const { userID } = req.params;

    // 1) find the user
    const user = await Users.findById(userID);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const username = user.displayName;

    // delete all posts by that user
    const userPosts = await Posts.find({ postedBy: username });
    for (const post of userPosts) {
      if (post.commentIDs?.length) {
        await deleteCommentsRecursive(post.commentIDs);
      }
      await Posts.findByIdAndDelete(post._id);
    }

    // delete all comments by that user
    const userComments = await Comments.find({ commentedBy: username });
    for (const comment of userComments) {
      if (comment.commentIDs?.length) {
        await deleteCommentsRecursive(comment.commentIDs);
      }
      await Comments.findByIdAndDelete(comment._id);
    }

    // delete all communities created by that user
    const userCommunities = await Communities.find({ creator: username });
    for (const comm of userCommunities) {
      
      for (const postID of comm.postIDs || []) {
        const post = await Posts.findById(postID);
        if (post?.commentIDs?.length) {
          await deleteCommentsRecursive(post.commentIDs);
        }
        await Posts.findByIdAndDelete(postID);
      }
      await Communities.findByIdAndDelete(comm._id);
    }

    await Users.findByIdAndDelete(userID);

    return res.sendStatus(204);
  } catch (err) {
    console.error("Error deleting user:", err);
    return res.status(500).json({ error: "Failed to delete user" });
  }
});

//WORKING
app.get('/userCommunities', auth.verify, async (req, res) => {
  try{
    const currentUser = await Users.findById(req.userId);
    if(!currentUser) return res.status(404).json({error: 'User not found'});
    let userCommunities = await Communities.find({creator: currentUser.displayName})
    res.status(200).send(userCommunities);
  } catch(err){
    console.error('Error getting user communities:', err);
    res.status(500).json({error: 'server error'})
  }
});

app.get('/userCommunities/:userID', auth.verify, async (req, res) => {
  try{
    const currentUser = await Users.findById(req.params.userID);
    if(!currentUser) return res.status(404).json({error: 'User not found'});
    let userCommunities = await Communities.find({creator: currentUser.displayName})
    res.status(200).send(userCommunities);
  } catch(err){
    console.error('Error getting user communities:', err);
    res.status(500).json({error: 'server error'})
  }
});
  
app.get('/users', async (req, res) => {
  try{
    const users = await Users.find({}).exec();
    res.send(users);
  } catch(err) {
    console.error('Error fetching users:', err);
    res.status(500).send('Error fetching users');
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Users.findOne({ email });
    if (!user) return res.status(404).send('User not found.');
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).send('Invalid password.');
    const token = jwt.sign({ userId: user._id }, 'phredditKey');
    const uObj = user.toObject();
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      path: '/',
      maxAge: 1000 * 60 * 60 * 4
    }).status(200).json({
      success: true,
      ...uObj
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Server error");
  }
});

app.get('/check_login', auth.verify, (req, res) => {
  try{
    res.status(200).send("User is logged in");
  } catch(err) {
    return res.status(401).send("User is not logged in");
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    path: '/',
    maxAge: 1000 * 60 * 60 * 4
  });
  res.status(200).send("Logout successful");
});

// --- VIEWS & VOTING ---

app.put('/post/:postId', async (req, res) => {
  const updated = await Posts.findByIdAndUpdate(
    req.params.postId,
    { $inc: { views: 1 } },
    { new: true }
  );
  res.json(updated);
});


app.put('/incrementPost/:postedBy', auth.verify, async (req, res) => {
    console.log('incrementing a post');
    let currentPost = await Posts.findById(req.body.postID);
    const currentUser = await Users.findById(req.userId);
    const postUser = await Users.findOne({displayName: currentPost.postedBy});
    
     //Add reputation constraint
     if (currentUser.reputation<50){
        // alert("You cannot vote with a reputation under 50!");
        return;
    }

    if(currentPost.downvotedBy.includes(currentUser._id)){
        currentPost.downvotedBy = currentPost.downvotedBy.filter(userID => !userID.equals(currentUser._id))
        currentPost.vote = currentPost.vote + 1;
        postUser.reputation = postUser.reputation + 10;
    }

    currentPost.upvotedBy.push(currentUser._id);
    console.log(currentPost.upvotedBy);
    currentPost.vote = currentPost.vote + 1;

    postUser.reputation = postUser.reputation + 5;

    postUser.save();
    await currentPost.save();
    res.status(200).send(currentPost.vote);

  });

  app.put('/incrementComment/:commentedBy', auth.verify, async (req, res) => {
    console.log('incrementing a comment');
      let currentComment = await Comments.findById(req.body.commentID);
      const currentUser = await Users.findById(req.userId);
      const commentUser = await Users.findOne({displayName: currentComment.commentedBy});
    
      if (currentUser.reputation<50){
        // alert("You cannot vote with a reputation under 50!");
        return;
    }
    
    if(currentComment.downvotedBy.includes(currentUser._id)){
        currentComment.downvotedBy = currentComment.downvotedBy.filter(userID => !userID.equals(currentUser._id))
        currentComment.vote = currentComment.vote + 1;
        commentUser.reputation = commentUser.reputation + 10;
    }

    currentComment.upvotedBy.push(currentUser._id);
    console.log(currentComment.upvotedBy);
    currentComment.vote = currentComment.vote + 1;

    commentUser.reputation = commentUser.reputation + 5;

    commentUser.save();
    await currentComment.save();
    res.status(200).send(currentComment.vote);

  });
  
  
  app.put('/decrementPost/:postedBy', auth.verify, async (req, res) => {
    console.log('decrementing a post');
    let currentPost = await Posts.findById(req.body.postID);
    const currentUser = await Users.findById(req.userId);
    const postUser = await Users.findOne({displayName: currentPost.postedBy});

    //Add reputation constraint
    if (currentUser.reputation<50){
        // alert("You cannot vote with a reputation under 50!");
        return;
    }

    if(currentPost.upvotedBy.includes(currentUser._id)){
        currentPost.upvotedBy = currentPost.upvotedBy.filter(userID => !userID.equals(currentUser._id))
        currentPost.vote = currentPost.vote - 1;
        postUser.reputation = postUser.reputation - 5;
    }



    currentPost.downvotedBy.push(currentUser._id);
    console.log(currentPost.downvotedBy);
    currentPost.vote = currentPost.vote - 1;
    postUser.reputation = postUser.reputation - 10;



    await postUser.save();
    await currentPost.save();
    res.status(200).send(currentPost.vote);    
  });

  app.put('/decrementComment/:commentedBy', auth.verify, async (req, res) => {
    console.log('decrementing a Comment');
    let currentComment = await Comments.findById(req.body.commentID);
    const currentUser = await Users.findById(req.userId);
    const commentUser = await Users.findOne({displayName: currentComment.commentedBy});

    if(currentComment.upvotedBy.includes(currentUser._id)){
        //Add reputation constraint
        if (currentUser.reputation<50){
            // alert("You cannot vote with a reputation under 50!");
            return;
        }
        currentComment.upvotedBy = currentComment.upvotedBy.filter(userID => !userID.equals(currentUser._id))
        currentComment.vote = currentComment.vote - 1;
        commentUser.reputation = commentUser.reputation - 5;
    }

    currentComment.downvotedBy.push(currentUser._id);
    console.log(currentComment.downvotedBy);
    currentComment.vote = currentComment.vote - 1;
    commentUser.reputation = commentUser.reputation - 10;

    await commentUser.save();
    await currentComment.save();
    res.status(200).send(currentComment.vote);    
  });

// check if user is in the community
app.get('/member/:communityID', auth.verify, async(req,res) => {
    console.log('verifying communities');
    let currentCommunity = await Communities.findById(req.params.communityID);
    console.log(currentCommunity.members);
    const currentUser = await Users.findById(req.userId);
    const isMember = currentCommunity.members.includes(currentUser.email);
    return res.json({isMember});
});

app.post('/leaveCommunity/:communityID', auth.verify, async(req, res) => {
    console.log('leaving community');
    let currentCommunity = await Communities.findById(req.params.communityID);
    const currentUser = await Users.findById(req.userId);
    currentCommunity.members = currentCommunity.members.filter(member => member != currentUser.email);
    console.log(currentCommunity.members);
    await currentCommunity.save();

    res.status(200).send(currentCommunity.members.length);
})

app.post('/joinCommunity/:communityID', auth.verify, async(req, res) => {
    console.log('joining community');
    let currentCommunity = await Communities.findById(req.params.communityID);
    const currentUser = await Users.findById(req.userId);
    currentCommunity.members.push(currentUser.email);
    console.log(currentCommunity.members);
    await currentCommunity.save();
    res.status(200).send(currentCommunity.members.length);
})

// get the users that connect to the specified community
app.get('/communityPosts/:communityID', async(req, res) => {
    console.log('retrieving communities');
    let currentCommunity = await Communities.findById(req.params.communityID);
    let postArray = currentCommunity.postIDs;
    let posts = await Posts.find({
        '_id': {$in: postArray}
    });

    res.send(posts);
});


// check for existing community name
app.get('/isUnique/:communityName', async(req, res) => {
    console.log('checking community name');
    let currentCommunity = await Communities.find({name: req.params.communityName})
    let isDuplicate = currentCommunity.length > 0;
    res.send({isDuplicate});
});


// check if the user has upvoted or downvoted
app.get('/checkVote/:postId', auth.verify, async(req, res) => {
    console.log('checking voted status');
    let currentPost = await Posts.findById(req.params.postId);
    let hasUpVoted = currentPost.upvotedBy.includes(req.userId);
    let hasDownVoted = currentPost.downvotedBy.includes(req.userId);
    console.log(hasUpVoted);
    console.log(hasDownVoted);
    res.send({hasUpVoted, hasDownVoted});
});

// check if the user has upvoted or downvoted a comment
app.get('/checkCommentVote/:commentId', auth.verify, async(req, res) => {
  console.log('checking voted status');
  let currentComment = await Comments.findById(req.params.commentId);
  let hasUpVoted = currentComment.upvotedBy.includes(req.userId);
  let hasDownVoted = currentComment.downvotedBy.includes(req.userId);
  console.log(hasUpVoted);
  console.log(hasDownVoted);
  res.send({hasUpVoted, hasDownVoted});
});

// check if the user is too low
app.get('/checkTooLow', auth.verify, async(req,res) => {
    console.log('checkign if too low');
    let currentUser = await Users.findById(req.userId);
    let isTooLow = (currentUser.reputation < 50);
    res.send(isTooLow);
})

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Server closed. Database disconnected.');
  process.exit(0);
});

// remove only an upvote
app.put('/removeUpvote/:postedBy', auth.verify, async (req, res) => {
  let p = await Posts.findById(req.body.postID);
  const voter = req.userId;
  const author = await Users.findOne({ displayName: p.postedBy });
  if (p.upvotedBy.includes(voter)) {
    p.upvotedBy = p.upvotedBy.filter(id => !id.equals(voter));
    p.vote -= 1;
    author.reputation -= 5;
    await author.save();
    await p.save();
  }
  res.status(200).send(p.vote);
});

// remove only a downvote
app.put('/removeDownvote/:postedBy', auth.verify, async (req, res) => {
  let p = await Posts.findById(req.body.postID);
  const voter = req.userId;
  const author = await Users.findOne({ displayName: p.postedBy });
  if (p.downvotedBy.includes(voter)) {
    p.downvotedBy = p.downvotedBy.filter(id => !id.equals(voter));
    p.vote += 1;
    author.reputation += 10;
    await author.save();
    await p.save();
  }
  res.status(200).send(p.vote);
});


// remove only an upvote on a comment
app.put('/removeUpvoteComment/:commentedBy', auth.verify, async (req, res) => {
  let c = await Comments.findById(req.body.commentID);
  const voter = req.userId;
  const author = await Users.findOne({ displayName: c.commentedBy });
  if (c.upvotedBy.includes(voter)) {
    c.upvotedBy = c.upvotedBy.filter(id => !id.equals(voter));
    c.vote -= 1;
    author.reputation -= 5;
    await author.save();
    await c.save();
  }
  res.status(200).send(c.vote);
});

// remove only a downvote on a comment
app.put('/removeDownvoteComment/:commentedBy', auth.verify, async (req, res) => {
  let c = await Comments.findById(req.body.commentID);
  const voter = req.userId;
  const author = await Users.findOne({ displayName: c.commentedBy });
  if (c.downvotedBy.includes(voter)) {
    c.downvotedBy = c.downvotedBy.filter(id => !id.equals(voter));
    c.vote += 1;
    author.reputation += 10;
    await author.save();
    await c.save();
  }
  res.status(200).send(c.vote);
});