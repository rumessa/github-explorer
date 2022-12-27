import '../styles/User.scss';
import React, { useState, useEffect, useMemo } from 'react';
import { usePagination, useSortBy, useTable } from 'react-table';
import axios from 'axios';

function formatCounts(num) {
    return num > 999 ? ((num)/1000).toFixed(1) + 'k' : num;
}

const COLUMNS = [
    {
        Header: 'Name',
        accessor: 'name',
        Cell: props => <div className="repo-name">{props.value}</div>
    },
    {
        Header: 'Description',
        accessor: 'description',
        Cell: props => <div className="repo-desc">{props.value}</div>,
        disableSortBy: true
    },
    {
        Header: 'Stars',
        accessor: 'stargazers_count',
        Cell: props => <div style={{'textAlign': 'center'}}>{formatCounts(props.value)}</div>,
        disableSortBy: true
    },
    {
        Header: 'Actions',
        accessor: 'html_url',
        Cell: props => <a className="repo-btn button" href={props.value} target="_blank">Visit</a>,
        disableSortBy: true
    }
]

function User(props) {
    const [repos, setRepos] = useState([]);
    const [repoLoaded, setRepoLoaded] = useState(false);

    useEffect(() => {
        loadRepos();
    }, [])

    function loadRepos() {
        axios({
            method: "GET",
            url: props.details.repos_url+ "?per_page=" + 100
          }
        )
        .then((res) => {
            // initially sorted according to star count
            setRepos(
                res.data.sort((a, b) => b.stargazers_count - a.stargazers_count)
            )
            setRepoLoaded(true);
            console.log(repos);
        })
        .catch((e) => {
            console.log(e);
        });
    }

    function compareIgnoreCase(a, b) { 
        let r1 = a.toLowerCase(); 
        let r2 = b.toLowerCase(); 
        if (r1 < r2) { return -1; } 
        if (r1 > r2) { return 1; } 
        return 0; 
    }

    const columns = useMemo(() => COLUMNS, []);
    const data = useMemo(() => repos, [repos]);
    const tableInstance = useTable({
        columns,
        data,
        sortTypes: {
            alphanumeric: (row1, row2, columnName) => {
                return compareIgnoreCase(row1.values[columnName], row2.values[columnName])
            },
        },
        initialState: { pageSize: 5 }
    },
    useSortBy,
    usePagination);
    const { getTableProps, 
        getTableBodyProps, 
        headerGroups, 
        page,
        nextPage,
        previousPage,
        canNextPage,
        canPreviousPage,
        pageOptions,
        state,
        gotoPage,
        setPageSize, 
        prepareRow 
    } = tableInstance;

    const { pageIndex, pageSize } = state;

    return (
    <div className="center-div d-flex flex-column align-items-center">
        
        <div className='user-info d-flex justify-content-between'>
            <div className='user-info-left d-flex flex-column'>
                <img id="avatar" src={props.details.avatar_url} alt="logo" />
                <p id="name">{props.details.name}</p>
            </div>
                
            <div className='user-info-right d-flex justify-content-between flex-column'>
                <a id="github-link" href={props.details.html_url} target="_blank">
                    <p id="username">@{props.details.login}</p>
                </a>

                <div className="user-stats d-flex flex-column">
                    <div className='user-stats-item'>
                        <h2>{formatCounts(props.details.public_repos)}</h2>
                        <p>Repositories</p>
                    </div>
                    <div className='user-stats-item'>
                        <h2>{formatCounts(props.details.following)}</h2>
                        <p>Following</p>
                    </div>
                    <div className='user-stats-item'>
                        <h2>{formatCounts(props.details.followers)}</h2>
                        <p>Followers</p>
                    </div>
                </div>
            </div>
        </div>

        {repoLoaded &&
        <table {...getTableProps()}>
            <thead>
                {
                    headerGroups.map((headerGroup) => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {
                                headerGroup.headers.map((column) => (
                                    <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                                        {column.render('Header')}
                                        {column.isSorted ? (column.isSortedDesc ? " ↓" : " ↑") : null}
                                    </th>
                                ))
                            }
                        </tr>
                    ))
                }
            </thead>

            <tbody {...getTableBodyProps()}>
                {
                    page.map((row) => {
                        prepareRow(row)
                        return (
                            <tr {...row.getRowProps()}>
                                {
                                    row.cells.map((cell) => {
                                        return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                    })
                                }
                            </tr>
                        )
                    })
                }
            </tbody>
        </table>
        }

        <div className='pagination-area'>
            {console.log(pageOptions.length)}
            <p className='page-numbers'>
                Page {pageIndex + 1} of {pageOptions.length}  |  Go To <input className="input-num" type="number" defaultValue={pageIndex+1} onChange={
                    (e) => {
                        const pgNum = e.target.value ? Number(e.target.value) - 1 : 0;
                        gotoPage(pgNum);
                    }
                }></input>
            </p>

            <div className='page-buttons'>
                <button onClick={() => previousPage()} disabled={!canPreviousPage}>Previous</button>
                <button onClick={() => nextPage()} disabled={!canNextPage}>Next</button>
            </div>

            <select className="page-sizing" defaultValue={pageSize} onChange={(e) => {setPageSize(Number(e.target.value))}}>
                {
                    [5, 10, 15, 20].map(pageSize => (
                        <option key={pageSize} value={pageSize}>
                            Show {pageSize}
                        </option>
                    ))
                }
            </select>
        </div>

    </div>  
    );
}
export default User;