const baseUrl = require("../scripts/constants.js");

const homeGreet = document.getElementById('home-greet');
const user = JSON.parse(sessionStorage.getItem('user'));

/*
<div class="hero-section-books flex-box">
    <div class="big-book" id="book1"></div>
    <div class="small-books-pair grid">
        <div class="small-book" id="book4"></div>
        <div class="small-book" id="book5"></div>
    </div>
    <div class="big-book" id="book2"></div>
    <div class="small-books-pair grid">
        <div class="small-book" id="book6"></div>
        <div class="small-book" id="book7"></div>
    </div>
    <div class="big-book" id="book3"></div>
</div>
*/

function updateHeading() {
    const currHour = new Date().getHours();
    let greetingTime;

    if (currHour >= 5 && currHour < 12) {
        greetingTime = 'Morning';
    } else if (currHour >= 12 && currHour < 17) {
        greetingTime = 'Afternoon';
    } else {
        greetingTime = 'Evening';
    }

    homeGreet.innerText = `Good ${greetingTime} ${user.firstName}! Explore the most Popular Titles`;
}

async function putTopBooks() {
    console.log(baseUrl);
    // let topBooks = sessionStorage.getItem('top-books');
    // if (!topBooks) {
    //     topBooks = await fetch(`${baseUrl}api/books/allTop`, {
            
    //     }) 
    // }
}

document.addEventListener('DOMContentLoaded', async (event) => {
    event.preventDefault();
    updateHeading();
    putTopBooks();
    console.log(baseUrl);
});