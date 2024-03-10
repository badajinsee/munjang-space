import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import MyButton from "../components/MyButton";
import Modal from "../components/Modal";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import { User, getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "../fbase";

import ReactStars from "react-stars";

import styled from "styled-components";
import { IReport, IUserInfo } from "../types";

interface Props {
  onEdit: (id: string, newItem: IReport) => void;
  userInfo: IUserInfo;
  reportList: IReport[];
}

const Edit = (props: Props) => {
  const [modal, setModal] = useState(false);
  const [book, setBook] = useState({
    title: "",
    cover: "",
    author: "",
    description: "",
    isbn13: "",
  });
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [star, setStar] = useState(3);
  const [like, setLike] = useState(0);

  const auth = getAuth();

  const quillRef = useRef(null);

  const navigate = useNavigate();

  const { id } = useParams() as { id: string }; // 넘겨준 id 받기

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      getReport(user!.email!);
    });
  }, []);

  // firebase 에서 id 독후감 가져오기
  const getReport = async (user: string) => {
    try {
      const reportsRef = collection(db, "reports");
      const reportsDocRef = doc(reportsRef, user);
      const userRef = collection(reportsDocRef, "books");
      const docRef = doc(userRef, id);
      const targetReport = await getDoc(docRef);
      const targetReportData = targetReport.data() as IReport | undefined;
      if (targetReportData) {
        const { book, title, content, isPrivate, star, like } = targetReportData;
        setBook(book);
        setTitle(title);
        setContent(content);
        setIsPrivate(isPrivate);
        setStar(star);
        setLike(like);
      }
    } catch (error) {}
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    if (name === "isPrivate") {
      setIsPrivate(e.target.checked);
    } else if (name === "title") {
      setTitle(e.target.value);
    } else if (name === "star") {
      setStar(parseInt(e.target.value));
    }
  };

  const handleBook = () => {
    setModal(true);
  };

  const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newItem = {
      id,
      title,
      content,
      date: new Date().getTime(),
      isPrivate,
      like,
      author: auth.currentUser!.email!,
      profileImage: props.userInfo.photoURL,
      username: props.userInfo.username,
      star,
      book,
    };
    props.onEdit(id, newItem);
    alert("수정 완료");
    navigate(`/report/${auth.currentUser!.email}/${id}`, { replace: true });
  };

  const modules = useMemo(() => {
    return {
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ["bold", "italic", "underline", "strike"],
          ["blockquote"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ color: [] }, { background: [] }],
          [{ align: [] }, "link", "image"],
        ],
      },
      history: {
        delay: 500,
        maxStack: 100,
        userOnly: true,
      },
    };
  }, []);

  const { state } = useLocation();
  useEffect(() => {
    if (state) {
      setBook(state);
    }
  }, [state]);

  return (
    <div>
      <FormContainer onSubmit={handleSubmit}>
        <HeaderWrapper>
          <BookWrapper>
            <BookImage src={process.env.PUBLIC_URL + "/images/book.png"} alt="" />
            <BookInfoSpan>
              {book.title ? (
                <>
                  <Book onClick={handleBook}>{book.title}</Book>에 관련된 독후감입니다.
                </>
              ) : (
                <Book onClick={handleBook}>책을 선택해주세요</Book>
              )}
            </BookInfoSpan>
          </BookWrapper>
          <StarWrapper>
            <ReactStars count={5} value={star} size={26} half={false} onChange={setStar} />
          </StarWrapper>
        </HeaderWrapper>
        <HeaderWrapper>
          <TitleInput name="title" type="text" value={title} onChange={handleInput} placeholder="독후감 제목" />
          <LabelWrapper htmlFor="isPrivate">
            <PrivateLabel id="isPrivate" type="checkbox" name="isPrivate" checked={isPrivate} onChange={handleInput} />
            <PrivateSpan>비공개</PrivateSpan>
          </LabelWrapper>
        </HeaderWrapper>
        <EditorWrapper>
          <ReactQuill ref={quillRef} style={{ height: "600px", width: "100%" }} modules={modules} theme="snow" onChange={setContent} value={content} />
        </EditorWrapper>
        <ButtonWrapper>
          <MyButton text="수정완료" type="positive" />
        </ButtonWrapper>
      </FormContainer>
      {modal && <Modal setModal={setModal} setBook={setBook} reportList={props.reportList} />}
    </div>
  );
};

export default Edit;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  margin-left: 100px;
  margin-right: 100px;
  gap: 20px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    margin-right: auto;
    margin-left: auto;
  }
`;

const BookImage = styled.img`
  height: 34px;
  padding: 4px;
  padding-left: 8px;
`;

const BookInfoSpan = styled.span`
  color: #0b4b77;
  font-family: "UhBeeJJIBBABBA";

  @media (max-width: 768px) {
    width: 220px;
  }
`;

const Book = styled.span`
  font-weight: bold;
  text-decoration: underline;
  cursor: pointer;
  font-family: "UhBeeJJIBBABBA";
`;

const BookWrapper = styled.div`
  background-color: #ececec;
  border-radius: 5px;
  display: flex;
  align-items: center;
  flex-grow: 1;
  gap: 5px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const EditorWrapper = styled.div`
  width: 1000px;
  height: 850px;

  @media (max-width: 768px) {
    width: 100%;
    height: 700px;
  }
`;

const TitleInput = styled.input`
  border: 0;
  border-radius: 5px;
  background-color: #ececec;
  width: 50%;
  height: 38px;
  font-family: "KyoboHandwriting2021sjy";
  font-size: 22px;
  flex-grow: 1;
  padding-left: 8px;
`;

const LabelWrapper = styled.label`
  display: flex;
  align-items: center;
  user-select: none;
  background-color: #ececec;
  border-radius: 5px;
  height: 42px;
  padding-left: 5px;
  padding-right: 5px;
  cursor: pointer;
`;

const PrivateLabel = styled.input`
  appearance: none;
  border: 1.5px solid gainsboro;
  border-radius: 0.35rem;
  width: 1.5rem;
  height: 1.5rem;
  cursor: pointer;

  &:checked {
    border-color: transparent;
    background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M5.707 7.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4a1 1 0 0 0-1.414-1.414L7 8.586 5.707 7.293z'/%3e%3c/svg%3e");
    background-size: 100% 100%;
    background-position: 50%;
    background-repeat: no-repeat;
    background-color: #a7d7e8;
  }
`;

const PrivateSpan = styled.span`
  margin-left: 0.25rem;
  font-family: "UhBeeJJIBBABBA";
`;

const HeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  height: 42px;
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 10px;
    height: auto;
    margin-bottom: 10px;
  }
`;

const StarWrapper = styled.div`
  background-color: #ececec;
  border-radius: 5px;
  padding-bottom: 7px;
  padding-left: 3px;
  padding-right: 3px;
`;
