import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { Link } from "react-router-dom";
import "./Search.scss";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const { data: results = [], isLoading, isError, error } = useQuery({
    queryKey: ["search", query],
    queryFn: () => {
      console.log("Searching for:", query);
      return makeRequest.get(`/users/search?q=${encodeURIComponent(query)}`).then((res) => {
        console.log("Search results:", res.data);
        return res.data;
      });
    },
    enabled: !!query,
  });

  return (
    <div className="search-page">
      <div className="container">
        <h1>Search Results</h1>
        {query && <p className="search-term">Results for: <strong>"{query}"</strong></p>}

        {isLoading && <div className="loading">Loading...</div>}
        {isError && <div className="error">Error: {error?.message || "fetching results"}</div>}

        {!isLoading && !isError && results.length === 0 && (
          <div className="no-results">
            <p>No users found matching "{query}"</p>
          </div>
        )}

        {!isLoading && !isError && results.length > 0 && (
          <div className="results-list">
            {results.map((user) => (
              <Link
                key={user.id}
                to={`/profile/${user.id}`}
                className="result-item"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="user-card">
                  <img
                    src={
                      user.profilePic
                        ? user.profilePic.startsWith("/upload/") || user.profilePic.startsWith("http")
                          ? user.profilePic
                          : "/upload/" + user.profilePic
                        : ""
                    }
                    alt={user.name}
                    className="profile-pic"
                  />
                  <div className="user-info">
                    <h3>{user.name}</h3>
                    {user.desc && <p className="user-desc">{user.desc}</p>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
