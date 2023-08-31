import { tweetsData as initialTweetsData } from './data.js'
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

//STORE TWEETS IN LOCAL STORAGE:
//check if there is anything in local storage - if so set tweetsData array to the contents of local storage by calling a function to retrieve them
//else set tweetsData array to initialTweetsData

let tweetsData = []

if(localStorage.getItem("tweetsData")){
    //take this out into it's own function - 'retrieve'
    retrieveTweetsData()
}
else{
    tweetsData = initialTweetsData
}

//create retrieving function that sets the value of tweetsDataArr to the contents of local storage using JSON.parse
//create function to store tweets to local storage by setting item to the value of tweetsData using JSON.stringify

//call store tweets function within every click handling function
//if there is anything in local storage then call retrieve tweets function within the get feed html function

function saveTweetsToLocalStorage(){
    localStorage.setItem("tweetsData", JSON.stringify(tweetsData))
}

function retrieveTweetsData(){
    tweetsData = JSON.parse( localStorage.getItem("tweetsData") )
}


//EVENT LISTENERS:
document.addEventListener('click', function(e){
    if(e.target.dataset.like){
       handleLikeClick(e.target.dataset.like) 
    }
    else if(e.target.dataset.retweet){
        handleRetweetClick(e.target.dataset.retweet)
    }
    //if the target of the click is the reply icon, call handleReplyClick func passing in the reply dataset//
    //(defined as tweet uuid within getFeedHTML func)//
    else if(e.target.dataset.reply){
        handleReplyClick(e.target.dataset.reply)
    }
    else if(e.target.id === 'tweet-btn'){
        handleTweetBtnClick()
    }
    else if(e.target.dataset.replybtn){
        handleReplyBtnClick(e.target.dataset.replybtn)
    }
})



 //HANDLE ICON CLICKS:
function handleLikeClick(tweetId){ 
    const targetTweetObj = tweetsData.filter(function(tweet){
        return tweet.uuid === tweetId
    })[0]

    if (targetTweetObj.isLiked){
        targetTweetObj.likes--
    }
    else{
        targetTweetObj.likes++ 
    }
    targetTweetObj.isLiked = !targetTweetObj.isLiked
    saveTweetsToLocalStorage()
    render()
}

function handleRetweetClick(tweetId){
    const targetTweetObj = tweetsData.filter(function(tweet){
        return tweet.uuid === tweetId
    })[0]
    
    if(targetTweetObj.isRetweeted){
        targetTweetObj.retweets--
    }
    else{
        targetTweetObj.retweets++
    }
    targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted
    saveTweetsToLocalStorage()
    render() 
}

//HANDLE THE REPLY & TWEET BUTTON CLICK:
//handleReplyClick func takes a variable - when called above this is the tweet uuid//
//takes control of the div containing the reply html and toggles class list hidden to diplay or hide replies depending on current state//
//to enable replying add to replies HTML a textarea and create a new func called sendReply that is similar to handleTweetBtnClick()//
function handleReplyClick(replyId){
    document.getElementById(`replies-${replyId}`).classList.toggle('hidden')
}


function handleTweetBtnClick(){
    const tweetInput = document.getElementById('tweet-input')

    if(tweetInput.value){
        tweetsData.unshift({
            handle: `@Waffles`,
            profilePic: `images/dogavatar.jpg`,
            likes: 0,
            retweets: 0,
            tweetText: tweetInput.value,
            replies: [],
            isLiked: false,
            isRetweeted: false,
            uuid: uuidv4()
        })
    saveTweetsToLocalStorage()
    render()
    tweetInput.value = ''
    }

}



function handleReplyBtnClick(replybtnId){
    const replyInput = document.getElementById(`reply-input-${replybtnId}`)
    
    if(replyInput.value){
        const targetReplyObj = tweetsData.filter(function(tweet){
            return tweet.uuid === replybtnId
        })[0]
        console.log(targetReplyObj)
        
        targetReplyObj.replies.unshift({
            handle: `@Waffles`,
            profilePic: `images/dogavatar.jpg`,
            tweetText: replyInput.value,
    })
    saveTweetsToLocalStorage()
    render()
    replyInput.value = ''
    document.getElementById(`replies-${replybtnId}`).classList.toggle('hidden')
    }
}


//DISPLAY THE FEED HTML:
function getFeedHtml(){
    let feedHtml = ``

    if(localStorage.getItem("tweetsData")){
        retrieveTweetsData()
    }
    
    tweetsData.forEach(function(tweet){
        
        let likeIconClass = ''
        
        if (tweet.isLiked){
            likeIconClass = 'liked'
        }
        
        let retweetIconClass = ''
        
        if (tweet.isRetweeted){
            retweetIconClass = 'retweeted'
        }
 
        //create a variable to hold the reply html//
        let repliesHtml = ''
        //if the tweet reply array in data.js is longer than 0, for each reply create the below html and add to the html variable//
        if(tweet.replies.length > 0){
            tweet.replies.forEach(function(reply){
                repliesHtml+=`
<div class="tweet-reply">
    <div class="tweet-inner">
        <img src="${reply.profilePic}" class="profile-pic">
            <div>
                <p class="handle">${reply.handle}</p>
                <p class="tweet-text">${reply.tweetText}</p>
            </div>
        </div>
</div>
`
            })
        }
        
          
        feedHtml += `
<div class="tweet">
    <div class="tweet-inner">
        <img src="${tweet.profilePic}" class="profile-pic">
        <div>
            <p class="handle">${tweet.handle}</p>
            <p class="tweet-text">${tweet.tweetText}</p>
            <div class="tweet-details">
                <span class="tweet-detail">
                    <i class="fa-regular fa-comment-dots"
                    data-reply="${tweet.uuid}"
                    ></i>
                    ${tweet.replies.length}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-heart ${likeIconClass}"
                    data-like="${tweet.uuid}"
                    ></i>
                    ${tweet.likes}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-retweet ${retweetIconClass}"
                    data-retweet="${tweet.uuid}"
                    ></i>
                    ${tweet.retweets}
                </span>
            </div>   
        </div>            
    </div>
    <div class="hidden" id="replies-${tweet.uuid}">
        <div class="tweet-reply">
        <div class="tweet-input-area">
			<img src="images/dogavatar.jpg" class="profile-pic">
			<textarea placeholder="Post your reply!" id="reply-input-${tweet.uuid}"></textarea>
		</div>
		<button class="button" id="reply-btn" data-replybtn="${tweet.uuid}">Reply</button>
        </div>
        ${repliesHtml}
    </div>   
</div>
`
   })
   return feedHtml 
}

function render(){
    document.getElementById('feed').innerHTML = getFeedHtml()
}

render()