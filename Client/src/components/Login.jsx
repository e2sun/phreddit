import React, { useState } from "react";
import axios from "axios";
axios.defaults.baseURL = 'http://localhost:8000';

function Login({ onLoginSuccess, handleError }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
 
  const loginUser = async (e) => {
    e.preventDefault();

    if (!email) {
      alert("Please enter email");
      return;
    }
    if (!password) {
      alert("Please enter a password");
      return;
    }


    try {
        const { data } = await axios.post(
            "/login",
            { email, password },
            { withCredentials: true }
          );
         
          onLoginSuccess(data);
    } catch (err) {
      if (err.response?.status === 404) {
        alert("User not found");
      } else if (err.response?.status === 401) {
        alert("Password entered incorrectly");
      } else {
        alert("An error has occurred");
        console.error(err);
        handleError(err);
      }
    }
  };

  return (
    <div id="login_setup">
      <div id="login_header">
        <h1>Login</h1>
      </div>
      <form id="login_form" onSubmit={loginUser}>
        <label>
          <h3>Email</h3>
        </label>
        <input
          type="text"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <br />
        <label>
          <h3>Password</h3>
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <br />
        <button id="submit_login" type="submit">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
