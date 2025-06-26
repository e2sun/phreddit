import React, { useState, useEffect } from "react";
import Post from './Post.jsx';
import SortPosts from "./SortPosts.jsx";
import PropTypes from 'prop-types';
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:8000';


function HomePage({ goToPostPage, getCommunityName, getCommentLength, isLoggedIn, handleError, checkPostExists}){
    console.log("made it to home page");
    const [type, setType] = useState('newest');
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [communities, setCommunities] = useState([]);
    const [user, setUsers] = useState(null);
    
    async function fetchAll(){
            try{
                const [postsRes, commentsRes, commRes] = await Promise.all([
                    axios.get('/posts'),
                    axios.get('/comments'),
                    axios.get('/communities')
                ]);
                setPosts(postsRes.data);
                setComments(commentsRes.data);
                // setUsers(userRes.data);
                setCommunities(commRes.data);
            }
            catch (err){
                console.log(err);
                handleError(err);
            }
        };
    
    useEffect(()=>{
        // async function fetchAll(){
        //     try{
        //         const [postsRes, commentsRes, commRes] = await Promise.all([
        //             axios.get('/posts'),
        //             axios.get('/comments'),
        //             axios.get('/communities')
        //         ]);
        //         setPosts(postsRes.data);
        //         setComments(commentsRes.data);
        //         // setUsers(userRes.data);
        //         setCommunities(commRes.data);
        //     }
        //     catch (err){
        //         console.log(err);
        //         handleError(err);
        //     }
        // }

        fetchAll();

        const localStorageChange = () => {
            const currentTime = localStorage.getItem('postsUpdated');
            if(currentTime){
                fetchAll();
                localStorage.removeItem('postsUpdated');
            }
        };

        window.addEventListener('storage', localStorageChange);

        return () => {
            window.removeEventListener('storage', localStorageChange);
        }
    }, []);

    useEffect(()=>{
        async function fetchUser(){
            if (!isLoggedIn){
                return;
            }
            try{
                const [userRes] = await Promise.all([
                    axios.get('/userProfile', {withCredentials: true})
                ]);

                setUsers(userRes.data);
            }
            catch (err){
                console.log(err);
                handleError(err);
            }
        }

        fetchUser();
    }, []);

    // // refetch posts when you click back to the tab (for delete post)
    // useEffect(() => {
    //     const handleVisible = () => {
    //         if(document.visibilityState === "visible") {
    //             console.log("Refetching");
    //             fetchAll();
    //         }
    //     };

    //     document.addEventListener('visibilitychange', handleVisible);

    //     return () => {
    //         document.removeEventListener('visibilitychange', handleVisible);
    //     };
    // }, []);

    if (isLoggedIn && user === null) {
        return;
    }



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
        const user_posts  = posts.filter(p=>userCommIDs.includes(postToCommunity[p._id]));
        const other_posts = posts.filter(p=>!userCommIDs.includes(postToCommunity[p._id]));

         //Sorting
        var sorted_user_posts  = SortPosts({ array: user_posts,  type, comments });
        var sorted_other_posts = SortPosts({ array: other_posts, type, comments });

    } else{
        //Sorting
        var sortedPosts = SortPosts({array: posts, type, comments});
    }
  
    
  


    
    const handleClick = (order) => {
        setType(order);
    };

    return (
    <div id="homepage_setup">
        <div id="post_wrapper">
            <div id="post_info">
                <h1>All Posts</h1>
            </div>
            <div id="post_buttons">
                <form>
                    <input id="newest" type="submit" value="Newest" onClick={(e) => {e.preventDefault(); handleClick('newest');}}/>
                    <input id="oldest" type="submit" value="Oldest" onClick={(e) => {e.preventDefault(); handleClick('oldest');}}/>
                    <input id="active" type="submit" value="Active" onClick={(e) => {e.preventDefault(); handleClick('active');}}/>
                </form>
            </div>
        </div>
        <h2 id="number_of_posts"> {posts.length} posts </h2>
        <hr/>
        {isLoggedIn ? (
            <><div id="posts">
                    {sorted_user_posts.map(post => (
                        <Post key={post._id} post={post} goToPostPage={goToPostPage} getCommunityName={getCommunityName} community={false} getCommentLength={getCommentLength} checkPostExists={checkPostExists}/>
                    ))}
                </div><hr></hr><hr></hr><div id="posts">
                        {sorted_other_posts.map(post => (
                            <Post key={post._id} post={post} goToPostPage={goToPostPage} getCommunityName={getCommunityName} community={false} getCommentLength={getCommentLength} checkPostExists={checkPostExists}/>
                        ))}
                    </div></>
        ):(
            <div id="posts">
            {sortedPosts.map(post => (
                <Post key={post._id} post={post} goToPostPage={goToPostPage} getCommunityName={getCommunityName} community={false} getCommentLength={getCommentLength} checkPostExists={checkPostExists}/>
            ))}
            </div>
        )}
       

    </div>
    );
}

export default HomePage;

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

HomePage.propTypes = {
    posts: PropTypes.arrayOf(postShape).isRequired,
    goToPostPage: PropTypes.func.isRequired,
    getCommunityName: PropTypes.func.isRequired,
    comments: PropTypes.arrayOf(commentShape).isRequired,
    getCommentLength: PropTypes.func.isRequired
};