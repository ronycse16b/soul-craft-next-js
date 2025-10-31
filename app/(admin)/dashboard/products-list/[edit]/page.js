

export default function ProductEdit() {
  return (
    <div>
        <h1 className="text-xl font-bold text-primary mb-4">Edit Product</h1>
        <p className="mb-6">This is the product edit page.</p>
        <div className="bg-white p-6 rounded shadow">
            <form>
            {/* Form fields for editing product would go here */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Product Name</label>
                <input type="text" className="w-full border rounded p-2" />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Price</label>
                <input type="number" className="w-full border rounded p-2" />
            </div>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                Save Changes
            </button>
            </form>
        </div>
    </div>
  )
}
