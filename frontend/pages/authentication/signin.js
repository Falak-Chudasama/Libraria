const signInForm = document.getElementById('signin-form');
const username = document.getElementById('username');
const password = document.getElementById('password');
const signInBtn = document.getElementById('signin');

const urlOrigin = window.location.origin;

const formSubmission = async (event) => {
    event.preventDefault();
    console.log('form was submitted');
    console.log('username: ' + username.value);
    console.log('password: ' + password.value);
    const response = await loginHandling(username.value, password.value);
    console.log(response);
    if (response && response.startsWith('Successfully')) {
        window.location.href = `${urlOrigin}/home`;
    }
};

const inputCheck = (username, password) => {
    if (!username || username.trim() === '') {
        throw new Error('username was not passed');
    }
    if (!password || password.trim() === '') {
        throw new Error('password was not passed');
    }
    
    if (username.length > 20) {
        throw new Error('username should be less than or equal to 20 characters long');
    } else if (username.length < 8) {
        throw new Error('username should be greater than or equal to 8 characters long');
    } 
    
    if (password.length > 100) {
        throw new Error('password should be less than or equal to 100 characters long');
    } else if (password.length < 8) {
        throw new Error('password should be greater than or equal to 8 characters long');
    }

    return true;
};

const loginHandling = async (username, password) => {
    try {
        inputCheck(username, password);
        const response = await fetch(`${urlOrigin}/auth/login`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();

        if (!data?.user) {
            throw new Error(data?.error || "Login Failed");
        }

        sessionStorage.setItem('user', JSON.stringify(data.user));
        sessionStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        return data.message;
    } catch (err) {
        console.log(err);
    }
};

signInForm.addEventListener('submit', formSubmission);