const Loading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="inline-block w-16 h-16 border-4 border-orange-200 dark:border-orange-900/30 border-t-orange-600 dark:border-t-orange-400 rounded-full animate-spin mb-4" />
        <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;