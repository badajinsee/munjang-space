import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../fbase";

import styled from "styled-components";

import ChangePassword from "../components/ChangePassword";
import MyProfile from "../components/MyProfile";
import MyButton from "../components/MyButton";

import { User, getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";

const Profile = () => {
  const [init, setInit] = useState(false);

  const [isCorrect, setIsCorrect] = useState(false);

  const [isChangePW, setIsChangePW] = useState(false);

  const [isSocial, setIsSocial] = useState(localStorage.getItem("isSocial")! === "true");

  const [user, setUser] = useState<User>();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [password, setPassword] = useState("");

  const auth = getAuth();

  const navigate = useNavigate();

  useEffect(() => {
    setIsSocial(localStorage.getItem("isSocial")! === "true");
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setEmail(user.email!);
        setUsername(user.displayName!);
        setPhotoURL(user.photoURL!);
        setInit(true);
      }
    });
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    let data;
    try {
      data = await signInWithEmailAndPassword(auth, email, password);
      if (data) {
        setIsCorrect(true);
      }
    } catch (error) {
      if ((error as FirebaseError).code === "auth/wrong-password") {
        alert("비밀번호가 일치하지 않습니다.");
        setPassword("");
      }
    }
  };

  const handleChangePW = () => setIsChangePW((prev) => !prev);

  // 회원탈퇴 기능

  const handleDeleteUser = () => {
    const user = auth.currentUser;

    if (window.confirm("정말 탈퇴 하시겠습니까?")) {
      if (user) {
        user
          .delete()
          .then(() => {
            window.alert("회원 탈퇴가 되었습니다.");
            navigate("/", { replace: true });
            deleteInformation();
          })
          .catch((error) => {
            console.log("오류가 발생했습니다.");
          });
      }
    } else {
      window.alert("취소 되었습니다.");
    }
  };

  async function deleteInformation() {
    console.log("deleteInformation");
    const deleteUser = doc(db, "reports", email);

    // reports 문서 삭제 (독후감)
    await deleteDoc(deleteUser);

    // users 문서 삭제 (닉네임)
    await deleteDoc(doc(db, "users", email));
  }

  return init && isSocial ? (
    <div>
      <Container>
        {isChangePW ? (
          <ChangePassword email={email} setIsChangePW={setIsChangePW} handleChangePW={handleChangePW} />
        ) : (
          <MyProfile email={email} username={username} photoURL={photoURL} handleChangePW={handleChangePW} isSocial={isSocial} />
        )}
      </Container>
      <DeleteButton>
        <DeleteUserButton onClick={handleDeleteUser}>회원탈퇴</DeleteUserButton>
      </DeleteButton>
    </div>
  ) : isCorrect ? (
    <div>
      <Container>
        {isChangePW ? (
          <ChangePassword email={email} setIsChangePW={setIsChangePW} handleChangePW={handleChangePW} />
        ) : (
          <MyProfile email={email} username={username} photoURL={photoURL} handleChangePW={handleChangePW} isSocial={isSocial} />
        )}
      </Container>
      <DeleteButton>
        <DeleteUserButton onClick={handleDeleteUser}>회원탈퇴</DeleteUserButton>
      </DeleteButton>
    </div>
  ) : (
    <PasswordCheckContainer>
      <Title>비밀번호 확인</Title>
      <PasswordForm onSubmit={handleSubmit}>
        <Info>
          안전한 개인정보 변경을 위해
          <br /> 비밀번호를 다시 입력해주세요.
        </Info>
        <Input name="password" type="password" value={password} onChange={handleInput} placeholder="비밀번호 입력" />
        <MyButton text={"확인"} type={"positive"} />
      </PasswordForm>
      <PasswordImage src={process.env.PUBLIC_URL + "/images/passwordCheck.jpeg"} alt="image" />
    </PasswordCheckContainer>
  );
};

export default Profile;

const Container = styled.div`
  position: relative;
  padding: 40px;
  margin-right: auto;
  margin-left: auto;
  width: 400px;
  height: 600px;

  border-radius: 15px;
  margin-top: 50px;
  display: flex;
  align-items: center;
  flex-direction: column;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  background-color: #ececec;

  @media (max-width: 768px) {
    width: 250px;
    height: 400px;
    padding: 20px;
  }
`;

const PasswordForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-family: "KyoboHandwriting2021sjy";

  @media (max-width: 768px) {
    align-items: center;
  }
`;

const Input = styled.input`
  width: 500px;
  font-size: 24px;
  font-family: "KyoboHandwriting2021sjy";
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const PasswordCheckContainer = styled.div`
  padding: 40px 0px;
  margin-top: 50px;
  margin-right: 100px;
  margin-left: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;

  @media (max-width: 768px) {
    margin: 0;
  }
`;

const Title = styled.div`
  font-family: "UhBeeJJIBBABBA";
  letter-spacing: 4px;
  font-size: 40px;
`;

const Info = styled.div`
  text-align: center;

  color: #8b8b8b;
  font-size: 14px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const PasswordImage = styled.img`
  width: 600px;
`;

// 삭제 버튼

const DeleteButton = styled.div`
  display: grid;
  place-items: center;
`;

const DeleteUserButton = styled.button`
  font-family: "UhBeeJJIBBABBA";
  font-size: 16px;
  color: white;

  margin-top: 30px;
  padding: 10px 15px;

  background-color: #fd565f;

  border: 0;
  border-radius: 8px;

  cursor: pointer;

  &:hover {
    background-color: #ff2833;
    color: white;
  }
`;
