import React, { useEffect, useRef, useState } from 'react';
import axios from "axios";
import { CustomTable, TableCell } from 'zyra';
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import "./ManagestockTable.scss";
import { Data } from 'react-csv/lib/core';

interface DataType{
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
    name: string,
    class: string,
    dependent?: string,
    type: string,
    editable: boolean,
    options?: string[];
}

const Managestock:React.FC = () => {
  const updateDataUrl = `${ appLocalizer.apiUrl }/notifima/v1/update-product`;
  const fetchDataUrl   = `${appLocalizer.apiUrl}/notifima/v1/get-products`;
  const segmentDataUrl = `${appLocalizer.apiUrl}/notifima/v1/all-products`;
  const [data, setData] = useState<DataType[] | null>(null);
  const [headers, setHeaders] = useState([]);
  const [totalProducts, setTotalProducts] = useState();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [displayMessage, setDisplayMessage] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchType, setSearchType] = useState("");
  const [productType, setProductType] = useState("");
  const [stockStatus, setStockStatus] = useState("");
  const [segments, setSegments] = useState(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const filterChanged = useRef(false);
  const [pagination, setPagination] = useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    });
  const [ uploadData, setUploadData ] = useState( {
    id: "",
    name: "",
    value: "",
  });

  useEffect(() => {
    if (!appLocalizer.khali_dabba) return;
    axios({
      method: "post",
      url: segmentDataUrl,
      headers: { "X-WP-Nonce": appLocalizer.nonce },
      data: { segment: true },
    }).then((response) => {
      setSegments(response.data);
    });
  }, []);


  useEffect(() => {
    if (!appLocalizer.khali_dabba) return;
    if (filterChanged.current && (Boolean(searchType) !== Boolean(searchValue))) {
      filterChanged.current = false;
      return;
    }
    setData(null);
    //Fetch the data to show in the table
    axios({
      method: "post",
      url: fetchDataUrl,
      headers: { "X-WP-Nonce": appLocalizer.nonce },
      data: {
        page: currentPage + 1,
        row: rowsPerPage,
        product_name: searchType == 'productName' ? searchValue: null,
        product_sku: searchType == 'productSku' ? searchValue: null,
        product_type: productType,
        stock_status: stockStatus,
      },
    }).then((response) => {
      let parsedData = JSON.parse(response.data);
      setData(parsedData.products);
      setHeaders(parsedData.headers);
      setTotalProducts(parsedData.total_products);
      setTotalPages(Math.ceil(parsedData.total_products/pagination.pageSize));
      const data = {
        data:parsedData.products,
        headers:parsedData.headers,
        totalProducts:parsedData.total_products
      }
    });
  }, [
    rowsPerPage,
    currentPage,
    searchValue,
    searchType,
    productType,
    stockStatus,
  ]);

  const onCellChange = (productId:any, productKey:any, val:any) => {
    console.log("Input Id value : ",productId);
    console.log("Input Product key is : ",productKey);
    console.log("Input value : ",val);
    if (!data) return;
    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [productId]: {
          ...prev[productId],
          [productKey]: val,
        },
      };
    });
  };
  
  const columns: ColumnDef<Record<string, any>, any>[] = Object.entries(headers)
  .filter(([_, headerData]: [string, HeaderType]) => headerData.name !== 'Image' && headerData.name !== 'Name')
  .map(([key, headerData]: [string, HeaderType]): ColumnDef<Record<string, any>, any> => ({
    id: key,
    header: headerData.name,
    cell: (cellProps) => {
      const { row } = cellProps;
      
      const value = headerData.name === "Product" ? row.original.name : row.original[key];
      const rowId = row.original.id; // ✅ Fetch id inside cell, not outside

      const isBackOrdersOrStock = headerData.name === "Back orders" || headerData.name === "Stock";
      const isStockStatus = headerData.name === "Stock status";

      let type = headerData.type;
      if (isBackOrdersOrStock) {
        type = row.original.manage_stock ? headerData.type : "";
      } else if (isStockStatus) {
        type = row.original.manage_stock ? "" : headerData.type;
      }
      
      return (
        <TableCell
          title={headerData.name}
          type={type}
          header={headerData}
          fieldValue={value}
          onChange={
            (e) => {
              console.log("Row id : ",rowId);
              console.log("Row : ",row.original);
              // onCellChange(rowId, key, e.target.value)
            } // ✅ Now uses correct rowId
          }
        >
          {headerData.name === "Product" ? (
            <a href={row.original.link}>
              <img className="products" src={row.original.image} alt="product_image" />
            </a>
          ) : (
            <p className={headerData.class}>
              {headerData.type === "number" ? String(value || 0) : value}
            </p>
          )}
        </TableCell>
      );
    }
  }));

  // console.log("Columns : ",columns);
  // console.log("Headers : ",headers);
  // console.log("Data : ",data);

  let tableData: DataType[] | null = data;
  if(data){
    tableData = Object.values(data);
  }
  // console.log("Table Data : ",tableData);

  return (
    <div>
        <CustomTable
            data={tableData}
            columns={columns}
            pageCount={totalPages}
            pagination={pagination}
            onPaginationChange={setPagination}
            typeCounts={[]}
            perPageOption={[5,10,20]}
        />
        {/* <div>Hello</div> */}
    </div>
  )
}

export default Managestock