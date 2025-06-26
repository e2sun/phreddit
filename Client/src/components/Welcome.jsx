import React, { useState } from "react";
import PropTypes from 'prop-types';

function Welcome({goToLoginPage, goToRegister, goToHomepage, isLoggedIn}){
    console.log("made it to welcome page");
    if(isLoggedIn){
        goToHomepage();
        return;
    }
    
    return (
    <div id="welcome_setup">
        <div id="welcome_wrapper">
            <div id="welcome_content">
                <h1>Welcome to Phreddit!</h1>
            </div>
            <div id="welcome_buttons">
                <button id="signup_button" type="submit" onClick={(e) => {e.preventDefault(); goToRegister()}}> Sign Up </button>
                <button id="login_button" type="submit" onClick={(e) => {e.preventDefault(); goToLoginPage()}}> Login </button>
                <button id="guest_button" type="submit" onClick={(e) => {e.preventDefault(); goToHomepage()}}> Continue as Guest </button>
            </div>
        </div>
    </div>
    );
}

export default Welcome;

Welcome.propTypes = {
    goToLoginPage: PropTypes.func.isRequired,
    goToRegister: PropTypes.func.isRequired,
    goToHomepage: PropTypes.func.isRequired
};