export const History = () => {
  return (
    <div className="pb-6">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
          <p className="text-sm text-gray-500 mt-1">
            Full transaction history
          </p>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="flex flex-col items-center justify-center px-4 mt-20">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Coming Soon
        </h2>
        <p className="text-center text-gray-600">
          Full payment history with charts and analytics will be available here.
        </p>
      </div>
    </div>
  );
};
