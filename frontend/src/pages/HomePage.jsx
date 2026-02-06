const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-base-100 text-center px-4">
      {/* INTRO TEXT */}
      <h1 className="text-2xl md:text-3xl font-semibold text-primary mb-2">
        Welcome to CVD Care
      </h1>
      <p className="text-sm md:text-base text-gray-600 max-w-lg mb-6">
        Here you can predict your cardiovascular health, track your past results 
        and gain insights to improve your lifestyle.
      </p>

      {/* LOGO */}
      <img
        src="/cvd.png"
        alt="CVD Care"
        className="max-w-xs md:max-w-md lg:max-w-lg"
      />
    </div>
  );
}

export default HomePage;