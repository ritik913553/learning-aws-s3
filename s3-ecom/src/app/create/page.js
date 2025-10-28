"use client"
import React, { useState } from "react";

const CreateProductPage = () => {
    const [imageFile, setImageFile] = useState(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [fileName, setFileName] = useState("");
    const [privateProduct, setPrivateProduct] = useState(false);

    // Function to handle image change
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            console.log("Selected file:", file);

            const mime = file.type.split('/')[1];
            console.log("MIME type:", mime);

            //send the request to the server to get presigned url

            const response = await fetch('http://localhost:3200/api/get-presigned-url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mime }),
                credentials: 'include',
            });

            if(!response.ok) {
                console.error("Failed to get presigned URL");
                if(response.status === 401) {
                    window.alert("You are not logged in");
                }
                return;
            }
            const data = await response.json();
            console.log("Presigned URL response:", data);

            setFileName(data.finalName);


            //upload the file to s3 using the presigned url
            const uploadResponse = await fetch(data.url, {
                method: 'PUT',
                headers: {
                    'Content-Type': file.type || 'application/octet-stream',
                },
                body: file,
            });

            if (uploadResponse.ok) {
                console.log("File uploaded successfully to S3");
            } else {
                console.error("Failed to upload file to S3");
            }
           
        }
    };



    const handleSubmit = async (e) => {
        e.preventDefault();


        const res = await fetch('http://localhost:3200/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                name,
                description,
                price,
                filename: fileName,
                privateProduct
            }),
        });

        if (!res.ok) {
            console.error("Failed to create product");
            if(res.status === 401) {
                window.alert("You are not logged in,Please loggdin before creating a product");
            }
            return;
        }

        console.log("Sucess");

        // Reset form fields
        setName("");
        setDescription("");
        setPrice("");
        setImageFile(null);
        setFileName("");
        setPrivateProduct(false);

    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center">
            <form
                onSubmit={handleSubmit}
                className="w-[30%] mx-auto p-6 bg-white/10 rounded-2xl shadow-md"
            >
                <h2 className="text-2xl font-semibold mb-4">Create Product</h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                        Product Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        name="name"
                        placeholder="e.g. Wooden Coffee Table"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                        Description
                    </label>
                    <textarea
                        rows="4"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        name="description"
                        placeholder="Write a short description..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    ></textarea>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                        Image
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full text-sm text-gray-700"
                    />
                    {imageFile && (
                        <p className="text-sm mt-2 text-gray-600">
                            Selected: {imageFile.name}
                        </p>
                    )}
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium mb-1">
                        Price (USD)
                    </label>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        name="price"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-36 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-1">
                        Private Product
                    </label>
                    <div className="flex items-center gap-3">
                        <label className="flex items-center">
                            <input type="radio" name="privateProduct" value={false} onChange={(e) => setPrivateProduct(e.target.value === 'true')} className="mr-2" defaultChecked/>
                            False
                        </label>
                        <label className="flex items-center">
                            <input type="radio" name="privateProduct" value={true} onChange={(e) => setPrivateProduct(e.target.value === 'true')} className="mr-2"/>
                            True
                        </label>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white px-4 py-2 rounded-2xl font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        Create Product
                    </button>

                    <button
                        type="reset"
                        className="border px-4 py-2 rounded-2xl text-sm font-medium hover:bg-gray-50"
                        onClick={() => setImageFile(null)}
                    >
                        Reset
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateProductPage;
