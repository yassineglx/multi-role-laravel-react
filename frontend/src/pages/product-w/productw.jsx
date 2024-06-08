import React, { useEffect, useState, useCallback } from "react";
import Case from "../../components/Case";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";
import { debounce } from "lodash";
import { useNavigate } from "react-router-dom";
import appConfig from "../../config/appConfig";
import InputValidation from "../Layout/Components/InputValidation";
import Pagination from "../Layout/Components/Pagination";
import AddButton from "../Layout/Components/AddButton";
import SearchEntries from "../Layout/Components/SearchEntries";
import ModalFooter from "../Layout/Components/ModalFooter";
import ModalHeader from "../Layout/Components/ModalHeader";

export default function Product() {
    const navigate = useNavigate();
    const MySwal = withReactContent(Swal);

    const [rows, setRows] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRows, setTotalRows] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchTermDebounced, setSearchTermDebounced] = useState("");
    const [showing, setShowing] = useState(10);
    const [refetch, setRefetch] = useState(Math.random());
    const [modalData, setModalData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ 
        name: "", 
        description: "", 
        price: "", 
        category_id: "", 
        quantity: "", 
        image1: null 
    });
    const [formErrors, setFormErrors] = useState({ 
        name: "", 
        description: "", 
        price: "", 
        category_id: "", 
        quantity: "", 
        image1: "" 
    });

    useEffect(() => {
        document.title = "Products";

        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${appConfig.baseurlAPI}/categories`);
                setCategories(response.data);
            } catch (error) {
                console.error("Failed to load categories:", error);
            }
        };

        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(
                    `${appConfig.baseurlAPI}/products?page=${currentPage}&per_page=${showing}&search=${searchTermDebounced}`
                );
                const data = response.data;
                setRows(data.data);
                setTotalPages(data.last_page);
                setTotalRows(data.total);
            } catch (error) {
                if (error.response) {
                    if (error.response.status === 403) {
                        navigate("/403");
                    } else {
                        console.error("Error response:", error.response.data);
                        MySwal.fire({
                            title: "Error",
                            text: "Failed to load products.",
                            icon: "error",
                            timer: 2000,
                        });
                    }
                } else {
                    console.error("Network error:", error.message);
                    MySwal.fire({
                        title: "Error",
                        text: "Network error occurred.",
                        icon: "error",
                        timer: 2000,
                    });
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
        fetchProducts();
    }, [currentPage, showing, searchTermDebounced, refetch, navigate]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleSearchDebounced = useCallback(
        debounce((value) => {
            setSearchTermDebounced(value);
        }, appConfig.debounceTimeout),
        []
    );

    const handleSearch = (event) => {
        const value = event.target.value;
        setSearchTerm(value);
        handleSearchDebounced(value);
    };

    const handleShow = (event) => {
        setShowing(parseInt(event.target.value));
    };

    const handleAdd = () => {
        setModalData(null);
        setIsEditing(false);
        setFormData({ 
            name: "", 
            description: "", 
            price: "", 
            category_id: "", 
            quantity: "", 
            image1: null 
        });
    };

    const handleEdit = (id) => {
        const data = rows.find((row) => row.id === id);
        setModalData(data);
        setFormData({
            name: data.name,
            description: data.description,
            price: data.price,
            category_id: data.category_id,
            quantity: data.quantity,
            image1: null,
        });
        setIsEditing(true);
    };

    const handleInputChange = (event) => {
        const { name, value, files } = event.target;
        setFormData({ ...formData, [name]: files ? files[0] : value });
    };

    const validateForm = () => {
        const errors = {};
        let formIsValid = true;
        if (!formData.name) {
            formIsValid = false;
            errors.name = "Name is required";
        }
        if (!formData.description) {
            formIsValid = false;
            errors.description = "Description is required";
        }
        if (!formData.price) {
            formIsValid = false;
            errors.price = "Price is required";
        }
        if (!formData.category_id) {
            formIsValid = false;
            errors.category_id = "Category is required";
        }
        if (!formData.quantity) {
            formIsValid = false;
            errors.quantity = "Quantity is required";
        }
        if (!formData.image1) {
            formIsValid = false;
            errors.image1 = "Image is required";
        }
        setFormErrors(errors);
        return formIsValid;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateForm()) return;

        const formDataToSend = new FormData();
        for (const key in formData) {
            formDataToSend.append(key, formData[key]);
        }

        try {
            const url = isEditing
                ? `${appConfig.baseurlAPI}/products/${modalData.id}`
                : `${appConfig.baseurlAPI}/products`;
            const method = isEditing ? "put" : "post";
            const response = await axios({
                method,
                url,
                data: formDataToSend,
                headers: { "Content-Type": "multipart/form-data" },
            });

            const successMessage = isEditing
                ? "Product updated successfully"
                : "Product created successfully";
            Swal.fire({
                title: "Success!",
                text: successMessage,
                icon: "success",
                timer: 1500,
            }).then(() => {
                $(".modal").modal("hide");
                setRefetch(Math.random());
                setFormData({ 
                    name: "", 
                    description: "", 
                    price: "", 
                    category_id: "", 
                    quantity: "", 
                    image1: null 
                });
            });
        } catch (error) {
            console.error("Error:", error);
            MySwal.fire({
                title: "Oops...",
                text: "Something went wrong.",
                icon: "error",
                timer: 2000,
            });
        }
    };

    const handleConfirmationDelete = (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        }).then((result) => {
            if (result.isConfirmed) {
                handleDelete(id);
            }
        });
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${appConfig.baseurlAPI}/products/${id}`);
            setRows(rows.filter((row) => row.id !== id));
            setTotalRows(totalRows - 1);
            MySwal.fire({
                title: "Deleted!",
                text: "Product deleted successfully.",
                icon: "success",
                timer: 1500,
            });
        } catch (error) {
            console.error("Error:", error);
            MySwal.fire({
                title: "Oops...",
                text: "Something went wrong.",
                icon: "error",
                timer: 2000,
            });
        }
    };

    if (isLoading) {
        return (
            <Case>
                <div className="section-header px-4 tw-rounded-none tw-shadow-md tw-shadow-gray-200 lg:tw-rounded-lg">
                    <h1 className="mb-1 tw-text-lg">Loading...</h1>
                </div>
            </Case>
        );
    }

    return (
        <Case>
            <div className="section-header px-4 tw-rounded-none tw-shadow-md tw-shadow-gray-200 lg:tw-rounded-lg">
                <h1 className="mb-1 tw-text-lg">Products</h1>
            </div>

            <div className="section-body">
                <div className="card">
                    <div className="card-body px-0">
                    <h3>Product Table</h3>
                        <SearchEntries
                            showing={showing}
                            handleShow={handleShow}
                            searchTerm={searchTerm}
                            handleSearch={handleSearch}
                        />
                        <div className="table-responsive tw-max-h-96">
                            <table>
                                <thead className="tw-sticky tw-top-0">
                                    <tr className="tw-text-gray-700">
                                        <th width="5%" className="text-center">No</th>
                                        <th>Product Name</th>
                                        <th>Description</th>
                                        <th>Price</th>
                                        <th>Category</th>
                                        <th>Quantity</th>
                                        <th>Image</th>
                                        <th className="text-center">
                                            <i className="fas fa-cog"></i>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(rows) && rows.length ? (
                                        rows.map((row, index) => (
                                            <tr key={index}>
                                                <td className="text-center">{index + 1}</td>
                                                <td>{row.name}</td>
                                                <td>{row.description}</td>
                                                <td>{row.price}</td>
                                                <td>{row.category_name}</td>
                                                <td>{row.quantity}</td>
                                                <td>
                                                    <img src={row.image_url} alt={row.name} width="50" />
                                                </td>
                                                <td className="text-center">
                                                    <button
                                                        onClick={() => handleEdit(row.id)}
                                                        className="btn btn-primary mr-2"
                                                        data-toggle="modal"
                                                        data-target="#formDataModal"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => handleConfirmationDelete(row.id)}
                                                        className="btn btn-danger"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center">
                                                No data available in the table
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            showing={showing}
                            totalRows={totalRows}
                            totalPages={totalPages}
                            handlePageChange={handlePageChange}
                        />
                    </div>
                </div>
                <AddButton handleAdd={handleAdd} />
            </div>

            <div
                className="modal fade"
                id="formDataModal"
                aria-labelledby="formDataModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <ModalHeader isEditing={isEditing} />
                        <form onSubmit={handleSubmit} encType="multipart/form-data">
                            <div className="modal-body">
                                <InputValidation
                                    label="Product Name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    error={formErrors.name}
                                />
                                <InputValidation
                                    label="Description"
                                    name="description"
                                    type="text"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    error={formErrors.description}
                                />
                                <InputValidation
                                    label="Price"
                                    name="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    error={formErrors.price}
                                />
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        name="category_id"
                                        className="form-control"
                                        value={formData.category_id}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.category_id && <div className="text-danger">{formErrors.category_id}</div>}
                                </div>
                                <InputValidation
                                    label="Quantity"
                                    name="quantity"
                                    type="number"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    error={formErrors.quantity}
                                />
                                <div className="form-group">
                                    <label>Image</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        name="image1"
                                        onChange={handleInputChange}
                                    />
                                    {formErrors.image1 && <div className="text-danger">{formErrors.image1}</div>}
                                </div>
                            </div>
                            <ModalFooter />
                        </form>
                    </div>
                </div>
            </div>
        </Case>
    );
}

