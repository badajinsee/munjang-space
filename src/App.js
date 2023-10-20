import "./App.css";
import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Book from "./pages/Book";
import List from "./pages/List";
import Report from "./pages/Report";
import New from "./pages/New";
import Edit from "./pages/Edit";
import Statistics from "./pages/Statistics";
import SignUp from "./pages/SignUp";

import MyHeader from "./components/MyHeader";
import MyFooter from "./components/MyFooter";

import { db } from "./fbase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import getDefaultProfileImage from "./utils/getDefaultProfileImage";

const dummyData = [
  {
    id: 0,
    title: "0",
    content: "0",
    date: 1695463111141,
    isPrivate: false,
    star: 1,
    book: {
      title: "해리포터",
      cover: `${process.env.PUBLIC_URL}/images/예시책.jpeg`,
    },
  },
  {
    id: 1,
    title: "1",
    content: "1",
    date: 1695463111142,
    isPrivate: false,
    star: 2,
    book: {
      title: "해리포터1",
      cover: `${process.env.PUBLIC_URL}/images/예시책.jpeg`,
    },
  },
  {
    id: 2,
    title: "2",
    content: "2",
    date: 1695463111143,
    isPrivate: false,
    star: 3,
    book: {
      title: "해리포터2",
      cover: `${process.env.PUBLIC_URL}/images/예시책.jpeg`,
    },
  },
  {
    id: 3,
    title: "3",
    content: "3",
    date: 1695463111144,
    isPrivate: false,
    star: 4,
    book: {
      title: "해리포터3",
      cover: `${process.env.PUBLIC_URL}/images/예시책.jpeg`,
    },
  },
  {
    id: 4,
    title: "4",
    content: "4",
    date: 1695463111145,
    isPrivate: true,
    star: 5,
    book: {
      title: "해리포터4",
      cover: `${process.env.PUBLIC_URL}/images/예시책.jpeg`,
    },
  },
  {
    id: 5,
    title: "5",
    content: "5",
    date: 1695463111146,
    isPrivate: true,
    star: 5,
    book: {
      title: "해리포터5",
      cover: `${process.env.PUBLIC_URL}/images/예시책.jpeg`,
    },
  },
  {
    id: 6,
    title: "6",
    content: "6",
    date: 1695463111147,
    isPrivate: true,
    star: 1,
    book: {
      title: "해리포터6",
      cover: `${process.env.PUBLIC_URL}/images/예시책.jpeg`,
    },
  },
  {
    id: 7,
    title: "7",
    content: "7",
    date: 1695463111148,
    isPrivate: false,
    star: 2,
    book: {
      title: "해리포터7",
      cover: `${process.env.PUBLIC_URL}/images/예시책.jpeg`,
    },
  },
  {
    id: 8,
    title: "8",
    content: "8",
    date: 1695463111149,
    isPrivate: true,
    star: 3,
    book: {
      title: "해리포터8",
      cover: `${process.env.PUBLIC_URL}/images/예시책.jpeg`,
    },
  },
  {
    id: 9,
    title: "9",
    content: "9",
    date: 1695463111150,
    isPrivate: false,
    star: 4,
    book: {
      title: "해리포터9",
      cover: `${process.env.PUBLIC_URL}/images/예시책.jpeg`,
    },
  },
  {
    id: 10,
    title: "10",
    content: "10",
    date: 1695463111151,
    isPrivate: true,
    star: 5,
    book: {
      title: "해리포터10",
      cover: `${process.env.PUBLIC_URL}/images/예시책.jpeg`,
    },
  },
  {
    id: 11,
    title: "11",
    content: "11",
    date: 1695463111152,
    isPrivate: false,
    star: 1,
    book: {
      title: "해리포터11",
      cover: `${process.env.PUBLIC_URL}/images/예시책.jpeg`,
    },
  },
  {
    id: 12,
    title: "12",
    content: "12",
    date: 1695463111153,
    isPrivate: true,
    star: 2,
    book: {
      title: "해리포터12",
      cover: `${process.env.PUBLIC_URL}/images/예시책.jpeg`,
    },
  },
  {
    id: 13,
    title: "13",
    content: "13",
    date: 1695463111154,
    isPrivate: false,
    star: 3,
    book: {
      title: "해리포터13",
      cover: `${process.env.PUBLIC_URL}/images/예시책.jpeg`,
    },
  },
  {
    id: 14,
    author: "testUser",
    title: "14",
    content: "14",
    date: 1695463111155,
    isPrivate: true,
    star: 4,
    book: {
      title: "해리포터14",
      cover: `${process.env.PUBLIC_URL}/images/예시책.jpeg`,
    },
  },
  {
    id: 15,
    title: "15",
    content: "15",
    date: 1695463111156,
    isPrivate: false,
    star: 5,
    book: {
      title: "해리포터15",
      cover: `${process.env.PUBLIC_URL}/images/예시책.jpeg`,
    },
  },
];

function App() {
  const [IsLogin, setIsLogin] = useState(localStorage.getItem("isLogin"));
  const [userInfo, setUserInfo] = useState({});
  const [reportList, setReportList] = useState(dummyData);
  const [testData, setTestData] = useState([]);
  const [reportCount, setReportCount] = useState(0);
  const auth = getAuth();

  useEffect(() => {
    let unSubscribe;
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // console.log(user);
        setIsLogin(true);
        // loadData(user.email);
        unSubscribe = onSnapshot(
          collection(db, "reports", user.email, "books"),
          (querySnapShot) => {
            const data = [];
            querySnapShot.forEach((doc) => {
              data.push(doc.data());
            });
            setTestData(data);
            setReportCount(data.length);
          }
        );
        if (user.photoURL) {
          setUserInfo({
            email: user.email,
            photoURL: user.photoURL,
            nickname: user.displayName,
          });
        } else {
          getDefaultProfileImage().then((res) =>
            setUserInfo({
              email: user.email,
              photoURL: res,
              nickname: user.displayName,
            })
          );
        }

        localStorage.setItem("isLogin", true);
      } else {
        setIsLogin(false);
        localStorage.setItem("isLogin", false);
      }
    });

    return () => unSubscribe();
  }, []);

  const onCreate = async (report) => {
    try {
      const docRef = doc(
        collection(db, "reports", report.author, "books"),
        `${report.id}`
      );
      await setDoc(docRef, report);
    } catch (error) {
      console.log(error);
    }
  };

  const onEdit = async (id, report) => {
    try {
      const targetReportRef = doc(db, "reports", userInfo.email, "books", id);
      await setDoc(targetReportRef, report);
    } catch (error) {
      console.log(error);
    }
  };

  const onLike = async (author, id) => {
    const likeListRef = collection(
      db,
      "reports",
      author,
      "books",
      `${id}`,
      "likeList"
    );
    const docRef = doc(likeListRef, userInfo.email);
    const document = await getDoc(docRef);
    if (document.data()) {
      if (document.data().isLike === true) {
        // 좋아요 리스트에 있으면 -> 좋아요 취소
        await updateDoc(docRef, { isLike: false });
      } else {
        // 좋아요 리스트에 있고, false -> 좋아요
        await updateDoc(docRef, { isLike: true });
      }
    } else {
      // 좋아요 리스트에 없으면 -> 좋아요
      const reportRef = doc(
        collection(db, "reports", author, "books", `${id}`, "likeList"),
        userInfo.email
      );
      await setDoc(reportRef, { isLike: true });
    }
    const q = query(likeListRef, where("isLike", "==", true));
    const LikeListDocs = await getDocs(q);
    const count = LikeListDocs.docs.length;
    await updateDoc(doc(db, "reports", author, "books", `${id}`), {
      like: count,
    });
  };

  const getBookReports = (isbn13) => {
    const reportsCollectionRef = collection(db, "reports");
    const allReports = [];

    // 각 사용자 문서에서 'books' 컬렉션을 참조합니다.
    onSnapshot(reportsCollectionRef, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added" || change.type === "modified") {
          // 추가 또는 수정된 문서 처리
          const doc = change.doc;

          const booksCollectionRef = collection(doc.ref, "books");
          const q = query(
            booksCollectionRef,
            where("book.isbn13", "==", isbn13)
          );
          const booksQuerySnapshot = await getDocs(q);

          booksQuerySnapshot.forEach((bookDoc) => {
            // 각 'books' 컬렉션의 독후감 문서를 allReports 목록에 추가합니다.
            allReports.push(bookDoc.data());
          });

          // 이제 allReports 배열은 변경된 데이터를 포함하게 됩니다.
          // console.log(allReports);
        }
      });
    });
  };

  useEffect(() => {
    const isbn13 = "9791192908236";
    getBookReports(isbn13);
  }, []);
  return (
    <BrowserRouter>
      <MyHeader IsLogin={IsLogin} />
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />

          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<SignUp />} />

          <Route path="/book/:isbn13" element={<Book />} />
          <Route path="/list" element={<List reportList={testData} />} />

          <Route
            path="/report/:id"
            element={
              <Report
                reportList={testData}
                onLike={onLike}
                userInfo={userInfo}
              />
            }
          />
          <Route
            path="/new"
            element={<New onCreate={onCreate} reportCount={reportCount} />}
          />

          <Route path="/edit/:id" element={<Edit onEdit={onEdit} />} />

          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </div>
      <MyFooter />
    </BrowserRouter>
  );
}

export default App;
