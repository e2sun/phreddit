
export default function Error({goToWentWrong}) {
    return(
        <>
        <h1 id="error_heading">Whoops! There's been an error.</h1>
        <p id="error_message">We're so sorry but something has gone wrong. Please click the button below to return to the welcome page.</p>
        <img id="error_image" src="/elmo_sigh.png" alt="Elmo sighing because he got an error"/>
        <button id="error_button" onClick={(e) => {e.preventDefault(); goToWentWrong();}}>Welcome Page</button>
        </>
    );
};