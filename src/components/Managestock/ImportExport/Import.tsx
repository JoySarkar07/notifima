import React, { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { CSVLink } from "react-csv";
import { __ } from "@wordpress/i18n";
import { Link } from "react-router-dom";
import "./importExport.scss";
import { StockDataType } from "../Managestock";
import { ImportExportStockDataType } from "./Export";

const Import = () => {
    const [ data, setData ] = useState< StockDataType[] >( [] );
    const [ file, setFile ] = useState< File | null >( null );
    const [ filename, setFilename ] = useState< string >( "" );
    const [ displayMessage, setDisplayMessage ] = useState< string >( "" );

    // Fetch all the data for the sample CSV
    useEffect( () => {
        if ( appLocalizer.khali_dabba ) {
            axios( {
                method: "GET",
                url: `${ appLocalizer.apiUrl }/notifima/v1/products`,
                headers: { "X-WP-Nonce": appLocalizer.nonce },
                params: { action: "segment" },
            } )
                .then( ( response ) => {
                    const parsedData = JSON.parse( response.data );
                    setData( Object.values( parsedData ) );
                } )
                .catch( ( error ) => {
                    console.error( "Error fetching data:", error );
                } );
        }
    }, [] );

    // Convert data for export
    const getData = (): ImportExportStockDataType[] => {
        return data.map( ( row ) => ( {
            ...row,
            manage_stock: row.manage_stock ? "yes" : "no",
            stock_quantity: row.stock_quantity ?? "-", // if null/undefined, set '-'
        } ) );
    };

    // Handle file input change
    const handleFileChange = ( event: ChangeEvent< HTMLInputElement > ) => {
        const selectedFile = event.target.files?.[ 0 ];
        if ( selectedFile ) {
            setFile( selectedFile );
            setFilename( selectedFile.name );
        }
    };

    // Headers for the Sample CSV
    const header = [
        { label: "ID", key: "id" },
        { label: "SKU", key: "sku" },
        { label: "Manage stock", key: "manage_stock" },
        { label: "Stock status", key: "stock_status" },
        { label: "Backorders", key: "backorders" },
        { label: "Stock", key: "stock_quantity" },
    ];
    //Function that process the csv
    const processCSV = (
        str: string,
        delim: string = ","
    ): Record< string, string >[] => {
        // Determine End of Line (EOL) character
        let eol = "\n";
        if ( str.indexOf( "\r" ) !== -1 ) {
            if ( str.indexOf( "\r" ) < str.indexOf( "\n" ) ) {
                eol = "\r\n";
            } else {
                eol = "\r";
            }
        }

        const headers = str.slice( 0, str.indexOf( eol ) ).split( delim );
        const rows = str.slice( str.indexOf( "\n" ) + 1 ).split( eol );

        const processedCsvData = rows
            .filter( ( row ) => row.trim() !== "" ) // Ignore empty rows
            .map( ( row ) => {
                const values = row.split( delim );
                const eachObject = headers.reduce< Record< string, string > >(
                    ( obj, headerData, i ) => {
                        obj[ headerData.trim() ] = ( values[ i ] ?? "" ).trim();
                        return obj;
                    },
                    {}
                );
                return eachObject;
            } );

        return processedCsvData;
    };
    const handleUpload = (): void => {
        if ( file ) {
            const reader = new FileReader();
            reader.readAsText( file );
            reader.onload = ( e: ProgressEvent< FileReader > ) => {
                if ( e.target?.result ) {
                    const csvData = processCSV( e.target.result as string );
                    axios( {
                        method: "POST",
                        url: `${ appLocalizer.apiUrl }/notifima/v1/products`,
                        headers: {
                            "X-WP-Nonce": appLocalizer.nonce,
                            "Content-Type": "application/json",
                        },
                        data: { product: csvData },
                    } );
                    setDisplayMessage( "CSV Data Uploaded Successfully" );
                    setTimeout( () => {
                        setDisplayMessage( "" );
                    }, 2000 );
                }
            };
        }
    };

    return (
        <div className="admin-container">
            <div className="import-page">
                <div className="admin-page-title">
                    <p>{ __( "Import", "notifima" ) }</p>
                    <button className="import-export-btn">
                        <Link to={ "?page=notifima#&tab=manage-stock" }>
                            <div className="wp-menu-image dashicons-before dashicons-arrow-left-alt"></div>
                            { __( "Inventory Manager", "notifima" ) }
                        </Link>
                    </button>
                    { displayMessage && (
                        <div className="admin-notice-display-title">
                            <i className="admin-font adminLib-icon-yes"></i>
                            { displayMessage }
                        </div>
                    ) }
                </div>
                <div className="import-section">
                    <p>
                        { __(
                            "Upload your CSV file to update stock data for existing products. The file must match the specified format a sample CSV is available for reference.",
                            "notifima"
                        ) }
                        { data && (
                            <CSVLink
                                enclosingCharacter={ `` }
                                data={ getData() }
                                headers={ header }
                                filename={ "Sample.csv" }
                            >
                                { __( "Download Sample CSV", "notifima" ) }
                            </CSVLink>
                        ) }
                    </p>
                    <div className="import-table">
                        <div className="import-csv-section">
                            <div className="dashicons dashicons-format-image"></div>
                            <p>
                                { filename !== ""
                                    ? filename
                                    : "Drag your file here or click in this area" }
                            </p>
                            <input
                                className="import-input"
                                onChange={ handleFileChange }
                                type="file"
                                name="csv_file"
                                accept=".csv"
                            />
                        </div>
                        <div className="import-upload-btn-section">
                            <button
                                onClick={ handleUpload }
                                className="import-btn"
                            >
                                { __( "Upload CSV", "notifima" ) }
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Import;
