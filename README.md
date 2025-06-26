# Phreddit

**Phreddit** (Phony Reddit) is a full-stack web application that mimics core Reddit functionality. Built with **React**, **Node.js**, **Express**, and **MongoDB**, it allows users to create accounts, post content, join communities, and comment on threads.

---

## 🚀 Features

- User account registration and login  
- Community creation and membership  
- Post creation with flair support  
- Comment threads  
- Voting system  
- Secure authentication with JWT  
- Backend validation and unit testing  

---

## 🧰 Tech Stack

- **Frontend**: HTML, CSS, React  
- **Backend**: Node.js, Express.js, MongoDB, Mongoose  
- **Testing**: Jest  
- **Authentication**: bcrypt, JWT  
- **Other Tools**: Axios, Cors, Cookie-parser  

---

## ⚙️ Setup Instructions

Follow the steps below to get the application running locally.

### ✅ Prerequisites

Ensure the following are installed on your system:

- Node.js  
- npm (comes with Node)  
- MongoDB (running locally at `mongodb://127.0.0.1:27017/phreddit`)  
- Git  

---

### 📁 Clone the Repository

`git clone https://github.com/e2sun/phreddit.git`

---

## 🖥️ Server Setup

Follow these steps to set up and run the backend server for the Phreddit application.

### 1. Navigate to the Server Folder

`cd server`

### 2. Install Server Dependencies

`npm install express axios mongoose cors cookie-parser bcrypt jsonwebtoken
npm install jest`

### 2. Initialize MongoDB Database

Make sure MongoDB is running locally at mongodb://127.0.0.1:27017/phreddit, then run:

`node init.js mongodb://127.0.0.1:27017/phreddit`

### 3. Start the Node Server

`nodemon server.js`

---

## 🌐 Client Setup

Follow these steps to set up and run the frontend client of the Phreddit application.

### 1. Navigate to the Client Folder

`cd client`

### 2. Install Client Dependencies

`npm install`

### 3. Install Client Dependencies

`npm start`

---

## 👥 Contributors
This project was completed in collaboration with Charlotte Cain and Evelyn Sun.









