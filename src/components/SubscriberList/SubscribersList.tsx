// // import React from 'react'
import { CustomTable, TableCell } from "zyra";
// import types from customtable zyra
import type { Subscriber }  from "zyra";
import Popup from "../Popup/Popup";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { ReactNode, useEffect, useRef, useState } from "react";
import { DateRangePicker, RangeKeyDict, Range } from 'react-date-range';
import axios from "axios";
import { Dialog } from "@mui/material";
import { CSVLink } from "react-csv";
import { __ } from "@wordpress/i18n";
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import './subscribersList.scss';

// Type declarations
type SubscriberStatus = {
  key: string;
  name: string;
  count: number;
}

type SubscriberResponse = {
  all: number;
  subscribed: number;
  unsubscribed: number;
  mailsent: number;
}

type FilterData = {
  searchField?: string;
  searchAction?: string;
  date?:{
    start_date: Date;
    end_date: Date;
  }
  typeCount?: string;
}

export interface RealtimeFilter {
  name: string;
  render: (updateFilter: (key: string, value: any) => void, filterValue: any) => ReactNode;
} 


const SubscribersList:React.FC = () => {
  const fetchSubscribersDataUrl = `${ appLocalizer.apiUrl }/notifima/v1/subscribers`;
  const bulkActionUrl = `${ appLocalizer.apiUrl }/notifima/v1/subscribers`;
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const dateRef = useRef<HTMLDivElement | null>(null);
  const bulkSelectRef = useRef<HTMLSelectElement>(null);
  const [openModal, setOpenModal] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [modalDetails, setModalDetails] = useState<string | boolean>(false);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalRows, setTotalRows] = useState<number>(0);
  const [pageCount, setPageCount] = useState(0);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [postStatus, setPostStatus] = useState("");
  const [subscribersStatus, setSubscribersStatus] = useState<SubscriberStatus[] | null>(null);
  const [filters, setFilters] = useState<FilterData>({});
  const [data, setData] = useState<Subscriber[] | null>(null);
  const [allData, setAllData] = useState([]);
  const csvLink = useRef<CSVLink & HTMLAnchorElement & { link: HTMLAnchorElement }>(null);
  const [selectedRange, setSelectedRange] = useState([
    {
      startDate: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      key: 'selection'
    }
  ]);


  // Columns for the table
  const columns: ColumnDef<Subscriber,any>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
    },
    {
      header: "Product",
      cell: ({row}) =>
        <TableCell title="Product" >
          <img src={row.original.image} alt="product_image" />
          <p>{row.original.product}</p>
        </TableCell>,
    },
    {
      header: "Email",
      cell: ({row}) =>
        <TableCell title="Email">
          {row.original.email }
          {
            row.original.user_link &&
            <a className="user-profile" href={row.original.user_link} target="_blank"><i className="admin-font adminLib-person"></i></a>
          }
        </TableCell>,
    },
    {
      header: "Date",
      cell: ({row}) => <TableCell title="Date" > {row.original.date} </TableCell>,
    },
    {
      header: "Status",
      cell: ({row}) => <TableCell title="Status" >
        <p
          className={row.original.status_key === 'mailsent' ? 'sent' : (row.original.status_key === 'subscribed' ? 'subscribed' : 'unsubscribed')}
        >{row.original.status}</p>
      </TableCell>,
    },
  ];

  // useEffects
  useEffect(() => {
    if (appLocalizer.khali_dabba) {
      requestData();
    }
  }, [postStatus]);

  useEffect(() => {
    if (!appLocalizer.khali_dabba) return;
    const currentPage = pagination.pageIndex + 1;
    const rowsPerPage = pagination.pageSize;
    requestData(
      rowsPerPage,
      currentPage,
    );
    setPageCount(Math.ceil(totalRows/rowsPerPage));
  }, [pagination]);

  useEffect(() => {
    if (appLocalizer.khali_dabba) {
      axios<SubscriberResponse>({
        method: "GET",
        url: fetchSubscribersDataUrl,
        headers: { "X-WP-Nonce": appLocalizer.nonce },
        params: { action: 'segment'}
      }).then((response) => {
        const responseData = response.data;
        setTotalRows(responseData.all);
        setPageCount(Math.ceil(responseData.all/pagination.pageSize));

        setSubscribersStatus([
          {
            key: "all",
            name: "All",
            count: responseData["all"],
          },
          {
            key: "subscribed",
            name: "Subscribed",
            count: responseData["subscribed"],
          },
          {
            key: "unsubscribed",
            name: "Unsubscribed",
            count: responseData["unsubscribed"],
          },
          {
            key: "mailsent",
            name: "Mail Sent",
            count: responseData["mailsent"],
          },
        ]);

      });
    }
  }, [data]);


  useEffect(() => {
    document.body.addEventListener("click", (event) => {
      if (event.target instanceof Node && !dateRef?.current?.contains(event.target)) {
        setOpenDatePicker(false);
      }
    })
  }, [])


  const requestApiForData = (rowsPerPage:number, currentPage:number, filterData:FilterData) => {
    // If serch action or search text fields any one of is missing then do nothing 
    if (Boolean((filterData as { searchAction?: string; searchField?: string })?.searchAction) !== Boolean((filterData as { searchAction?: string; searchField?: string })?.searchField)) {
      return;
    }

    setData(null);
    requestData(
      rowsPerPage,
      currentPage,
      filterData?.searchField,
      filterData?.searchAction,
      filterData?.date?.start_date,
      filterData?.date?.end_date,
      filterData.typeCount
    );
  };

  const handleDateOpen = () => {
    setOpenDatePicker(!openDatePicker);
  }

  const getSelectedRows = (selectedRows: any,data: Subscriber[]) => {
    return Object.keys(selectedRows).map((key) => data[parseInt(key)]);
  }

  function requestData(
    rowsPerPage = 10,
    currentPage = 1,
    searchField = "",
    searchAction = "",
    start_date = new Date(0),
    end_date = new Date(),
    postStatus?:string
  ) {
    //Fetch the data to show in the table
    setData(null);
    axios({
      method: "GET",
      url: fetchSubscribersDataUrl,
      headers: { "X-WP-Nonce": appLocalizer.nonce },
      params: {
        page: currentPage,
        row: rowsPerPage,
        postStatus: postStatus,
        search_field: searchField,
        search_action: searchAction,
        start_date: start_date,
        end_date: end_date,
      },
    }).then((response) => {
      console.log("response", response.data);
      const data = JSON.parse(response.data);
      setData(data);
    });
  }

  const handleBulkAction = (event:any) => {
    if (!appLocalizer.khali_dabba) return;
    const selectedRows = getSelectedRows(rowSelection, data as Subscriber[]);
    if (!bulkSelectRef.current?.value) {
      setModalDetails( "Please select a action." )
      setOpenModal( true );
    }

    if (!selectedRows.length) {
      setModalDetails( "Please select products." )
      setOpenModal( true );
    }

    setData( null );

    axios({
      method: "post",
      url: bulkActionUrl,
      headers: { "X-WP-Nonce": appLocalizer.nonce },
      data: {
        action: bulkSelectRef.current?.value,
        subscribers: selectedRows
      },
    }).then( ( response ) => {
      requestData();
    });
  }

  const handleClick = () => {
    if ( appLocalizer.khali_dabba ) {
      axios({
        method: "GET",
        url: fetchSubscribersDataUrl,
        headers: { "X-WP-Nonce": appLocalizer.nonce },
        params: {
          postStatus: postStatus,
          search_field: filters.searchField,
          search_action: filters.searchAction,
          start_date: filters.date?.start_date,
          end_date: filters.date?.end_date,
        },
      }).then((response) => {
        const data = JSON.parse(response.data);
        setAllData(data);
        csvLink.current?.link.click()
      });
    }
  }
  
  // Filter for the table
  const realtimeFilter:RealtimeFilter[] = [
    {
      name: "bulk-action",
      render: () => {
        return (
          <>
            <div className="subscriber-bulk-action bulk-action">
              <select name="action" ref={bulkSelectRef} >
                <option value="">{ __('Bulk Actions', "notifima") }</option>
                <option value="unsubscribe">{ __('Unsubscribe Users', "notifima") }</option>
                <option value="delete">{ __('Delete Users', "notifima") }</option>
              </select>
              <button
                name="bulk-action-apply"
                onClick={ handleBulkAction }
              >
                { 'Apply' }
              </button>
            </div>
          </>
        );
      },
    },
    {
      name: "date",
      render: (updateFilter, value) => (
        <div ref={ dateRef }>
          <div className="admin-header-search-section">
            <input value={ `${ selectedRange[0].startDate.toLocaleDateString() } - ${ selectedRange[0].endDate.toLocaleDateString() }` } onClick={() => handleDateOpen()} className="date-picker-input-custom" type="text" placeholder={"DD/MM/YYYY"} />
          </div>
          {openDatePicker &&
            <div className="date-picker-section-wrapper" id="date-picker-wrapper">
              <DateRangePicker
                ranges= { selectedRange }
                months= { 1 }
                direction= "vertical"
                scroll={{ enabled: true }}
                maxDate={ new Date() }
                onChange={ (ranges: RangeKeyDict) => {
                const selection: Range = ranges.selection;

                if ( selection?.endDate instanceof Date ) {
                  // Set end of day to endDate
                  selection.endDate.setHours( 23, 59, 59, 999 );
                }

                // Update local range state
                setSelectedRange([{
                  startDate: selection.startDate || new Date(),
                  endDate: selection.endDate || new Date(),
                  key: selection.key || 'selection',
                }]);

                // Update external filters (could be used by table or search logic)
                updateFilter("date", {
                  start_date: selection.startDate,
                  end_date: selection.endDate,
                });

                // Optional: updating local filters state for UI sync
                setFilters((prevFilters) => ({
                  ...prevFilters,
                  date: {
                    start_date: selection.startDate || new Date(0),
                    end_date: selection.endDate || new Date(),
                  },
                }));
              }}
            />
            </div>
          }
        </div>
      ),
    },
    {
      name: "searchField",
      render: (updateFilter, filterValue) => (
        <>
          <div className="admin-header-search-section search-section">
            <input
              name= "searchField"
              type= "text"
              placeholder={ __( "Search...", "notifima" ) }
              onChange={( e ) => {
                updateFilter( e.target.name, e.target.value )
                setFilters( ( previousfilters ) => {
                  return {
                    ...previousfilters, 
                    searchField : e.target.value
                  }
                })
              }}
              value={ filterValue || "" }
            />
          </div>
        </>
      ),
    },
    {
      name: "searchAction",
      render: (updateFilter, filterValue) => (
        <>
          <div className= "admin-header-search-section searchAction">
            <select
              name= "searchAction"
              onChange={( e ) => {
                updateFilter( e.target.name, e.target.value )
                setFilters( ( previousfilters ) => {
                  return {
                    ...previousfilters, 
                    searchAction : e.target.value
                  }
                })
              }}
              value={ filterValue || "" }
            >
              <option value="">{ __( "All", "notifima" ) }</option>
              <option value="productField">{ __( "Product Name", "notifima" )}</option>
              <option value="emailField">{ __( "Email", "notifima" )}</option>
            </select>
          </div>
        </>
      ),
    },
  ];

  return (
    <>
    {!appLocalizer.khali_dabba ? (
        <div>
          <div className="free-reports-download-section">
            <h2 className="section-heading">{ __( "Download product wise subscriber data.", "notifima") }</h2>
            <button>
              <a href={ appLocalizer.export_button }>{ __( "Download CSV", "notifima" ) }</a>
            </button>
            <p className="description" dangerouslySetInnerHTML={{ __html: "This CSV file contains all subscriber data from your site. Upgrade to <a href='https://multivendorx.com/woocommerce-product-stock-manager-notifier-pro/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=stockmanager' target='_blank'>Notifima Pro</a> to generate CSV files based on specific products or users." }}></p>
          </div>
          <Dialog
            className="admin-module-popup"
            open={ openDialog }
            onClose={() => {
              setOpenDialog( false );
            }}
            aria-labelledby="form-dialog-title"
          >
            <span
              className="admin-font adminLib-cross stock-manager-popup-cross"
              onClick={() => {
                setOpenDialog( false );
              }}
            ></span>
            <Popup />
          </Dialog>
          <div
            className="subscriber-img"
            onClick={() => {
              setOpenDialog( true );
            }}>
          </div>
        </div>
      ) : (
        <div className="admin-subscriber-list">
          {openModal && modalDetails &&
            <div className="notice notice-error error-modal">
            <div className="modal-wrapper">
              <p>{ modalDetails }</p>
              <i onClick={() => setOpenModal( false )} className="admin-font adminLib-cross"></i>
            </div>
            </div>
          }
          <div className="admin-page-title">
            <p>{ __( "Subscriber List", "notifima" ) }</p>
            <div className="download-btn-subscriber-list">
              <button onClick={ handleClick } className="admin-btn btn-purple">
                <div className="wp-menu-image dashicons-before dashicons-download"></div>
                { __( "Download CSV", "notifima" ) }
              </button>
              <CSVLink
                data={ allData.map(({ date, product, email, status }) => ({ date, product, email, status })) }
                filename={ __( "Subscribers.csv", "notifima" ) }
                className= 'hidden'
                ref={ csvLink }
              />
            </div>
          </div>

          {
            <CustomTable
            data={ data }
            columns={ columns as ColumnDef<Record<string, any>, any>[] }
            rowSelection={ rowSelection }
            onRowSelectionChange={ setRowSelection }
            defaultRowsPerPage={ 10 }
            realtimeFilter={ realtimeFilter }
            pageCount={ pageCount }
            pagination={ pagination }
            onPaginationChange={ setPagination }
            typeCounts={ subscribersStatus as SubscriberStatus[] }
            handlePagination={ requestApiForData }
            perPageOption={ [10, 25, 50] }
          />
          }
        </div>
      )}
    </>
  )
}

export default SubscribersList