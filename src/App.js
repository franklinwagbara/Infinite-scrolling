import { useCallback, useEffect, useRef, useState } from "react";
import "./styles.css";
import axios from "axios";

export default function App() {
  const [query, setQuery] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [books, loading, hasMore] = useBookSearch({ query, pageNumber });

  const observer = useRef();
  const lastItem = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore)
          setPageNumber((prev) => prev + 1);
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  console.log(books);
  return (
    <div className="App">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setPageNumber(1);
        }}
      />
      {books &&
        books.map((book, index) =>
          index + 1 === books.length ? (
            <p key={book} ref={lastItem}></p>
          ) : (
            <p key={book}>{book} </p>
          )
        )}
      {hasMore && <p>load more...</p>}
      {loading && <p>Loading...</p>}
    </div>
  );
}

export const useBookSearch = ({ query, pageNumber }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    console.log("useBookeff");
    let cancel;

    setLoading(true);
    setHasMore(false);

    axios({
      method: "GET",
      url: "https://openlibrary.org/search.json",
      params: { q: query, page: pageNumber },
      cancelToken: new axios.CancelToken((c) => (cancel = c))
    })
      .then((res) => {
        setBooks((prev) => [
          ...new Set([...prev, ...res.data.docs.map((doc) => doc.title)])
        ]);
        setLoading(false);

        if (res.data.docs.length > 0) setHasMore(true);
      })
      .catch((e) => {
        if (axios.isCancel(e)) return;
      });

    console.log("quer", query);

    return () => cancel();
  }, [query, pageNumber]);

  return [books, loading, hasMore];
};
