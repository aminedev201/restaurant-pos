const Loading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="inline-block w-16 h-16 border-4 border-primary-200 dark:border-primary-900/30 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin mb-4" />
        <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;