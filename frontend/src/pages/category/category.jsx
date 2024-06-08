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

export default function Category() {
    const navigate = useNavigate();
    const MySwal = withReactContent(Swal);

    const [rows, setRows] = useState([]);
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
    const [formData, setFormData] = useState({ name: "", CategoryChoix: "" });
    const [formErrors, setFormErrors] = useState({ name: "", CategoryChoix: "" });

    // useEffect(() => {
    //     document.title = "Categories";
    //     const fetchCategories = async () => {
    //         try {
    //             setIsLoading(true);
    //             const { data } = await axios.get(
    //                 `${appConfig.baseurlAPI}/categories?page=${currentPage}&per_page=${showing}&search=${searchTermDebounced}`
    //             );
    //             setRows(data.data.data);
    //             setTotalPages(data.data.last_page);
    //             setTotalRows(data.data.total);
    //         } catch (error) {
    //             if (error.response && error.response.status === 403) {
    //                 navigate("/403");
    //             } else {
    //                 console.error(error);
    //                 MySwal.fire({
    //                     title: "Error",
    //                     text: "Failed to load categories.",
    //                     icon: "error",
    //                     timer: 2000,
    //                 });
    //             }
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     };
    //     fetchCategories();
    // }, [currentPage, showing, searchTermDebounced, refetch, navigate]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(
                    `${appConfig.baseurlAPI}/categories?page=${currentPage}&per_page=${showing}&search=${searchTermDebounced}`
                );
    
                console.log("Response Data:", response.data);  // Log the full response
    
                const data = response.data;
    
                if (data && Array.isArray(data)) {
                    setRows(data);
                    setTotalPages(data.last_page);
                    setTotalRows(data.total);
                } else {
                    console.error("Unexpected data structure:", data);
                    MySwal.fire({
                        title: "Error",
                        text: "Unexpected data format received.",
                        icon: "error",
                        timer: 2000,
                    });
                }
            } catch (error) {
                if (error.response) {
                    if (error.response.status === 403) {
                        navigate("/403");
                    } else {
                        console.error("Error response:", error.response.data);
                        MySwal.fire({
                            title: "Error",
                            text: "Failed to load categories.",
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
        setFormData({ name: "", CategoryChoix: "" });
    };

    const handleEdit = (id) => {
        const data = rows.find((row) => row.id === id);
        setModalData(data);
        setFormData({
            name: data.name,
            CategoryChoix: data.CategoryChoix,
        });
        setIsEditing(true);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const validateForm = () => {
        const errors = {};
        let formIsValid = true;
        if (!formData.name) {
            formIsValid = false;
            errors.name = "Name is required";
        }
        if (!formData.CategoryChoix) {
            formIsValid = false;
            errors.CategoryChoix = "Category choice is required";
        }
        setFormErrors(errors);
        return formIsValid;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateForm()) return;

        try {
            const url = isEditing
                ? `${appConfig.baseurlAPI}/categories/${modalData.id}`
                : `${appConfig.baseurlAPI}/categories`;
            const method = isEditing ? "put" : "post";
            const response = await axios({
                method,
                url,
                data: formData,
                headers: { "Content-Type": "application/json" },
            });

            const successMessage = isEditing
                ? "Category updated successfully"
                : "Category created successfully";
            Swal.fire({
                title: "Success!",
                text: successMessage,
                icon: "success",
                timer: 1500,
            }).then(() => {
                $(".modal").modal("hide");
                setRefetch(Math.random());
                setFormData({ name: "", CategoryChoix: "" });
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
            await axios.delete(`${appConfig.baseurlAPI}/categories/${id}`);
            setRows(rows.filter((row) => row.id !== id));
            setTotalRows(totalRows - 1);
            MySwal.fire({
                title: "Deleted!",
                text: "Category deleted successfully.",
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
                <h1 className="mb-1 tw-text-lg">Categories</h1>
            </div>

            <div className="section-body">
                <div className="card">
                    <div className="card-body px-0">
                        <h3>Category Table</h3>
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
                                        <th width="15%" className="text-center">
                                            No
                                        </th>
                                        <th>Category Name</th>
                                        <th>Category Choice</th>
                                        <th className="text-center">
                                            <i className="fas fa-cog"></i>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(rows) && rows.length ? (
                                        rows.map((row, index) => (
                                            <tr key={index}>
                                                <td className="text-center">
                                                    {index + 1}
                                                </td>
                                                <td>{row.name}</td>
                                                <td>{row.CategoryChoix}</td>
                                                <td className="text-center">
                                                    <button
                                                        onClick={() =>
                                                            handleEdit(row.id)
                                                        }
                                                        className="btn btn-primary mr-2"
                                                        data-toggle="modal"
                                                        data-target="#formDataModal"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleConfirmationDelete(
                                                                row.id
                                                            )
                                                        }
                                                        className="btn btn-danger"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="text-center"
                                            >
                                                No data available in the table
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination and showing data */}
                        <Pagination
                            currentPage={currentPage}
                            showing={showing}
                            totalRows={totalRows}
                            totalPages={totalPages}
                            handlePageChange={handlePageChange}
                        />
                        {/* Pagination and showing data */}
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
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <InputValidation
                                    label="Category Name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    error={formErrors.name}
                                />
                                <InputValidation
                                    label="Category Choice"
                                    name="CategoryChoix"
                                    type="text"
                                    value={formData.CategoryChoix}
                                    onChange={handleInputChange}
                                    error={formErrors.CategoryChoix}
                                />
                            </div>
                            <ModalFooter />
                        </form>
                    </div>
                </div>
            </div>
        </Case>
    );
}
