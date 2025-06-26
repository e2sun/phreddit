import React, { useState, useEffect } from 'react';
import Banner from './Banner';
import Navbar from './Navbar';
import HomePage from './HomePage';
import NewPost from './NewPost';
import NewCommunity from './NewCommunity';
import NewComment from './NewComment';
import PostPage from './PostPage';
import CommunityPage from './CommunityPage';
import SearchBar from './SearchBar';
import axios from 'axios';
import Welcome from './Welcome';
import Login from './Login';
import Register from './Register';
import UserProfile from './UserProfile'
import Error from './Error'
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:8000';


export default function Phreddit(){
  // Common use constants and arrays
  // const [communities, setCommunities] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [linkFlairs, setLinkFlairs] = useState([]);
  const [redPost, setPostButton] = useState(false);
  const [redHome, setHomeButton] = useState(false);
  const [redCommunity, setCommunityButton] = useState(false);
  const [redCommunityLink, setCommunityLink] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentComment, setCurrentComment] = useState(null);
  const [tempUser, setTempUser] = useState(null);
  const [searchTrigger, setSearchTrigger] = useState(0);

  // Set states
  const [view, setView] = useState('welcome');   // view can be homepage, post, newpost, newcommunity, newcomment, search, community
  const [currentPost, setCurrentPost] = useState(null);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [buttonTrigger, setButtonTrigger] = useState(0);
 
  useEffect(() => { //Call get method of post and fill the array
        axios.get("/posts")
        .then((res) => {
            setPosts(res.data);
        })
        .catch((err) => {
            console.log("Request failed to get posts");
            handleError(err);
        });
        // axios.get("/communities")
        // .then((res) => {
        //     setCommunities(res.data);
        // })
        // .catch((err) => {
        //     console.log("Request failed to get communities");
        //     handleError(err);
        // });
        axios.get("/comments")
        .then((res) => {
            setComments(res.data);
        })
        .catch((err) => {
            console.log("Request failed to get comments");
            handleError(err);
        });
        axios.get("/linkflairs")
        .then((res) => {
            setLinkFlairs(res.data);
        })
        .catch((err) => {
            console.log("Request failed to get linkflairs");
            handleError(err);
        });      
  }, []);

  useEffect(() => {
    async function checkLoggedIn() {
      try{
        const status = await axios.get("/check_login", {withCredentials: true});

        console.log("STATUS:", status);
        if(status.status === 200){
          const response = await axios.get("/userProfile", {withCredentials: true});
          setCurrentUser(response.data);
          setIsLoggedIn(true);
        } else{
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
        return;
      } catch (err){
        if(err.response && err.response.status === 401){
          setIsLoggedIn(false);
          setCurrentUser(null);
        } else{
          console.error("Error checking if user is logged in: ", err);
          handleError(err);
        }
      }
    }

    checkLoggedIn();
  }, []);

  useEffect(() => {
    const userInteraction = () => {
      setButtonTrigger(prev => prev + 1);
    };

    window.addEventListener('click', userInteraction);
    window.addEventListener('keydown', userInteraction);

    return () => {
      window.removeEventListener('click', userInteraction);
      window.removeEventListener('keydown', userInteraction);
    }
  })
    
  const goToHomepage = () => {    
    // axios.get("/communities") // Reget all of the communities so state will update everytime the state is updated
    // .then((res) => {
    //     setCommunities(res.data);
    // })
    // .catch((err) => {
    //     console.log("Request failed");
    //     handleError(err);
    // });

    axios.get("/linkflairs") // Reget all of the posts so state will update everytime the state is updated
    .then((res) => {
        setLinkFlairs(res.data);
    })
    .catch((err) => {
        console.log("Request failed");
        handleError(err);
    });

    setHomeButton(true);
    setPostButton(false);
    setCommunityButton(false);
    setCommunityLink(false);
    setSelectedCommunity(null);
    setView("homepage");
    console.log("Homepage");
  };

  const goToPostPage = (post) => {
    axios.put(`/post/${post._id}`, post)
    .then((res) => {
      setHomeButton(false);
      setPostButton(false);
      setCommunityButton(false);
      setView("postpage");
      setCurrentPost(res.data);
      console.log("Post Page");
      setCommunityLink(false);
      setSelectedCommunity(null);
      })
      .catch((err) => {
        handleError(err);
        throw err;
      })
  };
  const goToNewPost = () => {
    axios.get("/linkflairs") // Reget all of the posts so state will update everytime the state is updated
    .then((res) => {
        setLinkFlairs(res.data);
    })
    .catch((err) => {
        console.log("Request failed");
        handleError(err);
    });
    setHomeButton(false);
    setPostButton(true);
    setCommunityButton(false);
    setView("newPost");
    console.log("New Post Page");
    setCommunityLink(false);
    setSelectedCommunity(null);
  };
  const goToNewComment = (object) => {

  setHomeButton(false);
    setPostButton(false);
    setCommunityButton(false);
    setView("newComment");
    setReplyTo(object);
    console.log("New Comment Page");
    setCommunityLink(false);
    setSelectedCommunity(null);
  };
  const goToSearch = (searchQuery) => {
    setHomeButton(false);
    setPostButton(false);
    setCommunityButton(false);
    setSearchQuery(searchQuery);
    setView("search");
    console.log("Search Page");
    setCommunityLink(false);
    setSelectedCommunity(null);
    setSearchTrigger(prev => prev + 1);
  };

  const goToWelcome = () => {
    setHomeButton(false);
    setPostButton(false);
    setCommunityButton(false);
    setView("welcome");
    console.log("Welcome Page");
    setCommunityLink(false);
    setSelectedCommunity(null);
  };

  const goToWentWrong = () => {
    if(isLoggedIn){
      onLogout();
    } else{
      goToWelcome();
    }
  }

  const goToLogin = () => {
    setHomeButton(false);
    setPostButton(false);
    setCommunityButton(true);
    setView("login");
    console.log("Login Page");
    setCommunityLink(false);
    setSelectedCommunity(null);
  };
  const goToRegister = () => {
    setHomeButton(false);
    setPostButton(false);
    setCommunityButton(true);
    setView("register");
    console.log("Register Page");
    setCommunityLink(false);
    setSelectedCommunity(null);
  }

  const goToNewCommunity = () => {
    setHomeButton(false);
    setPostButton(false);
    setCommunityButton(true);
    setView("newCommunity");
    console.log("New Community Page");
    setCommunityLink(false);
    setSelectedCommunity(null);
  };

 
  const goToCommunity = (community) => {

    setHomeButton(false);
    setPostButton(false);
    setCommunityButton(false);
    setView("community");
    setSelectedCommunity(community);
     console.log(community);
    console.log("Community Page");
    setCommunityLink(true);
  }

  const goToUserProfile = (user) => {
    setHomeButton(false);
    setPostButton(false);
    setCommunityButton(false);
    setView("user profile");
    if(user){
      setCurrentUser(user);
    }
    console.log(user);
    console.log("User Profile Page");
    setCommunityLink(true);
  }

  const onCommunityEdit = (community) => {
    setHomeButton(false);
    setPostButton(false);
    setCommunityButton(false);
    setView("edit community");
    setSelectedCommunity(community);
    console.log(community);
    console.log("Edit Community Page");
    setCommunityLink(false);
  }

  const onCommentEdit = (comment) => {
    setHomeButton(false);
    setPostButton(false);
    setCommunityButton(false);
    setView("edit comment");
    setCurrentComment(comment);
    console.log(comment);
    console.log("Edit Comment Page");
    setCommunityLink(false);
  }

  const onPostEdit = (post) => {
    setHomeButton(false);
    setPostButton(false);
    setCommunityButton(false);
    setView("edit post");
    setCurrentPost(post);
    console.log(post);
    console.log("Edit Post Page");
    setCommunityLink(false);
  }

const handleError = (error) => {
  console.error("Handling error:", error);
  setView('error');
}

// When button is clicked, go to Admin page and set view 
const onAdminClick = ((user) => {
  setTempUser(user);
  setView("sub user profile");
  console.log("working");
});


  //Add data to model
  const addCommunity = (community) => {
    axios.post('/new_community', community)
    .then(() => {
      // Re-fetch the entire updated list after the new one is saved
      setButtonTrigger(prev => prev + 1);
      return axios.get('/communities');
    })
    .then(res => {
      //  setCommunities(res.data);
       goToHomepage();
    })
    .catch(err => {
      console.error("Error adding community", err);
      handleError(err);
    })
  };

  const addComments = (comment) => {
    axios.post('/new_comment', comment)
      .then(() => {
        // update the comments state by re-fetching comments
        return axios.get('/comments');
      })
      .then((res) => {
        setComments(res.data);
        // re-fetch posts so the new comment's ID is in the post's commentIDs array
        return axios.get('/posts');
      })
      .then((res) => {
        const updatedPost = res.data.find(p => p._id === currentPost._id);
        goToPostPage(updatedPost);        
      })
      .catch((err) => {
        console.error("Error adding comment", err);
        handleError(err);
      });
  };

  const createUser = (user) => {
    return axios.post('/new_user', user)
      .catch((err) => {
        handleError(err);
        throw err;
      })
  }
  
  // const addLinkFlairs = (linkFlair)=>{
  //   modelInstance.data.linkFlairs.push(linkFlair);
  //   setLinkFlairs(modelInstance.data.linkFlairs);
  // }

  // getters
  // const getCommunityName = (currentPostID) => {
  //   const community = communities.find(community => community.postIDs.includes(currentPostID));

  //   if (community) {
  //     return community.name;
  //   } else {
  //     return 'FIX THIS';
  //   }
  // }
  
  const getCommunityName = async (currentPostID) => {
    try{
      const valid = await checkPostExists(currentPostID);
      if(!valid){
        return "DELETED";
      }
      // working
      const result = await axios.get(`/getCommunityByPost/${currentPostID}`);
      return result.data.communityName;
    } catch(err) {
      console.error("Error fetching community for post:", err);
      handleError(err);
    }
  };
  
  const getLinkFlair = (currentLinkFlairID) => {
    const linkFlair = linkFlairs.find(linkFlair => linkFlair._id === currentLinkFlairID);
    return linkFlair ? linkFlair.content : "";
  }

  const getCommentLength = (commentArray = []) => {
    let commentCount = 0;

    const countAll = (commentArray) => {
      commentArray.forEach(commentID =>{
        commentCount++;
        const currentComment = comments.find(comment => comment._id === commentID);
       

  
        console.log("Comments:",comments);
        console.log("COMMENT ID:",commentID);
        // if(currentComment.commentIDs.length !== 0){
        //   countAll(currentComment.commentIDs);
        // }

        if (currentComment?.commentIDs && Array.isArray(currentComment.commentIDs)) {
          countAll(currentComment.commentIDs);
         }
      });
    }

    countAll(commentArray);

    return commentCount;
  }


  function addNewPost(post) {
    console.log("📝 addNewPost called with:", post);
    axios.post('/new_post', post,  { withCredentials: true } )
      .then(() => axios.get("/posts"))
      .then((res) => {
        console.log("fetched posts:", res.data.length);
         setPosts(res.data); 
         goToHomepage();
      })
      .catch(err => {
         console.error("Error adding new post", err);
         handleError(err);
      });
  }

  function editPost(newPost, post) {
    console.log("📝 editPost called with:", post);
    axios.put(`/editPost/${post._id}`, newPost, { withCredentials: true } )
      .then(() => axios.get("/posts"))
      .then((res) => {
        console.log("fetched posts:", res.data.length);
         setPosts(res.data);
         goToHomepage();
      })
      .catch(err => {
         console.error("Error editing post", err);
         handleError(err);
      });
  }

  function deletePost(post) {
    axios
      .delete(`/deletePost/${post._id}`, { withCredentials: true })
      .then(() => axios.get("/posts"))
      .then((res) => {
        setPosts(res.data);
        localStorage.setItem('postsUpdated', Date.now());
        goToHomepage();
      })
      .catch((err) => {
        console.error("Error deleting post", err);
        handleError(err);
      });
  }

  const checkPostExists = async(postId) =>{
    try{
      const res = await axios.get(`/postExist/${postId}`);
      return res.data;
    } catch(err){
      console.error('Error checking post status', err);
      handleError(err);
      return false;
    }
  }
  function editComment(newComment, comment) {
    console.log("editComment called with:", comment);
    axios.put(`/editComment/${comment._id}`, newComment, {withCredentials: true})
      .then(() => axios.get("/comments"))
      .then((res) => {
          console.log("fetched comments:", res.data.length);
          setComments(res.data);
          goToHomepage();
      })
      .catch(err => {
        console.error("Error editing comment", err);
        handleError(err);
      });
  }

  function deleteComment(comment) {
    axios
      .delete(`/deleteComment/${comment._id}`, { withCredentials: true })
      .then(() => axios.get("/comments"))
      .then(res => {
        setComments(res.data);
        goToHomepage();
      })
      .catch(err => {
        console.error("Error deleting comment", err);
        handleError(err);});
  }
  

  function editCommunity(newCommunity, community) {
    console.log("editCommunity called with:", community);
    axios.put(`/editCommunity/${community._id}`, newCommunity, {withCredentials: true})
      .then(() => axios.get("/communities"))
      .then((res) => {
          console.log("fetched communities:", res.data.length);
          // setCommunities(res.data);
          setButtonTrigger(prev => prev + 1);
          goToHomepage();
      })
      .catch(err => {
        console.error("Error editing community", err);
        handleError(err);
      })
  }
  
  function deleteCommunity(community) {
    axios
      .delete(`/deleteCommunity/${community._id}`, { withCredentials: true })
      .then(() => axios.get("/communities"))
      .then(res => {
        // setCommunities(res.data);
        setButtonTrigger(prev => prev + 1);
        goToHomepage();
      })
      .catch(err => {
        console.error("Error deleting community", err)
        handleError(err);
      });
  }
  

function getPosts(community){
  const communityArray = [];
  const communityPostIDs = community.postIDs;
  communityPostIDs.forEach(postID => {
    const thisPost = posts.find(post => post._id === postID);
    communityArray.push(thisPost);
    } 
  )
  return communityArray;
}

function onLogout(){
  axios.post('/logout', {withCredentials:true})
      .then(()=>{setIsLoggedIn(false); setCurrentUser(null); goToWelcome();})
      .catch((err) => {
        alert('Logout failed. Please try again.');
        console.error('Logout failed:', err)
        handleError(err);
      });
}

  //determine main content based on view
  let mainContent;

  switch(view){
    case "homepage":
      mainContent=(
        <HomePage
            goToPostPage={goToPostPage}
            getCommunityName={getCommunityName}
            getCommentLength={getCommentLength}
            isLoggedIn = {isLoggedIn}
            handleError = {handleError}
            checkPostExists = {checkPostExists}
            buttonTrigger = {buttonTrigger}
        />
      );
    break;
    case "postpage":
      mainContent=(
        <PostPage
            post={currentPost}
            getLinkFlair={getLinkFlair}
            getCommentLength={getCommentLength}
            goToNewComment={goToNewComment}
            isLoggedIn={isLoggedIn}
            handleError={handleError}
            />
            
      );
    break;
    case "newPost":
      mainContent=(
        <NewPost
            addNewPost={addNewPost}
            linkFlairs={linkFlairs}
            user={currentUser}
            handleError={handleError}/>
      );
    break;
    case "edit post":
      mainContent=(
        <NewPost
            addNewPost={addNewPost}
            linkFlairs={linkFlairs}
            user={currentUser}
            isEdit={true}
            isDelete={true}
            post={currentPost}
            editPost={editPost}
            onDelete={deletePost}
            handleError={handleError}/>
      );
    break;
    case "newCommunity":
      mainContent=(
        <NewCommunity
              addCommunity={addCommunity}
              onCreateCommunityClick={goToHomepage}
              user = {currentUser}
              handleError = {handleError}
        />
      );
    break;
    case "edit community":
      mainContent=(
        <NewCommunity
              addCommunity={addCommunity}
              onCreateCommunityClick={goToHomepage}
              user = {currentUser}
              isEdit = {true}
              community = {selectedCommunity}
              editCommunity={editCommunity}
              onDelete={deleteCommunity}
              handleError = {handleError}
        />
      );
    break;
    case "newComment":
      mainContent=(
        <NewComment
            object={replyTo}
            onCommentAdded={addComments}
            user = {currentUser}
        />
      );
    break;
    case "edit comment":
      mainContent=(
        <NewComment
            object={currentComment}
            onCommentAdded={addComments}
            user = {currentUser}
            isEdit = {true}
            comment = {currentComment}
            editComment = {editComment}
            onDelete={deleteComment}
        />
      );
    break;
    case "search":
      mainContent=(
        <SearchBar
              searchQuery={searchQuery}
              goToPostPage={goToPostPage}
              getCommunityName={getCommunityName}
              getCommentLength={getCommentLength}
              isLoggedIn={isLoggedIn}
              handleError={handleError}
              searchTrigger={searchTrigger}
              checkPostExists={checkPostExists}
        />
      );
      break;
    case "community":
      mainContent=(
        <CommunityPage
                community={selectedCommunity}
                getPosts={getPosts}
                goToPostPage={goToPostPage}
                getCommunityName={getCommunityName}
                comments={comments}
                getCommentLength={getCommentLength}
                isLoggedIn={isLoggedIn}
                buttonTrigger={setButtonTrigger}
                handleError={handleError}
                checkPostExists={checkPostExists}
          />
      );
      
    break;
    case "welcome":
      if(isLoggedIn) { goToHomepage(); return; }
      else{
      mainContent=(
        <Welcome
            goToLoginPage = {goToLogin}
            goToRegister = {goToRegister}
            goToHomepage = {goToHomepage}
        />
      );}
    break;
    case "register":
      mainContent=(
        <Register
          createUser = {createUser}
          onCreateUserClick = {goToWelcome}
        />
      );
    break;
    case "login":
      mainContent=(
        <Login onLoginSuccess={(user) => {setIsLoggedIn(true); setCurrentUser(user); goToHomepage();}} handleError={handleError} />
      );
    break;
    case "user profile":
      mainContent=(
        <UserProfile goToPostPage={goToPostPage} getCommunityName={getCommunityName} getCommentLength={getCommentLength} onCommunityEdit={onCommunityEdit} onPostEdit={onPostEdit} onCommentEdit={onCommentEdit} onAdminClick={onAdminClick} handleError={handleError} setButtonTrigger={setButtonTrigger}/>
      )
    break;
    case "sub user profile":
      mainContent=(
        <UserProfile goToPostPage={goToPostPage} getCommunityName={getCommunityName} getCommentLength={getCommentLength} onCommunityEdit={onCommunityEdit} onPostEdit={onPostEdit} onCommentEdit={onCommentEdit} onAdminClick={onAdminClick} subUser={tempUser} shouldGoBack={true} returnClick={goToUserProfile} handleError={handleError}/>
      )
    break;
    case "error":
      mainContent=(
        <Error goToWentWrong={goToWentWrong}/>
      )
    break;
    default:
      mainContent=(
        <Welcome
            goToLoginPage = {goToLogin}
            goToRegister = {goToRegister}
            goToHomepage = {goToHomepage}
        />
      );
    
  }

  return(
    <>
       <Banner 
           onPhredditClick={goToWelcome} 
           onSearchBarClick={goToSearch}
           onCreatePostClick={goToNewPost}
           redPost={redPost}
           isLoggedIn={isLoggedIn}
           onLogout={onLogout}
           onUserSelect={goToUserProfile}
           user={currentUser}
         />
       <hr></hr>
  
      <Navbar
           onHomeButtonClick={goToHomepage}
           onCreateCommunityClick={goToNewCommunity}
           onCommunitySelect={goToCommunity}
           redHome={redHome}
           redCommunity={redCommunity}
           redCommunityLink={redCommunityLink}
           selectedCommunity={selectedCommunity}
           isLoggedIn = {isLoggedIn}
           reloadTrigger = {buttonTrigger}
           handleError = {handleError}
       />
       <div id="main-content">
         {mainContent}
       </div>  
    </>
  );
}