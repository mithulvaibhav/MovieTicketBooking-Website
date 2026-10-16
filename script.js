
let movies = [
    { 
        id: 'm1', 
        name: 'Inception', 
        price: 150, 
        image: 'https://upload.wikimedia.org/wikipedia/en/2/2e/Inception_%282010%29_theatrical_poster.jpg' 
    },
    { 
        id: 'm2', 
        name: 'The Lion King', 
        price: 120, 
        image: 'https://upload.wikimedia.org/wikipedia/en/3/3d/The_Lion_King_poster.jpg' 
    },
    { 
        id: 'm3', 
        name: 'Avengers Endgame', 
        price: 180, 
        image: 'https://upload.wikimedia.org/wikipedia/en/0/0d/Avengers_Endgame_poster.jpg' 
    }
     ,{
    id: 'm4',
    name: 'Interstellar',
    price: 200,
        image: 'https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg'}
];


let bookings = []; 


let movieCardsContainer = document.getElementById('movie-cards');
let movieSelect = document.getElementById('movie-select');
let form = document.getElementById('booking-form');
let ticketsInput = document.getElementById('tickets');
let totalPriceDisplay = document.getElementById('total-price');
let messageBox = document.getElementById('message-box');
let bookingsList = document.getElementById('bookings-list');
let bookingCount = document.getElementById('booking-count');
let searchInput = document.getElementById('search-input');

function init() {
    movies.forEach(movie => {
        let card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${movie.image}" alt="${movie.name} poster" class="movie-img">
            <h3>${movie.name}</h3>
            <p class="price">₹${movie.price}</p>
        `;
        movieCardsContainer.appendChild(card);

    
        let option = document.createElement('option');
        option.value = movie.id;
        option.textContent = `${movie.name} - ₹${movie.price}`;
        movieSelect.appendChild(option);
    });
}






function updateTotalPrice() {
    let selectedMovieId = movieSelect.value;
    let ticketCount = Number(ticketsInput.value);

    if (selectedMovieId && ticketCount > 0 && Number.isInteger(ticketCount)) {
    
        let movie = movies.find(m => m.id === selectedMovieId);
        totalPriceDisplay.textContent = (movie.price * ticketCount).toString();
    } else {
        totalPriceDisplay.textContent = '0';
    }
}


movieSelect.addEventListener('change', updateTotalPrice);
ticketsInput.addEventListener('input', updateTotalPrice);


form.addEventListener('submit', async function(e) {
    e.preventDefault(); 

    let email = document.getElementById('email').value;
    let selectedMovieId = movieSelect.value;
    let showtime = document.getElementById('showtime-select').value;
    let tickets = Number(ticketsInput.value);


    if (!selectedMovieId || !showtime) {
        showMessage('Please select a movie and showtime.', 'error');
        return;
    }
    
    if (tickets <= 0 || !Number.isInteger(tickets)) {
        showMessage('Ticket quantity must be a positive whole number.', 'error');
        return;
    }

    let movie = movies.find(m => m.id === selectedMovieId);
    let totalPrice = movie.price * tickets;


    let newBooking = {
        id: Date.now().toString(), 
        movieName: movie.name,
        showtime: showtime,
        tickets: tickets,
        totalPrice: totalPrice,
        email: email
    };

    bookings.push(newBooking);
    updateBookingsUI(bookings);
    
    // Attempt to send email
    showMessage('Processing booking and sending email...', 'success');
    await sendConfirmationEmail(newBooking);

    form.reset();
    updateTotalPrice();
});


function showMessage(text, type) {
    messageBox.textContent = text;
    messageBox.className = `message-box ${type}`;
    
    setTimeout(() => {
        messageBox.className = 'message-box hidden';
    }, 4000);
}

function updateBookingsUI(bookingsArray) {
    bookingCount.textContent = bookings.length;
    bookingsList.innerHTML = ''; 

    if (bookingsArray.length === 0) {
        bookingsList.innerHTML = `
            <div class="empty-state">
                
                <h3>No bookings found.</h3>
            </div>`;
        return;
    }

    
    bookingsArray.forEach(booking => {
        let item = document.createElement('div');
        item.className = 'booking-item';
        item.innerHTML = `
            <div>
                <strong>${booking.movieName}</strong><br>
                <small>${booking.showtime} | ${booking.tickets} Tickets | ₹${booking.totalPrice}</small>
            </div>
            <button class="btn-cancel" onclick="cancelBooking('${booking.id}')">Cancel</button>
        `;
        bookingsList.appendChild(item);
    });
}


function cancelBooking(bookingId) {
    bookings = bookings.filter(b => b.id !== bookingId);
    updateBookingsUI(bookings);
    
    searchInput.dispatchEvent(new Event('input')); 
}


searchInput.addEventListener('input', function(e) {
    let term = e.target.value.toLowerCase();
    let filtered = bookings.filter(b => b.movieName.toLowerCase().includes(term));
    updateBookingsUI(filtered);
});

async function sendConfirmationEmail(booking) {
    
    let PUBLIC_ACCESS_KEY = "38bb095c-4365-4e8a-b3ed-c5b3798f0492"; 

    let formData = {
        access_key: PUBLIC_ACCESS_KEY,
        subject: "Your Movie Ticket Booking Confirmation",
        email: booking.email,
        message: `Thank you for booking! \nMovie: ${booking.movieName} \nShowtime: ${booking.showtime} \nTickets: ${booking.tickets} \nTotal Paid: ₹${booking.totalPrice}`
    };

    try {
        let response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            showMessage('Tickets booked successfully! Confirmation email sent.', 'success');
        } else {
            showMessage('Tickets booked, but email failed to send. Check your public key.', 'error');
        }
    } catch (error) {
        showMessage('Tickets booked, but network error prevented email.', 'error');
    }
}

init();     