import '../styles/User.scss';
import React, { useState, useEffect, useMemo } from 'react';
import { useTable } from 'react-table';
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
        Cell: props => <div className="repo-desc">{props.value}</div>
    },
    {
        Header: 'Stars',
        accessor: 'stargazers_count',
        Cell: props => <div style={{'textAlign': 'center'}}>{formatCounts(props.value)}</div>
    },
    {
        Header: 'Actions',
        accessor: 'html_url',
        Cell: props => <a className="repo-btn button" href={props.value} target="_blank">Visit</a>
    }
]

function User(props) {
    const [repos, setRepos] = useState([]);
    const [repoLoaded, setRepoLoaded] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [noMore, setNoMore] = useState(false);
    const [count, setCount] = useState(2);
    // const reposZero = false;

    useEffect(() => {
        loadRepos();
    }, [])

    function loadRepos() {
        setIsFetching(true);
        axios({
            method: "GET",
            url: props.details.repos_url + "?per_page=" + count,
          }
        )
        .then((res) => {
            setRepos(
                res.data.sort((a, b) => b.stargazers_count - a.stargazers_count)
            )
            if (res.data.length === repos.length) {
                setNoMore(true);
            }
            setRepoLoaded(true);
            setIsFetching(false);

            if (res.data.length === 0) {setCount(0);}
            else {setCount(count + 2);}
        })
        .catch((e) => {
            console.log(e);
        });
    }

    const columns = useMemo(() => COLUMNS, []);
    const data = useMemo(() => repos, [repos]);
    const tableInstance = useTable({
        columns,
        data 
    });
    const { getTableProps, 
        getTableBodyProps, 
        headerGroups, 
        rows, 
        prepareRow 
    } = tableInstance;

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
                                    <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                                ))
                            }
                        </tr>
                    ))
                }
            </thead>

            <tbody {...getTableBodyProps()}>
                {
                    rows.map((row) => {
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

        {!isFetching && !noMore && <button className='user-repos-button'onClick={loadRepos}>Load more</button>}

        {isFetching && <button className='user-repos-button'>Loading...</button>}

        {count === 0 ? <p>No repositories to show</p> : noMore && <button className='user-repos-button-no-more'>No more to load</button>}

    </div>  
    );
}
  
  export default User;