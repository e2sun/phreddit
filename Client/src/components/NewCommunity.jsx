
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8000';

export default function NewCommunity({addCommunity, onCreateCommunityClick, user, isEdit, community, editCommunity, onDelete, handleError}){

  //Use State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

   useEffect( () => {
              const getInfo = async() => {
                  console.log("MADE IT")
                  if (isEdit && community){
                      setName(community.name);
                      setDescription(community.description);
                  }
              }
              getInfo();
              
          }, [isEdit, community])


  //Handle Submit Button Function
  const handleSubmit = async (e) =>{
    e.preventDefault(); // Don't reload page 
    const nameMaxChar = 100;
    const descriptionMaxChar = 500;

    let nameCount=name.length; // Get length of input
    let descriptionCount=description.length; // Get length of input
    // let usernameCheck = username.length; // Get length of input
    var valid=true;

    if (nameCount>nameMaxChar){
        alert("Your community name has exceeded the character limit!");
        valid=false;
        return;
    }
    if (nameCount===0){
        alert("Community name is required!");
        valid=false;
        return;
    }
    if (descriptionCount>descriptionMaxChar){
        alert("Your community description has exceeded the character limit!");
        valid=false;
        return;
    }
    if (descriptionCount===0){
        alert("Community description is required!");
        valid=false;
        return;
    }

    if(!isEdit){
      const response = await axios.get(`/isUnique/${name}`)
        .catch(err => {
          handleError(err);
        }
        )
      if(response.data.isDuplicate){
        alert("Community already exists, please enter a unique name");
        valid = false;
        return;
      }
    }
  
    // Check hyperlinks
    const hyperlinkRegex = /\[([^\]]*)\]\((.*?)\)/g;

    let match;

    while ((match = hyperlinkRegex.exec(description)) !== null) {
      if (match[1].trim()===''){
        alert("The hyperlink text (inside []) cannot be empty!");
        valid=false;
        return;
      }
      if (match[2].trim()===''){
        alert("The hyperlink URL (inside ()) cannot be empty!");
        valid=false;
        return;
      }
  

      if (!(match[2].slice(0, 8) === 'https://' || match[2].slice(0, 7) === 'http://')) {
        alert("The hyperlink URL must begin with either 'https://' or 'http://'!");
        valid = false;
        return;
      }
  }

    
    if (valid){
        const newCommunity = {
            name: name,
            description: description,
            postIDs: [],
            startDate: new Date(),
            members: [user.email],
            memberCount: 1,
            createdBy: user.displayName
        };

        
      
        alert("Your community has successfully been created!");
        if(isEdit){
          editCommunity(newCommunity, community);
        } else {
          addCommunity(newCommunity);
        }

        //Reset Form
        setName("");
        setDescription("");
  
        onCreateCommunityClick();
        
    }
  
  }

    return(
      <div id="newcommunity_setup">
        <div id="newcommunity_header"> 
         <h1>{isEdit ? "Edit Community" : "Tell us about your Community"}</h1>
       </div>
        <form id="newcommunity_form" onSubmit={handleSubmit}>
            <input id="community_name" type="text" placeholder={isEdit ? "" : "Community Name (required, max 100 characters)"} onFocus={(e) => e.target.placeholder = ""} onChange={(e) => setName(e.target.value)} value={name}/> 
            <textarea id="community_description_box" type="text" placeholder="Community Description (required, max 500 characters)" onFocus={(e) => e.target.placeholder = ""} onChange={(e) => setDescription(e.target.value)} value={description}></textarea>
            {/* <input id="creator_username" type="text" placeholder="Creator Username (required)" onFocus={(e) => e.target.placeholder = ""} onChange={(e) => setUsername(e.target.value)}/>  */}
            <input id="engender_community" type="submit" value={isEdit ? "Save Changes" : "Engender Community"}/>
        {isEdit && onDelete && (
          <button
            type="button"
            id="delete_community"
            style={{ backgroundColor: '#f44336', color: '#fff' }}
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this community?")) {
                onDelete(community);
              }
            }}
          >
            Delete Community
          </button>
        )}
        </form>
      </div>  
    );
}


NewCommunity.propTypes = {
  addCommunity: PropTypes.func.isRequired,
  onCreateCommunityClick: PropTypes.func.isRequired
}