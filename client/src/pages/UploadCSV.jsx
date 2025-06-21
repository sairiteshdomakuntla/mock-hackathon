import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const UploadCSV = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [errors, setErrors] = useState([]);
  const { user } = useAuth();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage({ text: '', type: '' });
    setErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage({ text: 'Please select a file first', type: 'error' });
      return;
    }

    if (!file.name.endsWith('.csv')) {
      setMessage({ text: 'Only CSV files are allowed', type: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    
    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/admin/upload-csv', 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${user.token}`
          }
        }
      );
      
      setMessage({ 
        text: `Success! ${response.data.count} students imported (${response.data.processed} records processed).`, 
        type: 'success' 
      });
      
      // If there are errors, display them
      if (response.data.errors && response.data.errors.length > 0) {
        setErrors(response.data.errors);
      }
      
      setFile(null);
      // Reset file input
      document.getElementById('file-upload').value = '';
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.message || 'Error uploading file', 
        type: 'error' 
      });
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Upload Student Data</h1>
        <a 
          href="/" 
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          Back to Dashboard
        </a>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <p className="text-sm text-gray-500 mb-4">
            Upload a CSV file containing student data. The file should include columns for student name, age, class, and teacherEmail.
          </p>
          
          {message.text && (
            <div className={`mb-4 p-4 rounded ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message.text}
            </div>
          )}
          
          {/* Display detailed errors */}
          {errors.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-100 rounded">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">Issues found during import:</h3>
              <ul className="list-disc pl-5 text-xs text-yellow-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="file-upload" 
                className="block text-sm font-medium text-gray-700"
              >
                CSV File
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept=".csv"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">CSV up to 10MB</p>
                  {file && (
                    <p className="text-sm text-blue-600 font-medium">
                      Selected: {file.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !file}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                  loading || !file ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {loading ? 'Uploading...' : 'Upload File'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">CSV Format Instructions</h2>
          <p className="text-sm text-gray-500 mb-4">
            Your CSV file should follow this format:
          </p>
          <div className="bg-gray-50 p-4 rounded overflow-auto">
            <pre className="text-xs">
              name,age,class,teacherEmail,empathy,regulation,cooperation
              John Doe,8,3A,teacher@example.com,4,3,5
              Jane Smith,7,2B,teacher@example.com,5,4,3
            </pre>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-700">
              <strong>Fields explanation:</strong>
            </p>
            <ul className="text-xs text-gray-600 list-disc pl-5 mt-2">
              <li><strong>name:</strong> Student's full name (required)</li>
              <li><strong>age:</strong> Student's age (optional)</li>
              <li><strong>class:</strong> Class/grade identifier (optional)</li>
              <li><strong>teacherEmail:</strong> Email of assigned teacher (required)</li>
              <li><strong>empathy:</strong> SEL empathy score 1-5 (optional)</li>
              <li><strong>regulation:</strong> SEL self-regulation score 1-5 (optional)</li>
              <li><strong>cooperation:</strong> SEL cooperation score 1-5 (optional)</li>
            </ul>
          </div>
          <div className="mt-4 text-sm text-gray-700">
            <strong>Important:</strong> The teacherEmail must match the email of a registered teacher in the system.
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadCSV;