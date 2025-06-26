import {useState} from 'react';
import PropTypes from 'prop-types';

function Banner({onPhredditClick, onSearchBarClick, onCreatePostClick, redPost, isLoggedIn, onLogout, onUserSelect, user}){
    const [searchInput, setSearchInput] = useState("");
    const [isHovered, setIsHovered] = useState(false);

    const createPostButtonStyle = {
        backgroundColor: isLoggedIn ? (isHovered ? '#FF4500' : (redPost ? '#ff4500' : '#c2c7c9')): '#A9A9A9',
      };

    const handleKeyDown = (e) => {
        if (e.key==='Enter'){
            e.preventDefault();
            onSearchBarClick(searchInput);
        }
    }
    return (
        <div id = "banner_setup">
            <div id="banner" className="banner">
            <a id="title_label" href="" onClick={(e) => { e.preventDefault(); onPhredditClick(); }}>
                <h2>Phreddit</h2>
            </a>
            <form id="form" onSubmit={(e) => { e.preventDefault(); onSearchBarClick(searchInput); setSearchInput(""); }}>
                <input id="searchbar" type="text" placeholder="Search Phreddit..." value={searchInput}onChange={(e) => setSearchInput(e.target.value)} onKeyDown={handleKeyDown}/>
            </form>

            {isLoggedIn ? (
                <>
                    <button id="user" onClick={(e) => {e.preventDefault(); onUserSelect(user)}}>{user.displayName}</button>
                    <button id="logout" onClick={(e) => {e.preventDefault(); onLogout()}}>Logout</button>
                    <button id="createpost" style={createPostButtonStyle} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onClick={(e) => { e.preventDefault(); onCreatePostClick(); }}> Create Post </button>
                </>
            ) : (
                <>
                    <button id="user">Guest</button>
                    <button id="createpost" style={createPostButtonStyle}> Create Post </button>
                </>
            )
            }
            </div>
        </div>
    );
}
export default Banner;

Banner.propTypes = {
    onPhredditClick: PropTypes.func.isRequired,
    onSearchBarClick: PropTypes.func.isRequired,
    onCreatePostClick: PropTypes.func.isRequired,
    redPost: PropTypes.bool.isRequired,
    isLoggedIn: PropTypes.bool.isRequired
};