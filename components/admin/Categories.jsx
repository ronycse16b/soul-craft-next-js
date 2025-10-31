"use client";

import { Edit, ImagePlus, Pencil, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [view, setView] = useState("categories");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [preview, setPreview] = useState(null)

  const [editMode, setEditMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [error, setError] = useState(null);

  // Fallback modal state
  const [fallbackModalOpen, setFallbackModalOpen] = useState(false);
  const [fallbackTargetId, setFallbackTargetId] = useState("");
  const [fallbackId, setFallbackId] = useState("");

  useEffect(() => {
    fetchCategoriesWithSubs();
  }, []);

  const handleRemoveImage = async (urlToRemove) => {
    try {
      setIsDeleting(true);
      const filename = urlToRemove.split("/uploads/")[1]; // Extract filename only

      // Call API to delete from server
    const res =  await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/delete-upload-image`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename }),
        }
      );

      const data = await res.json();
      if(data?.success){
        setPreview(null);
        localStorage.removeItem("uploadedCategoriesImage");
      }
      
      
    } catch (error) {
      console.log(error?.message);
    } finally {
      setIsDeleting(false);
    }
  };


  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("images", file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });
      localStorage.removeItem("uploadedCategoriesImage");
      const data = await res.json();
      if (data.success) {
        const imageUrl = data.imageUrls[0];
        localStorage.setItem("uploadedCategoriesImage", imageUrl);
        console.log("Image uploaded:", imageUrl);
        setPreview(imageUrl);
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  };
  
  useEffect(() => {
    const previewUrl = localStorage.getItem("uploadedCategoriesImage");
    if (previewUrl) {
      setPreview(previewUrl);
    }
  }, []);


  const fetchCategoriesWithSubs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/categories`);
      const data = await res.json();
      if (data.success) setCategories(data.result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setName("");
    setSelectedCategoryId("");
    setEditMode(false);
    setEditTarget(null);
    setModalOpen(false);
    setPreview(null);
    setError(null);
    setFallbackModalOpen(false);
  };

  const handleSubmit = async () => {

    

    if (!name.trim()) return alert("Name is required");
    if (view === "subcategories" && !selectedCategoryId)
      return alert("Select a parent category");

    const url = editMode
      ? view === "categories"
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/categories/${editTarget._id}`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/api/sub-categories/${editTarget._id}`
      : view === "categories"
      ? "/api/categories"
      : "/api/sub-categories";

    const method = editMode ? "PUT" : "POST";
    const body = JSON.stringify(
      view === "categories"
        ? { name ,image:preview}
        : { name, selectedCategoryId ,image:preview}
    );

    try {
      setLoading(true);
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });
      const data = await res.json();

      if (data.success) {
        resetModal();
        fetchCategoriesWithSubs();
        toast.success(data.message);
        localStorage.removeItem("uploadedCategoriesImage");
      } else {
        setError(data.message || "Operation failed.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id, isActive, type) => {
    const url =
      type === "category"
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/categories/toggle`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/api/sub-categories/toggle`;
    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive }),
      });
      const data = await res.json();
      if (data.success) fetchCategoriesWithSubs();
      
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleDeleteSub = (subId) => {
    setFallbackTargetId(subId);
    setFallbackId("");
    setFallbackModalOpen(true);
  };

  const confirmDeleteSubWithFallback = async () => {
   
    if (!confirm("Confirm delete?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/categories/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subId: fallbackTargetId,
          fallbackId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchCategoriesWithSubs();
        setFallbackModalOpen(false);
        setIsDeleting(false);
        toast.success("Subcategory deleted successfully");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
      setIsDeleting(false);
      toast.error("Failed to delete subcategory");
    }
  };

  const openEdit = (item, type) => {
    setEditMode(true);
    setEditTarget(item);
    setName(item.name);
    setPreview(item?.image);
    setView(type === "subcategory" ? "subcategories" : "categories");

    if (type === "subcategory") {
      // Find parent category of this subcategory
      const parent = categories.find((cat) =>
        cat.subCategories?.some((sub) => sub._id === item._id)
      );
      setSelectedCategoryId(parent?._id || "");
    }

    setModalOpen(true);
    setError(null);
  };

  const filteredSubcategories = () =>
    categories.flatMap((cat) =>
      (cat.subCategories || []).map((sub) => ({
        ...sub,
        parentName: cat.name,
      }))
    );

  return (
    <div className="p-4 sm:p-6 ">
      {/* Toggle Buttons */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-6 ">
        <div className="border border-gray-300">
          <button
            onClick={() => setView("categories")}
            className={`px-4 py-2 rounded transition ${
              view === "categories"
                ? "bg-primary text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setView("subcategories")}
            className={`px-4 py-2 rounded transition ${
              view === "subcategories"
                ? "bg-primary text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Subcategories
          </button>
        </div>

        <button
          onClick={() => {
            resetModal();
            setView(view);
            setModalOpen(true);
          }}
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition"
        >
          + Add {view === "categories" ? "Category" : "Subcategory"}
        </button>
      </div>

      <div className="overflow-x-auto bg-white relative ">
        {/* Table */}
        {/* Table */}
        {loading ? (
          <div className="animate-pulse">
            <div className="overflow-x-auto w-full  shadow-sm">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-200 text-xs uppercase tracking-wider text-gray-600">
                  <tr>
                    <th className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                      SN
                    </th>
                    <th className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                      Active
                    </th>

                    <th className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                      Name
                    </th>
                    <th className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                      ID
                    </th>
                    {view === "subcategories" && (
                      <th className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                        Parent Category
                      </th>
                    )}

                    <th className="px-4 py-2 border border-gray-300 whitespace-nowrap text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="border border-gray-200">
                      {[...Array(5)].map((_, j) => (
                        <td
                          key={j}
                          className="px-4 py-2 border border-gray-300 whitespace-nowrap"
                        >
                          <div className="h-2 bg-gray-200 rounded w-full"></div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <table className="w-full min-w-[600px] text-sm text-left">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                  SN
                </th>
                <th className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                  Active
                </th>

                <th className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                  Name
                </th>
                <th className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                  ID
                </th>
                {view === "subcategories" && (
                  <th className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                    Parent Category
                  </th>
                )}

                <th className="px-4 py-2 border border-gray-300 whitespace-nowrap text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {(view === "categories"
                ? categories
                : filteredSubcategories()
              ).map((item, index) => (
                <tr
                  key={item._id}
                  className="border-gray-300 border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                    {index + 1}
                  </td>

                  <td className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={item?.isActive}
                      onChange={(e) =>
                        handleToggleActive(
                          item?._id,
                          e.target.checked,
                          view === "categories" ? "category" : "sub"
                        )
                      }
                    />
                  </td>
                  <td className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                    {item?.name}
                    {view === "subcategories" && (
                      <span className="text-gray-500 text-xs ml-2 font-bold">
                        ({item?.productCount || 0} products)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                    {item?._id}
                  </td>
                  {view === "subcategories" && (
                    <td className="px-4 py-2 border border-gray-300 whitespace-nowrap">
                      {item?.parentName}
                    </td>
                  )}
                  <td className="px-4 py-2 border border-gray-300 whitespace-nowrap text-right space-x-2">
                    <button
                      onClick={() =>
                        openEdit(
                          item,
                          view === "categories" ? "category" : "subcategory"
                        )
                      }
                      className="text-blue-600 hover:underline"
                    >
                      <Edit className="inline w-6 h-6" />
                    </button>
                    {view === "subcategories" && (
                      <button
                        onClick={() => handleDeleteSub(item?._id)}
                        className="text-red-600 hover:underline"
                      >
                        <Trash className="inline w-6 h-6" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {/* {modalOpen && (
        
      )} */}
      <div>
        <div
          className={`fixed z-[100] flex items-center justify-center  ${
            modalOpen ? "opacity-100 visible" : "invisible opacity-0"
          } inset-0 bg-primary/20 backdrop-blur-sm duration-100`}
        >
          <div
            className={`absolute w-[400px] rounded bg-white p-6 text-center drop-shadow-2xl dark:bg-gray-800 dark:text-white ${
              modalOpen
                ? "opacity-100 translate-y-0 duration-300"
                : "translate-y-20 opacity-0 duration-150"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4 ">
              {editMode ? `Edit ${view}` : `Add new ${view}`}
            </h2>

            {view === "categories" && (
              <div className="mb-4 relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border-gray-300 border rounded px-3 py-2"
                  placeholder="Enter name"
                />
                {preview ? (
                  <>
                    {preview && (
                      <section className="relative">
                        <div className="relative w-fit mt-2">
                          <img
                            src={preview}
                            alt="Preview"
                            className="w-16 h-16 object-cover rounded border shadow-md"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(preview)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-all"
                            title="Remove"
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <div className="h-4 w-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {editMode && (
                          <span className="absolute bottom-0 right-0 text-xs animate-pulse mt-2 text-red-600">
                            If you want to change picture, delete first
                          </span>
                        )}
                      </section>
                    )}
                  </>
                ) : (
                  <fieldset className="border border-gray-300 rounded-lg p-4 mt-3 hover:shadow-md transition-all duration-200 bg-white">
                    <label
                      htmlFor="imageUpload"
                      className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-2 cursor-pointer hover:border-[#f69224] transition-all"
                    >
                      <ImagePlus size={28} className="text-[#f69224] mb-1" />
                      <span className="text-sm text-gray-700 font-medium">
                        Click to upload image
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        (Max size: 1MB)
                      </span>
                    </label>

                    <input
                      id="imageUpload"
                      accept="image/*"
                      required
                      type="file"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </fieldset>
                )}
              </div>
            )}
            {error && (
              <p className="text-red-500 text-sm mt-1 animate-bounce absolute left-0">
                {error}
              </p>
            )}
            {view === "subcategories" && (
              <div className="mb-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border-gray-300 border rounded px-3 mb-4 py-2"
                  placeholder="Enter name"
                />
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full border-gray-300 border rounded px-3 py-2"
                >
                  <option value="">-- Select parent category --</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={resetModal}
                className="px-4 py-2 border-gray-300 border rounded hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-gray-800 transition"
              >
                {loading ? "Saving..." : editMode ? "Update" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fallback Modal */}
      <div
        className={`fixed z-[100] flex items-center justify-center ${
          fallbackModalOpen ? "opacity-100 visible" : "invisible opacity-0"
        } inset-0 bg-primary/20 backdrop-blur-sm duration-100`}
      >
        <div
          className={`absolute w-[400px] rounded-lg bg-white p-6 text-center drop-shadow-2xl dark:bg-gray-800 dark:text-white ${
            fallbackModalOpen
              ? "opacity-100 translate-y-0 duration-300"
              : "translate-y-20 opacity-0 duration-150"
          }`}
        >
          {filteredSubcategories()
            .filter((sub) => sub._id === fallbackTargetId)
            .map((sub) => (
              <div key={sub._id}>
                {sub?.productCount > 0 ? (
                  <>
                    <h2 className="text-lg font-semibold mb-4">
                      Move products from{" "}
                      <span className="text-red-600">{sub.name}</span> to:
                    </h2>
                    <h2 className="text-lg font-semibold mb-4">
                      Select Another Subcategory
                    </h2>
                    <select
                      value={fallbackId}
                      onChange={(e) => setFallbackId(e.target.value)}
                      className="w-full border-gray-300 border rounded px-3 py-2"
                    >
                      <option value="">-- Select fallback --</option>
                      {filteredSubcategories()
                        .filter((s) => s._id !== fallbackTargetId)
                        .map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name} ({s.parentName})
                          </option>
                        ))}
                    </select>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold mb-4">
                      Are you want to Sure Delete? <br />
                      <span className="text-red-600">{sub.name}</span>
                    </h2>
                  </>
                )}
              </div>
            ))}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setFallbackModalOpen(false)}
              className="px-4 py-2 border-gray-300 border  rounded hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteSubWithFallback}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              {filteredSubcategories()?.map((sub) => {
                if (sub?._id === fallbackTargetId && sub?.productCount > 0) {
                  return (
                    <>
                      {isDeleting ? "Deleting..." : "Delete with Move Products"}

                      <Trash className="inline w-4 h-4 ml-1" />
                    </>
                  );
                } else if (sub?._id === fallbackTargetId) {
                  return (
                    <>
                      {isDeleting ? "Deleting..." : "Delete"}
                      <Trash className="inline w-4 h-4 ml-1" />
                    </>
                  );
                }
                return null;
              })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
