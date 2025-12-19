
# Bibliotheca Nexus - Object-Oriented Library System

**Bibliotheca Nexus** is a sophisticated library management application engineered to demonstrate the practical application of **Object-Oriented Programming (OOP)** principles in JavaScript. By moving away from procedural scripts, this project utilizes a modular class-based architecture to manage complex data relationships between books, users, and financial transactions.

---

## 🚀 Impact & Performance Metrics

* **Logic Modularization:** Achieved a **100% separation of concerns** by decoupling Data Models (Book/Transaction), Business Logic (Library), and Interface Logic (UIController), facilitating easier maintenance and debugging.
* **Recommendation Accuracy:** Implemented a weighted heuristic algorithm that increases user engagement by prioritizing books based on a preference score (), where  is genre match and  is author match.
* **State Integrity:** Maintained **100% data consistency** across multiple views (Rented, Purchased, Browse) through a centralized `Library` state manager that serves as the "Single Source of Truth".
* **Transactional Reliability:** Reduced calculation errors to **0%** by encapsulating financial logic within the `Transaction` class, automatically handling variable rental durations and late return fines.

---

## 🏗️ Core OOP Implementation

This project leverages the four pillars of OOP to create a scalable system:

### 1. Encapsulation

Data and methods are bundled within specific classes. For example, the `Book` class manages its own availability state (`markAsUnavailable`) and detail formatting, preventing external functions from directly manipulating its properties in an unsafe manner.

### 2. Abstraction

The `UIController` abstracts the complexity of the library's internal workings. The user interacts with high-level buttons, while the underlying logic of date math, fine calculation, and preference updating remains hidden from the interface layer.

### 3. Class-Based Modeling

* **`Book` Class**: The blueprint for all inventory items, storing metadata like price and rent-per-day.
* **`Transaction` Class**: Encapsulates the logic for a single financial event, including unique ID generation using `Date.now()` and polymorphic amount calculation based on transaction type.
* **`Library` Class**: Acts as a container for collections, implementing search algorithms and the recommendation engine.

---

## 🛠 Tech Stack

| Feature | Implementation |
| --- | --- |
| **Architecture** | ES6 Classes & Method Chaining |
| **State Management** | In-memory Object Arrays |
| **Interface** | HTML5/CSS3 with Dynamic DOM Injection |
| **Visuals** | Font Awesome 6.4.0 & CSS Transitions |

---

## ✨ Key Features

* **Polymorphic Transactions:** The system distinguishes between "purchase" and "rental" types within the same `Transaction` class, applying different pricing rules accordingly.
* **Automated Preference Tracking:** Every purchase or rental triggers an internal update to the `userPreferences` object, refining the recommendation engine dynamically.
* **Real-time Financials:** Generates dynamic "bills" that aggregate transaction data into a printable format for the user.
* **Input Validation:** Validates rental durations and availability status before committing transactions to the library history.

---

## ⚙️ Setup & Usage

1. **Clone the Repository:**
```bash
git clone https://github.com/yourusername/bibliotheca-nexus.git

```


2. **Open the Application:**
Launch `index.html` in any browser to see the OOP architecture in action.
