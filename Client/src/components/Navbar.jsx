import React, { useState, useEffect} from "react";
import PropTypes from 'prop-types';
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:8000';

function Navbar({ onHomeButtonClick, onCreateCommunityClick, onCommunitySelect, redHome, redCommunity, selectedCommunity, isLoggedIn, reloadTrigger, handleError}) {
  
  const [isHovered1, setIsHovered1] = useState(false);
  const [isHovered2, setIsHovered2] = useState(false);

  const [communities, setCommunities] = useState([]);
  const [user, setUsers] = useState(null);
  const [logedInCommunities, setLoggedCommunities] = useState([]);

  useEffect(()=>{
    async function fetchAll(){
        try{
            const [commRes] = await Promise.all([
                axios.get('/communities')
            ]);
            setCommunities(commRes.data)
        }
        catch (err){
            console.log(err);
            handleError(err);
        }
    }

    fetchAll();
}, [reloadTrigger]);

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
}, [isLoggedIn]);

useEffect(() => {
  if(!isLoggedIn || !user) {
    return;
  }

  const userCommIDs = communities
        .filter(c => c.members.includes(user.email))
        .map(c => c._id);

  const user_communities = communities.filter(c => userCommIDs.includes(c._id));
  const other_communities = communities.filter(c => !userCommIDs.includes(c._id));

  setLoggedCommunities([...user_communities, ...other_communities]);
}, [user, communities, isLoggedIn]);


  const homeButtonStyle = {
    backgroundColor: isHovered1 ? '#FF4500' : (redHome ? '#ff4500' : '#c2c7c9'),
  };
  const createCommunityButtonStyle = {
    backgroundColor: isHovered2 ? '#FF4500' : (redCommunity ? '#ff4500' : '#c2c7c9'),
  };
  const disabledCommunityButtonStyle = {
    backgroundColor: '#A9A9A9'
  }


  return (
    <div id="navbar" className="navbar">
      <a id="home_link" href="#" style={homeButtonStyle} onMouseEnter={() => setIsHovered1(true)} onMouseLeave={() => setIsHovered1(false)} onClick={(e) => { e.preventDefault(); onHomeButtonClick(); }}>
        Home
      </a>
      <hr id="navdiv" />
      <h3>Communities</h3>

      {isLoggedIn ? (
    //Logged in
    <>
    <button
      id="new_community"
      style={createCommunityButtonStyle}
      onMouseEnter={() => setIsHovered2(true)}
      onMouseLeave={() => setIsHovered2(false)}
      onClick={e => { e.preventDefault(); onCreateCommunityClick(); }}
    >
      Create Community
    </button>
    <ul id="community_list">
        {logedInCommunities.map((community) => {
           console.log("Community ID:", community._id);
          const communityLinkStyle = {
            backgroundColor: selectedCommunity && selectedCommunity._id === community._id ? 'rgba(255,69,0,.5)' : 'white',
            whiteSpace: 'normal',          
            overflowWrap: 'break-word',    
            wordWrap: 'break-word',        
            display: 'block',             
            maxWidth: '150px',            
          };

          return (
          
            <li key={community._id}> 
            
              <a
                href="#"
                style={communityLinkStyle}
                onClick={(e) => {
                  e.preventDefault();
                  onCommunitySelect(community);
                }}
              >
                {community.name}
              </a>
            </li>
          );
        })}
      </ul>
    </>
  ) : (
    // Logged out
    <>
    <button
      id="new_community"
      disabled
      style={disabledCommunityButtonStyle}
    >
      Create Community
    </button>
    
    <ul id="community_list">
        {communities.map((community) => {
           console.log("Community ID:", community._id);
          const communityLinkStyle = {
            backgroundColor: selectedCommunity && selectedCommunity._id === community._id ? 'rgba(255,69,0,.5)' : 'white',
            whiteSpace: 'normal',          
            overflowWrap: 'break-word',    
            wordWrap: 'break-word',        
            display: 'block',             
            maxWidth: '150px',            
          };

          return (
          
            <li key={community._id}> 
            
              <a
                href="#"
                style={communityLinkStyle}
                onClick={(e) => {
                  e.preventDefault();
                  onCommunitySelect(community);
                }}
              >
                {community.name}
              </a>
            </li>
          );
        })}
      </ul>
    </>
  )}
      <div id="vertical_line"></div>
    </div>
  );
}

export default Navbar;

const communityShape = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  postIDs: PropTypes.arrayOf(PropTypes.string).isRequired,
  startDate: PropTypes.instanceOf(Date).isRequired,
  members: PropTypes.arrayOf(PropTypes.string).isRequired,
  memberCount: PropTypes.number.isRequired
});

Navbar.propTypes = {
  communities: PropTypes.arrayOf(communityShape).isRequired,
  onHomeButtonClick: PropTypes.func.isRequired,
  onCreateCommunityClick: PropTypes.func.isRequired,
  onCommunitySelect: PropTypes.func.isRequired,
  redHome: PropTypes.bool.isRequired,
  redCommunity: PropTypes.bool.isRequired,
  selectedCommunity: communityShape.isRequired
}