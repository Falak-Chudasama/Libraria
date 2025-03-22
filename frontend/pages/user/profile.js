const baseOrigin = window.location.origin;

const dashboard = document.getElementById('dashboard'); // add bgimage of user dashboard
const homeBtn = document.getElementById('home-button');
const userProfile = document.getElementById('user-profile-bigger'); // add bgimage of user profile
const firstName = document.getElementById('first-name')
const lastName = document.getElementById('last-name')
const email = document.getElementById('email');
const phoneNumber = document.getElementById('phone-number');
const house = document.getElementById('house');
const street = document.getElementById('street');
const city = document.getElementById('city');
const state = document.getElementById('state');
const bio = document.getElementById('bio');
const readRecentlyBooks = document.getElementById('read-recently-books'); // add divs with class 'read-recently-book'
const booksRead = document.getElementById('books-read');
const favGenre = document.getElementById('fav-genre');
const currentBook = document.getElementById('current-book');
const favBook = document.getElementById('fav-book');
const addressPen = document.getElementById('address-pen');
const bioPen = document.getElementById('bio-pen');


document.addEventListener('DOMContentLoaded', () => {
    let url = "http://localhost:3000/uploads/users";
    dashboard.style.background = `url(${url}/dashboard/arthurMorganDashboard.jpg) black 50% / cover no-repeat`;
    userProfile.style.background = `url(${url}/profile/arthur_morgan.png)  black 50% / cover no-repeat`

    firstName.innerText = 'Arthur';
    lastName.innerText = 'Morgan';
    email.innerText = 'arthur@gmail.com';
    phoneNumber.innerText = '+91 12345 67890';

    house.innerText = 'house';
    street.innerText = 'broadway';
    city.innerText = 'Los Angeles';
    state.innerText = 'California';

    bio.innerText = 'Arthur Morgan was a gunslinger, artist, and reluctant philosopher who roamed the American West in the late 19th century. Born into a life of hardship, Arthur became a central figure in the Van der Linde gang—a group of outlaws chasing freedom in a world rapidly closing in. ';

    booksRead.innerText = '26';
    favGenre.innerText = 'Self Help';
    currentBook.innerText = 'The Psychology of Money';
    favBook.innerText = 'Shri Bhagwat Geeta';
});

homeBtn.addEventListener('click', (event) => {
    event.preventDefault();
    window.location.href = `${baseOrigin}/home`;
});