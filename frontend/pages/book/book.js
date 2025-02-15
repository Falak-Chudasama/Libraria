const userProfile = document.getElementById('user-profile');
const bookCover = document.getElementById('book-cover');
const bookTitle = document.getElementById('book-title');
const bookAuthor = document.getElementById('book-author');
const miniDescription = document.getElementById('mini-description');
const genre = document.getElementById('genre');
const cost = document.getElementById('cost');
const copies = document.getElementById('copies');
const isbn = document.getElementById('isbn');
const pages = document.getElementById('pages');
const format = document.getElementById('format');
const records = document.getElementById('records');
const publishment = document.getElementById('publishment');
const bookDescription = document.getElementById('book-description');
const borrowersContainer = document.getElementById('borrowers-container');

function editBorrowersSection() {
    borrowersContainer.style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', () => {
    // Example
    userProfile.setAttribute('src', '../../assets/images/defaultProfile.jpg');
    bookCover.style.background = `url("../../../uploads/books/rich_dad_poor_dad.jpg") lightgray 50% / cover no-repeat`
    bookTitle.innerText = 'Rich Dad, Poor Dad';
    bookAuthor.innerText = 'Kiyosaki Robert';
    miniDescription.innerText = 'A personal finance classic challenging conventional wisdom on wealth.'
    genre.innerText = 'Finance';
    cost.innerText = `$3.00`;
    copies.innerText = '6';
    isbn.innerText = '9780446677455';
    pages.innerText = '189';
    format.innerText = 'Hardcover';
    records.innerText = '135 Borrowed';
    publishment.innerText = '1997';
    bookDescription.innerText = `Rich Dad, Poor Dad contrasts the financial philosophies of Robert Kiyosaki’s 'two dads': his biological father and his best friend’s father. The book offers insights into building wealth, achieving financial independence, and investing wisely.`
});