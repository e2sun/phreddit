function Admin({user}){  

    const redText = { color: '#FF4500' };

    return (
        <div class ="phreddit_user_header">
            <p>
                Display Name:&nbsp;
                <span style={redText}>{user.displayName}</span>
            </p>
            <p>
                Email Address:&nbsp; 
                <span style={redText}>{user.email}</span>
            </p>
            <p>
                Reputation: &nbsp;
                <span style={redText}>{user.reputation}</span>
            </p>
            
        </div>
    );

}
export default Admin;