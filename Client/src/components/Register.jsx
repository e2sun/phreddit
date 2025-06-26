import React, {useState} from 'react';
import PropTypes from 'prop-types';

export default function Register({createUser, onCreateUserClick}){
    const [firstName, setFirst] = useState("");
    const [lastName, setLast] = useState("");
    const [email, setEmail] = useState("");
    const [displayName, setName] = useState("");
    const [firstPassword, setFirstPassword] = useState("");
    const [secondPassword, setSecondPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(firstName === ""){
            alert("First name is required");
            return;
        }
        if(lastName === ""){
            alert("Last name is required");
            return;
        }
        if(email === "") {
            alert("Email is required");
            return;
        }
        if(displayName === ""){
            alert("Display Name is required");
            return;
        }
        if(firstPassword === ""){
            alert("First Password is required");
            return;
        }
        if(secondPassword === ""){
            alert("Second Password is required");
            return;
        }
        if(firstPassword != secondPassword){
            alert("Passwords do not match, please try again");
            return;
        }
        
        // Checking for a valid email
        // used a common RegEx pattern for this from Geeks for Geeks
        // https://www.geeksforgeeks.org/how-to-validate-email-address-using-regexp-in-javascript/
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if(!emailRegex.test(email)){
            alert("Please enter a valid email address.");
            return;
        }

        //Substring of email
        const emailSub = email.split("@")[0];
        

        //Checking if password contains first or last name
        const p = firstPassword.toLowerCase();
        if (p.includes(firstName.toLowerCase())){
            alert("Password cannot contain your first name!");
            return;
        } else if (p.includes(lastName.toLowerCase())){
            alert("Password cannot contain your last name!");
            return;
        } else if (p.includes(displayName.toLowerCase())){
            alert("Password cannot contain your display name!");
            return;
        } else if (p.includes(emailSub.toLowerCase())){
            alert("Password cannot contain your email!");
            return;
        }

        try {
            await createUser({
                firstName,
                lastName,
                email,
                displayName,
                password: firstPassword
            });

            alert("Your user has successfully been created");
            setFirst("");
            setLast("");
            setEmail("");
            setName("");
            setFirstPassword("");
            setSecondPassword("");

            onCreateUserClick();

        } catch (err) {
            const status = err.response.status;
            const code   = err.response.data.error;

            if (status === 409) {
                if (code === 'EMAIL_TAKEN') {
                    alert("There's already an account associated with that email");
                } else if (code === 'DISPLAYNAME_TAKEN') {
                    alert("That display name is already taken");
                } else {
                    console.error("Unexpected error creating user:", err);
                    alert("Error creating user. Please try again later.");
                }
            }
        }
    };  // ← fixed handleSubmit closure

    return (
        <div id="register_new_user">
            <div id="create_phreddit">Create a Phreddit account</div>
            <form id="register_user_form" onSubmit={handleSubmit}>
                <h3>First name (required):</h3>
                <input id="register_first_name" type="text" onChange={(e) => setFirst(e.target.value)}/>
                <h3>Last name (required):</h3>
                <input id="register_last_name" type="text" onChange={(e) => setLast(e.target.value)}/>
                <h3>Email (required):</h3>
                <input id="register_email" type="text" onChange={(e) => setEmail(e.target.value)}/>
                <h3>Display Name (required):</h3>
                <input id="register_display_name" type="text" onChange={(e) => setName(e.target.value)}/>
                <h3>Password (required):</h3>
                <input id="register_password_one" type="password" onChange={(e) => setFirstPassword(e.target.value)}/>
                <h3>Re-type Password (required):</h3>
                <input id="register_password_two" type="password" onChange={(e) => setSecondPassword(e.target.value)}/>
                <input id="register_user" type="submit" value="Sign Up"/>
            </form>
        </div>
    );
}

Register.propTypes = {
    createUser: PropTypes.func.isRequired,
    onCreateUserClick: PropTypes.func.isRequired
};
