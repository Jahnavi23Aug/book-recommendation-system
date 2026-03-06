import React, { useState, useEffect } from "react";
import "./App.css";

function App() {

  const [book, setBook] = useState("");
  const [allBooks, setAllBooks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load books when app starts
  useEffect(() => {

    fetch("https://book-recommendation-system-k1q6.onrender.com/books")
      .then((res) => res.json())
      .then((data) => setAllBooks(data))
      .catch((err) => console.log(err));

    // Example trending books
    setRecommendations([
      {
        book_title: "Harry Potter and the Sorcerer's Stone",
        image_url_m: "https://images-na.ssl-images-amazon.com/images/I/51UoqRAxwEL.jpg"
      },
      {
        book_title: "The Hobbit",
        image_url_m: "https://images-na.ssl-images-amazon.com/images/I/41aQPTCmeVL.jpg"
      },
      {
        book_title: "To Kill a Mockingbird",
        image_url_m: "https://images-na.ssl-images-amazon.com/images/I/51IXWZzlgSL.jpg"
      },
      {
        book_title: "Pride and Prejudice",
        image_url_m: "https://covers.openlibrary.org/b/id/8226191-L.jpg"
      },
      {
        book_title: "The Great Gatsby",
        image_url_m: "https://images-na.ssl-images-amazon.com/images/I/51vv75oglyL.jpg"
      }
    ]);

  }, []);

  // Get recommendations
  const getRecommendations = async () => {

    if (book === "") {
      setError("Please enter a book name");
      return;
    }

    setLoading(true);
    setError("");

    try {

      const response = await fetch(
        "https://book-recommendation-system-k1q6.onrender.com/recommend",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ book: book })
        }
      );

      if (!response.ok) {
        throw new Error("API error");
      }

      const data = await response.json();

      if (!data.recommendations || data.recommendations.length === 0) {
        setError("Book not found in dataset");
        setRecommendations([]);
      } else {
        setRecommendations(data.recommendations);
      }

    } catch (error) {
      console.log(error);
      setError("Server error. Backend may be sleeping, please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="container">

      <h1>📚 Book Recommendation System</h1>

      <div className="search">

        <input
          placeholder="Search Book..."
          value={book}
          onChange={(e) => {

            const value = e.target.value;
            setBook(value);

            const suggestions = allBooks.filter((title) =>
              title.toLowerCase().includes(value.toLowerCase())
            );

            setFilteredBooks(suggestions.slice(0, 5));
          }}
        />

        {/* Suggestions */}
        <div className="suggestions">
          {filteredBooks.map((title, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => {
                setBook(title);
                setFilteredBooks([]);
              }}
            >
              {title}
            </div>
          ))}
        </div>

        <button onClick={getRecommendations}>
          Recommend
        </button>

      </div>

      {/* Loading */}
      {loading && <div className="loader"></div>}

      {/* Error */}
      {error && <p className="error">{error}</p>}

      <div className="book-grid">
        {recommendations.map((item, index) => (
          <div key={index} className="card">
            <img src={item.image_url_m} alt="book" />
            <p>{item.book_title}</p>
          </div>
        ))}
      </div>

    </div>
  );
}

export default App;
