from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np

app = Flask(__name__)
CORS(app)

# -----------------------------
# Load Dataset and Model Files
# -----------------------------
books = pd.read_csv("Books_clean.csv")

model = pickle.load(open("model_knn.pkl", "rb"))
encoder = pickle.load(open("book_encoder.pkl", "rb"))
sparse_matrix = pickle.load(open("sparse_matrix.pkl", "rb"))


# -----------------------------
# Home Route
# -----------------------------
@app.route("/")
def home():
    return "📚 Book Recommendation API is running"


# -----------------------------
# Recommendation Logic Function
# -----------------------------
def get_recommendations(book_name):

    try:
        isbn = books[books["book_title"] == book_name]["isbn"].values[0]
        book_idx = encoder.transform([isbn])[0]

        distances, indices = model.kneighbors(
            sparse_matrix.T[book_idx],
            n_neighbors=6
        )

        similar_indices = indices.flatten()[1:]
        similar_isbns = encoder.inverse_transform(similar_indices)

        recommended_books = books[
            books["isbn"].isin(similar_isbns)
        ][["book_title", "image_url_m"]].to_dict(orient="records")

        return recommended_books

    except Exception as e:
        print("Error:", e)
        return []


# -----------------------------
# Recommendation API
# -----------------------------
@app.route("/recommend", methods=["POST"])
def recommend_books():

    data = request.get_json()
    book_name = data.get("book")

    print("Selected Book:", book_name)

    recommendations = get_recommendations(book_name)

    print("Recommendations:", recommendations)

    return jsonify({
        "recommendations": recommendations
    })


# -----------------------------
# Get All Book Titles
# -----------------------------
@app.route("/books", methods=["GET"])
def get_books():

    titles = books["book_title"].unique().tolist()

    # sending only first 1000 for faster loading
    return jsonify(titles[:1000])


# -----------------------------
# Run App
# -----------------------------
if __name__ == "__main__":
    app.run(debug=True)