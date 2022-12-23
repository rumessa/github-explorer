import React, {useState, useEffect} from 'react';
import axios from 'axios';

import User from './User';
import '../styles/Search.scss';

// import { useRef } from 'react';  in case i do the close button manually

const Search = () => {
    const [searchInput, setSearchInput] = useState("");
    const [dataLoaded, setDataLoaded] = useState(false);
    const [APIData, setAPIData] = useState([]);
    const [error, setError] = useState(false);

    const handleChange = (e) => {
      if (e.code === 'Enter') {
        if (e.target.value.startsWith("@")) {
          setError(true);
        }
        else {
          setSearchInput("@" + e.target.value);
        }
      }
    };

    useEffect(() => {
      if (searchInput.length !== 0) {
        axios({
            method: "GET",
            url: `https://api.github.com/users/` + searchInput.slice(1),
          }
        )
        .then((response) => {
          setError(false);
          setAPIData(response.data);
          setDataLoaded(true);
        })
        .catch((error) => {
          console.log('error', error);
          setError(true);
        });
      }
    }, [searchInput])

    useEffect(() => {
      let interval;

      interval = setInterval(() => {
        setError(false);
      }, 5000);
      return () => {
        clearInterval(interval);
      };
    }, [error]);

    return (
        <div className='container-fluid'>

            {!dataLoaded && 
              <div className='search-div my-5 d-flex justify-content-center align-items-center'>
                  <label className='heading px-2'>The Github username I am searching for is <input className="search-bar" type="text" placeholder="username, per favore" onKeyDown={handleChange}/></label> 
              </div>
            }
            
            {dataLoaded && <User details={APIData}/>}

            {error && 
              <div className='alert-danger alert-dismissible alert fade show text-center mx-auto pt-3 rounded' role="alert">
                  Oops, the username does not exist.
                  {/* <button type="button" class="btn-close" aria-label="Close"></button> */}
              </div>
            }
        </div> 
    );
}

export default Search;
