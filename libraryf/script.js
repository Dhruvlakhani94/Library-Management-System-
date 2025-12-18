// Book class representing a book in the library
        class Book {
            constructor(id, title, author, genre, price, rentPerDay, available = true) {
                this.id = id;
                this.title = title;
                this.author = author;
                this.genre = genre;
                this.price = price;
                this.rentPerDay = rentPerDay;
                this.available = available;
            }
            
            // Method to mark book as unavailable
            markAsUnavailable() {
                this.available = false;
            }
            
            // Method to mark book as available
            markAsAvailable() {
                this.available = true;
            }
            
            // Method to get book details
            getDetails() {
                return {
                    id: this.id,
                    title: this.title,
                    author: this.author,
                    genre: this.genre,
                    price: this.price,
                    rentPerDay: this.rentPerDay,
                    available: this.available
                };
            }
        }

        // Transaction class to handle book transactions
        class Transaction {
            constructor(book, type, days = 1) {
                this.id = Date.now() + Math.floor(Math.random() * 1000);
                this.book = book;
                this.type = type; // 'purchase' or 'rental'
                this.date = new Date();
                this.days = days;
                this.calculateAmount();
            }
            
            // Calculate transaction amount
            calculateAmount() {
                if (this.type === 'purchase') {
                    this.amount = this.book.price;
                } else if (this.type === 'rental') {
                    this.amount = this.book.rentPerDay * this.days;
                }
            }
            
            // Get transaction details
            getDetails() {
                return {
                    id: this.id,
                    bookTitle: this.book.title,
                    type: this.type,
                    date: this.date.toLocaleDateString(),
                    amount: this.amount.toFixed(2)
                };
            }
        }

        // Library class to manage books and transactions
        class Library {
            constructor() {
                this.books = [];
                this.transactions = [];
                this.rentedBooks = [];
                this.purchasedBooks = [];
                this.userPreferences = {
                    genres: [],
                    authors: []
                };
            }
            
            // Add book to library
            addBook(book) {
                this.books.push(book);
            }
            
            // Search books by title or author
            searchBooks(query, genre = '') {
                let results = this.books.filter(book => 
                    book.title.toLowerCase().includes(query.toLowerCase()) || 
                    book.author.toLowerCase().includes(query.toLowerCase())
                );
                
                if (genre) {
                    results = results.filter(book => book.genre === genre);
                }
                
                return results;
            }
            
            // Get all available books
            getAvailableBooks() {
                return this.books.filter(book => book.available);
            }
            
            // Purchase a book
            purchaseBook(bookId) {
                const book = this.books.find(b => b.id === bookId && b.available);
                if (book) {
                    book.markAsUnavailable();
                    const transaction = new Transaction(book, 'purchase');
                    this.transactions.push(transaction);
                    this.purchasedBooks.push(book);
                    this.updateUserPreferences(book);
                    return transaction;
                }
                return null;
            }
            
            // Rent a book
            rentBook(bookId, days) {
                const book = this.books.find(b => b.id === bookId && b.available);
                if (book) {
                    book.markAsUnavailable();
                    const transaction = new Transaction(book, 'rental', days);
                    this.transactions.push(transaction);
                    this.rentedBooks.push({
                        book: book,
                        rentalDate: new Date(),
                        dueDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
                        transaction: transaction
                    });
                    this.updateUserPreferences(book);
                    return transaction;
                }
                return null;
            }
            
            // Return a rented book
            returnBook(bookId) {
                const rentedIndex = this.rentedBooks.findIndex(rb => rb.book.id === bookId);
                if (rentedIndex !== -1) {
                    const rentedBook = this.rentedBooks[rentedIndex];
                    rentedBook.book.markAsAvailable();
                    
                    // Calculate fine if returned late
                    const today = new Date();
                    const dueDate = rentedBook.dueDate;
                    let fine = 0;
                    
                    if (today > dueDate) {
                        const daysLate = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
                        fine = daysLate * 2; // $2 per day late
                    }
                    
                    this.rentedBooks.splice(rentedIndex, 1);
                    return { success: true, fine: fine };
                }
                return { success: false, fine: 0 };
            }
            
            // Update user preferences based on their choices
            updateUserPreferences(book) {
                if (!this.userPreferences.genres.includes(book.genre)) {
                    this.userPreferences.genres.push(book.genre);
                }
                
                if (!this.userPreferences.authors.includes(book.author)) {
                    this.userPreferences.authors.push(book.author);
                }
            }
            
            // Get recommendations based on user preferences
            getRecommendations(limit = 6) {
                if (this.userPreferences.genres.length === 0 && this.userPreferences.authors.length === 0) {
                    // If no preferences, return random available books
                    const availableBooks = this.getAvailableBooks();
                    return availableBooks.sort(() => 0.5 - Math.random()).slice(0, limit);
                }
                
                // Calculate similarity score for each book
                const scoredBooks = this.getAvailableBooks().map(book => {
                    let score = 0;
                    
                    // Genre match
                    if (this.userPreferences.genres.includes(book.genre)) {
                        score += 3;
                    }
                    
                    // Author match
                    if (this.userPreferences.authors.includes(book.author)) {
                        score += 2;
                    }
                    
                    // Exclude books already purchased or rented
                    const isOwned = this.purchasedBooks.some(pb => pb.id === book.id) || 
                                   this.rentedBooks.some(rb => rb.book.id === book.id);
                    
                    return {
                        book: book,
                        score: score,
                        isOwned: isOwned
                    };
                });
                
                // Sort by score (descending) and filter out owned books
                return scoredBooks
                    .filter(item => !item.isOwned && item.score > 0)
                    .sort((a, b) => b.score - a.score)
                    .slice(0, limit)
                    .map(item => item.book);
            }
            
            // Get transaction history
            getTransactionHistory() {
                return this.transactions.map(t => t.getDetails());
            }
        }

        // UI Controller class to handle DOM interactions
        class UIController {
            constructor() {
                this.library = new Library();
                this.currentTab = 'browse';
                this.initializeEventListeners();
                this.loadBooks();
            }
            
            // Initialize event listeners
            initializeEventListeners() {
                // Tab switching
                document.querySelectorAll('.tab').forEach(tab => {
                    tab.addEventListener('click', () => {
                        this.switchTab(tab.dataset.tab);
                    });
                });
                
                // Search functionality
                document.getElementById('search-btn').addEventListener('click', () => {
                    this.performSearch();
                });
                
                document.getElementById('search-input').addEventListener('keyup', (e) => {
                    if (e.key === 'Enter') {
                        this.performSearch();
                    }
                });
                
                document.getElementById('genre-filter').addEventListener('change', () => {
                    this.performSearch();
                });
            }
            
            // Switch between tabs
            switchTab(tabName) {
                // Update active tab
                document.querySelectorAll('.tab').forEach(tab => {
                    tab.classList.remove('active');
                });
                document.querySelector(`.tab[data-tab="${tabName}"]`).classList.add('active');
                
                // Update active tab content
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(tabName).classList.add('active');
                
                this.currentTab = tabName;
                
                // Refresh content based on tab
                if (tabName === 'browse') {
                    this.displayBooks(this.library.getAvailableBooks(), 'books-container');
                    this.displayRecommendations();
                } else if (tabName === 'rented') {
                    this.displayRentedBooks();
                } else if (tabName === 'purchased') {
                    this.displayPurchasedBooks();
                } else if (tabName === 'transactions') {
                    this.displayTransactionHistory();
                }
            }
            
            // Load books from JSON
            async loadBooks() {
                try {
                    const booksData = [
                        { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Fiction", price: 12.99, rentPerDay: 1.50 },
                        { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", genre: "Fiction", price: 10.99, rentPerDay: 1.25 },
                        { id: 3, title: "1984", author: "George Orwell", genre: "Science Fiction", price: 11.50, rentPerDay: 1.75 },
                        { id: 4, title: "Pride and Prejudice", author: "Jane Austen", genre: "Romance", price: 9.99, rentPerDay: 1.00 },
                        { id: 5, title: "The Hobbit", author: "J.R.R. Tolkien", genre: "Fantasy", price: 14.99, rentPerDay: 2.00 },
                        { id: 6, title: "The Da Vinci Code", author: "Dan Brown", genre: "Mystery", price: 13.50, rentPerDay: 1.80 },
                        { id: 7, title: "The Alchemist", author: "Paulo Coelho", genre: "Fiction", price: 10.25, rentPerDay: 1.20 },
                        { id: 8, title: "Sapiens", author: "Yuval Noah Harari", genre: "History", price: 15.99, rentPerDay: 2.25 },
                        { id: 9, title: "Becoming", author: "Michelle Obama", genre: "Biography", price: 16.50, rentPerDay: 2.50 },
                        { id: 10, title: "The Power of Now", author: "Eckhart Tolle", genre: "Self-Help", price: 11.75, rentPerDay: 1.60 },
                        { id: 11, title: "Dune", author: "Frank Herbert", genre: "Science Fiction", price: 13.99, rentPerDay: 1.90 },
                        { id: 12, title: "The Silent Patient", author: "Alex Michaelides", genre: "Mystery", price: 12.25, rentPerDay: 1.70 },
                        { id: 13, title: "War and Peace", author: "Leo Tolstoy", genre: "Historical", price: 18.50, rentPerDay: 2.80 },
                        { id: 14, title: "Crime and Punishment", author: "Fyodor Dostoevsky", genre: "Fiction", price: 14.75, rentPerDay: 2.10 },
                        { id: 15, title: "The Brothers Karamazov", author: "Fyodor Dostoevsky", genre: "Fiction", price: 15.25, rentPerDay: 2.20 },
                        { id: 16, title: "The Book Thief", author: "Markus Zusak", genre: "Historical", price: 13.50, rentPerDay: 1.85 },
                        { id: 17, title: "Babel", author: "R.F. Kuang", genre: "Fantasy", price: 16.00, rentPerDay: 2.30 },
                        { id: 18, title: "A Thousand Splendid Suns", author: "Khaled Hosseini", genre: "Drama", price: 12.50, rentPerDay: 1.70 },
                        { id: 19, title: "The Secret History", author: "Donna Tartt", genre: "Mystery", price: 14.00, rentPerDay: 2.00 },
                        { id: 20, title: "Jane Eyre", author: "Charlotte Bronte", genre: "Romance", price: 10.50, rentPerDay: 1.25 }
                    ];
                    
                    // Add books to library
                    booksData.forEach(bookData => {
                        const book = new Book(
                            bookData.id,
                            bookData.title,
                            bookData.author,
                            bookData.genre,
                            bookData.price,
                            bookData.rentPerDay
                        );
                        this.library.addBook(book);
                    });
                    
                    // Display books
                    this.displayBooks(this.library.getAvailableBooks(), 'books-container');
                    this.displayRecommendations();
                    
                } catch (error) {
                    console.error('Error loading books:', error);
                    this.showNotification('Error loading books data', 'error');
                }
            }
            
            // Perform search based on user input
            performSearch() {
                const query = document.getElementById('search-input').value;
                const genre = document.getElementById('genre-filter').value;
                const results = this.library.searchBooks(query, genre);
                this.displayBooks(results, 'books-container');
            }
            
            // Display books in a container
            displayBooks(books, containerId) {
                const container = document.getElementById(containerId);
                container.innerHTML = '';
                
                if (books.length === 0) {
                    container.innerHTML = '<div class="empty-state"><i class="fas fa-book"></i><h3>No Books Found</h3><p>Try adjusting your search criteria.</p></div>';
                    return;
                }
                
                books.forEach(book => {
                    const bookCard = this.createBookCard(book);
                    container.appendChild(bookCard);
                });
            }
            
            // Create a book card element
            createBookCard(book) {
                const card = document.createElement('div');
                card.className = 'book-card';
                card.innerHTML = `
                    <div class="book-cover">
                        <i class="fas fa-book"></i>
                    </div>
                    <div class="book-details">
                        <div class="book-title">${book.title}</div>
                        <div class="book-author">by ${book.author}</div>
                        <div class="book-meta">
                            <span class="book-genre">${book.genre}</span>
                            <span class="book-price">$${book.price.toFixed(2)}</span>
                        </div>
                        <div class="book-meta">
                            <small>Rent: $${book.rentPerDay.toFixed(2)}/day</small>
                            <small>${book.available ? 'Available' : 'Not Available'}</small>
                        </div>
                        <div class="book-actions">
                            ${this.currentTab === 'browse' && book.available ? `
                                <button class="btn btn-buy" data-id="${book.id}">Buy</button>
                                <button class="btn btn-rent" data-id="${book.id}">Rent</button>
                            ` : this.currentTab === 'rented' ? `
                                <button class="btn btn-return" data-id="${book.id}">Return</button>
                            ` : ''}
                        </div>
                    </div>
                `;
                
                // Add event listeners for buttons
                if (this.currentTab === 'browse' && book.available) {
                    card.querySelector('.btn-buy').addEventListener('click', () => {
                        this.purchaseBook(book.id);
                    });
                    
                    card.querySelector('.btn-rent').addEventListener('click', () => {
                        this.rentBook(book.id);
                    });
                } else if (this.currentTab === 'rented') {
                    card.querySelector('.btn-return').addEventListener('click', () => {
                        this.returnBook(book.id);
                    });
                }
                
                return card;
            }
            
            // Display recommendations
            displayRecommendations() {
                const recommendations = this.library.getRecommendations();
                const container = document.getElementById('recommendations-container');
                
                if (recommendations.length === 0) {
                    container.innerHTML = '<div class="empty-state"><i class="fas fa-book"></i><h3>No Recommendations Yet</h3><p>Start renting or buying books to get personalized recommendations!</p></div>';
                    return;
                }
                
                this.displayBooks(recommendations, 'recommendations-container');
            }
            
            // Display rented books
            displayRentedBooks() {
                const container = document.getElementById('rented-books-container');
                const emptyState = document.getElementById('empty-rented');
                
                if (this.library.rentedBooks.length === 0) {
                    container.innerHTML = '';
                    emptyState.style.display = 'block';
                    return;
                }
                
                emptyState.style.display = 'none';
                container.innerHTML = '';
                
                this.library.rentedBooks.forEach(rentedBook => {
                    const book = rentedBook.book;
                    const card = document.createElement('div');
                    card.className = 'book-card';
                    card.innerHTML = `
                        <div class="book-cover">
                            <i class="fas fa-book"></i>
                        </div>
                        <div class="book-details">
                            <div class="book-title">${book.title}</div>
                            <div class="book-author">by ${book.author}</div>
                            <div class="book-meta">
                                <span class="book-genre">${book.genre}</span>
                                <span>Due: ${rentedBook.dueDate.toLocaleDateString()}</span>
                            </div>
                            <div class="book-actions">
                                <button class="btn btn-return" data-id="${book.id}">Return</button>
                            </div>
                        </div>
                    `;
                    
                    card.querySelector('.btn-return').addEventListener('click', () => {
                        this.returnBook(book.id);
                    });
                    
                    container.appendChild(card);
                });
            }
            
            // Display purchased books
            displayPurchasedBooks() {
                const container = document.getElementById('purchased-books-container');
                const emptyState = document.getElementById('empty-purchased');
                
                if (this.library.purchasedBooks.length === 0) {
                    container.innerHTML = '';
                    emptyState.style.display = 'block';
                    return;
                }
                
                emptyState.style.display = 'none';
                container.innerHTML = '';
                
                this.library.purchasedBooks.forEach(book => {
                    const card = document.createElement('div');
                    card.className = 'book-card';
                    card.innerHTML = `
                        <div class="book-cover">
                            <i class="fas fa-book"></i>
                        </div>
                        <div class="book-details">
                            <div class="book-title">${book.title}</div>
                            <div class="book-author">by ${book.author}</div>
                            <div class="book-meta">
                                <span class="book-genre">${book.genre}</span>
                                <span class="book-price">Purchased</span>
                            </div>
                        </div>
                    `;
                    
                    container.appendChild(card);
                });
            }
            
            // Display transaction history
            displayTransactionHistory() {
                const container = document.getElementById('transactions-container');
                const emptyState = document.getElementById('empty-transactions');
                const transactions = this.library.getTransactionHistory();
                
                if (transactions.length === 0) {
                    container.innerHTML = '';
                    emptyState.style.display = 'block';
                    document.getElementById('bill-container').style.display = 'none';
                    return;
                }
                
                emptyState.style.display = 'none';
                container.innerHTML = '';
                
                transactions.forEach(transaction => {
                    const transactionEl = document.createElement('div');
                    transactionEl.className = 'transaction-item';
                    transactionEl.innerHTML = `
                        <div>
                            <strong>${transaction.bookTitle}</strong>
                            <div>${transaction.type === 'purchase' ? 'Purchase' : 'Rental'} - ${transaction.date}</div>
                        </div>
                        <div>$${transaction.amount}</div>
                    `;
                    
                    container.appendChild(transactionEl);
                });
            }
            
            // Purchase a book
            purchaseBook(bookId) {
                const transaction = this.library.purchaseBook(bookId);
                if (transaction) {
                    this.showNotification(`Successfully purchased "${transaction.book.title}" for $${transaction.book.price.toFixed(2)}`, 'success');
                    this.displayBooks(this.library.getAvailableBooks(), 'books-container');
                    this.displayPurchasedBooks();
                    this.displayRecommendations();
                    this.generateBill([transaction]);
                } else {
                    this.showNotification('Book is not available for purchase', 'error');
                }
            }
            
            // Rent a book
            rentBook(bookId) {
                const days = parseInt(prompt('Enter number of days to rent:', '7'));
                if (isNaN(days) || days <= 0) {
                    this.showNotification('Please enter a valid number of days', 'error');
                    return;
                }
                
                const transaction = this.library.rentBook(bookId, days);
                if (transaction) {
                    this.showNotification(`Successfully rented "${transaction.book.title}" for ${days} days - Total: $${transaction.amount.toFixed(2)}`, 'success');
                    this.displayBooks(this.library.getAvailableBooks(), 'books-container');
                    this.displayRentedBooks();
                    this.displayRecommendations();
                    this.generateBill([transaction]);
                } else {
                    this.showNotification('Book is not available for rental', 'error');
                }
            }
            
            // Return a rented book
            returnBook(bookId) {
                const result = this.library.returnBook(bookId);
                if (result.success) {
                    let message = `Successfully returned the book`;
                    if (result.fine > 0) {
                        message += `. Late fine: $${result.fine.toFixed(2)}`;
                    }
                    this.showNotification(message, result.fine > 0 ? 'warning' : 'success');
                    this.displayRentedBooks();
                    this.displayBooks(this.library.getAvailableBooks(), 'books-container');
                    this.displayRecommendations();
                } else {
                    this.showNotification('Error returning book', 'error');
                }
            }
            
            // Generate bill for transactions
            generateBill(transactions) {
                const billContainer = document.getElementById('bill-container');
                const billItems = document.getElementById('bill-items');
                const billTotal = document.getElementById('bill-total-amount');
                
                billItems.innerHTML = '';
                let total = 0;
                
                transactions.forEach(transaction => {
                    const item = document.createElement('div');
                    item.className = 'bill-details';
                    item.innerHTML = `
                        <div>${transaction.book.title} (${transaction.type})</div>
                        <div>1</div>
                        <div>$${transaction.amount.toFixed(2)}</div>
                    `;
                    billItems.appendChild(item);
                    total += transaction.amount;
                });
                
                billTotal.textContent = `$${total.toFixed(2)}`;
                billContainer.style.display = 'block';
                
                // Switch to transactions tab to show the bill
                this.switchTab('transactions');
            }
            
            // Show notification
            showNotification(message, type = 'info') {
                const notification = document.getElementById('notification');
                notification.textContent = message;
                notification.className = `notification ${type}`;
                notification.classList.add('show');
                
                setTimeout(() => {
                    notification.classList.remove('show');
                }, 3000);
            }
        }

        // Initialize the application when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            const app = new UIController();
        });
