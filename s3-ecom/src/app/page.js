"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        console.log("Checking login status from localStorage");
        if (typeof window !== "undefined") {
            const status = localStorage.getItem("loggedIn") === "true";
            setLoggedIn(status);
        }
    }, []);

    const handleLogout = async () => {
        try {
            const res = await fetch("http://localhost:3200/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });

            const data = await res.json();

            if (!res.ok)
                throw new Error(data.message || "Something went wrong");

            setLoggedIn(false);
            localStorage.setItem("loggedIn", "false");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch("http://localhost:3200/api/products", {
                    method: "GET",
                    credentials: "include",
                });
                const data = await res.json();
                setProducts(data || []);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        fetchProducts();
    }, [loggedIn]); // ✅ Empty dependency array ensures it runs only once

    return (
        <div className="min-h-screen w-full bg-gray/10 py-10 px-6">
            <div className="w-full flex justify-end">
                {loggedIn ? (
                    <div className="flex gap-4">
                        <button
                            className="text-white bg-red-600 px-4 py-1 rounded-md font-bold text-sm"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                        <Link
                            href={"/create"}
                            className="text-white bg-blue-600 px-4 py-1 rounded-md font-bold text-sm"
                        >
                            Add products
                        </Link>
                    </div>
                ) : (
                    <Link
                        className="text-white bg-blue-600 px-4 py-1 rounded-md font-bold text-sm"
                        href="/auth"
                    >
                        Login / Sign Up
                    </Link>
                )}
            </div>

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
                            {product.imageUrl ? (
                                <img
                                    src={`${product.imageUrl}`}
                                    alt={product.name}
                                    className="w-full h-56 object-cover"
                                />
                            ) : (
                                <img
                                    src={`https://imgs.search.brave.com/fjZKoA2xz9J1oTC0a70stjc8lyIEFjlE32tH-oWhndY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/dmVjdG9yc3RvY2su/Y29tL2kvNTAwcC81/MS83Mi9uby1waG90/by1hdmFpbGFibGUt/aWNvbi1kZWZhdWx0/LWltYWdlLXN5bWJv/bC12ZWN0b3ItNDA4/ODUxNzIuanBn`}
                                    alt={product.name}
                                    className="w-full h-56 object-cover"
                                />
                            )}
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
