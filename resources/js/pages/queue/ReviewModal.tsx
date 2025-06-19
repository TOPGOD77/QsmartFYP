import React, { useState } from 'react';
import { router } from '@inertiajs/react';

const ReviewModal = ({
  show,
  onClose,
  bookingId,
  service,
  branch,
  date,
}: {
  show: boolean;
  onClose: () => void;
  bookingId: number;
  service: string;
  branch: string;
  date: string;
}) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted || !rating) return;
    setSubmitting(true);
    router.post(
      route('queue.review', { booking: bookingId }),
      { rating, feedback },
      {
        onFinish: () => {
          setSubmitting(false);
          onClose();
        },
      }
    );
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl p-8 max-w-md w-full shadow-lg relative"
      >
        <h2 className="text-xl font-bold mb-6 text-teal-700">Rate Our Services</h2>
        <div className="mb-4 flex gap-4">
          <div>
            <div className="text-xs text-gray-500 font-semibold mb-1">SERVICE NAME</div>
            <div className="px-4 py-2 border rounded-lg text-gray-700 bg-gray-50">{service}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 font-semibold mb-1">DATE</div>
            <div className="px-4 py-2 border rounded-lg text-gray-700 bg-gray-50">{date}</div>
          </div>
        </div>
        <div className="mb-4">
          <div className="text-xs text-gray-500 font-semibold mb-1">BRANCH</div>
          <div className="px-4 py-2 border rounded-lg text-gray-700 bg-gray-50">{branch}</div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Your service rating</label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setRating(star)}
                className={`cursor-pointer text-3xl ${
                  star <= rating ? 'text-teal-600' : 'text-gray-300'
                }`}
                role="button"
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                ★
              </span>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Additional feedback</label>
          <textarea
            className="w-full border rounded-md p-2"
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="If you have any additional feedback, please type it in here..."
          />
        </div>
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mr-2"
            required
          />
          <span className="text-xs text-gray-500">
            I have read and accept the <a href="/privacy" className="underline">Privacy Policy</a>.
          </span>
        </div>
        <button
          type="submit"
          className={`w-full bg-teal-600 text-white py-2 rounded-md font-semibold hover:bg-teal-700 transition ${
            (!accepted || !rating || submitting) && 'opacity-50 cursor-not-allowed'
          }`}
          disabled={!accepted || !rating || submitting}
        >
          {submitting ? 'Submitting...' : 'Submit feedback'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          aria-label="Close"
        >
          &times;
        </button>
      </form>
    </div>
  );
};

export default ReviewModal;
