import React, { useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";

const SignUP = ({ staticData }) => {
  const { locale } = useRouter();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isDirty, isValid },
  } = useForm({ mode: "onTouched" });

  const [backErrors, setBackErrors] = useState([]);

  const router = useRouter();

  const onSubmit = (e) => {
    setBackErrors([]);
    e.preventDefault();
    signUp(e);
  };

  const signUp = async (e) => {
    e.preventDefault();
    const UserData = getValues();
    const res = await fetch("/api/users", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(UserData),
    });
    if (res.status == 409) {
      const err = backErrors;
      err.push("email Alredy Exists");
      setBackErrors(err);
    }
    if (res.status == 200) {
      router.push("/");
      router.reload(window.location.pathname);
    }
  };
  return (
    <div>
      <div className="login_container">
        <button disabled="true" className=" btn login_with_google">
          {staticData.signUp.loginGoogle}
        </button>
        <button disabled="true" className=" btn login_with_facebook">
          {staticData.signUp.loginFaceBook}
        </button>
        <div>
          {backErrors.map((err, key) => (
            <div className="alert alert-danger" role="alert" key={key}>
              {err}
            </div>
          ))}
        </div>
        <form
          className="login_form"
          onSubmit={(e) => handleSubmit(onSubmit(e))}
        >
          <div className="form-group Loginstitles" id="usernamelogin">
            {staticData.signUp.userName}
            <input
              className={`form-control
              ${locale === "arab" ? "text-end" : "text-start"}
              ${
                errors.userName
                  ? "border-danger text-danger"
                  : "border-muted text-dark"
              }`}
              placeholder={staticData.signUp.userNamePlace}
              type="text"
              name="userName"
              {...register("userName", { required: true, minLength: 3 })}
            ></input>
            {errors.userName && (
              <div className="text-danger fs-6 fw-light">
                The UserName must be grater or equal to 3 chars
              </div>
            )}
            {staticData.signUp.email}
            <input
              className={`form-control
              ${locale === "arab" ? "text-end" : "text-start"}
              ${
                errors.email
                  ? "border-danger text-danger"
                  : "border-muted text-dark"
              }`}
              placeholder={staticData.signUp.emailPlace}
              type="email"
              name="email"
              {...register("email", {
                required: "The Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email address",
                },
              })}
            ></input>
            {errors.email && (
              <div className="text-danger fs-6 fw-light">
                {errors.email.message}
              </div>
            )}
            {staticData.signUp.password}
            <input
              className={`form-control
              ${locale === "arab" ? "text-end" : "text-start"} ${
                errors.hashPassword
                  ? "border-danger text-danger"
                  : "border-muted text-dark"
              }`}
              placeholder={staticData.signUp.passwordPlace}
              name="hashPassword"
              type="password"
              {...register("hashPassword", {
                minLength: 8,
                required: true,
                type: "email",
              })}
            ></input>
            {errors.hashPassword && (
              <div className="text-danger fs-6 fw-light">
                The MinLenght Must Be 8 chars
              </div>
            )}
            <button
              disabled={!isValid || !isDirty}
              className="btn singinbtn"
              type="submit"
            >
              {staticData.signUp.action}
            </button>
          </div>
        </form>
        <div className="text-center mt-2">
          You already have an account?{" "}
          <a href="logIn" className="underline  fw-bold">
            Log In
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignUP;
