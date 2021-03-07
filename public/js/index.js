const url="/QNA";
console.log("hello");
function searchfunc()
{
    var content=document.getElementById('searchCon').value;
    console.log(content);
    if(content!="")
    {   console.log("sendng req");
        document.getElementById('queslist').innerHTML="";
        var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () { // this is what happens when an answer is returned 
        if(xhttp.readyState === 4 && xhttp.status === 200) { // a valid answer
            document.getElementById('queslist').innerHTML=xhttp.responseText;
            console.log(xhttp.responseText)
           //document.getElementById("divShowBooks").innerHTML = xhttp.responseText;
         }
    };
    xhttp.open("GET",url+"/search/"+content,true);
    xhttp.send();
    }
}