const title = document.getElementById('title');
const author = document.getElementById('author');
const isbn = document.getElementById('isbn');
const cost = document.getElementById('cost');
const copies = document.getElementById('copies');
const pages = document.getElementById('pages');
const publishmentYear = document.getElementById('publishment-year');
const genre = document.getElementById('genre');
const edition = document.getElementById('edition');
const coverImage = document.getElementById('cover-image');
const summary = document.getElementById('summary');
const description = document.getElementById('description');
const addBookBtn = document.getElementById('add-book-btn');
const addBookForm = document.getElementById('add-book-form');

addBookForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const bookObject = {
        title: title.value,
    }

    console.log("Title:", title.value);
    console.log("Author:", author.value);
    console.log("ISBN:", isbn.value);
    console.log("Cost:", cost.value);
    console.log("Copies:", copies.value);
    console.log("Pages:", pages.value);
    console.log("Publishment Year:", publishmentYear.value);
    console.log("Genre:", genre.value);
    console.log("Edition:", edition.value);
    console.log("Cover Image File:", coverImage.files[0]); // For file input
    console.log("Summary:", summary.value);
    console.log("Description:", description.value);
});