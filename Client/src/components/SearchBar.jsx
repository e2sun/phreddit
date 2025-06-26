import React, { useState, useEffect } from "react";
import Post from './Post.jsx';
import SortPosts from "./SortPosts.jsx";
import PropTypes from 'prop-types';
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:8000';

export default function SearchBar({ searchQuery, goToPostPage, getCommunityName, getCommentLength, isLoggedIn, handleError,searchTrigger, checkPostExists}) {
  const [posts, setPosts] = useState([]);
  const [type, setType] = useState('newest');
  const [comments, setComments] = useState([]);
  const [user, setUsers] = useState(null);
  const [communities, setCommunities] = useState([]);  

      useEffect(()=>{
          async function fetchAll(){
              try{
                  const [postsRes, commentsRes, commRes] = await Promise.all([
                      axios.get('/posts'),
                      axios.get('/comments'),
                      axios.get('/communities')
                  ]);
                  setPosts(postsRes.data);
                  setComments(commentsRes.data);
                  setCommunities(commRes.data)
              }
              catch (err){
                  console.log(err);
                  handleError(err);
              }
          }
  
          fetchAll();
      }, [searchQuery, searchTrigger]);

      useEffect(()=>{
        async function fetchUser(){
            if (!isLoggedIn){
                return;
            }
            try{
                const [userRes] = await Promise.all([
                    axios.get('/userProfile')
                ]);
                setUsers(userRes.data);
            }
            catch (err){
                console.log(err);
                handleError(err);
            }
        }

        fetchUser();
    }, [searchQuery, searchTrigger]);

    if (isLoggedIn && user === null) {
      return;
  }

  const getSearch = (searchQuery) => {
   
    const terms = searchQuery
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(t => t.length > 0);
  
    return posts.filter(post => {
      const filtered_posts = (
        post.title +' ' +(post.content || '')
      ).toLowerCase();

      return terms.some(term => filtered_posts.includes(term));
    });
  };

  const searchPosts = getSearch(searchQuery);


  //Map post id to parent community
  const postToCommunity = {};
  communities.forEach(c =>
      c.postIDs.forEach(pid => {
          postToCommunity[pid] = c._id;
      })
  );

//Find out which community the user is in

if (isLoggedIn && user){
  const userCommIDs = communities
  .filter(c => c.members.includes(user.email))
  .map(c => c._id);

  //Splitting posts
  const user_posts  = searchPosts.filter(p=>userCommIDs.includes(postToCommunity[p._id]));
  const other_posts = searchPosts.filter(p=>!userCommIDs.includes(postToCommunity[p._id]));

   //Sorting
  var filteredUserPosts  = SortPosts({ array: user_posts,  type, comments });
  var filteredOtherPosts = SortPosts({ array: other_posts, type, comments });

} else{
  //Sorting
  var filteredPosts = SortPosts({array: searchPosts, type, comments});
}

  const handleClick = (order) => {
    setType(order);
  };


  return (
    <div id="searchbar_setup">
      <div id="search_wrapper">
        {isLoggedIn ? (<>{filteredUserPosts.length === 0 && filteredOtherPosts === 0 ? <h1 className="red_header">No results found for: &quot;{searchQuery}&quot;</h1> : <h1 className="red_header">Results for: &quot;{searchQuery}&quot;</h1>}</>):(<>{filteredPosts.length === 0 ? <h1 className="red_header">No results found for: &quot;{searchQuery}&quot;</h1> : <h1 className="red_header">Results for: &quot;{searchQuery}&quot;</h1>}</>)}
        
  
        <div id="community_buttons">
            <button id="community_newest" onClick={() => handleClick('newest')}>Newest</button>
            <button id="community_oldest" onClick={() => handleClick('oldest')}>Oldest</button>
            <button id="community_active" onClick={() => handleClick('active')}>Active</button>
        </div>
      </div>
      
      <div className="search_post_results">
        {isLoggedIn ? (<><h2>{filteredUserPosts.length + filteredOtherPosts.length} Posts found</h2></>) : (<><h2>{filteredPosts.length} Posts found</h2></>)}
      </div>
    
     <hr/>
     <div id="posts">
            {isLoggedIn ? (
                        <><div id="posts">
                                {filteredUserPosts.map(post => (
                                    <Post key={post._id} post={post} goToPostPage={goToPostPage} getCommunityName={getCommunityName} community={false} getCommentLength={getCommentLength} checkPostExists={checkPostExists}/>
                                ))}
                            </div><hr></hr><hr></hr><div id="posts">
                                    {filteredOtherPosts.map(post => (
                                        <Post key={post._id} post={post} goToPostPage={goToPostPage} getCommunityName={getCommunityName} community={false} getCommentLength={getCommentLength} checkPostExists={checkPostExists}/>
                                    ))}
                                </div></>
                    ):(
                        <div id="posts">
                        {filteredPosts.map(post => (
                            <Post key={post._id} post={post} goToPostPage={goToPostPage} getCommunityName={getCommunityName} community={false} getCommentLength={getCommentLength} checkPostExists={checkPostExists}/>
                        ))}
                        </div>
                    )}
        </div>

    </div>
  );
}

const commentShape = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  commentIDs: PropTypes.arrayOf(PropTypes.string).isRequired,
  commentedBy: PropTypes.string.isRequired,
  commentedDate: PropTypes.instanceOf(Date).isRequired
});

const postShape = PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    linkFlairID: PropTypes.string.isRequired,
    postedBy: PropTypes.string.isRequired,
    postedDate: PropTypes.instanceOf(Date).isRequired,
    commentIDs: PropTypes.arrayOf(PropTypes.string).isRequired,
    views: PropTypes.number.isRequired
});

SearchBar.propTypes = {
  posts: PropTypes.arrayOf(postShape).isRequired,
  searchQuery: PropTypes.string.isRequired,
  goToPostPage: PropTypes.func.isRequired,
  getCommunityName: PropTypes.func.isRequired,
  comments: PropTypes.arrayOf(commentShape).isRequired,
  getCommentLength: PropTypes.func.isRequired
};
