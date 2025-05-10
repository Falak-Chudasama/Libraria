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
    const userObj = JSON.parse(sessionStorage.getItem('user'));

    // dashboard.style.background = `url(${url}/dashboard/arthurMorganDashboard.jpg) black 50% / cover no-repeat`;
    // dashboard.style.background = `url(${userObj.profileImage}) black 50% / cover no-repeat`;
    userProfile.style.background = `url(${url}/profile/arthur_morgan.png)  black 50% / cover no-repeat`
    userProfile.style.background = `url(${userObj.dashboardImage})  black 50% / cover no-repeat`

    // firstName.innerText = 'Arthur';
    // lastName.innerText = 'Morgan';
    // email.innerText = 'arthur@gmail.com';
    // phoneNumber.innerText = '+91 12345 67890';
    firstName.innerText = userObj.firstName;
    lastName.innerText = userObj.lastName;
    email.innerText = userObj.email;
    phoneNumber.innerText = `+91 ${userObj.mobileNo}`;

    // house.innerText = 'house';
    // street.innerText = 'broadway';
    // city.innerText = 'Los Angeles';
    // state.innerText = 'California';
    house.innerText = userObj.address.house;
    street.innerText = userObj.address.street;
    city.innerText = userObj.address.city;
    state.innerText = userObj.address.state;

    // bio.innerText = 'Arthur Morgan was a gunslinger, artist, and reluctant philosopher who roamed the American West in the late 19th century. Born into a life of hardship, Arthur became a central figure in the Van der Linde gang—a group of outlaws chasing freedom in a world rapidly closing in. ';
    bio.innerText = userObj.bio;

    // booksRead.innerText = '26';
    booksRead.innerText = userObj.borrowRecords.length;
    favGenre.innerText = 'Self Help'; // pending
    currentBook.innerText = userObj.borrowedBook === null ? 'None' : userObj.borrowedBook;
    favBook.innerText = 'Shri Bhagwat Geeta'; // pending
});

homeBtn.addEventListener('click', (event) => {
    event.preventDefault();
    window.location.href = `${baseOrigin}/home`;
});