import React from "react";

function ParseDescription({description}){
const hyperlinkRegex = /\[([^\]]*)\]\((.*?)\)/g;


    let lastIndex = 0;
    let match=hyperlinkRegex.exec(description);
    const elements=[];

    
    while (match!=null){
      if (match.index>lastIndex){
        elements.push(description.slice(lastIndex,match.index)); //Keep track of description up to the part we need to replace
      }
      elements.push(
        <a key={match.index} href={match[2]}> 
          {match[1]}
        </a>
      ); //Add hyperlink
      lastIndex = match.index + match[0].length; //Update last index
      // Update match to the next occurrence
      match = hyperlinkRegex.exec(description);
    }
    //Add remaining description
    if (lastIndex<description.length){
      elements.push(description.slice(lastIndex));
    }
    return elements;

}

export default ParseDescription;