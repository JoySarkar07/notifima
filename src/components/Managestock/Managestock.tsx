import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { CustomTable, TableCell } from "zyra";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Dialog } from "@mui/material";
import Popup from "../Popup/Popup";
import "./ManagestockTable.scss";
import { __ } from "@wordpress/i18n";
import type { RealtimeFilter } from "../SubscriberList/SubscribersList";

// Type declarations
export interface StockDataType {
    backorders: string;
    id: string;
    image: string;
    link: string;
    manage_stock: boolean;
    name: string;
    regular_price: string;
    sale_price: string;
    sku: string;
    stock_quantity: number | null;
    stock_status: string;
    subscriber_no: string;
    type: string;
}

interface HeaderType {
    name: string;
    class: string;
    dependent?: string;
    type: string;
    editable: boolean;
    options?: string[];
}

type ProductCountStatus = {
    key: string;
    name: string;
    count: number;
};

type FilterData = {
    searchProductType?: string;
    searchAction?: string;
    typeCount?: string;
    searchField?: string;
};

const Managestock: React.FC = () => {
    const updateDataUrl = `${ appLocalizer.apiUrl }/notifima/v1/products`;
    const fetchDataUrl = `${ appLocalizer.apiUrl }/notifima/v1/products`;
    const segmentDataUrl = `${ appLocalizer.apiUrl }/notifima/v1/products`;
    const [ data, setData ] = useState< StockDataType[] | null >( null );
    const [ headers, setHeaders ] = useState( [] );
    const [ displayMessage, setDisplayMessage ] = useState( "" );
    const [ openDialog, setOpenDialog ] = useState( false );
    const [ successMessage, setSuccessMessage ] = useState< string >( "" );
    const [ totalPages, setTotalPages ] = useState< number >( 0 );
    const [ filter, setFilter ] = useState< FilterData >( {} );
    const [ productCount, setProductCount ] = useState<
        ProductCountStatus[] | null
    >( null );
    const [ pagination, setPagination ] = useState< PaginationState >( {
        pageIndex: 0,
        pageSize: 10,
    } );
    const selectRef = useRef< HTMLSelectElement >( null );
    const stockChanged = useRef< boolean >( false );

    const handleSelectChange = () => {
        if ( appLocalizer.khali_dabba ) {
            const selectedValue = selectRef.current?.value;
            const updatedFilters = {
                ...filter,
                searchProductType: selectedValue,
            };
            setFilter( updatedFilters );
            // Call API with updated filters, not old ones
            requestApiForData( pagination.pageSize, 1, updatedFilters );
        }
    };

    const realtimeFilter: RealtimeFilter[] = [
        {
            name: "Product Type",
            render: () => {
                return (
                    <>
                        <div className="subscriber-bulk-action bulk-action">
                            <select
                                name="action"
                                ref={ selectRef }
                                onChange={ handleSelectChange }
                            >
                                <option value="">
                                    { __( "Product Type", "notifima" ) }
                                </option>
                                <option value="Simple">
                                    { __( "Simple", "notifima" ) }
                                </option>
                                <option value="Variable">
                                    { __( "Variable", "notifima" ) }
                                </option>
                            </select>
                        </div>
                    </>
                );
            },
        },
        {
            name: "searchField",
            render: ( updateFilter, filterValue ) => (
                <>
                    <div className="admin-header-search-section search-section">
                        <input
                            name="searchField"
                            type="text"
                            // eslint-disable-next-line @wordpress/i18n-ellipsis
                            placeholder={ __( "Search...", "notifima" ) }
                            onChange={ ( e ) => {
                                updateFilter( e.target.name, e.target.value );
                                setFilter( ( previousfilters ) => {
                                    return {
                                        ...previousfilters,
                                        searchField: e.target.value,
                                    };
                                } );
                            } }
                            value={ filterValue || "" }
                        />
                    </div>
                </>
            ),
        },
        {
            name: "searchAction",
            render: ( updateFilter, filterValue ) => (
                <>
                    <div className="admin-header-search-section searchAction">
                        <select
                            name="searchAction"
                            onChange={ ( e ) => {
                                updateFilter( e.target.name, e.target.value );
                                setFilter( ( previousfilters ) => {
                                    return {
                                        ...previousfilters,
                                        searchAction: e.target.value,
                                    };
                                } );
                            } }
                            value={ filterValue || "" }
                        >
                            <option value="">
                                { __( "Select", "notifima" ) }
                            </option>
                            <option value="productName">
                                { __( "Product Name", "notifima" ) }
                            </option>
                            <option value="productSku">
                                { __( "Sku", "notifima" ) }
                            </option>
                        </select>
                    </div>
                </>
            ),
        },
    ];

    useEffect( () => {
        if ( ! appLocalizer.khali_dabba ) return;
        axios( {
            method: "GET",
            url: segmentDataUrl,
            headers: { "X-WP-Nonce": appLocalizer.nonce },
            params: {
                segment: true,
                action: "segment",
            },
        } ).then( ( response ) => {
            const responseData = response.data;
            setProductCount( [
                {
                    key: "all",
                    name: "All",
                    count: responseData.all,
                },
                {
                    key: "instock",
                    name: "In stock",
                    count: responseData.instock,
                },
                {
                    key: "onbackorder",
                    name: "On backorder",
                    count: responseData.onbackorder,
                },
                {
                    key: "outofstock",
                    name: "Out of stock",
                    count: responseData.outofstock,
                },
            ] );
        } );
    }, [ stockChanged.current, segmentDataUrl ] );

    function requestData(
        rowsPerPage = 10,
        currentPage = 1,
        productName: string | null,
        productSku: string | null,
        productType: string = "",
        stockStatus: string = ""
    ) {
        //Fetch the data to show in the table
        setData( null );
        axios( {
            method: "GET",
            url: fetchDataUrl,
            headers: { "X-WP-Nonce": appLocalizer.nonce },
            params: {
                page: currentPage,
                row: rowsPerPage,
                product_name: productName || null,
                product_sku: productSku || null,
                product_type: productType,
                stock_status: stockStatus,
            },
        } ).then( ( response ) => {
            const productData = JSON.parse( response.data );
            setData( productData.products );
        } );
    }

    const requestApiForData = (
        rowsPerPage: number,
        currentPage: number,
        filterData: FilterData
    ) => {
        setData( null );
        filterData = { ...filter, ...filterData };
        requestData(
            rowsPerPage,
            currentPage,
            filterData.searchAction === "productName"
                ? ( filterData.searchField as string )
                : "",
            filterData.searchAction === "productSku"
                ? ( filterData.searchField as string )
                : "",
            filterData.searchProductType || "",
            filterData.typeCount === "all" ? "" : filterData.typeCount
        );
    };

    useEffect( () => {
        if ( ! appLocalizer.khali_dabba ) return;
        setData( null );
        //Fetch the data to show in the table
        axios( {
            method: "GET",
            url: fetchDataUrl,
            headers: { "X-WP-Nonce": appLocalizer.nonce },
            params: {
                page: pagination.pageIndex + 1,
                row: pagination.pageSize,
                product_name:
                    filter.searchAction === "productName"
                        ? filter.searchField
                        : null,
                product_sku:
                    filter.searchAction === "productSku"
                        ? filter.searchField
                        : null,
                product_type: filter.searchProductType,
                stock_status: filter.typeCount,
            },
        } ).then( ( response ) => {
            const parsedData = JSON.parse( response.data );
            setData( parsedData.products );
            setHeaders( parsedData.headers );
            setTotalPages(
                Math.ceil( parsedData.total_products / pagination.pageSize )
            );
        } );
    }, [
        pagination,
        fetchDataUrl,
        filter.searchAction,
        filter.searchField,
        filter.searchProductType,
        filter.typeCount,
    ] );

    const updateData = ( id: string, name: string, value: any ) => {
        if ( ! id ) {
            return;
        }
        axios( {
            method: "post",
            url: updateDataUrl,
            headers: { "X-WP-Nonce": appLocalizer.nonce },
            data: {
                id: String( id ),
                name: "set_" + String( name ),
                value: String( value ),
            },
        } )
            .then( () => {
                setSuccessMessage(
                    __( "Data updated successfully!", "notifima" )
                );
                setTimeout( () => {
                    setSuccessMessage( __( "", "notifima" ) );
                }, 2000 );
            } )
            .catch( () => {
                setSuccessMessage( __( "Error updating data!", "notifima" ) );
                setTimeout( () => {
                    setSuccessMessage( __( "", "notifima" ) );
                }, 2000 );
            } );
    };

    const onCellChange = ( productId: any, productKey: any, val: any ) => {
        if ( ! data ) return;
        setData( ( prev ) => {
            if ( ! prev ) return prev;
            return {
                ...prev,
                [ productId ]: {
                    ...prev[ productId ],
                    [ productKey ]: val,
                },
            };
        } );
    };

    const onChange = (
        e: any,
        key: string,
        rowId: string,
        type: string,
        row: Record< string, any >
    ) => {
        key = key === "product" ? "name" : key;
        if ( type === "checkbox" ) {
            onCellChange( rowId, key, e.target.checked );
            updateData( rowId, key, e.target.checked );
        } else if ( type === "dropdown" ) {
            if ( "value" in e ) {
                onCellChange( rowId, key, e.value );
                updateData( rowId, key, e.value );
            }
        } else {
            if ( key === "regular_price" ) {
                if ( parseInt( e.target.value ) < parseInt( row.sale_price ) ) {
                    setDisplayMessage(
                        __(
                            "Regular price should be greater than sale price.",
                            "notifima"
                        )
                    );
                    setTimeout( () => {
                        setDisplayMessage( __( "", "notifima" ) );
                    }, 2000 );
                    return;
                }
            } else if ( key === "sale_price" ) {
                if (
                    parseInt( e.target.value ) > parseInt( row.regular_price )
                ) {
                    setDisplayMessage(
                        __(
                            "Sale price should be less than regular price.",
                            "notifima"
                        )
                    );
                    setTimeout( () => {
                        setDisplayMessage( __( "", "notifima" ) );
                    }, 2000 );
                    return;
                }
            } else if ( key === "stock_quantity" ) {
                onCellChange( rowId, key, parseInt( e.target.value ) );
                updateData( rowId, key, parseInt( e.target.value ) );
                if ( e.target.value > 0 ) {
                    onCellChange( rowId, "stock_status", "instock" );
                    updateData( rowId, "stock_status", "instock" );
                } else {
                    onCellChange( rowId, "stock_status", "outofstock" );
                    updateData( rowId, "stock_status", "outofstock" );
                }
                stockChanged.current = ! stockChanged.current;
                return;
            }
            updateData( rowId, key, e.target.value );
            onCellChange( rowId, key, e.target.value );
        }
    };

    // Define columns based on headers
    const columns: ColumnDef< Record< string, any >, any >[] = Object.entries(
        headers
    )
        .filter(
            ( [ _, headerData ]: [ string, HeaderType ] ) =>
                headerData.name !== "Image" && headerData.name !== "Name"
        )
        .map(
            ( [ key, headerData ]: [ string, HeaderType ] ): ColumnDef<
                Record< string, any >,
                any
            > => ( {
                id: key,
                header: headerData.name,
                cell: ( { row } ) => {
                    const rowId = row.original.id;
                    const manageStock = row.original.manage_stock;
                    const headerName = headerData.name;
                    let value =
                        headerName === "Product"
                            ? row.original.name
                            : row.original[ key ];
                    let type = headerData.type;

                    const isBackOrdersOrStock =
                        headerName === "Back orders" || headerName === "Stock";
                    const isStockStatus = headerName === "Stock status";

                    // Handle conditional type/value overrides
                    if ( isBackOrdersOrStock ) {
                        if ( ! manageStock ) {
                            type = "";
                            if (
                                headerName === "Back orders" &&
                                headerData.options
                            ) {
                                value =
                                    headerData.options[
                                        value as keyof typeof headerData.options
                                    ];
                            }
                        }
                    } else if ( isStockStatus ) {
                        if ( manageStock ) {
                            type = "";
                            if ( headerData.options ) {
                                value =
                                    headerData.options[
                                        value as keyof typeof headerData.options
                                    ];
                            }
                        } else {
                            type = headerData.type;
                        }
                    }

                    return (
                        <TableCell
                            key={ key }
                            title={ headerData.name }
                            type={ type }
                            header={ headerData }
                            fieldValue={
                                headerData.type === "number"
                                    ? String( value || 0 )
                                    : value
                            }
                            onChange={
                                ( e ) => {
                                    onChange(
                                        e,
                                        key,
                                        rowId,
                                        type,
                                        row.original
                                    );
                                } // ✅ Now uses correct rowId
                            }
                        >
                            { headerData.name === "Product" ? (
                                <a href={ row.original.link }>
                                    <img
                                        className="products"
                                        src={ row.original.image }
                                        alt="product_image"
                                    />
                                </a>
                            ) : (
                                <p
                                    className={ headerData.class }
                                    data-id={ rowId }
                                >
                                    { headerData.type === "number"
                                        ? String( value || 0 )
                                        : value }
                                </p>
                            ) }
                        </TableCell>
                    );
                },
            } )
        );

    let tableData: StockDataType[] | null = data;
    if ( data ) {
        tableData = Object.values( data );
    }

    return (
        <>
            { ! appLocalizer.khali_dabba ? (
                //If the user is free user he will be shown a Inventory Manager image
                <div className="inventory-manager-wrapper">
                    <Dialog
                        className="admin-module-popup"
                        open={ openDialog }
                        onClose={ () => {
                            setOpenDialog( false );
                        } }
                        aria-labelledby="form-dialog-title"
                    >
                        <span
                            className="admin-font adminLib-cross stock-manager-popup-cross"
                            onClick={ () => {
                                setOpenDialog( false );
                            } }
                        ></span>
                        <Popup />
                    </Dialog>
                    <div
                        onClick={ () => {
                            setOpenDialog( true );
                        } }
                        className="inventory-manager"
                    ></div>
                </div>
            ) : (
                //If user is pro user he will shown the Inventory Manager Table
                <div className="admin-middle-container-wrapper">
                    <div className="title-section">
                        <p>{ __( "Inventory Manager", "notifima" ) }</p>
                        <div className="stock-reports-download">
                            <button className="import-export-btn">
                                <Link to={ "?page=stock-manager#&tab=import" }>
                                    <div className="wp-menu-image dashicons-before dashicons-download"></div>
                                    { __( "Import", "notifima" ) }
                                </Link>
                            </button>
                            <button className="import-export-btn">
                                <Link to={ "?page=stock-manager#&tab=export" }>
                                    <div className="wp-menu-image dashicons-before dashicons-upload"></div>
                                    { __( "Export", "notifima" ) }
                                </Link>
                            </button>
                        </div>
                        { displayMessage && (
                            <div className="admin-notice-display-title">
                                <i className="admin-font adminLib-icon-yes"></i>
                                { displayMessage }
                            </div>
                        ) }
                    </div>
                    <CustomTable
                        data={ tableData }
                        columns={ columns }
                        pageCount={ totalPages }
                        pagination={ pagination }
                        onPaginationChange={ setPagination }
                        realtimeFilter={ realtimeFilter }
                        typeCounts={ productCount as ProductCountStatus[] }
                        perPageOption={ [ 5, 10, 20 ] }
                        handlePagination={ requestApiForData }
                        successMsg={ successMessage }
                    />
                </div>
            ) }
        </>
    );
};

export default Managestock;
