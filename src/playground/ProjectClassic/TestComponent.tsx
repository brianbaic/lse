export default function TestComponent() {
  return (
    <div className="p-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white text-center">
      <h1 className="text-4xl font-bold mb-4">This component has no schema file!</h1>
      <p className="text-lg mb-6">All text is automatically discovered and editable.</p>
      <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">
        Try editing me
      </button>
    </div>);

}