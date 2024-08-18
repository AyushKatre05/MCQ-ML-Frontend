"use client";

import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const [text, setText] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [files, setFiles] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Check if both text and files are provided or neither
    if ((text && files) || (!text && !files)) {
      toast.error("Please provide either text input or a file, but not both.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    if (files) {
      for (const file of files) {
        formData.append("files[]", file);
      }
    } else {
      formData.append("text", text);
    }
    formData.append("num_questions", numQuestions);

    try {
      const response = await axios.post("https://mcq-ml-backend-4.onrender.com/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMcqs(response.data);
      setSelectedAnswers({});
      setScore(null);
      setCurrentPage(0); // Reset pagination
    } catch (error) {
      console.error("Error fetching MCQs:", error);
      toast.error("Failed to generate MCQs");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (questionIndex, option) => {
    if (selectedAnswers[questionIndex] === undefined) {
      setSelectedAnswers((prev) => ({
        ...prev,
        [questionIndex]: option,
      }));
    }
  };

  const handleCheckAnswers = () => {
    let newScore = 0;
    mcqs.forEach(([questionText, options, correctAnswerIndex], index) => {
      if (selectedAnswers[index] === options[correctAnswerIndex]) {
        newScore += 1;
      }
    });
    setScore(newScore);
    setShowPopup(true);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < mcqs.length) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-100 p-6">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-4 text-center text-blue-400">
          MCQ Generator
        </h1>
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
          <div>
            <label htmlFor="text" className="block text-gray-300">
              Text:
            </label>
            <textarea
              id="text"
              name="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700"
              rows="4"
              placeholder="Enter text here"
            />
          </div>
            <div>
            <label htmlFor="files" className="block text-gray-300">
              Upload Files:
            </label>
            <input
              type="file"
              id="files"
              name="files[]"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700"
            />
          </div>
          <div>
            <label htmlFor="num_questions" className="block text-gray-300">
              Number of Questions:
            </label>
            <select
              id="num_questions"
              name="num_questions"
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value, 10))}
              className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate MCQs"}
          </button>
        </form>
        {mcqs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-6"
          >
            <h2 className="text-2xl font-semibold mb-4 text-center text-blue-400">
              Generated MCQs
            </h2>
            <motion.div
              className="bg-gray-700 p-4 rounded-lg shadow-md"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-semibold mb-2">
                Question {currentPage + 1}:
              </h3>
              <p className="mb-4">{mcqs[currentPage][0]}</p>
              <div className="space-y-2">
                {mcqs[currentPage][1].map((option, optionIndex) => {
                  const optionLetter = String.fromCharCode(65 + optionIndex);
                  const isSelected = selectedAnswers[currentPage] === option;
                  return (
                    <motion.div
                      key={option}
                      className={`p-2 border rounded-lg ${
                        isSelected
                          ? optionIndex === mcqs[currentPage][2]
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                          : "bg-gray-600"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleOptionChange(currentPage, option)}
                    >
                      {optionLetter}. {option}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
                disabled={currentPage === 0}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
                disabled={currentPage === mcqs.length - 1}
              >
                Next
              </button>
            </div>
            {currentPage === mcqs.length - 1 && (
              <button
                onClick={handleCheckAnswers}
                className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Check Score
              </button>
            )}
          </motion.div>
        )}
      </div>

      <ToastContainer />
      {showPopup && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75"
        >
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">Score</h2>
            <p className="text-lg text-white">
              Your score: {score} / {mcqs.length}
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
