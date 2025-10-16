import Image from "next/image";

export default async function Home() {

  const res = await fetch('http://localhost:3200/api/products');

  if(!res.ok) {
    console.error("Failed to fetch products");
    return;
  }

  const products = await res.json();
  console.log("Products fetched:", products);


    return (
        <div className="min-h-screen w-full bg-gray/10 py-10 px-6">
            <h2 className="text-3xl font-semibold text-center mb-10">
                Product List
            </h2>

            {products.length === 0 ? (
                <p className="text-center text-gray-500">No products found.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {products.map((product, index) => (
                        <div
                            key={index}
                            className="bg-white/10 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                        >
                            {/* Product Image */}
                            <img
                                src={`https://d21d75qyy0swbi.cloudfront.net/${product.filename}`}
                                alt={product.name}
                                className="w-full h-56 object-cover"
                            />

                            {/* Product Details */}
                            <div className="p-5">
                                <h3 className="text-xl font-semibold mb-2">
                                    {product.name}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                    {product.description}
                                </p>
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-indigo-600">
                                        ${product.price}
                                    </span>
                                    <button className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 transition-colors">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
