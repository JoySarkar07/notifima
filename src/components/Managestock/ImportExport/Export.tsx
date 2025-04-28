import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CSVLink } from "react-csv";
import { __ } from '@wordpress/i18n';
import { Link } from 'react-router-dom';
import "./importExport.scss";

// Define types
interface Product {
    id: number;
    type: string;
    sku: string;
    name: string;
    manage_stock: boolean;
    stock_status: string;
    backorders: string;
    stock_quantity: number;
    [key: string]: any; // In case there are extra fields
  }
  
  interface CheckboxItem {
    name: string;
    value: keyof Product;
    checked: boolean;
  }

  interface HeaderItem {
    label: string;
    key: keyof Product;
  }

const Export = () => {
    const [data, setData] = useState<Product[]>([]);
    const [selectAll, setSelectAll] = useState<boolean>(true);
    const [checkboxData, setCheckboxData] = useState<CheckboxItem[]>([
    { name: 'Id',           value: 'id',             checked: true },
    { name: 'Type',         value: 'type',           checked: true },
    { name: 'SKU',          value: 'sku',            checked: true },
    { name: 'name',         value: 'name',           checked: true },
    { name: 'Manage stock', value: 'manage_stock',   checked: true },
    { name: 'Stock status', value: 'stock_status',   checked: true },
    { name: 'Backorders',   value: 'backorders',     checked: true },
    { name: 'Stock',        value: 'stock_quantity', checked: true },
    ]);

    useEffect(() => {
    if (appLocalizer.khali_dabba) {
        axios({
        method: "post",
        url: `${appLocalizer.apiUrl}/notifima/v1/all-products`,
        headers: { 'X-WP-Nonce': appLocalizer.nonce },
        }).then((response) => {
        const parsedData: Product[] = Object.values(JSON.parse(response.data));
        setData(parsedData);
        }).catch((error) => {
        console.error('Error fetching data:', error);
        });
    }
    }, []);

    const getHeader = (): HeaderItem[] => {
        const header: HeaderItem[] = [];
        checkboxData.forEach(({ name, value, checked }) => {
          if (checked) {
            header.push({ label: name, key: value });
          }
        });
        return header;
      };
      
      // For getData
      const getData = (): Array<Omit<Product, 'manage_stock'> & { manage_stock: string }> => {
        return data.map((row) => {
          return {
            ...row,
            manage_stock: row.manage_stock ? 'yes' : 'no',
            stock_quantity: row.stock_quantity ?? '-', // Use nullish coalescing for undefined or null
          };
        });
      };

      const handleCheck = (e: React.ChangeEvent<HTMLInputElement>, name: string, value: keyof Product): void => {
        console.log(name, value);
        setCheckboxData((prevCheckboxData) =>
          prevCheckboxData.map((checkbox) =>
            checkbox.value === value
              ? { ...checkbox, checked: !checkbox.checked }
              : checkbox
          )
        );
      };
      
      const handleSelectAll = (): void => {
        if (!selectAll) {
          setCheckboxData(
            checkboxData.map((item) => ({ ...item, checked: true }))
          );
          setSelectAll(true);
        } else {
          setCheckboxData(
            checkboxData.map((item) => ({ ...item, checked: false }))
          );
          setSelectAll(false);
        }
      };
      

      function splitCheckBoxData(parts: number): JSX.Element[] {
        const chunks: JSX.Element[] = [];
        
        for (let i = 0; i < checkboxData.length; i += parts) {
          const chunk = checkboxData.slice(i, i + parts);
          
          const chunkElements = chunk.map((checkbox) => (
            <div className="export-feature-card" key={checkbox.value}>
              <h1>{checkbox.name}</h1>
              <div className="mvx-normal-checkbox-content">
                <input
                  type="checkbox"
                  id={checkbox.name}
                  checked={checkbox.checked}
                  onChange={(e) => handleCheck(e, checkbox.name, checkbox.value)}
                />
              </div>
            </div>
          ));
      
          chunks.push(
            <div key={i} className="chunk-container">
              {chunkElements}
            </div>
          );
        }
      
        return chunks;
      }
      
    return (
        <div className="admin-container">
            <div className='export-page'>
                <div className="admin-page-title">
                    <p>{ __( 'Export', 'notifima' ) }</p>
                    <button className="import-export-btn" >
                        <Link to={ '?page=notifima#&tab=manage-stock' }>
                            <div className='wp-menu-image dashicons-before dashicons-arrow-left-alt'></div>
                            { __( 'Inventory Manager', 'notifima' ) }
                        </Link>
                    </button>
                </div>
                <div className="export-section">
                    <p>{ __( 'Download a CSV file containing stock data. Choose specific fields for CSV download.', 'notifima' ) }</p>
                    <div className='export-page-content'>
                        <div className='import-export-btn-section'>
                            <p>{ __( 'Select fields for exports', 'notifima' ) }</p>
                            <div>
                                <button className="select-deselect-trigger" onClick={ handleSelectAll } >{ __( 'Select / Deselect All', 'notifima' ) }</button>
                            </div>
                        </div>
                        <div className="export-list-section">
                            <div className='checkbox-container'>
                                { splitCheckBoxData( 4 ) }
                            </div>
                        </div>
                        <button className="import-export-btn">
                            <div className='wp-menu-image dashicons-before dashicons-upload'></div>
                            {data.length > 0 && (
                            <CSVLink
                                enclosingCharacter={``}
                                data={getData()}
                                headers={getHeader() as { label: string; key: string }[]}
                                filename="Products.csv"
                            >
                                {__('Export CSV', 'notifima')}
                            </CSVLink>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Export;