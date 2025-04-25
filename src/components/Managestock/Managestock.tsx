import React, { useEffect, useRef, useState } from 'react';
import axios from "axios";
import { CustomTable, TableCell } from 'zyra';
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import "./ManagestockTable.scss";

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
    stock_quantity: number|null;
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

  const fetchDataUrl   = `${appLocalizer.apiUrl}/notifima/v1/get-products`;
  const segmentDataUrl = `${appLocalizer.apiUrl}/notifima/v1/all-products`;
  const [data, setData] = useState<DataType[]|null>(null);
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
      console.log("Data : ",data);
    });
  }, [
    rowsPerPage,
    currentPage,
    searchValue,
    searchType,
    productType,
    stockStatus,
  ]);

  const columns: ColumnDef<Record<string, any>, any>[] = Object.entries(headers)
  .filter(([_, headerData]: [string, HeaderType]) => headerData.name !== 'Image' && headerData.name !== 'Name')
  .map(([key, headerData]: [string, HeaderType]): ColumnDef<Record<string, any>, any> => ({
    id: key,
    header: headerData.name,
    cell: ({ row }) => {
      let value = row.original[key];
      if (headerData.name === "Product") {
        value = row.original.name;
      }
      return (
        <TableCell title={headerData.name} type={headerData.type} header={headerData} fieldValue={value}>
          {headerData.name === "Product" ? (
            <>
              <a href={row.original.link}><img className='products' src={row.original.image} alt="product_image" /></a>
            </>
          ):
          (
          <p className={headerData.class}>{value}</p>
          )}
        </TableCell>
      );
    },
  }));

  console.log("Columns : ",columns);
  console.log("Headers : ",headers);

  const productData = [{
    id: 64,
    backorders: "no",
    image: "http://localhost/wordpress2/wp-content/uploads/2025/02/Pizza.jpg",
    link: "http://localhost/wordpress2/product/pizza/",
    manage_stock: false,
    name: "Pizza",
    regular_price: "100",
    sale_price: "90",
    sku: "-",
    stock_quantity: null,
    stock_status: "instock",
    subscriber_no: "5",
    type: "Simple"
  }];

  const tableData = Object.values(data || {});

  console.log("Table Data : ",tableData);

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